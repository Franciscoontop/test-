// ================================================================
// ChatWidget.jsx
// DROP THIS FILE INTO: src/components/ChatWidget.jsx
// Then add <ChatWidget /> anywhere in your App.jsx
// ================================================================

import { useEffect, useRef } from "react";
import "../styles/ChatWidget.css";

// ── CONFIG — change these per client ──────────────────────────────
const CONFIG = {
  SHEET_URL:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVsTHX1E0Jd-f2oVoNH8N2YXdzgPZcn6iwmHE7GM8-nvMkZxZ93KEtN0jyCd4iqu1NjvBvmcOx9eu7/pub?output=csv",      // ← paste your published sheet CSV URL
  LEADS_SHEET_URL: "YOUR_GOOGLE_APPS_SCRIPT_URL",   // ← paste your Apps Script web app URL
  AGENT_NAME:      "AI Assistant",
  API_ROUTE:       "/api/chat",                      // ← keep as-is if using Vercel
};
// ─────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  // All mutable state lives in refs so we don't re-render the whole tree
  const stateRef = useRef({
    SHEET_STRING: "",
    SHEET_DATA:   {},
    chatHistory:  [],
    hasPopped:    false,
    leadSent:     false,
    lead: { name: null, email: null, phone: null, service: null },
  });

  useEffect(() => {
    const S = stateRef.current;

    // ── SHEET LOADER ─────────────────────────────────────────────
    async function loadSheet() {
      try {
        const res = await fetch(CONFIG.SHEET_URL + "&cb=" + Date.now());
        const csv = await res.text();
        csv.split("\n").forEach(row => {
          const [key, ...rest] = row.split(",");
          if (key?.trim()) S.SHEET_DATA[key.trim().toLowerCase()] = rest.join(",").trim();
        });
        S.SHEET_STRING = Object.entries(S.SHEET_DATA).map(([k, v]) => `${k}: ${v}`).join(" | ");
        if (S.SHEET_DATA["promos"]) {
          const el = document.getElementById("cw-modal-promo");
          if (el) el.innerText = S.SHEET_DATA["promos"];
        }
        const nameEl = document.getElementById("cw-header-agent-name");
        if (nameEl) nameEl.innerText = S.SHEET_DATA["agent_name"] || CONFIG.AGENT_NAME;
        const bizName = S.SHEET_DATA["business_name"] || "us";
        setGreeting(`Hey! 👋 Welcome to ${bizName}. I'm here to help you find the right service. What's your name?`);
      } catch (err) {
        console.warn("Sheet load failed:", err);
        setGreeting("Hey! 👋 I'm here to help. What's your name so I can get started?");
      }
    }

    // ── LEAD EXTRACTION ──────────────────────────────────────────
    function extractLeadData(text) {
      const lower = text.toLowerCase().trim();
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) S.lead.email = emailMatch[0];
      const phoneMatch = text.match(/\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/);
      if (phoneMatch) S.lead.phone = phoneMatch[0];
      if (!S.lead.name && text.trim().length < 55) {
        const nameMatch = text.trim().match(/^(?:(?:hi|hey|hello|my name is|i am|i'm|name is|it's|its)\s+)?([a-zA-Z]{2,20})\s+([a-zA-Z]{2,20})$/i);
        if (nameMatch) {
          const parts = [nameMatch[nameMatch.length - 2], nameMatch[nameMatch.length - 1]];
          S.lead.name = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        }
      }
      if (!S.lead.service) {
        if (S.SHEET_DATA["services"]) {
          const services = S.SHEET_DATA["services"].split("|").map(s => s.trim().toLowerCase());
          const matched  = services.find(s => lower.includes(s.split(" ")[0]));
          if (matched) S.lead.service = matched;
        }
        if (!S.lead.service) {
          const keywords = ["haircut","fade","beard","cut","trim","color","blowout","booking",
            "appointment","massage","nails","lashes","wax","facial","cleaning","plumbing",
            "hvac","design","website","consult","repair","install","coaching","training",
            "landscaping","detailing","painting","electrical"];
          const found = keywords.find(w => lower.includes(w));
          if (found) S.lead.service = found;
        }
      }
      if (!S.lead.service && S.chatHistory.length > 0) {
        const lastAI = S.chatHistory.filter(m => m.role === "assistant").pop();
        if (lastAI) {
          const aiKeywords = ["haircut","fade","beard","trim","color","blowout","coaching",
            "training","massage","nails","lashes","wax","facial","cleaning","plumbing",
            "hvac","design","website","consult","repair","install","landscaping",
            "detailing","painting","electrical","strength"];
          const found = aiKeywords.find(w => lastAI.content.toLowerCase().includes(w));
          if (found) S.lead.service = found;
        }
      }
    }

    function isLeadComplete() {
      return !!(S.lead.name && S.lead.email && S.lead.phone && S.lead.service);
    }

    // ── BOOKING BUTTON ───────────────────────────────────────────
    function showBookingButton() {
      const bookingLink = S.SHEET_DATA["booking_link"];
      if (!bookingLink) return;
      const container = document.getElementById("cw-response-container");
      if (!container) return;
      const wrap = document.createElement("div");
      wrap.className = "cw-booking-btn-wrap";
      wrap.innerHTML = `<a href="${bookingLink}" target="_blank" class="cw-booking-btn">📅 Book Your Appointment →</a>`;
      container.appendChild(wrap);
      container.scrollTop = container.scrollHeight;
    }

    function leadStatus() {
      return `
CURRENT LEAD STATUS (check before every reply):
- Name    : ${S.lead.name    || "MISSING — ask their name first"}
- Service : ${S.lead.service || "MISSING — ask what service they need"}
- Email   : ${S.lead.email   || "MISSING — ask after service is known"}
- Phone   : ${S.lead.phone   || "MISSING — ask last"}
- Complete: ${isLeadComplete() ? "YES — thank them and say team will be in touch" : "NO — collect what is missing, one at a time"}
COLLECTION ORDER: Name → Service → Email → Phone
Never ask for something already collected above.
`.trim();
    }

    // ── SAVE LEAD ────────────────────────────────────────────────
    async function saveLeadToSheet() {
      if (S.leadSent) return;
      S.leadSent = true;
      const bizName    = S.SHEET_DATA["business_name"] || "Your Business";
      const transcript = S.chatHistory.map(m => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`).join("\n");
      try {
        await fetch(CONFIG.LEADS_SHEET_URL, {
          method:  "POST",
          mode:    "no-cors",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name: S.lead.name, service: S.lead.service, email: S.lead.email, phone: S.lead.phone, business: bizName, transcript }),
        });
      } catch (err) {
        console.error("Sheet save failed:", err);
        S.leadSent = false;
      }
    }

    // ── STREAM RESPONSE ──────────────────────────────────────────
    async function streamResponse(bubbleId) {
      const bubble    = document.getElementById(bubbleId);
      const container = document.getElementById("cw-response-container");
      const systemContext = `
You are a helpful AI sales assistant for this business.
Be friendly, direct, and conversational. Never sound robotic.
Complete every sentence fully — never cut off mid-thought.
BUSINESS INFO:
${S.SHEET_STRING || "No business info loaded"}
${leadStatus()}
YOUR JOB:
1. Collection order: Name → Service → Email → Phone
2. Get name first, then service, then email, then phone — one at a time.
3. Keep replies to 2-3 sentences. Always end with a question.
4. When lead is complete say: "Perfect! The team will reach out to you shortly about [service]."
5. Never make up services — only discuss what is in the business info above.
`.trim();

      let fullReply = "";
      let hasStartedTyping = false;
      try {
        const res = await fetch(CONFIG.API_ROUTE, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            sheetData:      S.SHEET_STRING,
            systemContext: systemContext,
            messages:       S.chatHistory.map(m => ({ role: m.role, content: m.content })),
          }),
        });
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer    = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim().startsWith("data: ")) continue;
            const raw = line.trim().slice(6);
            if (!raw || raw === "[DONE]") continue;
            try {
              const parsed  = JSON.parse(raw);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                if (!hasStartedTyping) {
                  bubble.classList.remove("cw-thinking-state");
                  bubble.innerHTML = "";
                  hasStartedTyping = true;
                }
                fullReply += content;
                bubble.innerText = fullReply;
                if (container) container.scrollTop = container.scrollHeight;
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        if (bubble) bubble.innerHTML = "<i>Connection lost. Please try again.</i>";
      }
      return fullReply;
    }

    // ── SEND MESSAGE ─────────────────────────────────────────────
    async function send(overrideMsg = null) {
      const input     = document.getElementById("cw-msg");
      const container = document.getElementById("cw-response-container");
      const userText  = overrideMsg || input?.value.trim();
      if (!userText) return;

      container.innerHTML +=
        `<div class="cw-message-row cw-user-row">
           <div class="cw-avatar cw-user-avatar">U</div>
           <div class="cw-msg-bubble cw-user-msg">${userText}</div>
         </div>`;
      if (!overrideMsg && input) input.value = "";

      extractLeadData(userText);
      S.chatHistory.push({ role: "user", content: userText });

      const bubbleId = "cw-ai-" + Date.now();
      container.innerHTML +=
        `<div class="cw-message-row cw-ai-row">
           <div class="cw-avatar cw-ai-avatar">
             <svg style="width:14px;height:14px;fill:#000" viewBox="0 0 24 24">
               <path d="M2.78,20.06L14.06,8.78L12.65,7.37L20.03,0L23.56,3.54L19.32,7.78L20.73,9.19L17.2,12.73L15.79,11.31L4.5,22.6L2.78,20.06Z"/>
             </svg>
           </div>
           <div id="${bubbleId}" class="cw-msg-bubble cw-ai-msg cw-thinking-state">
             <div class="cw-thinking-dots">
               <div class="cw-dot"></div><div class="cw-dot"></div><div class="cw-dot"></div>
             </div>
           </div>
         </div>`;
      if (container) container.scrollTop = container.scrollHeight;

      const reply = await streamResponse(bubbleId);
      S.chatHistory.push({ role: "assistant", content: reply });

      if (isLeadComplete() && !S.leadSent) {
        saveLeadToSheet();
        showBookingButton();
      }
    }

    // ── UI HELPERS ────────────────────────────────────────────────
    function setGreeting(text) {
      const container = document.getElementById("cw-response-container");
      if (!container) return;
      container.innerHTML =
        `<div class="cw-message-row cw-ai-row">
           <div class="cw-avatar cw-ai-avatar">
             <svg style="width:14px;height:14px;fill:#000" viewBox="0 0 24 24">
               <path d="M2.78,20.06L14.06,8.78L12.65,7.37L20.03,0L23.56,3.54L19.32,7.78L20.73,9.19L17.2,12.73L15.79,11.31L4.5,22.6L2.78,20.06Z"/>
             </svg>
           </div>
           <div class="cw-msg-bubble cw-ai-msg">${text}</div>
         </div>`;
    }

    function toggleChat() {
      const win    = document.getElementById("cw-chat-window");
      const bubble = document.getElementById("cw-chat-bubble");
      const mobile = window.innerWidth <= 480;
      if (!win || !bubble) return;
      if (win.classList.contains("cw-open")) {
        win.classList.remove("cw-open");
        bubble.classList.remove("cw-active-spiral");
        if (mobile) { bubble.style.opacity = "1"; bubble.style.pointerEvents = "auto"; }
        setTimeout(() => { win.style.display = "none"; }, 400);
      } else {
        win.style.display = "flex";
        setTimeout(() => {
          win.classList.add("cw-open");
          bubble.classList.add("cw-active-spiral");
          if (mobile) { bubble.style.opacity = "0"; bubble.style.pointerEvents = "none"; }
        }, 10);
      }
    }

    function closeModal() {
      document.getElementById("cw-exit-modal")?.classList.remove("cw-active");
    }

    function claimOffer() {
      const promo = document.getElementById("cw-modal-promo")?.innerText;
      closeModal();
      if (!document.getElementById("cw-chat-window")?.classList.contains("cw-open")) toggleChat();
      send(`I want to claim the ${promo} offer.`);
    }

    // ── ATTACH EVENT LISTENERS ───────────────────────────────────
    document.getElementById("cw-chat-bubble")?.addEventListener("click", toggleChat);
    document.getElementById("cw-close-chat")?.addEventListener("click", toggleChat);
    document.getElementById("cw-send-btn")?.addEventListener("click", () => send());
    document.getElementById("cw-msg")?.addEventListener("keypress", e => { if (e.key === "Enter") send(); });
    document.getElementById("cw-close-modal-btn")?.addEventListener("click", claimOffer);
    document.getElementById("cw-maybe-later")?.addEventListener("click", closeModal);

    // Exit intent
    const exitHandler = (e) => {
      if (e.clientY < 10 && !S.hasPopped) {
        document.getElementById("cw-exit-modal")?.classList.add("cw-active");
        S.hasPopped = true;
      }
    };
    document.addEventListener("mousemove", exitHandler);

    // ── INIT ─────────────────────────────────────────────────────
    loadSheet();

    return () => {
      document.removeEventListener("mousemove", exitHandler);
    };
  }, []);

  // ── JSX MARKUP ────────────────────────────────────────────────
  return (
    <div id="cw-widget-wrapper">
      {/* Exit Modal */}
      <div id="cw-exit-modal">
        <div className="cw-modal-offer">Don't Leave Yet! 🚀</div>
        <div className="cw-modal-text">Get a free demo before you go.</div>
        <div className="cw-promo-code" id="cw-modal-promo">FREE-DEMO</div>
        <button className="cw-close-modal-btn" id="cw-close-modal-btn">Claim Offer</button>
        <p className="cw-maybe-later-link" id="cw-maybe-later">Maybe later</p>
      </div>

      {/* Chat Bubble */}
      <div id="cw-chat-bubble">
        <svg style={{ width: "30px", height: "30px", fill: "#0066fe" }} viewBox="0 0 24 24">
          <path d="M2.78,20.06L14.06,8.78L12.65,7.37L20.03,0L23.56,3.54L19.32,7.78L20.73,9.19L17.2,12.73L15.79,11.31L4.5,22.6L2.78,20.06Z"/>
        </svg>
      </div>

      {/* Chat Window */}
      <div id="cw-chat-window">
        <div id="cw-chat-header">
          <div className="cw-header-title">
            <div className="cw-icon-dock"></div>
            <div className="cw-header-text">
              <b id="cw-header-agent-name">AI Assistant</b>
              <span>● Active Now</span>
            </div>
          </div>
          <span id="cw-close-chat" style={{ cursor: "pointer", color: "#ffffff", fontSize: "18px" }}>✕</span>
        </div>
        <div id="cw-response-container"></div>
        <div className="cw-input-area">
          <input id="cw-msg" placeholder="Type your question..." autoComplete="off" />
          <button className="cw-send-btn" id="cw-send-btn">Send</button>
        </div>
      </div>
    </div>
  );
}
