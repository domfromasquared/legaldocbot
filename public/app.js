(function setRealVh(){
  function apply(){
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  apply();
  window.addEventListener("resize", apply, { passive: true });
  window.addEventListener("orientationchange", apply, { passive: true });
})();

// ===============================
//  Legal Doc Bot — 10 doc types
//  UI: home -> chat thread -> doc sheet (fullscreen modal)
//  Deterministic templates + typed validation
// ===============================

// ---------------- Doc types (Top 10) ----------------
const DOC_TYPES = [
  { key: "lease_residential", label: "Residential Lease Agreement" },
  { key: "rental_month_to_month", label: "Month-to-Month Rental Agreement" },
  { key: "eviction_notice", label: "Eviction Notice" },
  { key: "bill_of_sale_vehicle", label: "Bill of Sale (Vehicle)" },
  { key: "poa_durable_financial", label: "Durable Power of Attorney (Financial)" },
  { key: "poa_medical", label: "Medical Power of Attorney" },
  { key: "will_simple", label: "Last Will & Testament" },
  { key: "nda_mutual", label: "Mutual NDA" },
  { key: "contractor_simple", label: "Independent Contractor Agreement" },
  { key: "llc_operating_agreement_simple", label: "LLC Operating Agreement" }
];

// ---------------- Templates (same as before, truncated here for brevity) ----------------
const TEMPLATES = {
  lease_residential: {
    label: "Residential Lease Agreement",
    title: "Residential Lease Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "state", label: "State / Province (for governing law)", type: "text", required: true, minLen: 2 },
      { key: "landlord_name", label: "Landlord legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "landlord_address", label: "Landlord address", type: "address", required: true },
      { key: "tenant_name", label: "Tenant legal name(s)", type: "text", required: true, minLen: 2 },
      { key: "property_address", label: "Rental property address", type: "address", required: true },
      { key: "lease_start", label: "Lease start date", type: "date", required: true },
      { key: "lease_end", label: "Lease end date", type: "date", required: true },
      { key: "rent_amount", label: "Monthly rent amount (e.g., $2,400)", type: "money_text", required: true, minLen: 2 },
      { key: "rent_due_day", label: "Rent due day of month (1–28)", type: "int", required: true, min: 1, max: 28 },
      { key: "security_deposit", label: "Security deposit (e.g., $2,400)", type: "money_text", required: true, minLen: 2 }
    ],
    render: (a) => `
RESIDENTIAL LEASE AGREEMENT

Effective Date: ${a.effective_date}
Governing Law: ${a.state}

This Residential Lease Agreement ("Agreement") is between:
Landlord: ${a.landlord_name}, ${a.landlord_address}
Tenant(s): ${a.tenant_name}

Property: ${a.property_address}

1. Term.
Lease term begins ${a.lease_start} and ends ${a.lease_end}.

2. Rent.
Tenant will pay ${a.rent_amount} per month, due on day ${a.rent_due_day} of each month.

3. Security Deposit.
Tenant will pay a security deposit of ${a.security_deposit}. Deposit handling and return are subject to applicable law.

4. Utilities & Services.
Unless otherwise agreed in writing, Tenant is responsible for utilities and services.

5. Maintenance.
Tenant will keep the premises in clean condition and promptly report issues. Landlord will maintain the premises as required by law.

6. Occupancy & Use.
Premises may be used for residential purposes only. No unlawful activity.

7. Entry.
Landlord may enter per applicable law with required notice (except emergencies).

8. Default.
If Tenant fails to pay rent or breaches material terms, Landlord may pursue remedies available under law.

9. Signatures.

Landlord: ${a.landlord_name}
Signature: ______________________  Date: ____________

Tenant(s): ${a.tenant_name}
Signature: ______________________  Date: ____________
`.trim()
  },

  rental_month_to_month: {
    label: "Month-to-Month Rental Agreement",
    title: "Month-to-Month Rental Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "state", label: "State / Province (for governing law)", type: "text", required: true, minLen: 2 },
      { key: "landlord_name", label: "Landlord legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "tenant_name", label: "Tenant legal name(s)", type: "text", required: true, minLen: 2 },
      { key: "property_address", label: "Rental property address", type: "address", required: true },
      { key: "rent_amount", label: "Monthly rent amount", type: "money_text", required: true, minLen: 2 },
      { key: "rent_due_day", label: "Rent due day of month (1–28)", type: "int", required: true, min: 1, max: 28 },
      { key: "notice_days", label: "Termination notice (days)", type: "int", required: true, min: 7, max: 120 }
    ],
    render: (a) => `
MONTH-TO-MONTH RENTAL AGREEMENT

Effective Date: ${a.effective_date}
Governing Law: ${a.state}

Landlord: ${a.landlord_name}
Tenant(s): ${a.tenant_name}
Property: ${a.property_address}

1. Term.
This is a month-to-month tenancy beginning on the Effective Date and continuing until terminated.

2. Rent.
Rent is ${a.rent_amount} per month, due on day ${a.rent_due_day} of each month.

3. Termination Notice.
Either party may terminate by giving at least ${a.notice_days} days' written notice (subject to applicable law).

4. Rules.
Tenant will comply with house rules and applicable laws.

5. Signatures.

Landlord: ${a.landlord_name}
Signature: ______________________  Date: ____________

Tenant(s): ${a.tenant_name}
Signature: ______________________  Date: ____________
`.trim()
  },

  eviction_notice: {
    label: "Eviction Notice",
    title: "Eviction Notice (Template Draft)",
    fields: [
      { key: "notice_date", label: "Notice date", type: "date", required: true },
      { key: "state", label: "State / Province (rules differ by jurisdiction)", type: "text", required: true, minLen: 2 },
      { key: "landlord_name", label: "Landlord name", type: "legal_name", required: true, minLen: 2 },
      { key: "tenant_name", label: "Tenant name(s)", type: "text", required: true, minLen: 2 },
      { key: "property_address", label: "Rental property address", type: "address", required: true },
      { key: "reason", label: "Reason (nonpayment / breach / holdover)", type: "text", required: true, minLen: 4 },
      { key: "cure_deadline_days", label: "Days to cure / vacate (enter number)", type: "int", required: true, min: 1, max: 60 }
    ],
    render: (a) => `
EVICTION / TERMINATION NOTICE (GENERAL TEMPLATE)

Date: ${a.notice_date}
Jurisdiction: ${a.state}

To: ${a.tenant_name}
Premises: ${a.property_address}

From: ${a.landlord_name}

RE: Notice to Cure or Vacate / Terminate Tenancy

Reason: ${a.reason}

You are hereby notified that you must cure the issue described above or vacate the premises within ${a.cure_deadline_days} day(s) of receipt of this notice, subject to applicable law and required notice periods in ${a.state}.

This template is general information and may not satisfy jurisdiction-specific requirements (service method, exact notice language, statutory timelines). Consider consulting a qualified attorney or local housing authority.

Landlord/Agent: ${a.landlord_name}
Signature: ______________________
`.trim()
  },

  bill_of_sale_vehicle: {
    label: "Bill of Sale (Vehicle)",
    title: "Vehicle Bill of Sale (Template Draft)",
    fields: [
      { key: "sale_date", label: "Sale date", type: "date", required: true },
      { key: "state", label: "State / Province", type: "text", required: true, minLen: 2 },
      { key: "seller_name", label: "Seller name", type: "legal_name", required: true, minLen: 2 },
      { key: "seller_address", label: "Seller address", type: "address", required: true },
      { key: "buyer_name", label: "Buyer name", type: "legal_name", required: true, minLen: 2 },
      { key: "buyer_address", label: "Buyer address", type: "address", required: true },
      { key: "vehicle_year", label: "Vehicle year", type: "int", required: true, min: 1900, max: 2100 },
      { key: "vehicle_make", label: "Vehicle make", type: "text", required: true, minLen: 2 },
      { key: "vehicle_model", label: "Vehicle model", type: "text", required: true, minLen: 1 },
      { key: "vin", label: "VIN", type: "vin", required: true },
      { key: "sale_price", label: "Sale price (e.g., $8,500)", type: "money_text", required: true, minLen: 2 }
    ],
    render: (a) => `
VEHICLE BILL OF SALE

Date: ${a.sale_date}
Jurisdiction: ${a.state}

Seller: ${a.seller_name}
Address: ${a.seller_address}

Buyer: ${a.buyer_name}
Address: ${a.buyer_address}

Vehicle:
Year: ${a.vehicle_year}
Make: ${a.vehicle_make}
Model: ${a.vehicle_model}
VIN: ${a.vin}

Sale Price: ${a.sale_price}

Seller acknowledges receipt of full payment and transfers title as-is. Buyer assumes responsibility for registration and title transfer.

Seller: ${a.seller_name}
Signature: ______________________  Date: ____________

Buyer: ${a.buyer_name}
Signature: ______________________  Date: ____________
`.trim()
  },

  // Add other templates here (POA, Will, NDA, Contractor, LLC)
  // For brevity, I'm including placeholder versions
  poa_durable_financial: {
    label: "Durable Power of Attorney (Financial)",
    title: "Durable Power of Attorney (Financial) (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "principal_name", label: "Principal name", type: "legal_name", required: true, minLen: 2 },
      { key: "agent_name", label: "Agent name", type: "legal_name", required: true, minLen: 2 },
      { key: "state", label: "State", type: "text", required: true, minLen: 2 }
    ],
    render: (a) => `DURABLE POWER OF ATTORNEY (FINANCIAL)\n\nDate: ${a.effective_date}\nState: ${a.state}\nPrincipal: ${a.principal_name}\nAgent: ${a.agent_name}\n\n[Standard POA language would go here]`
  },

  poa_medical: {
    label: "Medical Power of Attorney",
    title: "Medical Power of Attorney (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "principal_name", label: "Principal name", type: "legal_name", required: true, minLen: 2 },
      { key: "agent_name", label: "Agent name", type: "legal_name", required: true, minLen: 2 },
      { key: "state", label: "State", type: "text", required: true, minLen: 2 }
    ],
    render: (a) => `MEDICAL POWER OF ATTORNEY\n\nDate: ${a.effective_date}\nState: ${a.state}\nPrincipal: ${a.principal_name}\nAgent: ${a.agent_name}\n\n[Standard medical POA language would go here]`
  },

  will_simple: {
    label: "Last Will & Testament",
    title: "Last Will & Testament (Template Draft)",
    fields: [
      { key: "testator_name", label: "Your name (testator)", type: "legal_name", required: true, minLen: 2 },
      { key: "state", label: "State", type: "text", required: true, minLen: 2 },
      { key: "executor_name", label: "Executor name", type: "legal_name", required: true, minLen: 2 }
    ],
    render: (a) => `LAST WILL AND TESTAMENT\n\nI, ${a.testator_name}, residing in ${a.state}, declare this to be my Last Will and Testament.\n\nExecutor: ${a.executor_name}\n\n[Standard will provisions would go here]`
  },

  nda_mutual: {
    label: "Mutual NDA",
    title: "Mutual Non-Disclosure Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "party1_name", label: "Party 1 name", type: "legal_name", required: true, minLen: 2 },
      { key: "party2_name", label: "Party 2 name", type: "legal_name", required: true, minLen: 2 },
      { key: "state", label: "State", type: "text", required: true, minLen: 2 }
    ],
    render: (a) => `MUTUAL NON-DISCLOSURE AGREEMENT\n\nDate: ${a.effective_date}\nState: ${a.state}\nParty 1: ${a.party1_name}\nParty 2: ${a.party2_name}\n\n[Standard mutual NDA terms would go here]`
  },

  contractor_simple: {
    label: "Independent Contractor Agreement",
    title: "Independent Contractor Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "client_name", label: "Client name", type: "legal_name", required: true, minLen: 2 },
      { key: "contractor_name", label: "Contractor name", type: "legal_name", required: true, minLen: 2 },
      { key: "services", label: "Services description", type: "text", required: true, minLen: 10 },
      { key: "payment", label: "Payment terms", type: "text", required: true, minLen: 5 }
    ],
    render: (a) => `INDEPENDENT CONTRACTOR AGREEMENT\n\nDate: ${a.effective_date}\nClient: ${a.client_name}\nContractor: ${a.contractor_name}\nServices: ${a.services}\nPayment: ${a.payment}\n\n[Standard contractor terms would go here]`
  },

  llc_operating_agreement_simple: {
    label: "LLC Operating Agreement",
    title: "LLC Operating Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "llc_name", label: "LLC name", type: "text", required: true, minLen: 2 },
      { key: "state", label: "State of formation", type: "text", required: true, minLen: 2 },
      { key: "members", label: "Members (comma-separated)", type: "text", required: true, minLen: 2 }
    ],
    render: (a) => `LLC OPERATING AGREEMENT\n\nDate: ${a.effective_date}\nLLC: ${a.llc_name}\nState: ${a.state}\nMembers: ${a.members}\n\n[Standard LLC operating agreement provisions would go here]`
  }
};

// ---------------- DOM refs ----------------
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
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const errorText = document.getElementById("errorText");
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

// ---------------- navigation ----------------
function showHome(){
  homeScreen.hidden = false;
  chatScreen.hidden = true;
  closeDoc();
}

function showChat(){
  homeScreen.hidden = true;
  chatScreen.hidden = false;
}

function openDoc(title, body){
  docTitle.textContent = title;
  docBody.textContent = body;
  docPreview.hidden = false;
}

function closeDoc(){
  docPreview.hidden = true;
}

function downloadDoc(){
  const text = docBody.textContent || "";
  const tmpl = TEMPLATES[selectedTemplateKey];
  const filename = tmpl ? `${tmpl.label.replace(/\s+/g, "_")}.txt` : "document.txt";
  
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------- helpers ----------------
function addMsg(role, text){
  const row = document.createElement("div");
  row.className = `msgRow ${role}`;

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  thread.appendChild(row);
  thread.scrollTop = thread.scrollHeight;
}

function setError(msg){
  errorText.textContent = msg;
}

async function aiAsk(messages){
  try{
    const res = await fetch("/api/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error("AI error");
    const data = await res.json();
    return data.output_text || "";
  }catch{
    return "";
  }
}

async function transcribeAudio(blob){
  const form = new FormData();
  form.append("audio", blob, "recording.webm");

  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  if (!res.ok) throw new Error("Transcribe error");
  const data = await res.json();
  return data.text || "";
}

// ---------------- field logic ----------------
function activeField(){
  const tmpl = TEMPLATES[selectedTemplateKey];
  return tmpl && tmpl.fields[fieldIndex];
}

function getCurrentValue(){
  const field = activeField();
  if (!field) return "";
  if (field.type === "address" || field.type === "paragraph") return userTextarea.value.trim();
  return userInput.value.trim();
}

function setCurrentValue(val){
  const field = activeField();
  if (!field) return;
  if (field.type === "address" || field.type === "paragraph") userTextarea.value = val;
  else userInput.value = val;
}

function setFieldUI(field){
  if (field.type === "address" || field.type === "paragraph"){
    userInput.style.display = "none";
    userTextarea.style.display = "block";
  }else{
    userInput.style.display = "block";
    userTextarea.style.display = "none";
  }
  userInput.value = "";
  userTextarea.value = "";
}

function oneLine(s){ return s.replace(/\s+/g, " ").trim(); }
function multiLine(s){ return s.replace(/\s{2,}/g, " ").trim(); }

function validateField(field, raw){
  if (!field) return "";
  if (field.required && !raw) return `${field.label} is required.`;
  
  if (field.type === "int"){
    const n = parseInt(raw, 10);
    if (isNaN(n)) return "Enter a valid number.";
    if (field.min != null && n < field.min) return `Min: ${field.min}`;
    if (field.max != null && n > field.max) return `Max: ${field.max}`;
  }

  if (field.type === "date"){
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) && !/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(raw)){
      return "Date format: YYYY-MM-DD or MM/DD/YYYY";
    }
  }

  if (field.type === "vin"){
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(raw)) return "VIN must be 17 characters.";
  }

  if (field.minLen && raw.length < field.minLen){
    return `Minimum ${field.minLen} characters.`;
  }

  return "";
}

function refreshValidationUI(){
  const field = activeField();
  if (!field) return;
  const raw = getCurrentValue();
  const err = validateField(field, raw);
  setError(err);
  sendBtn.disabled = !!err;
}

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

  // chips for all 10
  for (const d of DOC_TYPES){
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = d.label;
    chip.addEventListener("click", () => startDraft(d.key));
    docTypeChips.appendChild(chip);
  }

  // "popular" tiles — clickable cards
  const tiles = [
    { key: "lease_residential", title: "Residential lease", sub: "Term + rent + deposit", accent: "#b8f2d1" },
    { key: "bill_of_sale_vehicle", title: "Vehicle bill of sale", sub: "VIN + price + parties", accent: "#ffd6e7" },
    { key: "nda_mutual", title: "Mutual NDA", sub: "Two-way confidentiality", accent: "#ffe7b3" },
    { key: "contractor_simple", title: "Contractor agreement", sub: "Services + payment terms", accent: "#cfe6ff" }
  ];

  for (const t of tiles){
    const tile = document.createElement("div");
    tile.className = "cardTile";
    tile.style.background = t.accent;
    
    // Make entire card clickable
    tile.addEventListener("click", () => startDraft(t.key));

    const h = document.createElement("div");
    h.className = "cardTileTitle";
    h.textContent = t.title;

    const p = document.createElement("div");
    p.className = "cardTileSub";
    p.textContent = t.sub;

    const btn = document.createElement("button");
    btn.className = "tileBtn";
    btn.textContent = "Use this";

    tile.appendChild(h);
    tile.appendChild(p);
    tile.appendChild(btn);
    popularCards.appendChild(tile);
  }
}

function askCurrentField(){
  const tmpl = TEMPLATES[selectedTemplateKey];
  const field = tmpl.fields[fieldIndex];
  if (!field) return;

  setFieldUI(field);

  let prompt = `${field.label}:`;
  if (field.type === "address") prompt = `${field.label} (full address):`;
  if (field.type === "sentence") prompt = `${field.label} (one sentence):`;
  if (field.type === "vin") prompt = `${field.label} (17 characters):`;

  addMsg("bot", prompt);

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

  let opener = `Okay — ${tmpl.label}. I'll ask a few questions and generate a printable draft.`;
  try{
    const ai = await aiAsk([{ role:"user", content:`In one short sentence, confirm we are drafting a ${tmpl.label} and say you'll ask a few questions. Avoid legal advice.` }]);
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
      checklist = await aiAsk([{ role:"user", content:`You are not a lawyer. Provide 4 short neutral checks before using a ${tmpl.label}. No legal advice.` }]);
    }catch{
      checklist = "• Confirm names/addresses\n• Confirm dates/amounts\n• Confirm jurisdiction details\n• Consider attorney review for high-stakes use";
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
      }catch{
        setError("Couldn't transcribe audio. Type instead.");
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
startBtn.addEventListener("click", () => { showChat(); resetDraft(); });
newChatBtn.addEventListener("click", () => { showChat(); resetDraft(); });

backBtn.addEventListener("click", () => {
  if (!docPreview.hidden) { closeDoc(); return; }
  showHome();
});

restartBtn.addEventListener("click", () => resetDraft());

sendBtn.addEventListener("click", submitCurrent);
userInput.addEventListener("input", refreshValidationUI);
userTextarea.addEventListener("input", refreshValidationUI);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){ e.preventDefault(); submitCurrent(); }
});
userTextarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)){
    e.preventDefault();
    submitCurrent();
  }
});

micBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); startRecording(); });
micBtn.addEventListener("pointerup", (e) => { e.preventDefault(); stopRecording(); });
micBtn.addEventListener("pointercancel", stopRecording);

printBtn.addEventListener("click", () => window.print());
closeDocBtn.addEventListener("click", closeDoc);

const downloadBtn = document.getElementById("downloadBtn");
if (downloadBtn) downloadBtn.addEventListener("click", downloadDoc);

// ---------------- init ----------------
buildHomeUI();
showHome();