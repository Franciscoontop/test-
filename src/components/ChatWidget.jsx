// ================================================================
// ChatWidget.jsx — SINGLE FILE, customized for VoltPro
// DROP INTO: src/components/ChatWidget.jsx
// Add <ChatWidget /> to your App.jsx — that's it.
// ================================================================

import { useEffect, useRef } from "react";

const CONFIG = {
  SHEET_URL:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVsTHX1E0Jd-f2oVoNH8N2YXdzgPZcn6iwmHE7GM8-nvMkZxZ93KEtN0jyCd4iqu1NjvBvmcOx9eu7/pub?output=csv",
  LEADS_SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQlBMQchxKbi_7n7S14M3Ebu1p-y1r7iACmRqR6rY_PFk8aEae0LSxQ38nLEs2ZxH8ObairuBy-Wtk/pubhtml",
  AGENT_NAME:      "VoltPro AI Assistant",
  API_ROUTE:       "/api/chat",
};

const STYLES = `
  #cw-widget-wrapper {
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 2147483647;
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  #cw-exit-modal {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -45%) scale(0.95);
    width: 90%; max-width: 400px;
    background: #091026; border: 1px solid #1e3a8a; border-radius: 24px;
    padding: 40px; text-align: center;
    box-shadow: 0px 30px 60px rgba(0,0,0,0.8);
    pointer-events: none; z-index: 2147483648;
    opacity: 0; visibility: hidden;
    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.165,0.84,0.44,1), visibility 0.5s;
  }
  #cw-exit-modal.cw-active {
    opacity: 1; visibility: visible; pointer-events: auto;
    transform: translate(-50%, -50%) scale(1);
  }
  .cw-modal-offer  { font-size: 26px; font-weight: bold; margin-bottom: 12px; color: #fff; }
  .cw-modal-text   { font-size: 16px; margin-bottom: 24px; color: #9ca3af; }
  .cw-promo-code   { background: #030712; border: 1px dashed #1e60ff; padding: 12px 24px; font-size: 22px; font-weight: bold; border-radius: 12px; margin-bottom: 24px; color: #facc15; }
  .cw-close-modal-btn { background: #1e60ff; color: #fff; border: none; padding: 14px 30px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 15px; transition: background 0.2s; }
  .cw-close-modal-btn:hover { background: #154ec7; }
  .cw-maybe-later-link { font-size: 12px; color: #4b5563; margin-top: 20px; cursor: pointer; }
  #cw-chat-bubble {
    position: absolute; bottom: 20px; right: 20px;
    width: 60px; height: 60px; background: #1e60ff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; pointer-events: auto;
    box-shadow: 0 0 20px rgba(30,96,255,0.4);
    z-index: 2147483649;
    transition: bottom 0.8s cubic-bezier(0.34,1.56,0.64,1),
                right 0.8s cubic-bezier(0.34,1.56,0.64,1),
                width 0.5s ease, height 0.5s ease,
                transform 0.8s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.3s ease;
  }
  #cw-chat-bubble svg { transition: all 0.6s ease; fill: #fff; }
  #cw-chat-bubble.cw-active-spiral {
    bottom: 607px; right: 353px; width: 26px; height: 26px;
    transform: rotate(720deg); box-shadow: none; background: transparent;
  }
  #cw-chat-bubble.cw-active-spiral svg { width: 14px; height: 14px; fill: #9ca3af; }
  #cw-chat-window {
    position: absolute; bottom: 90px; right: 20px;
    width: 370px; height: 560px; max-height: 85svh;
    background: #030712; border: 1px solid #111827; border-radius: 20px;
    display: none; flex-direction: column;
    box-shadow: 0px 15px 50px rgba(0,0,0,0.8);
    pointer-events: auto; overflow: hidden;
    opacity: 0; transition: opacity 0.4s ease;
  }
  #cw-chat-window.cw-open { display: flex; opacity: 1; }
  #cw-chat-header {
    background: #091026; padding: 14px 16px;
    border-bottom: 1px solid #111827;
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0;
  }
  .cw-header-title { display: flex; align-items: center; gap: 10px; }
  .cw-icon-dock { width: 26px; height: 26px; border-radius: 50%; background: #1e60ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cw-icon-dock svg { width: 14px; height: 14px; fill: #fff; }
  .cw-header-text b    { display: block; font-size: 14px; color: #fff; }
  .cw-header-text span { font-size: 11px; color: #facc15; }
  #cw-response-container {
    flex: 1; padding: 14px; overflow-y: auto;
    display: flex; flex-direction: column; gap: 10px;
    background: #030712; scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  .cw-message-row { display: flex; align-items: flex-end; gap: 8px; max-width: 88%; }
  .cw-ai-row   { align-self: flex-start; }
  .cw-user-row { align-self: flex-end; flex-direction: row-reverse; }
  .cw-avatar     { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cw-ai-avatar   { background: #1e60ff; }
  .cw-ai-avatar svg { width: 14px; height: 14px; fill: #fff; }
  .cw-user-avatar { background: #111827; font-size: 10px; color: #9ca3af; border: 1px solid #1f2937; }
  .cw-msg-bubble { padding: 10px 14px; border-radius: 15px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; max-width: 100%; }
  .cw-ai-msg   { background: #091026; color: #fff; border: 1px solid #111827; border-bottom-left-radius: 4px; }
  .cw-user-msg { background: #1e60ff; color: #fff; border-bottom-right-radius: 4px; }
  .cw-booking-btn-wrap { padding: 4px 14px 10px; }
  .cw-booking-btn {
    display: block; width: 100%; padding: 12px;
    background: #1e60ff; color: #fff; border: none; border-radius: 12px;
    font-size: 14px; font-weight: bold; text-align: center;
    text-decoration: none; cursor: pointer; transition: background 0.2s;
  }
  .cw-booking-btn:hover { background: #154ec7; }
  .cw-thinking-state { display: inline-flex !important; width: auto !important; padding: 6px 12px !important; align-items: center; }
  .cw-thinking-dots { display: inline-flex; align-items: center; gap: 3px; }
  .cw-dot { width: 4px; height: 4px; background: #9ca3af; border-radius: 50%; animation: cw-bounce 1.4s infinite ease-in-out; }
  .cw-dot:nth-child(2) { animation-delay: 0.2s; }
  .cw-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes cw-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
  .cw-input-area {
    padding: 12px 14px; background: #091026;
    border-top: 1px solid #111827; display: flex; gap: 8px;
    flex-shrink: 0; align-items: center;
  }
  .cw-input-area input {
    flex: 1; padding: 10px 14px; background: #030712;
    border: 1px solid #1f2937; color: #fff; border-radius: 22px;
    outline: none; font-size: max(16px, 14px);
  }
  .cw-input-area input::placeholder { color: #4b5563; }
  .cw-send-btn {
    padding: 10px 16px; background: #1e60ff; color: #fff;
    border: none; border-radius: 22px; cursor: pointer;
    font-weight: bold; font-size: 13px; flex-shrink: 0; white-space: nowrap; transition: background 0.2s;
  }
  .cw-send-btn:hover { background: #154ec7; }
  @media (max-width: 480px) {
    #cw-chat-bubble { bottom: 16px; right: 16px; width: 54px; height: 54px; }
    #cw-chat-window {
      position: fixed; bottom: 0; right: 0; left: 0; top: 0;
      width: 100%; height: 100%; max-height: 100%;
      border-radius: 0; border: none;
    }
    #cw-chat-bubble.cw-active-spiral { opacity: 0; pointer-events: none; transform: none; }
    .cw-msg-bubble { font-size: 15px; }
    .cw-input-area { padding: 12px 16px 20px; }
    .cw-input-area input { padding: 12px 16px; }
    .cw-send-btn { padding: 12px 18px; }
    .cw-message-row { max-width: 92%; }
    #cw-exit-modal { padding: 28px 20px; }
    .cw-modal-offer { font-size: 22px; }
  }
  @media (min-width: 481px) and (max-width: 768px) {
    #cw-chat-window { width: calc(100vw - 32px); right: 16px; bottom: 84px; }
  }
`;

export default function ChatWidget() {
  const stateRef = useRef({
    SHEET_STRING: "", SHEET_DATA: {}, chatHistory: [],
    hasPopped: false, leadSent: false,
    lead: { name: null, email: null, phone: null, service: null },
  });

  useEffect(() => {
    if (!document.getElementById("cw-styles")) {
      const tag = document.createElement("style");
      tag.id = "cw-styles";
      tag.innerHTML = STYLES;
      document.head.appendChild(tag);
    }

    const S = stateRef.current;

    async function loadSheet() {
      try {
        const res = await fetch(CONFIG.SHEET_URL + "&cb=" + Date.now());
        const csv = await res.text();
        csv.split("\n").forEach(row => {
          const [key, ...rest] = row.split(",");
          if (key?.trim()) S.SHEET_DATA[key.trim().toLowerCase()] = rest.join(",").trim();
        });
        S.SHEET_STRING = Object.entries(S.SHEET_DATA).map(([k,v]) => `${k}: ${v}`).join(" | ");
        if (S.SHEET_DATA["promos"]) {
          const el = document.getElementById("cw-modal-promo");
          if (el) el.innerText = S.SHEET_DATA["promos"];
        }
        const nameEl = document.getElementById("cw-header-agent-name");
        if (nameEl) nameEl.innerText = S.SHEET_DATA["agent_name"] || CONFIG.AGENT_NAME;
        const bizName = S.SHEET_DATA["business_name"] || "VoltPro";
        setGreeting(`Hey! 👋 Welcome to ${bizName}. I'm here to help you power your home safely. What's your name?`);
      } catch {
        setGreeting("Hey! 👋 Welcome to VoltPro. What's your name so I can help get your project safely sorted?");
      }
    }

    function extractLeadData(text) {
      const lower = text.toLowerCase().trim();
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) S.lead.email = emailMatch[0];
      const phoneMatch = text.match(/\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/);
      if (phoneMatch) S.lead.phone = phoneMatch[0];
      if (!S.lead.name && text.trim().length < 55) {
        const nm = text.trim().match(/^(?:(?:hi|hey|hello|my name is|i am|i'm|name is|it's|its)\s+)?([a-zA-Z]{2,20})\s+([a-zA-Z]{2,20})$/i);
        if (nm) S.lead.name = [nm[nm.length-2], nm[nm.length-1]].map(w => w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(" ");
      }
      if (!S.lead.service) {
        const keywords = ["panel","upgrade","breaker","charger","ev","tesla","wiring","smart home","automation","outage","emergency","electrical","repair","install"];
        const found = keywords.find(w => lower.includes(w));
        if (found) S.lead.service = found;
      }
    }

    function isLeadComplete() { return !!(S.lead.name && S.lead.email && S.lead.phone && S.lead.service); }

    function leadStatus() {
      return `CURRENT LEAD STATUS:
- Name   : ${S.lead.name    || "MISSING — ask first"}
- Service: ${S.lead.service || "MISSING — ask after name"}
- Email  : ${S.lead.email   || "MISSING — ask after service"}
- Phone  : ${S.lead.phone   || "MISSING — ask last"}
- Complete: ${isLeadComplete() ? "YES — thank them" : "NO — collect missing, one at a time"}
Order: Name → Service → Email → Phone. Never re-ask collected fields.`;
    }

    function showBookingButton() {
      const link = S.SHEET_DATA["booking_link"];
      if (!link) return;
      const container = document.getElementById("cw-response-container");
      if (!container) return;
      const wrap = document.createElement("div");
      wrap.className = "cw-booking-btn-wrap";
      wrap.innerHTML = `<a href="${link}" target="_blank" class="cw-booking-btn">📅 Book Your Service →</a>`;
      container.appendChild(wrap);
      container.scrollTop = container.scrollHeight;
    }

    async function saveLeadToSheet() {
      if (S.leadSent) return;
      S.leadSent = true;
      const transcript = S.chatHistory.map(m => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`).join("\n");
      try {
        await fetch(CONFIG.LEADS_SHEET_URL, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...S.lead, business: S.SHEET_DATA["business_name"] || "VoltPro", transcript }),
        });
      } catch { S.leadSent = false; }
    }

    async function streamResponse(bubbleId) {
      const bubble = document.getElementById(bubbleId);
      const container = document.getElementById("cw-response-container");
      const systemContext = `You are a helpful AI sales assistant for VoltPro Electrical Solutions. Be friendly and professional.
BUSINESS INFO: ${S.SHEET_STRING || "VoltPro offers Premium electrical solutions, 24/7 emergency service, Panel upgrades, Smart Home wiring, and EV Charger installs."}
${leadStatus()}
RULES: Collect Name→Service→Email→Phone one at a time. 2-3 sentences max. Always end with a question.
When complete: "Perfect! One of our expert technicians will reach out shortly about your [service]."`;

      let fullReply = "", started = false;
      try {
        const res = await fetch(CONFIG.API_ROUTE, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sheetData: S.SHEET_STRING, systemContext, messages: S.chatHistory }),
        });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n"); buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim().startsWith("data: ")) continue;
            const raw = line.trim().slice(6);
            if (!raw || raw === "[DONE]") continue;
            try {
              const content = JSON.parse(raw).choices?.[0]?.delta?.content;
              if (content) {
                if (!started) { bubble.classList.remove("cw-thinking-state"); bubble.innerHTML = ""; started = true; }
                fullReply += content;
                bubble.innerText = fullReply;
                if (container) container.scrollTop = container.scrollHeight;
              }
            } catch (_) {}
          }
        }
      } catch { if (bubble) bubble.innerHTML = "<i>Connection lost. Please try again.</i>"; }
      return fullReply;
    }

    async function send(overrideMsg = null) {
      const input = document.getElementById("cw-msg");
      const container = document.getElementById("cw-response-container");
      const userText = overrideMsg || input?.value.trim();
      if (!userText) return;
      container.innerHTML += `<div class="cw-message-row cw-user-row"><div class="cw-avatar cw-user-avatar">U</div><div class="cw-msg-bubble cw-user-msg">${userText}</div></div>`;
      if (!overrideMsg && input) input.value = "";
      extractLeadData(userText);
      S.chatHistory.push({ role: "user", content: userText });
      const bubbleId = "cw-ai-" + Date.now();
      container.innerHTML += `<div class="cw-message-row cw-ai-row"><div class="cw-avatar cw-ai-avatar"><svg viewBox="0 0 24 24"><path d="M19,9L17.75,11.75L15,13L17.75,14.25L19,17L20.25,14.25L23,13L20.25,11.75L19,9M9,5L7,11L1,13L7,15L9,21L11,15L17,13L11,11L9,5M19,1L18.25,2.75L16.5,3.5L18.25,4.25L19,6L19.75,4.25L21.5,3.5L19.75,2.75L19,1Z"/></svg></div><div id="${bubbleId}" class="cw-msg-bubble cw-ai-msg cw-thinking-state"><div class="cw-thinking-dots"><div class="cw-dot"></div><div class="cw-dot"></div><div class="cw-dot"></div></div></div></div>`;
      container.scrollTop = container.scrollHeight;
      const reply = await streamResponse(bubbleId);
      S.chatHistory.push({ role: "assistant", content: reply });
      if (isLeadComplete() && !S.leadSent) { saveLeadToSheet(); showBookingButton(); }
    }

    function setGreeting(text) {
      const container = document.getElementById("cw-response-container");
      if (!container) return;
      container.innerHTML = `<div class="cw-message-row cw-ai-row"><div class="cw-avatar cw-ai-avatar"><svg viewBox="0 0 24 24"><path d="M19,9L17.75,11.75L15,13L17.75,14.25L19,17L20.25,14.25L23,13L20.25,11.75L19,9M9,5L7,11L1,13L7,15L9,21L11,15L17,13L11,11L9,5M19,1L18.25,2.75L16.5,3.5L18.25,4.25L19,6L19.75,4.25L21.5,3.5L19.75,2.75L19,1Z"/></svg></div><div class="cw-msg-bubble cw-ai-msg">${text}</div></div>`;
    }

    function toggleChat() {
      const win = document.getElementById("cw-chat-window");
      const bubble = document.getElementById("cw-chat-bubble");
      const mobile = window.innerWidth <= 480;
      if (!win || !bubble) return;
      if (win.classList.contains("cw-open")) {
        win.classList.remove("cw-open"); bubble.classList.remove("cw-active-spiral");
        if (mobile) { bubble.style.opacity = "1"; bubble.style.pointerEvents = "auto"; }
        setTimeout(() => { win.style.display = "none"; }, 400);
      } else {
        win.style.display = "flex";
        setTimeout(() => {
          win.classList.add("cw-open"); bubble.classList.add("cw-active-spiral");
          if (mobile) { bubble.style.opacity = "0"; bubble.style.pointerEvents = "none"; }
        }, 10);
      }
    }

    function closeModal() { document.getElementById("cw-exit-modal")?.classList.remove("cw-active"); }
    function claimOffer() {
      const promo = document.getElementById("cw-modal-promo")?.innerText;
      closeModal();
      if (!document.getElementById("cw-chat-window")?.classList.contains("cw-open")) toggleChat();
      send(`I want to claim the ${promo} offer.`);
    }

    document.getElementById("cw-chat-bubble")?.addEventListener("click", toggleChat);
    document.getElementById("cw-close-chat")?.addEventListener("click", toggleChat);
    document.getElementById("cw-send-btn")?.addEventListener("click", () => send());
    document.getElementById("cw-msg")?.addEventListener("keypress", e => { if (e.key === "Enter") send(); });
    document.getElementById("cw-close-modal-btn")?.addEventListener("click", claimOffer);
    document.getElementById("cw-maybe-later")?.addEventListener("click", closeModal);

    const exitHandler = (e) => {
      if (e.clientY < 10 && !S.hasPopped) {
        document.getElementById("cw-exit-modal")?.classList.add("cw-active");
        S.hasPopped = true;
      }
    };
    document.addEventListener("mousemove", exitHandler);
    loadSheet();
    return () => document.removeEventListener("mousemove", exitHandler);
  }, []);

  return (
    <div id="cw-widget-wrapper">
      <div id="cw-exit-modal">
        <div className="cw-modal-offer">Don't Leave Yet! 🚀</div>
        <div className="cw-modal-text">Get a premium service discount before you go.</div>
        <div className="cw-promo-code" id="cw-modal-promo">VOLTPRO-SAVE</div>
        <button className="cw-close-modal-btn" id="cw-close-modal-btn">Claim Offer</button>
        <p className="cw-maybe-later-link" id="cw-maybe-later">Maybe later</p>
      </div>
      <div id="cw-chat-bubble">
        <svg viewBox="0 0 24 24" style={{ width: "26px", height: "26px" }}>
          {/* Custom Electric/Volt icon matching your brand concept */}
          <path d="M12 2L2 14h9l-2 8 10-12h-9l2-8z" />
        </svg>
      </div>
      <div id="cw-chat-window">
        <div id="cw-chat-header">
          <div className="cw-header-title">
            <div className="cw-icon-dock">
              <svg viewBox="0 0 24 24"><path d="M12 2L2 14h9l-2 8 10-12h-9l2-8z" /></svg>
            </div>
            <div className="cw-header-text">
              <b id="cw-header-agent-name">VoltPro AI</b>
              <span>● Online & Powered Up</span>
            </div>
          </div>
          <span id="cw-close-chat" style={{ cursor:"pointer", color:"#4b5563", fontSize:"18px" }}>✕</span>
        </div>
        <div id="cw-response-container"></div>
        <div className="cw-input-area">
          <input id="cw-msg" placeholder="Ask about EV installation, panel upgrades..." autoComplete="off" />
          <button className="cw-send-btn" id="cw-send-btn">Send</button>
        </div>
      </div>
    </div>
  );
}
