// ============================================================
//  AI CHAT WIDGET — Vite / Vanilla JS Drop-in
//  Works with any HTML project (Vite, plain HTML, etc.)
//
//  HOW TO INTEGRATE IN 3 STEPS:
//
//  STEP 1 — Copy this file into your project, e.g.:
//           src/ai-chat-widget.js
//
//  STEP 2 — Import it in your main entry file (main.js or index.js):
//           import './ai-chat-widget.js'
//
//  STEP 3 — Fill in your CONFIG values below (Sheet URL, etc.)
//
//  That's it. The widget mounts itself automatically.
//  You do NOT need to add any HTML — it injects everything.
// ============================================================


// ============================================================
//  ① CONFIG — EDIT THESE VALUES FOR EACH CLIENT
//  SHEET_URL       : published Google Sheet CSV link
//  LEADS_SHEET_URL : Google Apps Script web app URL (saves leads)
//  AGENT_NAME      : fallback name shown in chat header
//  API_ROUTE       : your backend streaming endpoint
// ============================================================
const CONFIG = {
  SHEET_URL:       "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVsTHX1E0Jd-f2oVoNH8N2YXdzgPZcn6iwmHE7GM8-nvMkZxZ93KEtN0jyCd4iqu1NjvBvmcOx9eu7/pub?output=csv",
  LEADS_SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQlBMQchxKbi_7n7S14M3Ebu1p-y1r7iACmRqR6rY_PFk8aEae0LSxQ38nLEs2ZxH8ObairuBy-Wtk/pub?output=csv",
  AGENT_NAME:      "AI Assistant",
  API_ROUTE:       "/api/chat",
};


// ============================================================
//  ② STATE — internal variables, no need to touch these
// ============================================================
let SHEET_STRING = "";
let SHEET_DATA   = {};
let chatHistory  = [];
let hasPopped    = false;
let leadSent     = false;

let lead = {
  name:    null,
  email:   null,
  phone:   null,
  service: null,
};


// ============================================================
//  ③ INJECT CSS — widget styles are self-contained here
//  If you want to override styles, add CSS after this in your
//  own stylesheet using the same class/id names.
// ============================================================
function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* ── WRAPPER ── */
    #ai-widget-wrapper {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    }

    /* ── EXIT MODAL ── */
    #ai-exit-modal {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -45%) scale(0.95);
      width: 90%; max-width: 400px;
      background: #111; border: 1px solid #333; border-radius: 24px;
      padding: 40px; text-align: center;
      box-shadow: 0 30px 60px rgba(0,0,0,0.9);
      pointer-events: none; z-index: 2147483648;
      opacity: 0; visibility: hidden;
      transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.165,0.84,0.44,1), visibility 0.5s;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #fff;
    }
    #ai-exit-modal.active {
      opacity: 1; visibility: visible;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }
    .ai-modal-offer  { font-size: 26px; font-weight: bold; margin-bottom: 12px; }
    .ai-modal-text   { font-size: 16px; margin-bottom: 24px; color: #aaa; }
    .ai-promo-code   {
      background: #1a1a1a; border: 1px dashed #444;
      padding: 12px 24px; font-size: 22px; font-weight: bold;
      border-radius: 12px; margin-bottom: 24px;
    }
    .ai-close-modal-btn {
      background: #fff; color: #000; border: none;
      padding: 14px 30px; border-radius: 12px;
      cursor: pointer; font-weight: bold; font-size: 15px;
    }

    /* ── CHAT BUBBLE ── */
    #ai-chat-bubble {
      position: absolute; bottom: 20px; right: 20px;
      width: 60px; height: 60px;
      background: #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; pointer-events: auto;
      box-shadow: 0 0 15px rgba(255,255,255,0.3);
      z-index: 2147483649;
      transition: bottom 0.8s cubic-bezier(0.34,1.56,0.64,1),
                  right 0.8s cubic-bezier(0.34,1.56,0.64,1),
                  width 0.5s ease, height 0.5s ease,
                  transform 0.8s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.3s ease;
    }
    #ai-chat-bubble svg { transition: all 0.6s ease; }
    #ai-chat-bubble.active-spiral {
      bottom: 607px; right: 353px;
      width: 26px; height: 26px;
      transform: rotate(720deg); box-shadow: none;
    }
    #ai-chat-bubble.active-spiral svg { width: 14px; height: 14px; fill: #000; }

    /* ── CHAT WINDOW ── */
    #ai-chat-window {
      position: absolute; bottom: 90px; right: 20px;
      width: 370px; height: 560px; max-height: 85svh;
      background: #111; border: 1px solid #333; border-radius: 20px;
      display: none; flex-direction: column;
      box-shadow: 0 15px 50px rgba(0,0,0,0.9);
      pointer-events: auto; overflow: hidden;
      opacity: 0; transition: opacity 0.4s ease;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    #ai-chat-window.open { display: flex; opacity: 1; }

    /* ── HEADER ── */
    #ai-chat-header {
      background: #1a1a1a; padding: 14px 16px;
      border-bottom: 1px solid #333;
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0; color: #fff;
    }
    .ai-header-title { display: flex; align-items: center; gap: 10px; }
    .ai-icon-dock    { width: 26px; height: 26px; border-radius: 50%; background: #fff; flex-shrink: 0; }
    .ai-header-text b    { display: block; font-size: 14px; color: #fff; }
    .ai-header-text span { font-size: 11px; color: #00ff88; }

    /* ── MESSAGES ── */
    #ai-response-container {
      flex: 1; padding: 14px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 10px;
      background: #050505; scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    .ai-message-row { display: flex; align-items: flex-end; gap: 8px; max-width: 88%; }
    .ai-row-ai      { align-self: flex-start; }
    .ai-row-user    { align-self: flex-end; flex-direction: row-reverse; }
    .ai-avatar      { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ai-avatar-ai   { background: #fff; }
    .ai-avatar-user { background: #333; font-size: 10px; color: #aaa; border: 1px solid #444; }
    .ai-msg-bubble  { padding: 10px 14px; border-radius: 15px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; max-width: 100%; }
    .ai-msg-ai      { background: #222; color: #fff; border: 1px solid #333; border-bottom-left-radius: 4px; }
    .ai-msg-user    { background: #fff; color: #000; border-bottom-right-radius: 4px; }

    /* ── BOOKING BUTTON ── */
    .ai-booking-btn-wrap { padding: 4px 14px 10px; }
    .ai-booking-btn {
      display: block; width: 100%; padding: 12px;
      background: #fff; color: #000; border: none; border-radius: 12px;
      font-size: 14px; font-weight: bold; text-align: center;
      text-decoration: none; cursor: pointer; transition: background 0.2s;
    }
    .ai-booking-btn:hover { background: #e0e0e0; }

    /* ── TYPING DOTS ── */
    .ai-msg-bubble.thinking-state { display: inline-flex !important; width: auto !important; padding: 6px 12px !important; align-items: center; }
    .ai-thinking-dots { display: inline-flex; align-items: center; gap: 3px; }
    .ai-dot { width: 4px; height: 4px; background: #888; border-radius: 50%; animation: aiBounce 1.4s infinite ease-in-out; }
    .ai-dot:nth-child(2) { animation-delay: 0.2s; }
    .ai-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes aiBounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }

    /* ── INPUT BAR ── */
    .ai-input-area {
      padding: 12px 14px; background: #111;
      border-top: 1px solid #333;
      display: flex; gap: 8px; flex-shrink: 0; align-items: center;
    }
    .ai-input-area input {
      flex: 1; padding: 10px 14px;
      background: #1a1a1a; border: 1px solid #444;
      color: #fff; border-radius: 22px; outline: none;
      font-size: max(16px, 14px);
    }
    .ai-send-btn {
      padding: 10px 16px; background: #fff; color: #000;
      border: none; border-radius: 22px;
      cursor: pointer; font-weight: bold; font-size: 13px;
      flex-shrink: 0; white-space: nowrap;
    }

    /* ── MOBILE ── */
    @media (max-width: 480px) {
      #ai-chat-bubble { bottom: 16px; right: 16px; width: 54px; height: 54px; }
      #ai-chat-window {
        position: fixed; bottom: 0; right: 0; left: 0; top: 0;
        width: 100%; height: 100%; max-height: 100%;
        border-radius: 0; border: none;
      }
      #ai-chat-bubble.active-spiral {
        opacity: 0; pointer-events: none;
        width: 54px; height: 54px;
        bottom: 16px; right: 16px; transform: none;
      }
      .ai-msg-bubble { font-size: 15px; }
      .ai-input-area { padding: 12px 16px 20px; }
      .ai-input-area input { padding: 12px 16px; }
      .ai-send-btn { padding: 12px 18px; }
      .ai-message-row { max-width: 92%; }
      #ai-exit-modal { padding: 28px 20px; }
      .ai-modal-offer { font-size: 22px; }
    }

    @media (min-width: 481px) and (max-width: 768px) {
      #ai-chat-window { width: calc(100vw - 32px); right: 16px; bottom: 84px; }
    }
  `;
  document.head.appendChild(style);
}


// ============================================================
//  ④ INJECT HTML — builds the widget DOM and appends to body
//  Called once on init. All IDs are prefixed with "ai-"
//  to avoid conflicts with your site's existing elements.
// ============================================================
function injectHTML() {
  const wrapper = document.createElement("div");
  wrapper.id = "ai-widget-wrapper";
  wrapper.innerHTML = `
    <!-- EXIT INTENT MODAL -->
    <div id="ai-exit-modal">
      <div class="ai-modal-offer">Don't Leave Yet! 🚀</div>
      <div class="ai-modal-text">Get a free demo before you go.</div>
      <div class="ai-promo-code" id="ai-modal-promo">FREE-DEMO</div>
      <button class="ai-close-modal-btn" id="ai-claim-btn">Claim Offer</button>
      <p style="font-size:12px;color:#555;margin-top:20px;cursor:pointer;" id="ai-maybe-later">Maybe later</p>
    </div>

    <!-- FLOATING CHAT BUBBLE -->
    <div id="ai-chat-bubble">
      <svg style="width:30px;height:30px;fill:#000" viewBox="0 0 24 24">
        <path d="M19,9L17.75,11.75L15,13L17.75,14.25L19,17L20.25,14.25L23,13L20.25,11.75L19,9M9,5L7,11L1,13L7,15L9,21L11,15L17,13L11,11L9,5M19,1L18.25,2.75L16.5,3.5L18.25,4.25L19,6L19.75,4.25L21.5,3.5L19.75,2.75L19,1Z"/>
      </svg>
    </div>

    <!-- CHAT WINDOW -->
    <div id="ai-chat-window">
      <div id="ai-chat-header">
        <div class="ai-header-title">
          <div class="ai-icon-dock"></div>
          <div class="ai-header-text">
            <b id="ai-header-agent-name">AI Assistant</b>
            <span>● Active Now</span>
          </div>
        </div>
        <span style="cursor:pointer;color:#666;font-size:18px;" id="ai-close-btn">✕</span>
      </div>
      <div id="ai-response-container"></div>
      <div class="ai-input-area">
        <input id="ai-msg" placeholder="Type your question..." autocomplete="off" />
        <button class="ai-send-btn" id="ai-send-btn">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);
}


// ============================================================
//  ⑤ BIND EVENTS — attaches all click/keypress listeners
//  Called after injectHTML() so the DOM elements exist.
// ============================================================
function bindEvents() {
  document.getElementById("ai-chat-bubble").addEventListener("click", toggleChat);
  document.getElementById("ai-close-btn").addEventListener("click", toggleChat);
  document.getElementById("ai-send-btn").addEventListener("click", () => send());
  document.getElementById("ai-claim-btn").addEventListener("click", claimOffer);
  document.getElementById("ai-maybe-later").addEventListener("click", closeModal);
  document.getElementById("ai-msg").addEventListener("keypress", e => {
    if (e.key === "Enter") send();
  });

  // Exit intent — fires when mouse moves to top of screen
  document.addEventListener("mousemove", e => {
    if (e.clientY < 10 && !hasPopped) {
      document.getElementById("ai-exit-modal").classList.add("active");
      hasPopped = true;
    }
  });
}


// ============================================================
//  ⑥ SHEET LOADER — fetches business data from Google Sheet
//  Populates SHEET_DATA (object) and SHEET_STRING (text for AI).
//  Sheet format expected: Column A = key, Column B = value
// ============================================================
async function loadSheet() {
  try {
    const res = await fetch(CONFIG.SHEET_URL + "&cb=" + Date.now());
    const csv = await res.text();

    csv.split("\n").forEach(row => {
      const [key, ...rest] = row.split(",");
      if (key && key.trim()) {
        SHEET_DATA[key.trim().toLowerCase()] = rest.join(",").trim();
      }
    });

    SHEET_STRING = Object.entries(SHEET_DATA)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");

    // Update promo code if sheet has one
    if (SHEET_DATA["promos"]) {
      document.getElementById("ai-modal-promo").innerText = SHEET_DATA["promos"];
    }

    // Update agent name in header
    document.getElementById("ai-header-agent-name").innerText =
      SHEET_DATA["agent_name"] || CONFIG.AGENT_NAME;

    const bizName = SHEET_DATA["business_name"] || "us";
    setGreeting(`Hey! 👋 Welcome to ${bizName}. I'm here to help you find the right service. What's your name?`);

  } catch (err) {
    console.warn("Sheet load failed:", err);
    setGreeting("Hey! 👋 I'm here to help. What's your name so I can get started?");
  }
}


// ============================================================
//  ⑦ LEAD EXTRACTION — parses user messages for contact info
//  Only scans user messages, never AI responses.
//  Captures: name, email, phone, service
// ============================================================
function extractLeadData(text) {
  const lower = text.toLowerCase().trim();

  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) lead.email = emailMatch[0];

  // Phone
  const phoneMatch = text.match(/\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/);
  if (phoneMatch) lead.phone = phoneMatch[0];

  // Name — only from short messages so AI responses don't pollute it
  if (!lead.name && text.trim().length < 55) {
    const nameMatch = text.trim().match(
      /^(?:(?:hi|hey|hello|my name is|i am|i'm|name is|it's|its)\s+)?([a-zA-Z]{2,20})\s+([a-zA-Z]{2,20})$/i
    );
    if (nameMatch) {
      const first = nameMatch[nameMatch.length - 2];
      const last  = nameMatch[nameMatch.length - 1];
      lead.name   = [first, last]
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  // Service — check sheet first, then fallback keywords
  if (!lead.service) {
    if (SHEET_DATA["services"]) {
      const services = SHEET_DATA["services"].split("|").map(s => s.trim().toLowerCase());
      const matched  = services.find(s => lower.includes(s.split(" ")[0]));
      if (matched) lead.service = matched;
    }

    if (!lead.service) {
      const keywords = [
        "haircut","fade","beard","cut","trim","color","blowout",
        "massage","nails","lashes","wax","facial","cleaning",
        "plumbing","hvac","design","website","consult","repair",
        "install","coaching","training","landscaping","detailing",
        "painting","electrical","booking","appointment"
      ];
      const found = keywords.find(w => lower.includes(w));
      if (found) lead.service = found;
    }
  }

  // Fallback: grab service from last AI message context
  if (!lead.service && chatHistory.length > 0) {
    const lastAI = chatHistory.filter(m => m.role === "assistant").pop();
    if (lastAI) {
      const aiKeywords = ["plumbing","handyman","repair","install","coaching","training","cleaning"];
      const found = aiKeywords.find(w => lastAI.content.toLowerCase().includes(w));
      if (found) lead.service = found;
    }
  }
}


// ============================================================
//  ⑧ LEAD HELPERS — check completion and build prompt context
// ============================================================
function isLeadComplete() {
  return !!(lead.name && lead.email && lead.phone && lead.service);
}

// Injected into every AI prompt so the AI knows what to collect next
function leadStatus() {
  return `
CURRENT LEAD STATUS:
- Name    : ${lead.name    || "MISSING — ask their name first"}
- Service : ${lead.service || "MISSING — ask what service they need"}
- Email   : ${lead.email   || "MISSING — ask after service is known"}
- Phone   : ${lead.phone   || "MISSING — ask last"}
- Complete: ${isLeadComplete() ? "YES — thank them, say team will be in touch" : "NO — collect what is missing, one at a time"}

COLLECTION ORDER: Name → Service → Email → Phone
Never ask for something already collected.
  `.trim();
}


// ============================================================
//  ⑨ BOOKING BUTTON — shown in chat when lead is complete
//  Requires a "booking_link" row in your Google Sheet.
//  If no booking_link is found, nothing is shown.
// ============================================================
function showBookingButton() {
  const bookingLink = SHEET_DATA["booking_link"];
  if (!bookingLink) return;

  const container = document.getElementById("ai-response-container");
  const wrap      = document.createElement("div");
  wrap.className  = "ai-booking-btn-wrap";
  wrap.innerHTML  = `<a href="${bookingLink}" target="_blank" class="ai-booking-btn">📅 Book Your Appointment →</a>`;
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}


// ============================================================
//  ⑩ SAVE LEAD TO GOOGLE SHEET — fires once when lead is full
//  Uses no-cors because Google Apps Script requires it from browser.
//  To set up: deploy an Apps Script web app that accepts POST
//  with fields: name, service, email, phone, business, transcript
// ============================================================
async function saveLeadToSheet() {
  if (leadSent) return;
  leadSent = true;

  const bizName    = SHEET_DATA["business_name"] || "Business";
  const transcript = chatHistory
    .map(m => `${m.role === "user" ? "Customer" : "AI"}: ${m.content}`)
    .join("\n");

  try {
    await fetch(CONFIG.LEADS_SHEET_URL, {
      method:  "POST",
      mode:    "no-cors",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name: lead.name, service: lead.service,
        email: lead.email, phone: lead.phone,
        business: bizName, transcript,
      }),
    });
    console.log("✅ Lead saved:", lead.name);
  } catch (err) {
    console.error("❌ Sheet save failed:", err);
    leadSent = false;
  }
}


// ============================================================
//  ⑪ SEND MESSAGE — main handler for user input
// ============================================================
async function send(overrideMsg = null) {
  const input     = document.getElementById("ai-msg");
  const container = document.getElementById("ai-response-container");
  const userText  = overrideMsg || input.value.trim();
  if (!userText) return;

  // Render user bubble
  container.innerHTML +=
    `<div class="ai-message-row ai-row-user">
       <div class="ai-avatar ai-avatar-user">U</div>
       <div class="ai-msg-bubble ai-msg-user">${userText}</div>
     </div>`;

  if (!overrideMsg) input.value = "";

  extractLeadData(userText);
  chatHistory.push({ role: "user", content: userText });

  // Typing indicator
  const bubbleId = "ai-bubble-" + Date.now();
  container.innerHTML +=
    `<div class="ai-message-row ai-row-ai">
       <div class="ai-avatar ai-avatar-ai">
         <svg style="width:14px;height:14px;fill:#000" viewBox="0 0 24 24">
           <path d="M9,5L7,11L1,13L7,15L9,21L11,15L17,13L11,11L9,5"/>
         </svg>
       </div>
       <div id="${bubbleId}" class="ai-msg-bubble ai-msg-ai thinking-state">
         <div class="ai-thinking-dots">
           <div class="ai-dot"></div>
           <div class="ai-dot"></div>
           <div class="ai-dot"></div>
         </div>
       </div>
     </div>`;
  container.scrollTop = container.scrollHeight;

  const reply = await streamResponse(bubbleId);
  chatHistory.push({ role: "assistant", content: reply });

  // Save lead + show booking button once all 4 fields are collected
  if (isLeadComplete() && !leadSent) {
    saveLeadToSheet();
    showBookingButton();
  }
}


// ============================================================
//  ⑫ AI STREAM — calls your backend /api/chat endpoint
//  Expects a streaming response from OpenAI-compatible API.
//  The systemContext is rebuilt every message so the AI always
//  knows the latest lead status and business info.
// ============================================================
async function streamResponse(bubbleId) {
  const bubble    = document.getElementById(bubbleId);
  const container = document.getElementById("ai-response-container");

  const systemContext = `
You are a helpful AI sales assistant for this business.
Be friendly, direct, and conversational. Never sound robotic.
Complete every sentence fully — never cut off mid-thought.

BUSINESS INFO:
${SHEET_STRING || "No business info loaded yet"}

${leadStatus()}

YOUR JOB:
1. Collection order: Name → Service → Email → Phone
2. Get one piece of info at a time. Never ask two questions at once.
3. Keep replies to 2–3 sentences. Always end with a question.
4. When lead is complete say: "Perfect! The team will reach out shortly about [service]."
5. Only discuss services listed in the business info above.
  `.trim();

  let fullReply        = "";
  let hasStartedTyping = false;

  try {
    const res = await fetch(CONFIG.API_ROUTE, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        sheetData:     SHEET_STRING,
        systemContext: systemContext,
        messages:      chatHistory.map(m => ({ role: m.role, content: m.content })),
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
              bubble.classList.remove("thinking-state");
              bubble.innerHTML = "";
              hasStartedTyping = true;
            }
            fullReply += content;
            bubble.innerText = fullReply;
            container.scrollTop = container.scrollHeight;
          }
        } catch (_) {}
      }
    }

  } catch (err) {
    bubble.innerHTML = "<i>Connection lost. Please try again.</i>";
    console.error("Stream error:", err);
  }

  return fullReply;
}


// ============================================================
//  ⑬ UI HELPERS
// ============================================================
function setGreeting(text) {
  document.getElementById("ai-response-container").innerHTML =
    `<div class="ai-message-row ai-row-ai">
       <div class="ai-avatar ai-avatar-ai">
         <svg style="width:14px;height:14px;fill:#000" viewBox="0 0 24 24">
           <path d="M9,5L7,11L1,13L7,15L9,21L11,15L17,13L11,11L9,5"/>
         </svg>
       </div>
       <div class="ai-msg-bubble ai-msg-ai">${text}</div>
     </div>`;
}

function toggleChat() {
  const win    = document.getElementById("ai-chat-window");
  const bubble = document.getElementById("ai-chat-bubble");
  const mobile = window.innerWidth <= 480;

  if (win.classList.contains("open")) {
    win.classList.remove("open");
    bubble.classList.remove("active-spiral");
    if (mobile) {
      bubble.style.opacity = "1";
      bubble.style.pointerEvents = "auto";
    }
    setTimeout(() => { win.style.display = "none"; }, 400);
  } else {
    win.style.display = "flex";
    setTimeout(() => {
      win.classList.add("open");
      bubble.classList.add("active-spiral");
      if (mobile) {
        bubble.style.opacity = "0";
        bubble.style.pointerEvents = "none";
      }
    }, 10);
  }
}

function closeModal() {
  document.getElementById("ai-exit-modal").classList.remove("active");
}

function claimOffer() {
  const promo = document.getElementById("ai-modal-promo").innerText;
  closeModal();
  if (!document.getElementById("ai-chat-window").classList.contains("open")) toggleChat();
  send(`I want to claim the ${promo} offer.`);
}


// ============================================================
//  ⑭ INIT — runs automatically when the script is imported
//  Order: inject styles → inject HTML → bind events → load sheet
// ============================================================
(function init() {
  injectStyles();
  injectHTML();
  bindEvents();
  loadSheet();
})();
