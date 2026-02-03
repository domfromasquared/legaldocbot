// ---------------- Doc types ----------------
const DOC_TYPES = [
  { key: "nda_mutual", label: "Mutual NDA" },
  { key: "contractor_simple", label: "Contractor Agreement" }
];

// ---------------- Templates (typed fields) ----------------
const TEMPLATES = {
  nda_mutual: {
    label: "Mutual NDA",
    title: "Mutual Non-Disclosure Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "party_a_name", label: "Party A legal name", type: "text", required: true, minLen: 2 },
      { key: "party_a_address", label: "Party A address", type: "address", required: true },
      { key: "party_b_name", label: "Party B legal name", type: "text", required: true, minLen: 2 },
      { key: "party_b_address", label: "Party B address", type: "address", required: true },
      { key: "purpose", label: "Purpose (one sentence)", type: "sentence", required: true, minLen: 12, maxLen: 240 },
      { key: "term_years", label: "Confidentiality term (years)", type: "int", required: true, min: 1, max: 25 },
      { key: "governing_law", label: "Governing law (state/country)", type: "text", required: true, minLen: 2 }
    ],
    render: (a) => `
MUTUAL NON-DISCLOSURE AGREEMENT

Effective Date: ${a.effective_date}

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into by and between:

(1) ${a.party_a_name}, located at ${a.party_a_address} ("Party A"); and
(2) ${a.party_b_name}, located at ${a.party_b_address} ("Party B").

1. Purpose.
The parties wish to explore and/or conduct discussions regarding: ${a.purpose} (the "Purpose"). In connection with the Purpose, each party may disclose Confidential Information to the other.

2. Confidential Information.
"Confidential Information" means non-public information disclosed by either party, whether oral, written, visual, or electronic, that is designated confidential or should reasonably be understood to be confidential given the nature of the information and the circumstances.

3. Exclusions.
Confidential Information does not include information that the receiving party can demonstrate: (a) is or becomes public through no breach; (b) was lawfully known before disclosure; (c) is independently developed without use of Confidential Information; or (d) is lawfully received from a third party without duty of confidentiality.

4. Obligations.
The receiving party will: (a) use Confidential Information solely for the Purpose; (b) protect it using reasonable care (no less than the care used to protect its own similar information); and (c) restrict disclosure to employees/contractors who need to know for the Purpose and are bound by confidentiality obligations at least as protective as this Agreement.

5. Compelled Disclosure.
If legally compelled to disclose Confidential Information, the receiving party will (to the extent permitted) provide prompt notice and reasonable cooperation to allow the disclosing party to seek a protective order or other remedy.

6. Term.
This Agreement begins on the Effective Date. Confidentiality obligations continue for ${a.term_years} year(s) from the date of each disclosure.

7. No License; No Warranty.
All Confidential Information remains the property of the disclosing party. No license or other rights are granted except as expressly stated. Confidential Information is provided “as is.”

8. Governing Law.
This Agreement is governed by the laws of ${a.governing_law}, without regard to conflict of laws principles.

9. Signatures.

Party A: ${a.party_a_name}
Signature: ______________________   Date: ____________

Party B: ${a.party_b_name}
Signature: ______________________   Date: ____________
`.trim()
  },

  contractor_simple: {
    label: "Independent Contractor Agreement",
    title: "Independent Contractor Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "client_name", label: "Client legal name", type: "text", required: true, minLen: 2 },
      { key: "client_address", label: "Client address", type: "address", required: true },
      { key: "contractor_name", label: "Contractor legal name", type: "text", required: true, minLen: 2 },
      { key: "contractor_address", label: "Contractor address", type: "address", required: true },
      { key: "services", label: "Services (1–2 sentences)", type: "paragraph", required: true, minLen: 12, maxLen: 420 },
      { key: "rate", label: "Compensation (e.g., $100/hr or $2,500 flat)", type: "money_text", required: true, minLen: 3, maxLen: 80 },
      { key: "payment_terms", label: "Payment terms (e.g., Net 15)", type: "text", required: true, minLen: 3, maxLen: 60 },
      { key: "governing_law", label: "Governing law (state/country)", type: "text", required: true, minLen: 2 }
    ],
    render: (a) => `
INDEPENDENT CONTRACTOR AGREEMENT

Effective Date: ${a.effective_date}

This Agreement is between ${a.client_name}, located at ${a.client_address} ("Client") and
${a.contractor_name}, located at ${a.contractor_address} ("Contractor").

1. Services.
Contractor will perform the following services: ${a.services}

2. Compensation.
Client will pay Contractor ${a.rate}. Payment terms: ${a.payment_terms}.

3. Independent Contractor.
Contractor is an independent contractor and not an employee, partner, or agent of Client.

4. Confidentiality.
Contractor will keep Client’s non-public information confidential and use it only to perform the services.

5. Intellectual Property.
Unless otherwise agreed in writing, work product created specifically for Client under this Agreement is assigned to Client upon full payment.

6. Termination.
Either party may terminate with reasonable written notice. Client will pay for services performed through the termination date.

7. Governing Law.
This Agreement is governed by the laws of ${a.governing_law}.

8. Signatures.

Client: ${a.client_name}
Signature: ______________________   Date: ____________

Contractor: ${a.contractor_name}
Signature: ______________________   Date: ____________
`.trim()
  }
};

// ---------------- UI refs ----------------
const homeScreen = document.getElementById("homeScreen");
const chatScreen = document.getElementById("chatScreen");

const docTypeChips = document.getElementById("docTypeChips");
const popularCards = document.getElementById("popularCards");

const startBtn = document.getElementById("startBtn");
const newChatBtn = document.getElementById("newChatBtn");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");

const chatTitle = document.getElementById("chatTitle");
const chatTitlePill = document.getElementById("chatTitlePill");

const thread = document.getElementById("thread");

const userInput = document.getElementById("userInput");
const userTextarea = document.getElementById("userTextarea");
const errorText = document.getElementById("errorText");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

const docPreview = document.getElementById("docPreview");
const docTitle = document.getElementById("docTitle");
const docBody = document.getElementById("docBody");
const printBtn = document.getElementById("printBtn");
const closeDocBtn = document.getElementById("closeDocBtn");

// ---------------- state ----------------
let selectedTemplateKey = null;
let fieldIndex = 0;
let answers = {};
let mediaRecorder = null;
let audioChunks = [];

// ---------------- API helpers ----------------
async function aiAsk(messages) {
  const res = await fetch("/api/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!res.ok) throw new Error(data.error || `AI error (${res.status})`);
  return data.output_text || "";
}

async function transcribeAudio(blob) {
  const form = new FormData();
  form.append("audio", blob, "input.webm");
  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!res.ok) throw new Error(data.error || `Transcription error (${res.status})`);
  return data.text || "";
}

// ---------------- helpers ----------------
function oneLine(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
function multiLine(s) { return String(s || "").replace(/[ \t]+\n/g, "\n").trim(); }

function activeField() {
  if (!selectedTemplateKey) return null;
  return TEMPLATES[selectedTemplateKey].fields[fieldIndex] || null;
}

function setError(t){ errorText.textContent = t || ""; }
function scrollThreadToBottom(){
  thread.scrollTop = thread.scrollHeight;
}

function addMsg(role, text){
  const row = document.createElement("div");
  row.className = `msgRow ${role === "me" ? "me" : "bot"}`;

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role === "me" ? "me" : "bot"}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  thread.appendChild(row);
  scrollThreadToBottom();
}

function setFieldUI(field){
  setError("");
  sendBtn.disabled = false;

  userTextarea.style.display = "none";
  userInput.style.display = "block";
  userInput.value = "";
  userTextarea.value = "";

  if (!field) return;

  if (field.type === "date") {
    userInput.type = "date";
    userInput.placeholder = "";
  } else if (field.type === "int") {
    userInput.type = "number";
    userInput.inputMode = "numeric";
    userInput.placeholder = "Enter a number…";
    if (field.min != null) userInput.min = String(field.min);
    if (field.max != null) userInput.max = String(field.max);
  } else if (field.type === "address" || field.type === "paragraph") {
    userInput.type = "text";
    userInput.style.display = "none";
    userTextarea.style.display = "block";
    userTextarea.placeholder = field.type === "address"
      ? "Street address\nCity, State ZIP"
      : "Type here…";
  } else {
    userInput.type = "text";
    userInput.placeholder = "Type here…";
  }
}

function getCurrentValue(){
  const field = activeField();
  if (!field) return "";
  return (field.type === "address" || field.type === "paragraph")
    ? userTextarea.value
    : userInput.value;
}

function setCurrentValue(val){
  const field = activeField();
  if (!field) return;
  if (field.type === "address" || field.type === "paragraph") userTextarea.value = val;
  else userInput.value = val;
}

// ---------------- validation ----------------
function looksLikeAddress(s){
  const t = multiLine(s);
  const hasDigit = /\d/.test(t);
  const wordCount = oneLine(t).split(" ").filter(Boolean).length;
  const hasBreak = /,|\n/.test(t);
  return hasDigit && wordCount >= 4 && hasBreak;
}

function validateField(field, raw){
  const v = (field.type === "address" || field.type === "paragraph") ? multiLine(raw) : oneLine(raw);
  if (field.required && !v) return `Required: ${field.label}.`;

  if (field.type === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Please pick a valid date.";
    return null;
  }

  if (field.type === "int") {
    if (!/^\d+$/.test(v)) return "Please enter a whole number.";
    const n = parseInt(v, 10);
    if (field.min != null && n < field.min) return `Must be at least ${field.min}.`;
    if (field.max != null && n > field.max) return `Must be ${field.max} or less.`;
    return null;
  }

  if (field.type === "address") {
    if (!looksLikeAddress(v)) return "Enter a full address (street + city/state, include comma or line break).";
    return null;
  }

  if (field.type === "sentence") {
    if (field.minLen && v.length < field.minLen) return `Add a bit more detail (${field.minLen}+ characters).`;
    if (field.maxLen && v.length > field.maxLen) return `Please shorten (${field.maxLen} characters max).`;
    if (!/[.?!]$/.test(v)) return "Make it one sentence (end with a period).";
    return null;
  }

  if (field.type === "paragraph") {
    if (field.minLen && v.length < field.minLen) return `Add more detail (${field.minLen}+ characters).`;
    if (field.maxLen && v.length > field.maxLen) return `Please shorten (${field.maxLen} characters max).`;
    return null;
  }

  if (field.minLen && v.length < field.minLen) return `Too short (${field.minLen}+ characters).`;
  if (field.maxLen && v.length > field.maxLen) return `Too long (${field.maxLen} characters max).`;
  return null;
}

function refreshValidationUI(){
  const field = activeField();
  if (!field) { setError(""); sendBtn.disabled = false; return; }
  const err = validateField(field, getCurrentValue());
  setError(err || "");
  sendBtn.disabled = Boolean(err);
}

// ---------------- screens ----------------
function showHome(){
  homeScreen.hidden = false;
  chatScreen.hidden = true;
  closeDoc();
}

function showChat(){
  homeScreen.hidden = true;
  chatScreen.hidden = false;
  setTimeout(() => thread.scrollTop = thread.scrollHeight, 0);
}

// ---------------- doc preview ----------------
function openDoc(title, text){
  docTitle.textContent = title;
  docBody.textContent = text;
  docPreview.hidden = false;
}
function closeDoc(){
  docPreview.hidden = true;
  docTitle.textContent = "";
  docBody.textContent = "";
}

// ---------------- flow ----------------
function resetDraft(){
  selectedTemplateKey = null;
  fieldIndex = 0;
  answers = {};
  thread.innerHTML = "";
  chatTitle.textContent = "Pick a document type";
  chatTitlePill.textContent = "Draft";
  setError("");
  userInput.value = "";
  userTextarea.value = "";
  setFieldUI({ type:"text", label:"" });
  addMsg("bot", "Choose a document type to get started.");
}

function buildHomeUI(){
  docTypeChips.innerHTML = "";
  popularCards.innerHTML = "";

  for (const d of DOC_TYPES){
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = d.label;
    chip.addEventListener("click", () => startDraft(d.key));
    docTypeChips.appendChild(chip);
  }

  // simple “popular” tiles
  const tiles = [
    { key: "nda_mutual", title: "Mutual NDA draft", sub: "Two-way confidentiality", accent: "#ffd6e7" },
    { key: "contractor_simple", title: "Contractor agreement", sub: "Services + payment terms", accent: "#b8f2d1" }
  ];

  for (const t of tiles){
    const tile = document.createElement("div");
    tile.className = "cardTile";
    tile.style.background = t.accent;

    const top = document.createElement("div");
    const h = document.createElement("div");
    h.className = "cardTileTitle";
    h.textContent = t.title;

    const p = document.createElement("div");
    p.className = "cardTileSub";
    p.textContent = t.sub;

    top.appendChild(h);
    top.appendChild(p);

    const btn = document.createElement("button");
    btn.className = "tileBtn";
    btn.textContent = "Use this";
    btn.addEventListener("click", () => startDraft(t.key));

    tile.appendChild(top);
    tile.appendChild(btn);
    popularCards.appendChild(tile);
  }
}

function askCurrentField(){
  const tmpl = TEMPLATES[selectedTemplateKey];
  const field = tmpl.fields[fieldIndex];
  if (!field) return;

  setFieldUI(field);
  addMsg("bot", `${field.label}${field.type === "address" ? " (full address)" : ""}:`);

  setTimeout(() => {
    if (field.type === "address" || field.type === "paragraph") userTextarea.focus();
    else userInput.focus();
    refreshValidationUI();
  }, 0);
}

async function startDraft(key){
  selectedTemplateKey = key;
  fieldIndex = 0;
  answers = {};
  thread.innerHTML = "";
  closeDoc();

  const tmpl = TEMPLATES[key];
  chatTitle.textContent = tmpl.label;
  chatTitlePill.textContent = tmpl.label;

  showChat();

  // friendly opener (AI) but not controlling flow
  let opener = `Okay — ${tmpl.label}. Let’s fill this out.`;
  try{
    const ai = await aiAsk([{ role:"user", content:`In one short sentence, confirm we are drafting a ${tmpl.label} and say you'll ask a few questions.` }]);
    if (ai) opener = ai;
  }catch{}

  addMsg("bot", opener);
  askCurrentField();
}

async function submitCurrent(){
  const tmpl = TEMPLATES[selectedTemplateKey];
  const field = activeField();
  if (!tmpl || !field) return;

  const raw = getCurrentValue();
  const err = validateField(field, raw);
  if (err){ setError(err); sendBtn.disabled = true; return; }

  const val = (field.type === "address" || field.type === "paragraph") ? multiLine(raw) : oneLine(raw);
  answers[field.key] = val;

  addMsg("me", val);

  fieldIndex += 1;

  if (fieldIndex >= tmpl.fields.length){
    const doc = tmpl.render(answers);

    let checklist = "";
    try{
      checklist = await aiAsk([{ role:"user", content:`You are not a lawyer. Provide 4 short neutral checks before signing a ${tmpl.label} (no legal advice).` }]);
    }catch{
      checklist = "• Confirm names/addresses\n• Confirm dates/term\n• Confirm governing law\n• Consider attorney review for high-stakes use";
    }

    addMsg("bot", "Done. Opening your draft…");
    openDoc(tmpl.title, doc + "\n\nREVIEW CHECKLIST (General info):\n" + (checklist || "").trim());
    return;
  }

  askCurrentField();
}

// ---------------- voice input ----------------
async function startRecording(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];

    try { mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" }); }
    catch { mediaRecorder = new MediaRecorder(stream); }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      try{
        const text = await transcribeAudio(blob);
        setCurrentValue(text);
        refreshValidationUI();
      }catch(e){
        setError("Couldn’t transcribe audio. Type instead.");
      }
    };

    mediaRecorder.start();
  }catch{
    setError("Mic permission denied. You can still type.");
  }
}

function stopRecording(){
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
}

// ---------------- events ----------------
startBtn.addEventListener("click", () => showChat() || resetDraft());
newChatBtn.addEventListener("click", () => showChat() || resetDraft());

backBtn.addEventListener("click", () => showHome());
restartBtn.addEventListener("click", () => resetDraft());

sendBtn.addEventListener("click", submitCurrent);

userInput.addEventListener("input", refreshValidationUI);
userTextarea.addEventListener("input", refreshValidationUI);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){ e.preventDefault(); submitCurrent(); }
});
userTextarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)){ e.preventDefault(); submitCurrent(); }
});

micBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); startRecording(); });
micBtn.addEventListener("pointerup", (e) => { e.preventDefault(); stopRecording(); });
micBtn.addEventListener("pointercancel", stopRecording);

printBtn.addEventListener("click", () => window.print());
closeDocBtn.addEventListener("click", closeDoc);

// ---------------- init ----------------
buildHomeUI();
showHome();
