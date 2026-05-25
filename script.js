/* =========================================================
   ARCI DIGITAL — Client Application
   One-question-at-a-time form engine
   ========================================================= */

/* ---------- QUESTIONS ---------- */
const QUESTIONS = [
  {
    id: "fullName",
    type: "text",
    label: "What is your full name?",
    help: "Your full name — just so we know who's on the other side of this.",
    placeholder: "Type your full name…",
    required: true,
  },
  {
    id: "businessName",
    type: "text",
    label: "What is your business name?",
    help: "The brand we'd be working with.",
    placeholder: "e.g. Northshore Studios",
    required: true,
  },
  {
    id: "contactNumber",
    type: "text",
    label: "What's the best contact number to reach you?",
    help: "Include the country code if you're outside the US.",
    placeholder: "+1 (555) 000-0000",
    inputType: "tel",
    required: true,
  },
  {
    id: "industry",
    type: "single",
    label: "What industry does your business operate in?",
    help: "Pick the one that fits you best.",
    options: [
      "E-commerce / DTC",
      "Local Service Business",
      "Coaching / Info Products",
      "SaaS / Tech",
      "Real Estate",
      "Hospitality / F&B",
      "Health / Wellness",
      "Professional Services",
      "Something else",
    ],
    required: true,
  },
  {
    id: "businessAgeRevenue",
    type: "textarea",
    label: "How long has your business been operating, and what is your approximate monthly revenue range?",
    help: "A rough figure is fine — this helps us calibrate the strategy to your current stage.",
    placeholder: "e.g. We've been operating for 3 years and average around $40k/month in revenue.",
    required: true,
  },
  {
    id: "socialPresence",
    type: "textarea",
    label: "Do you currently have an active social media presence?",
    help: "If yes — which platforms, and how would you describe your current engagement? If no, just say so.",
    placeholder: "e.g. We post on Instagram and TikTok. Instagram has steady engagement, TikTok is hit or miss…",
    required: true,
  },
  {
    id: "paidAdsHistory",
    type: "textarea",
    label: "Have you invested in paid advertising before?",
    help: "If yes — what was your average monthly ad spend, and what results did you achieve?",
    placeholder: "e.g. Spent ~$5k/mo on Meta ads last year. ROAS was around 2x but plateaued…",
    required: true,
  },
  {
    id: "currentMarketing",
    type: "textarea",
    label: "Who is currently handling your marketing, and what made you look for a new partner?",
    help: "Be candid — yourself, an in-house team, another agency? And what's prompting the change?",
    placeholder: "e.g. We work with an agency now but feel they don't understand our brand…",
    required: true,
  },
  {
    id: "primaryGoal",
    type: "single",
    label: "What is your primary goal for the next 90 days?",
    help: "Pick the single most important outcome.",
    options: [
      "Brand awareness",
      "Lead generation",
      "Direct sales",
      "Scaling an existing campaign",
    ],
    required: true,
  },
  {
    id: "brandAssets",
    type: "multi",
    label: "Which brand assets do you currently have ready for use?",
    help: "Select everything you have available.",
    options: [
      "Logo",
      "Brand guidelines",
      "Professional photography",
      "Video content",
      "Website / landing pages",
      "Product imagery",
      "None of the above",
    ],
    required: true,
  },
  {
    id: "monthlyBudget",
    type: "single",
    label: "What is your allocated monthly budget for marketing services?",
    help: "Including both agency fees and ad spend combined.",
    options: [
      "Under $2,500 / month",
      "$2,500 – $5,000 / month",
      "$5,000 – $10,000 / month",
      "$10,000 – $25,000 / month",
      "$25,000 – $50,000 / month",
      "$50,000+ / month",
    ],
    required: true,
  },
  {
    id: "involvement",
    type: "single",
    label: "How involved do you plan to be in the content creation and approval process?",
    help: "There's no wrong answer — we'll structure things accordingly.",
    options: [
      "Hands-on — I want to be in every decision",
      "Collaborative — let's work together at key points",
      "Fully delegated — I trust you to run with it",
    ],
    required: true,
  },
  {
    id: "agencyHistory",
    type: "textarea",
    label: "Have you worked with a digital marketing agency before?",
    help: "If yes — what worked, what didn't, and what would you want done differently this time?",
    placeholder: "e.g. Worked with two agencies. Creative was great but reporting was opaque…",
    required: true,
  },
];

/* ---------- STATE ---------- */
const state = {
  step: -1,          // -1 = welcome, 0..N-1 = questions, N = finish
  total: QUESTIONS.length,
  answers: {},
  busy: false,       // prevents double-transitions
};

/* ---------- ELEMENTS ---------- */
const els = {
  questionsRoot: document.getElementById("questions"),
  welcome: document.querySelector('[data-screen="welcome"]'),
  finish: document.querySelector('[data-screen="finish"]'),
  startBtn: document.getElementById("startBtn"),
  backBtn: document.getElementById("backBtn"),
  nextBtn: document.getElementById("nextBtn"),
  nextLabel: document.getElementById("nextLabel"),
  controls: document.getElementById("controls"),
  progressFill: document.getElementById("progressFill"),
  progressLabel: document.getElementById("progressLabel"),
  progressWrap: document.querySelector(".progress-wrap"),
};

/* ---------- RENDER QUESTIONS ---------- */
function renderQuestions() {
  QUESTIONS.forEach((q, i) => {
    const screen = document.createElement("section");
    screen.className = "q-screen";
    screen.dataset.qid = q.id;
    screen.dataset.idx = i;

    screen.innerHTML = `
      <div class="q-inner">
        <div class="q-index">
          <span class="q-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="q-divider"></span>
          <span>Question ${i + 1} of ${state.total}</span>
        </div>
        <h2 class="q-label">
          ${escapeHtml(q.label)}${q.required ? '<span class="required">*</span>' : ""}
        </h2>
        ${q.help ? `<p class="q-help">${escapeHtml(q.help)}</p>` : ""}
        <div class="q-field">${renderField(q)}</div>
        <div class="field-error" data-error>Please provide an answer to continue.</div>
      </div>
    `;
    els.questionsRoot.appendChild(screen);
  });

  // Wire up interactive choices
  els.questionsRoot.querySelectorAll(".choice").forEach((node) => {
    node.addEventListener("click", () => handleChoiceClick(node));
  });
}

function renderField(q) {
  switch (q.type) {
    case "text":
      return `<input
        class="input-line"
        type="${q.inputType || "text"}"
        name="${q.id}"
        placeholder="${escapeAttr(q.placeholder || "")}"
        autocomplete="off"
        data-field />`;

    case "textarea":
      return `<textarea
        class="input-area"
        name="${q.id}"
        placeholder="${escapeAttr(q.placeholder || "")}"
        rows="5"
        data-field></textarea>`;

    case "single":
    case "multi":
      return `<div class="choices" data-field data-multi="${q.type === "multi"}">
        ${q.options
          .map(
            (opt, idx) => `
            <div class="choice" data-value="${escapeAttr(opt)}" data-key="${letterFromIndex(idx)}">
              <span class="key">${letterFromIndex(idx)}</span>
              <span class="label">${escapeHtml(opt)}</span>
              <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>`
          )
          .join("")}
      </div>`;
  }
  return "";
}

/* ---------- NAVIGATION ---------- */
function start() {
  go(0);
}

function go(targetStep) {
  if (state.busy) return;
  if (targetStep < -1 || targetStep > state.total) return;

  state.busy = true;
  const direction = targetStep > state.step ? "up" : "down";

  const current = currentScreen();
  const next = screenAt(targetStep);

  if (current) {
    current.classList.remove("active");
    current.classList.add(direction === "up" ? "exit-up" : "exit-down");
  }

  // small delay lets exit animation begin before entry
  setTimeout(() => {
    if (current) current.classList.remove("exit-up", "exit-down");

    state.step = targetStep;
    if (next) {
      next.classList.add("active");
      focusField(next);
    }

    updateChrome();
    state.busy = false;
  }, 260);
}

function currentScreen() {
  return screenAt(state.step);
}

function screenAt(step) {
  if (step === -1) return els.welcome;
  if (step === state.total) return els.finish;
  return els.questionsRoot.querySelector(`.q-screen[data-idx="${step}"]`);
}

function focusField(screen) {
  const input = screen.querySelector("input, textarea");
  if (input) {
    setTimeout(() => input.focus({ preventScroll: true }), 80);
  }
}

/* ---------- CHROME (header, controls) ---------- */
function updateChrome() {
  const onQuestion = state.step >= 0 && state.step < state.total;

  // Progress bar
  if (onQuestion || state.step === state.total) {
    els.progressWrap.classList.add("visible");
    const completed = state.step === state.total ? state.total : state.step;
    const pct = (completed / state.total) * 100;
    els.progressFill.style.width = `${pct}%`;
    els.progressLabel.textContent =
      state.step === state.total
        ? `${state.total} / ${state.total}`
        : `${state.step + 1} / ${state.total}`;
  } else {
    els.progressWrap.classList.remove("visible");
  }

  // Footer controls
  if (onQuestion) {
    els.controls.hidden = false;
    requestAnimationFrame(() => els.controls.classList.add("visible"));
    els.backBtn.disabled = state.step === 0;
    els.nextLabel.textContent =
      state.step === state.total - 1 ? "Submit Application" : "Continue";
  } else {
    els.controls.classList.remove("visible");
    setTimeout(() => {
      if (state.step < 0 || state.step >= state.total) {
        els.controls.hidden = true;
      }
    }, 260);
  }
}

/* ---------- VALIDATION + SUBMIT ---------- */
function attemptNext() {
  if (state.step < 0) { start(); return; }
  if (state.step >= state.total) return;

  const q = QUESTIONS[state.step];
  const screen = currentScreen();
  const error = screen.querySelector("[data-error]");
  error.classList.remove("visible");

  const value = readValue(q, screen);

  if (q.required && !isFilled(value)) {
    error.textContent = "Please provide an answer to continue.";
    error.classList.add("visible");
    return;
  }
  if (q.inputType === "email" && value && !isEmail(value)) {
    error.textContent = "That doesn't look like a valid email address.";
    error.classList.add("visible");
    return;
  }

  state.answers[q.id] = value;

  if (state.step === state.total - 1) {
    submit();
  } else {
    go(state.step + 1);
  }
}

function attemptBack() {
  if (state.step <= 0) return;
  go(state.step - 1);
}

function readValue(q, screen) {
  switch (q.type) {
    case "text":
    case "textarea":
      return screen.querySelector("[data-field]").value.trim();
    case "single": {
      const sel = screen.querySelector(".choice.selected");
      return sel ? sel.dataset.value : "";
    }
    case "multi": {
      return [...screen.querySelectorAll(".choice.selected")].map((n) => n.dataset.value);
    }
  }
  return "";
}

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function submit() {
  // In production, POST to your endpoint here.
  // fetch("/api/leads", { method:"POST", body: JSON.stringify(state.answers) })
  console.log("[Arci Digital] Lead submitted:", state.answers);
  go(state.total);
}

/* ---------- CHOICES ---------- */
function handleChoiceClick(node) {
  const wrap = node.parentElement;
  const multi = wrap.dataset.multi === "true";
  const screen = node.closest(".q-screen");
  const error = screen.querySelector("[data-error]");
  error.classList.remove("visible");

  if (multi) {
    node.classList.toggle("selected");
    return;
  }

  // single select
  wrap.querySelectorAll(".choice").forEach((n) => n.classList.remove("selected"));
  node.classList.add("selected");

  // auto-advance on single-choice for a snappy feel
  setTimeout(() => attemptNext(), 320);
}

/* ---------- KEYBOARD ---------- */
function onKeydown(e) {
  if (state.busy) return;

  // Enter advances unless typing in textarea (Enter = newline there)
  if (e.key === "Enter") {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "textarea" && !e.metaKey && !e.ctrlKey) return;
    e.preventDefault();
    attemptNext();
    return;
  }

  // Shift+Tab or ArrowUp for back? Keep it minimal — just letter-keys for choice picks.
  if (state.step >= 0 && state.step < state.total) {
    const q = QUESTIONS[state.step];
    if ((q.type === "single" || q.type === "multi") && /^[a-zA-Z]$/.test(e.key)) {
      const idx = e.key.toUpperCase().charCodeAt(0) - 65;
      const choices = currentScreen().querySelectorAll(".choice");
      if (choices[idx]) {
        e.preventDefault();
        handleChoiceClick(choices[idx]);
      }
    }
  }
}

/* ---------- HELPERS ---------- */
function letterFromIndex(i) {
  return String.fromCharCode(65 + i);
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeAttr(s) {
  return escapeHtml(s);
}

/* ---------- INIT ---------- */
function init() {
  renderQuestions();
  els.startBtn.addEventListener("click", start);
  els.nextBtn.addEventListener("click", attemptNext);
  els.backBtn.addEventListener("click", attemptBack);
  document.addEventListener("keydown", onKeydown);
  updateChrome();
}

document.addEventListener("DOMContentLoaded", init);
