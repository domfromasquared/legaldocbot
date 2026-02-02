// ---------------- Templates (MVP) ----------------
const TEMPLATES = {
  nda_mutual: {
    label: "Mutual NDA",
    title: "Mutual Non-Disclosure Agreement (Template Draft)",
    fields: [
      { key: "effective_date", prompt: "What is the effective date? (e.g., Feb 2, 2026)" },
      { key: "party_a_name", prompt: "Party A legal name (company/person)?" },
      { key: "party_a_address", prompt: "Party A address?" },
      { key: "party_b_name", prompt: "Party B legal name (company/person)?" },
      { key: "party_b_address", prompt: "Party B address?" },
      { key: "purpose", prompt: "What is the purpose of sharing confidential info? (1 sentence)" },
      { key: "term_years", prompt: "How many years should confidentiality last? (number)" },
      { key: "governing_law", prompt: "Governing law (state/country)?" }
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
      { key: "effective_date", prompt: "Effective date? (e.g., Feb 2, 2026)" },
      { key: "client_name", prompt: "Client legal name?" },
      { key: "client_address", prompt: "Client address?" },
      { key: "contractor_name", prompt: "Contractor legal name?" },
      { key: "contractor_address", prompt: "Contractor address?" },
      { key: "services", prompt: "Describe the services (1–2 sentences)." },
      { key: "rate", prompt: "Compensation (e.g., $X/hour or $X flat)?" },
      { key: "payment_terms", prompt: "Payment terms (e.g., Net 15)?" },
      { key: "governing_law", prompt: "Governing law (state/country)?" }
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
const assistantText = document.getElementById("assistantText");
const choicesEl = document.getElementById("choices");
const inputRow = document.getElementById("inputRow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const hint = document.getElementById("hint");

const docPreview = document.getElementById("docPreview");
const docTitle = document.getElementById("docTitle");
const docBody = document.getElementById("docBody");
const printBtn = document.getElementById("printBtn");
const closeDocBtn = document.getElementById("closeDocBtn");

let selectedTemplateKey = null;
let fieldIndex = 0;
let answers = {};
let mediaRecorder = null;
let audioChunks = [];

function setAssistant(text) {
  assistantText.textContent = text;
}
function setHint(text) {
  hint.textContent = text || "";
}
function clearChoices() {
  choicesEl.innerHTML = "";
}
function addChoice(label, onClick) {
  const btn = document.createElement("button");
  btn.className = "choiceBtn";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  choicesEl.appendChild(btn);
}
function showInput(show) {
  inputRow.style.display = show ? "flex" : "none";
}
function sanitizeOneLine(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

// ---------------- API helpers ----------------
async function aiAsk(messages) {
  const res = await fetch("/api/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });

  // safer parsing if server returns non-json error pages
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

// ---------------- Flow ----------------
function start() {
  selectedTemplateKey = null;
  fieldIndex = 0;
  answers = {};
  closeDoc();

  clearChoices();
  showInput(true);
  userInput.value = "";
  setHint("Tip: tap 🎙️ and hold to speak (voice will be transcribed).");

  setAssistant("What kind of legal doc do you need?");
  addChoice("Mutual NDA", () => chooseTemplate("nda_mutual"));
  addChoice("Contractor Agreement", () => chooseTemplate("contractor_simple"));
  addChoice("Other (type it)", () => {
    clearChoices();
    setAssistant("Type what you need (e.g., “NDA”, “services agreement”, “contractor agreement”).");
  });
}

async function chooseTemplate(key) {
  selectedTemplateKey = key;
  fieldIndex = 0;
  answers = {};
  clearChoices();

  const label = TEMPLATES[key].label;
  const text = await aiAsk([
    { role: "user", content: `We selected: ${label}. In one short sentence, confirm and ask the first intake question.` }
  ]);

  setAssistant(text || `Okay — ${label}. ${TEMPLATES[key].fields[0].prompt}`);
  showNextField();
}

function showNextField() {
  if (!selectedTemplateKey) return;
  const tmpl = TEMPLATES[selectedTemplateKey];
  const f = tmpl.fields[fieldIndex];
  if (f) setAssistant(f.prompt);
}

async function handleAnswer(raw) {
  const val = sanitizeOneLine(raw);
  if (!val) return;

  if (!selectedTemplateKey) {
    const mapping = await aiAsk([
      { role: "user", content: `User requested: "${val}". Choose the closest from: Mutual NDA, Independent Contractor Agreement. Reply with exactly one: "nda_mutual" or "contractor_simple".` }
    ]);

    const chosen = mapping.includes("contractor") ? "contractor_simple" : "nda_mutual";
    return chooseTemplate(chosen);
  }

  const tmpl = TEMPLATES[selectedTemplateKey];
  const f = tmpl.fields[fieldIndex];

  answers[f.key] = val;
  fieldIndex += 1;

  if (fieldIndex >= tmpl.fields.length) {
    const doc = tmpl.render(answers);

    const checklist = await aiAsk([
      { role: "user", content: `You are not a lawyer. Provide 4 short neutral checks a user should verify before signing a ${tmpl.label} (no legal advice).` }
    ]);

    openDoc(
      tmpl.title,
      doc + "\n\n" + "REVIEW CHECKLIST (General info):\n" + (checklist || "").trim()
    );
    return;
  }

  const nextPrompt = tmpl.fields[fieldIndex].prompt;
  const friendly = await aiAsk([
    { role: "user", content: `User answered: "${val}". Ask the next question in a friendly concise way: "${nextPrompt}"` }
  ]);

  setAssistant(friendly || nextPrompt);
  userInput.value = "";
}

// ---------------- Voice input ----------------
async function startRecording() {
  try {
    setHint("Recording… release to stop.");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];

    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch {
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setHint("Transcribing…");
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      try {
        const text = await transcribeAudio(blob);
        setHint("");
        userInput.value = text;
        await handleAnswer(text);
      } catch (err) {
        setHint("Couldn’t transcribe audio. Try typing instead.");
        console.error(err);
      }
    };

    mediaRecorder.start();
  } catch (err) {
    setHint("Mic permission denied. You can still type.");
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
}

// ---------------- Doc preview ----------------
function openDoc(title, text) {
  docTitle.textContent = title;
  docBody.textContent = text;

  docPreview.hidden = false;
  docPreview.style.display = "flex"; // fallback
}

function closeDoc() {
  docPreview.hidden = true;
  docPreview.style.display = "none"; // fallback

  docTitle.textContent = "";
  docBody.textContent = "";
}

// ---------------- Events ----------------
sendBtn.addEventListener("click", async () => {
  setHint("");
  await handleAnswer(userInput.value);
});

userInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    setHint("");
    await handleAnswer(userInput.value);
  }
});

micBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  startRecording();
});
micBtn.addEventListener("pointerup", (e) => {
  e.preventDefault();
  stopRecording();
});
micBtn.addEventListener("pointercancel", stopRecording);

printBtn.addEventListener("click", () => window.print());
closeDocBtn.addEventListener("click", () => closeDoc());

start();
