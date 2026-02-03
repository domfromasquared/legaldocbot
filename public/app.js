// ===============================
//  Legal Doc Bot — 10 doc types
//  UI: home -> chat thread -> doc sheet
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

// ---------------- Templates (typed fields + starter drafts) ----------------
// NOTE: These are starter drafts. Not legal advice. Users should consult counsel for high-stakes use.
const TEMPLATES = {
  // 1) Residential Lease Agreement
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

  // 2) Month-to-month rental
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
Either party may terminate by giving at least ${a.notice_days} days’ written notice (subject to applicable law).

4. Rules.
Tenant will comply with house rules and applicable laws.

5. Signatures.

Landlord: ${a.landlord_name}
Signature: ______________________  Date: ____________

Tenant(s): ${a.tenant_name}
Signature: ______________________  Date: ____________
`.trim()
  },

  // 3) Eviction Notice (generic)
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

  // 4) Vehicle Bill of Sale
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

Purchase Price: ${a.sale_price}

The vehicle is sold “AS-IS” without warranties, except as required by law. Buyer acknowledges responsibility for registration, title transfer, taxes, and fees.

Seller Signature: ______________________  Date: ____________
Buyer Signature:  ______________________  Date: ____________
`.trim()
  },

  // 5) Durable POA (financial) - general starter
  poa_durable_financial: {
    label: "Durable Power of Attorney (Financial)",
    title: "Durable Power of Attorney (Financial) (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "state", label: "State / Province (very jurisdiction-specific)", type: "text", required: true, minLen: 2 },
      { key: "principal_name", label: "Principal full legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "principal_address", label: "Principal address", type: "address", required: true },
      { key: "agent_name", label: "Agent (attorney-in-fact) name", type: "legal_name", required: true, minLen: 2 },
      { key: "agent_address", label: "Agent address", type: "address", required: true },
      { key: "powers_summary", label: "Powers granted (brief summary)", type: "paragraph", required: true, minLen: 10, maxLen: 600 }
    ],
    render: (a) => `
DURABLE POWER OF ATTORNEY (FINANCIAL) — GENERAL TEMPLATE

Effective Date: ${a.effective_date}
Jurisdiction: ${a.state}

Principal: ${a.principal_name}
Address: ${a.principal_address}

Agent (Attorney-in-Fact): ${a.agent_name}
Address: ${a.agent_address}

1. Grant of Authority.
Principal appoints Agent to act on Principal’s behalf for financial matters as summarized:
${a.powers_summary}

2. Durability.
This Power of Attorney is intended to be durable, meaning it remains effective if Principal becomes incapacitated, to the extent permitted by law.

3. Reliance.
Third parties may rely on this document as allowed by applicable law.

IMPORTANT: Many jurisdictions require specific statutory language, disclosures, witness/notary rules, and special signing formalities for a valid durable POA. This template is general information only.

Principal Signature: ______________________  Date: ____________
Agent Signature (optional): ________________  Date: ____________
Notary/Witnesses: _________________________
`.trim()
  },

  // 6) Medical POA (healthcare proxy)
  poa_medical: {
    label: "Medical Power of Attorney",
    title: "Medical Power of Attorney / Healthcare Proxy (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "state", label: "State / Province (very jurisdiction-specific)", type: "text", required: true, minLen: 2 },
      { key: "principal_name", label: "Patient/Principal full legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "principal_address", label: "Patient/Principal address", type: "address", required: true },
      { key: "agent_name", label: "Healthcare agent name", type: "legal_name", required: true, minLen: 2 },
      { key: "agent_phone", label: "Healthcare agent phone", type: "phone", required: true },
      { key: "instructions", label: "Special instructions (optional, brief)", type: "paragraph_optional", required: false, maxLen: 600 }
    ],
    render: (a) => `
MEDICAL POWER OF ATTORNEY / HEALTHCARE PROXY — GENERAL TEMPLATE

Effective Date: ${a.effective_date}
Jurisdiction: ${a.state}

Patient/Principal: ${a.principal_name}
Address: ${a.principal_address}

Healthcare Agent: ${a.agent_name}
Phone: ${a.agent_phone}

1. Appointment.
Principal appoints the Healthcare Agent to make healthcare decisions if Principal is unable to communicate informed decisions, as permitted by law.

2. Scope.
Agent may consult with providers, access relevant medical information as permitted, and consent/refuse treatment consistent with applicable law and Principal’s known wishes.

3. Special Instructions (if any):
${a.instructions || "(none)"}

IMPORTANT: Medical directives often require specific statutory disclosures and witnessing rules. This template is general information only.

Principal Signature: ______________________  Date: ____________
Witness/Notary: ___________________________
`.trim()
  },

  // 7) Simple Will
  will_simple: {
    label: "Last Will & Testament",
    title: "Last Will & Testament (Template Draft)",
    fields: [
      { key: "state", label: "State / Province (witness rules vary)", type: "text", required: true, minLen: 2 },
      { key: "testator_name", label: "Your full legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "testator_address", label: "Your address", type: "address", required: true },
      { key: "executor_name", label: "Executor name", type: "legal_name", required: true, minLen: 2 },
      { key: "beneficiaries", label: "Beneficiaries and gifts (one per line)", type: "paragraph", required: true, minLen: 10, maxLen: 900 }
    ],
    render: (a) => `
LAST WILL & TESTAMENT — GENERAL TEMPLATE

Jurisdiction: ${a.state}

I, ${a.testator_name}, residing at ${a.testator_address}, declare this to be my Last Will & Testament. I revoke all prior wills and codicils.

1. Executor.
I appoint ${a.executor_name} as Executor of my estate. If unable or unwilling to serve, I authorize the court to appoint a successor.

2. Disposition of Property.
I give my property as follows:
${a.beneficiaries}

3. General Provisions.
My Executor may pay legally enforceable debts, expenses, and taxes from my estate. Any remaining property shall be distributed consistent with the gifts above.

IMPORTANT: Wills are highly formal and jurisdiction-specific (witness count, self-proving affidavits, notarization rules). This template is general information only.

Signed: ____________________________  Date: ____________
Printed Name: ${a.testator_name}

Witness 1: _________________________  Date: ____________
Witness 2: _________________________  Date: ____________
`.trim()
  },

  // 8) Mutual NDA
  nda_mutual: {
    label: "Mutual NDA",
    title: "Mutual Non-Disclosure Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "state", label: "Governing law (state/country)", type: "text", required: true, minLen: 2 },
      { key: "party_a_name", label: "Party A legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "party_a_address", label: "Party A address", type: "address", required: true },
      { key: "party_b_name", label: "Party B legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "party_b_address", label: "Party B address", type: "address", required: true },
      { key: "purpose", label: "Purpose (one sentence)", type: "sentence", required: true, minLen: 12, maxLen: 240 },
      { key: "term_years", label: "Confidentiality term (years)", type: "int", required: true, min: 1, max: 25 }
    ],
    render: (a) => `
MUTUAL NON-DISCLOSURE AGREEMENT

Effective Date: ${a.effective_date}

This Agreement is between:
Party A: ${a.party_a_name}, ${a.party_a_address}
Party B: ${a.party_b_name}, ${a.party_b_address}

1. Purpose.
The parties will share confidential information for: ${a.purpose}

2. Confidential Information.
Non-public information disclosed by either party that should reasonably be considered confidential.

3. Exclusions.
Information that is public through no breach, previously known, independently developed, or lawfully obtained from a third party.

4. Obligations.
Each party will use the information only for the Purpose, protect it with reasonable care, and share only with people who need to know and are bound by confidentiality.

5. Term.
Obligations continue for ${a.term_years} year(s) from disclosure.

6. Governing Law.
This Agreement is governed by ${a.state}.

Party A: ${a.party_a_name}  Signature: __________________  Date: ________
Party B: ${a.party_b_name}  Signature: __________________  Date: ________
`.trim()
  },

  // 9) Contractor Agreement
  contractor_simple: {
    label: "Independent Contractor Agreement",
    title: "Independent Contractor Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "state", label: "Governing law (state/country)", type: "text", required: true, minLen: 2 },
      { key: "client_name", label: "Client legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "client_address", label: "Client address", type: "address", required: true },
      { key: "contractor_name", label: "Contractor legal name", type: "legal_name", required: true, minLen: 2 },
      { key: "contractor_address", label: "Contractor address", type: "address", required: true },
      { key: "services", label: "Services (1–2 sentences)", type: "paragraph", required: true, minLen: 12, maxLen: 500 },
      { key: "rate", label: "Compensation (e.g., $100/hr or $2,500 flat)", type: "money_text", required: true, minLen: 3, maxLen: 80 },
      { key: "payment_terms", label: "Payment terms (e.g., Net 15)", type: "text", required: true, minLen: 3, maxLen: 60 }
    ],
    render: (a) => `
INDEPENDENT CONTRACTOR AGREEMENT

Effective Date: ${a.effective_date}

Client: ${a.client_name}, ${a.client_address}
Contractor: ${a.contractor_name}, ${a.contractor_address}

1. Services.
${a.services}

2. Compensation.
Client will pay Contractor ${a.rate}. Payment terms: ${a.payment_terms}.

3. Independent Contractor.
Contractor is an independent contractor, not an employee.

4. Confidentiality.
Contractor will keep Client’s non-public info confidential and use it only to perform Services.

5. Work Product.
Unless otherwise agreed, work product created specifically for Client is assigned to Client upon full payment.

6. Governing Law.
${a.state}

Client Signature: __________________  Date: ________
Contractor Signature: ______________  Date: ________
`.trim()
  },

  // 10) LLC Operating Agreement (simple single-member or basic multi-member)
  llc_operating_agreement_simple: {
    label: "LLC Operating Agreement",
    title: "LLC Operating Agreement (Template Draft)",
    fields: [
      { key: "effective_date", label: "Effective date", type: "date", required: true },
      { key: "state", label: "State of formation / governing law", type: "text", required: true, minLen: 2 },
      { key: "llc_name", label: "LLC legal name", type: "text", required: true, minLen: 2 },
      { key: "principal_address", label: "Principal business address", type: "address", required: true },
      { key: "members", label: "Members + ownership (one per line, e.g., Alex — 60%)", type: "paragraph", required: true, minLen: 8, maxLen: 900 },
      { key: "management", label: "Management (member-managed or manager-managed)", type: "text", required: true, minLen: 6 },
      { key: "purpose", label: "Business purpose (1 sentence)", type: "sentence", required: true, minLen: 10, maxLen: 240 }
    ],
    render: (a) => `
LIMITED LIABILITY COMPANY OPERATING AGREEMENT — BASIC TEMPLATE

Effective Date: ${a.effective_date}
State: ${a.state}

1. Company.
Name: ${a.llc_name}
Principal Address: ${a.principal_address}

2. Purpose.
${a.purpose}

3. Members & Ownership.
${a.members}

4. Management.
The Company is ${a.management}. Authority and duties are governed by this Agreement and applicable law.

5. Profits, Losses, and Distributions.
Profits and losses are allocated and distributions are made in proportion to ownership interests unless otherwise agreed in writing.

6. Records.
The Company will keep basic financial records and provide access to Members as required by law.

7. Governing Law.
This Agreement is governed by the laws of ${a.state}.

Member/Manager Signatures:
__________________________   Date: ____________
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

// ✅ added for save/download
let lastDocTitle = "";
let lastDocText = "";

// ---------------- API helpers (LLM used only for friendly copy) ----------------
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
function setError(t){ errorText.textContent = t || ""; }
function scrollThreadToBottom(){ thread.scrollTop = thread.scrollHeight; }

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

function activeField() {
  if (!selectedTemplateKey) return null;
  return TEMPLATES[selectedTemplateKey].fields[fieldIndex] || null;
}

// ---------------- typed input UI ----------------
function setFieldUI(field){
  setError("");
  sendBtn.disabled = false;

  userTextarea.style.display = "none";
  userInput.style.display = "block";
  userInput.value = "";
  userTextarea.value = "";

  // reset numeric constraints so they don't leak between fields
  userInput.removeAttribute("min");
  userInput.removeAttribute("max");
  userInput.inputMode = "";

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
  return (field.type === "address" || field.type === "paragraph") ? userTextarea.value : userInput.value;
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

function looksLikePhone(s){
  const t = oneLine(s);
  return /^\+?[\d\s().-]{7,}$/.test(t);
}

function looksLikeVIN(s){
  const t = oneLine(s).toUpperCase();
  // 17 chars, no I/O/Q
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(t);
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

  if (field.type === "phone") {
    if (!looksLikePhone(v)) return "Enter a valid phone number.";
    return null;
  }

  if (field.type === "vin") {
    if (!looksLikeVIN(v)) return "Enter a valid 17-character VIN (no I/O/Q).";
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

  // optional paragraph field
  if (field.type === "paragraph_optional") {
    if (!v) return null;
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
  // ✅ store for download
  lastDocTitle = title || "";
  lastDocText = text || "";

  docTitle.textContent = title;
  docBody.textContent = text;
  docPreview.hidden = false;
}
function closeDoc(){
  docPreview.hidden = true;
  docTitle.textContent = "";
  docBody.textContent = "";
}

// ✅ download helpers (TXT + Word .doc)
function safeFilename(name){
  return String(name || "legal-document")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "legal-document";
}

function downloadBlob(filename, content, mime){
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadDoc(){
  if (!lastDocText) {
    addMsg("bot", "No draft to download yet. Finish the questions first.");
    return;
  }
  const base = safeFilename(lastDocTitle || "document");

  // TXT
  downloadBlob(`${base}.txt`, lastDocText, "text/plain;charset=utf-8");

  // Word-compatible .doc (HTML wrapper)
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><pre style="font-family:Times New Roman, serif; white-space:pre-wrap; font-size:12pt; line-height:1.35;">${escapeHtml(lastDocText)}</pre></body></html>`;
  downloadBlob(`${base}.doc`, html, "application/msword;charset=utf-8");
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

  // chips for all 10
  for (const d of DOC_TYPES){
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = d.label;
    chip.addEventListener("click", () => startDraft(d.key));
    docTypeChips.appendChild(chip);
  }

  // "popular" tiles — you can change these anytime
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

  let opener = `Okay — ${tmpl.label}. I’ll ask a few questions and generate a printable draft.`;
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
// ✅ FIX 1: remove showChat() || resetDraft() bug
startBtn.addEventListener("click", () => { showChat(); resetDraft(); });
newChatBtn.addEventListener("click", () => { showChat(); resetDraft(); });

// ✅ FIX 2: Back closes doc preview first, else go home
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

// ✅ FIX 3: Add Save/Download button if present in HTML (no other UI changes required)
const downloadBtn = document.getElementById("downloadBtn");
if (downloadBtn) downloadBtn.addEventListener("click", downloadDoc);

// ---------------- init ----------------
buildHomeUI();
showHome();
