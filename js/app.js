/* =========================================================================
 * Finance Tracker - app.js (single-file, file:// compatible)
 * Data lives in localStorage. CSV import/export to disk for portability.
 * ========================================================================= */
"use strict";

/* -------------------- Configuration -------------------- */
const STORAGE_KEY = "finance_tracker_v1";
const VERSION_KEY = "finance_tracker_seed_version";
const SEED_VERSION = 8; // bump only adds NEW sections / NEW taxonomy entries — never overwrites user data
const PDF_WORKER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
}

const SEED_FILES = {
  investments: "data/investments.csv",
  loans: "data/loans.csv",
  real_estate: "data/real_estate.csv",
  transactions: "data/transactions.csv",
  planned_budget: "data/planned_budget.csv",
  future_projections: "data/future_projections.csv",
  reward_targets: "data/reward_targets.csv",
  projection_segments: "data/projection_segments.csv",
  projection_segment_yearly: "data/projection_segment_yearly.csv",
  actual_overrides: "data/actual_overrides.csv",
  taxonomy: "data/taxonomy.csv",
  goals: "data/goals.csv"
};

const COLORS = [
  "#8b5cf6","#06b6d4","#10d9a3","#fbbf24","#f43f5e",
  "#ec4899","#38bdf8","#84cc16","#fb923c","#a78bfa",
  "#22d3ee","#f97316","#facc15","#0ea5e9","#94a3b8"
];

/* Theme + topbar */
function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("vault_theme", theme);
  // re-render the active tab so charts pick up new colors
  const active = $(".nav-item.active");
  if (active) renderTab(active.dataset.tab);
}
function initTheme() {
  const stored = localStorage.getItem("vault_theme") || "dark";
  document.body.setAttribute("data-theme", stored);
  const toggleHandler = () => {
    const next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
  };
  ["#theme-toggle", "#theme-toggle-mobile"].forEach(sel => {
    const el = $(sel); if (el) el.onclick = toggleHandler;
  });
}

const TAB_TITLES = {
  "dashboard":   { title: "Dashboard",       sub: "Your financial overview" },
  "investments": { title: "Investments",     sub: "All holdings across asset classes" },
  "loans":       { title: "Loans",           sub: "Outstanding debt & EMIs" },
  "real-estate": { title: "Real Estate",     sub: "Properties & valuations" },
  "expenses":    { title: "Expenses",        sub: "Transactions, trends, categories" },
  "planned":     { title: "Plan vs Actual",  sub: "Budget adherence & insights" },
  "statements":  { title: "Statements",      sub: "Upload PDF & CSV statements" },
  "projections": { title: "Future",          sub: "Long-term wealth projection" },
  "settings":    { title: "Settings",        sub: "Data storage, import & export" }
};
function updateTopbarTitle(tab) {
  const t = TAB_TITLES[tab] || { title: "", sub: "" };
  const titleEl = $("#topbar-title");
  const subEl = $("#topbar-sub");
  if (titleEl) titleEl.textContent = t.title;
  if (subEl) subEl.textContent = t.sub;
}

/* Merchant -> Category auto-classification (extend as you learn) */
const MERCHANT_RULES = [
  { match: /CHAI POINT|BRIMS|BURRITO|DHYAN DISHES|MC DONALDS|MCDONALD|STARBUCKS|CCD|BARBEQUE|HALDIRAM|DOMINOS|PIZZA|SWIGGY|ZOMATO|DISTRICT DINING/i, cat: "Dining", sub: "Restaurant" },
  { match: /AIRTEL PAYMENTS BANK|AIRTEL DTH|AIRTEL FIBER|AIRTEL BROADBAND/i, cat: "Utility", sub: "Mobile/Broadband" },
  { match: /BBPS PAYMENT RECEIVED|PAYMENT RECEIVED|CASHBACK CREDIT|CC CASHBACK|INTEREST CHARGE REVERSAL|LATE PAYMENT FEE REVERSAL|GST REVERSAL/i, cat: "Reversal", sub: "Credit/Cashback" },
  { match: /FUEL|PETROL|HPCL|IOCL|BPCL|SHELL/i, cat: "Fuel", sub: "Petrol" },
  { match: /AIRASIA|INDIGO|VISTARA|AKASA|AIR INDIA|SPICEJET|MAKEMYTRIP|YATRA|GOIBIBO|EASEMYTRIP|CLEARTRIP/i, cat: "Travel", sub: "Flights" },
  { match: /CLUB MAHINDRA|MARRIOTT|TAJ|OYO|HYATT|HILTON|RADISSON|AIRBNB|OBEROI/i, cat: "Travel", sub: "Hotels" },
  { match: /DCC FEE|FOREX|IGST-CI/i, cat: "Travel", sub: "Forex Fee" },
  { match: /BOOKMYSHOW|PVR|INOX|NETFLIX|HOTSTAR|PRIME VIDEO|SPOTIFY|YOUTUBE/i, cat: "Entertainment", sub: "Media" },
  { match: /GAME THEORY/i, cat: "Entertainment", sub: "Gaming Cafe" },
  { match: /POLICYBAZAAR/i, cat: "Insurance", sub: "General", note: "Large amounts may be ULIP - confirm" },
  { match: /ICICI ?LOMBARD|HDFC ERGO|BAJAJ ALLIANZ|TATA AIG|RELIANCE GENERAL/i, cat: "Insurance", sub: "General" },
  { match: /GANESH MEDICAL|APOLLO PHARMACY|MEDPLUS|1MG|NETMEDS/i, cat: "Medical", sub: "Pharmacy" },
  { match: /REWARD 360 GLOBAL SERV/i, cat: "Uncategorized", sub: "Reward 360 - verify" },
  { match: /ZUDIO|MYNTRA|AJIO|FLIPKART|AMAZON|MAX|RELIANCE TREND/i, cat: "Shopping", sub: "Apparel" },
  { match: /GOODGUDI|BIG BAZAAR|RELIANCE FRESH|MORE|DMART|BIGBASKET|BLINKIT|ZEPTO|INSTAMART/i, cat: "Grocery", sub: "Retail" },
  { match: /SCHOOLAY|SCHOOL|SHIKSHA|BYJU|EDUREKA/i, cat: "Education", sub: "School" },
  { match: /GYM|FITNESS|GYMNASTIC|YOGA|ZUMBA|CULT/i, cat: "Education", sub: "Fitness" },
  { match: /CRED|DREAMPLUG/i, cat: "Misc", sub: "CRED" },
  { match: /UBER|OLA|RAPIDO|METRO|IRCTC/i, cat: "Travel", sub: "Local Transport" },
  { match: /AIRTEL|JIO|VI |VODAFONE|BSNL/i, cat: "Utility", sub: "Mobile" },
  { match: /BBPS|RENT|HOUSE RENT/i, cat: "Rent", sub: "House Rent" },
];

/* -------------------- State -------------------- */
const appData = {
  investments: [],
  loans: [],
  real_estate: [],
  transactions: [],
  planned_budget: [],
  future_projections: [],
  reward_targets: [],
  projection_segments: [],
  projection_segment_yearly: [],
  actual_overrides: [],
  taxonomy: [],
  goals: [],
  assumptions: {
    return_pct: 8,
    inflation_pct: 6,
    annual_expense: 2700000,
    years: 30,
    rebalance_year: 2049,        // Year to shift Equity → FD (default age 60)
    nps_unlock_year: 2049,        // Year PF/NPS unlocks (age 60)
    nps_annuity_pct: 40           // % of NPS that goes to Pension Annuity (NPS Tier-1 rule)
  }
};

const charts = {}; // chartId -> Chart instance

/* -------------------- Utilities -------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const fmtINR = (n, opts = {}) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const decimals = opts.decimals !== undefined ? opts.decimals : 2;
  const lakhs = Number(n) / 100000;
  const sign = lakhs < 0 ? "-" : "";
  const abs = Math.abs(lakhs);
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return sign + "₹" + formatter.format(abs) + "L";
};
// Thousands formatter for monthly-scale numbers
const fmtK = (n, decimals = 2) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const k = Number(n) / 1000;
  const sign = k < 0 ? "-" : "";
  const abs = Math.abs(k);
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return sign + "₹" + formatter.format(abs) + "K";
};
// Scaled: L for annual, K for monthly/otherwise
const fmtScale = (n, scale) => scale === "L" ? fmtINR(n) : fmtK(n);

const fmtPct = (n, decimals = 1) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toFixed(decimals) + "%";
};

const monthKey = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
};
const yearKey = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return String(d.getFullYear());
};
const monthLabel = (key) => {
  const [y, m] = key.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleString("default", { month: "short", year: "numeric" });
};

const toast = (msg, type = "ok") => {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast show" + (type !== "ok" ? " " + type : "");
  setTimeout(() => t.classList.remove("show"), 2600);
};

const escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
  "&": "&amp;","<": "&lt;",">": "&gt;",'"': "&quot;","'": "&#39;"
}[c]));

const nextId = (collection) => {
  if (!collection.length) return 1;
  return Math.max(...collection.map(r => parseInt(r.id) || 0)) + 1;
};

/* ---- Taxonomy helpers ---- */
function getTaxonomy(type) {
  return Array.from(new Set(
    (appData.taxonomy || []).filter(t => t.type === type).map(t => t.name)
  )).sort((a, b) => a.localeCompare(b));
}
function getCategories() { return getTaxonomy("category"); }
function getCards() { return getTaxonomy("card"); }
function getSubcategories(category) {
  const all = (appData.taxonomy || []).filter(t => t.type === "subcategory");
  if (category) {
    const matching = all.filter(t => (t.parent || "") === category).map(t => t.name);
    if (matching.length) return Array.from(new Set(matching)).sort((a, b) => a.localeCompare(b));
  }
  return Array.from(new Set(all.map(t => t.name))).sort((a, b) => a.localeCompare(b));
}
function addToTaxonomy(type, name, parent = "") {
  name = String(name || "").trim();
  parent = String(parent || "").trim();
  if (!name) return false;
  const exists = (appData.taxonomy || []).some(t =>
    t.type === type &&
    t.name.toLowerCase() === name.toLowerCase() &&
    (t.parent || "").toLowerCase() === parent.toLowerCase()
  );
  if (exists) return false;
  if (!appData.taxonomy) appData.taxonomy = [];
  appData.taxonomy.push({
    id: nextId(appData.taxonomy),
    type, name, parent, notes: ""
  });
  return true;
}

/* -------------------- Storage -------------------- */
function saveAll() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateStorageInfo();
  } catch (e) {
    toast("Could not save to localStorage: " + e.message, "error");
  }
}
function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    Object.keys(appData).forEach(k => {
      if (parsed[k] !== undefined) appData[k] = parsed[k];
    });
    // No auto seed-loading. We only mark the version (so we don't re-check).
    // To load sample data, user clicks Settings → Load Seed Data explicitly.
    localStorage.setItem(VERSION_KEY, String(SEED_VERSION));
    return true;
  } catch (e) {
    console.error("Load failed:", e);
    return false;
  }
}
function updateStorageInfo() {
  const size = (localStorage.getItem(STORAGE_KEY) || "").length;
  const kb = (size / 1024).toFixed(1);
  const detail = `Stored: ${kb} KB · ${appData.transactions.length} txns · ${appData.investments.length} investments · ${appData.loans.length} loans · ${appData.real_estate.length} properties · ${appData.planned_budget.length} planned items`;
  const el = $("#storage-info");
  if (el) el.textContent = detail;
  const pill = $("#storage-info-pill");
  if (pill) pill.textContent = `${kb} KB · ${appData.transactions.length} txns`;
}

/* -------------------- CSV I/O -------------------- */
function parseCSV(text) {
  const res = Papa.parse(text, { header: true, dynamicTyping: false, skipEmptyLines: true });
  return res.data;
}
function toCSV(rows, columns) {
  if (!rows.length) return columns.join(",") + "\n";
  return Papa.unparse({ fields: columns, data: rows.map(r => columns.map(c => r[c] !== undefined ? r[c] : "")) });
}
function downloadCSV(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const CSV_SCHEMAS = {
  investments: ["id","entity","term","category","expiry","invested_lakh","current_value_lakh","realized_profit_lakh","owner","client_id","policy_number","due_date","notes"],
  loans: ["id","category","outstanding","end_year","emi","notes"],
  real_estate: ["id","property","address","owner","purchase_year","acquired_cost","current_value","outstanding_loan","monthly_rent","notes"],
  transactions: ["id","date","merchant","amount","category","subcategory","card","source_statement","notes"],
  planned_budget: ["id","category","subcategory","monthly","annual","payment_mode","notes"],
  future_projections: ["id","year","age","phase","total_assets_lakh","annual_expense_lakh","annual_income_lakh","net_change_lakh","locked","notes"],
  reward_targets: ["id","category","best_card","monthly_spend","reward_rate_pct","annual_reward_target"],
  projection_segments: ["id","name","type","monthly_amount","annual_amount","yoy_growth_pct","return_pct","start_year","end_year","current_balance","category","notes"],
  projection_segment_yearly: ["id","segment_id","year","annual_amount","return_pct","notes"],
  actual_overrides: ["id","period","category","amount","notes"],
  taxonomy: ["id","type","name","parent","notes"],
  goals: ["id","name","target_year","target_amount","current_allocation","monthly_contribution","expected_return_pct","priority","linked_segment","notes"]
};

function exportTable(name) {
  const csv = toCSV(appData[name], CSV_SCHEMAS[name]);
  downloadCSV(name + ".csv", csv);
  toast("Exported " + name + ".csv");
}
function importTable(name, file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const rows = parseCSV(e.target.result);
    if (!rows.length) { toast("No rows in CSV", "error"); return; }
    // Coerce numeric fields
    coerceNumeric(name, rows);
    appData[name] = rows;
    saveAll();
    renderAll();
    toast("Imported " + rows.length + " rows into " + name);
  };
  reader.readAsText(file);
}
function coerceNumeric(name, rows) {
  const numFields = {
    investments: ["invested_lakh","current_value_lakh","realized_profit_lakh"],
    loans: ["outstanding","emi","end_year"],
    real_estate: ["acquired_cost","current_value","outstanding_loan","monthly_rent","purchase_year"],
    transactions: ["amount"],
    planned_budget: ["monthly","annual"],
    future_projections: ["year","age","total_assets_lakh","annual_expense_lakh","annual_income_lakh","net_change_lakh"],
    reward_targets: ["monthly_spend","reward_rate_pct","annual_reward_target"],
    projection_segments: ["monthly_amount","annual_amount","yoy_growth_pct","return_pct","start_year","end_year","current_balance"],
    projection_segment_yearly: ["segment_id","year","annual_amount","return_pct"],
    actual_overrides: ["amount"],
    goals: ["target_year","target_amount","current_allocation","monthly_contribution","expected_return_pct"]
  }[name] || [];
  rows.forEach(r => {
    numFields.forEach(f => {
      if (r[f] !== undefined && r[f] !== "" && r[f] !== null) {
        const n = Number(String(r[f]).replace(/,/g, ""));
        if (!isNaN(n)) r[f] = n;
      }
    });
  });
}

/* -------------------- Seed Load (initial) -------------------- */
const IS_FILE_PROTOCOL = window.location.protocol === "file:";

async function loadSeed() {
  let loaded = 0;
  let usedEmbedded = false;
  for (const [name, path] of Object.entries(SEED_FILES)) {
    let text = null;
    // Only try fetch when served via HTTP — skip on file:// to avoid CORS errors
    if (!IS_FILE_PROTOCOL) {
      try {
        const res = await fetch(path);
        if (res.ok) text = await res.text();
      } catch (e) { /* fall through to embedded */ }
    }
    // Fallback to embedded seed
    if (!text && window.EMBEDDED_SEED && window.EMBEDDED_SEED[name]) {
      text = window.EMBEDDED_SEED[name];
      usedEmbedded = true;
    }
    if (!text) continue;
    try {
      const rows = parseCSV(text);
      coerceNumeric(name, rows);
      appData[name] = rows;
      loaded++;
    } catch (e) {
      console.warn("Could not parse " + name + ":", e.message);
    }
  }
  if (loaded) {
    saveAll();
    toast("Loaded " + loaded + " seed file(s)" + (usedEmbedded ? " (from embedded data)" : ""));
    renderAll();
  } else {
    toast("Could not load seed data. Use Settings > Bulk Import to load CSVs manually.", "warn");
  }
}

/* -------------------- Tabs -------------------- */
function initTabs() {
  const goToTab = (tab) => {
    $$(".nav-item").forEach(b => b.classList.remove("active"));
    $$(".view").forEach(v => v.classList.remove("active"));
    const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
    if (navItem) navItem.classList.add("active");
    const sec = document.getElementById(tab);
    if (sec) sec.classList.add("active");
    updateTopbarTitle(tab);
    renderTab(tab);
    document.body.classList.remove("drawer-open");
  };
  $$(".nav-item[data-tab]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      goToTab(btn.dataset.tab);
    });
  });
  // Wire any [data-jump-tab] anchors (cross-references between tabs)
  document.body.addEventListener("click", (e) => {
    const a = e.target.closest("[data-jump-tab]");
    if (!a) return;
    e.preventDefault();
    goToTab(a.dataset.jumpTab);
  });
}

/* Mobile drawer (hamburger menu) */
function initDrawer() {
  const closeDrawer = () => document.body.classList.remove("drawer-open");
  const openDrawer  = () => document.body.classList.add("drawer-open");
  const toggleDrawer = () => document.body.classList.toggle("drawer-open");

  const hamburger = $("#hamburger-btn");
  if (hamburger) hamburger.onclick = toggleDrawer;

  const backdrop = $("#drawer-backdrop");
  if (backdrop) backdrop.onclick = closeDrawer;

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("drawer-open")) closeDrawer();
  });

  // Close when crossing back to desktop width
  const mql = window.matchMedia("(max-width: 880px)");
  if (mql.addEventListener) mql.addEventListener("change", e => { if (!e.matches) closeDrawer(); });
}
function renderTab(name) {
  switch (name) {
    case "dashboard": renderDashboard(); break;
    case "investments": renderInvestments(); break;
    case "loans": renderLoans(); break;
    case "real-estate": renderRealEstate(); break;
    case "expenses": renderExpenses(); break;
    case "planned": renderPlannedActual(); break;
    case "statements": /* static */ break;
    case "income": renderIncome(); break;
    case "planned-expenses": renderPlannedExpenses(); break;
    case "goals": renderGoals(); break;
    case "projections": renderProjections(); break;
    case "settings": updateStorageInfo(); renderTaxonomyEditor(); break;
  }
}
function renderAll() {
  const active = $(".nav-item.active");
  if (active) renderTab(active.dataset.tab);
  updateStorageInfo();
}

/* -------------------- Chart helper -------------------- */
function themeColors() {
  const isLight = document.body.getAttribute("data-theme") === "light";
  return {
    text: isLight ? "rgba(15,20,35,0.74)" : "rgba(255,255,255,0.78)",
    textDim: isLight ? "rgba(15,20,35,0.42)" : "rgba(255,255,255,0.42)",
    grid: isLight ? "rgba(15,20,35,0.06)" : "rgba(255,255,255,0.06)",
    tooltipBg: isLight ? "rgba(255,255,255,0.96)" : "rgba(20,24,36,0.96)",
    tooltipBorder: isLight ? "rgba(15,20,35,0.12)" : "rgba(255,255,255,0.12)"
  };
}

function makeChart(canvasId, type, data, options = {}) {
  const ctx = $("#" + canvasId);
  if (!ctx) return;
  if (charts[canvasId]) { charts[canvasId].destroy(); }
  const tc = themeColors();

  // Apply gradient fill to line datasets if not already set
  if (type === "line" && data.datasets) {
    data.datasets.forEach((ds, i) => {
      if (ds.fill !== false && !ds._gradientApplied) {
        const c = ctx.getContext("2d");
        const grad = c.createLinearGradient(0, 0, 0, 300);
        const color = ds.borderColor || COLORS[i % COLORS.length];
        grad.addColorStop(0, color + "55");
        grad.addColorStop(1, color + "00");
        if (ds.fill) ds.backgroundColor = grad;
        ds.tension = ds.tension ?? 0.35;
        ds.borderWidth = ds.borderWidth ?? 2;
        ds.pointRadius = ds.pointRadius ?? 0;
        ds.pointHoverRadius = 4;
        ds._gradientApplied = true;
      }
    });
  }

  // For bar charts: rounded corners
  if (type === "bar" && data.datasets) {
    data.datasets.forEach(ds => {
      ds.borderRadius = ds.borderRadius ?? 6;
      ds.borderSkipped = false;
    });
  }

  // For doughnut: thicker cutout for modern look
  const isDonut = type === "doughnut" || type === "pie";

  // For doughnut/pie: precompute total to show percentages in legend + tooltip
  const donutTotal = isDonut && data.datasets && data.datasets[0]
    ? data.datasets[0].data.reduce((s, v) => s + (Number(v) || 0), 0)
    : 0;

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: "easeOutQuart" },
    cutout: isDonut ? "65%" : undefined,
    plugins: {
      legend: {
        position: isDonut ? "right" : "top",
        labels: {
          color: tc.text,
          font: { size: 11, family: "Inter", weight: "500" },
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
          usePointStyle: true,
          pointStyle: "circle",
          // For doughnut: show category · percentage in legend
          generateLabels: isDonut ? (chart) => {
            const d = chart.data;
            const ds = d.datasets[0];
            const bg = ds.backgroundColor;
            return d.labels.map((label, i) => {
              const val = Number(ds.data[i]) || 0;
              const pct = donutTotal > 0 ? (val / donutTotal * 100).toFixed(1) : "0.0";
              return {
                text: `${label} · ${pct}%`,
                fillStyle: Array.isArray(bg) ? bg[i % bg.length] : bg,
                strokeStyle: Array.isArray(bg) ? bg[i % bg.length] : bg,
                pointStyle: "circle",
                hidden: false,
                index: i
              };
            });
          } : undefined
        }
      },
      tooltip: {
        backgroundColor: tc.tooltipBg,
        borderColor: tc.tooltipBorder,
        borderWidth: 1,
        titleColor: tc.text,
        bodyColor: tc.text,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 12, weight: "600", family: "Inter" },
        bodyFont: { size: 12, family: "Inter" },
        boxPadding: 6,
        callbacks: {
          label: (ctx) => {
            const lbl = ctx.dataset.label || ctx.label || "";
            const val = ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed;
            if (isDonut && donutTotal > 0) {
              const pct = (Number(val) / donutTotal * 100).toFixed(1);
              return ` ${ctx.label}: ${fmtINR(val)} (${pct}%)`;
            }
            return ` ${lbl}: ${fmtINR(val)}`;
          }
        }
      }
    },
    scales: isDonut ? {} : {
      x: {
        ticks: { color: tc.textDim, font: { size: 10, family: "Inter" }, maxRotation: 0 },
        grid: { color: tc.grid, drawBorder: false }
      },
      y: {
        ticks: { color: tc.textDim, font: { size: 10, family: "Inter" }, callback: (v) => fmtINR(v) },
        grid: { color: tc.grid, drawBorder: false }
      }
    }
  };
  // Deep-ish merge
  const merged = JSON.parse(JSON.stringify(defaultOptions));
  Object.keys(options).forEach(k => {
    if (typeof options[k] === "object" && !Array.isArray(options[k])) {
      merged[k] = Object.assign({}, merged[k] || {}, options[k]);
    } else merged[k] = options[k];
  });
  charts[canvasId] = new Chart(ctx, { type, data, options: merged });
}

/* -------------------- Calculations -------------------- */
function totalInvestments() {
  return appData.investments.reduce((acc, r) => {
    acc.invested += Number(r.invested_lakh || 0) * 100000;
    acc.current += Number(r.current_value_lakh || 0) * 100000;
    acc.realized += Number(r.realized_profit_lakh || 0) * 100000;
    return acc;
  }, { invested: 0, current: 0, realized: 0 });
}
function totalLoans() {
  const active = appData.loans.filter(l => Number(l.outstanding || 0) > 0);
  return {
    outstanding: appData.loans.reduce((s, l) => s + Number(l.outstanding || 0), 0),
    emi: appData.loans.reduce((s, l) => s + Number(l.emi || 0), 0),
    activeCount: active.length
  };
}
function totalRealEstate() {
  return appData.real_estate.reduce((acc, r) => {
    acc.value += Number(r.current_value || 0);
    acc.loan += Number(r.outstanding_loan || 0);
    acc.rent += Number(r.monthly_rent || 0);
    return acc;
  }, { value: 0, loan: 0, rent: 0 });
}
function totalAssets() {
  const inv = totalInvestments();
  const re = totalRealEstate();
  return inv.current + re.value;
}
function totalLiabilities() {
  return totalLoans().outstanding;
}
function netWorth() {
  return totalAssets() - totalLiabilities();
}
function plannedMonthly() {
  return appData.planned_budget.reduce((s, r) => s + Number(r.monthly || 0), 0);
}

/* -------------------- Dashboard -------------------- */
function isAppDataEmpty() {
  const arrays = ["investments", "loans", "real_estate", "transactions", "planned_budget", "projection_segments", "goals"];
  return arrays.every(k => !appData[k] || appData[k].length === 0);
}

function renderDashboard() {
  // Show welcome card if nothing has been added yet (fresh visitor)
  const welcome = $("#welcome-card");
  if (welcome) welcome.style.display = isAppDataEmpty() ? "block" : "none";

  // ---- Compute investor metrics from Future tab segments ----
  const segments = appData.projection_segments || [];
  const investmentSegs = segments.filter(s => s.type === "investment");
  const incomeSegs = segments.filter(s => s.type === "income");
  const expenseSegs = segments.filter(s => s.type === "expense");

  const loans = totalLoans();
  const totalAssets = investmentSegs.reduce((sum, s) => sum + Number(s.current_balance || 0), 0);
  const totalLiabilities = loans.outstanding;
  const netWorth = totalAssets - totalLiabilities;

  // Liquid net worth: exclude Real Estate + Retirement
  const liquidAssets = investmentSegs
    .filter(s => !/real\s*estate|retirement|pf\b|nps/i.test(s.name || ""))
    .reduce((sum, s) => sum + Number(s.current_balance || 0), 0);
  const liquidNW = liquidAssets - totalLiabilities;

  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const debtVerdict = debtRatio < 20 ? "Healthy" : debtRatio < 40 ? "Moderate" : "High";

  const annualExpense = expenseSegs.reduce((sum, s) => sum + effectiveAnnual(s), 0);
  const monthlyExpense = annualExpense / 12;
  const runwayMonths = monthlyExpense > 0 ? totalAssets / monthlyExpense : Infinity;
  const runwayStr = isFinite(runwayMonths) ? Math.round(runwayMonths) + " mo" : "∞";

  const annualIncome = incomeSegs.reduce((sum, s) => sum + effectiveAnnual(s), 0);
  const annualInvestContrib = investmentSegs.reduce((sum, s) => sum + effectiveAnnual(s), 0);
  const savingsRate = annualIncome > 0 ? (annualInvestContrib / annualIncome) * 100 : 0;

  // FI (financial independence) target: 25x annual expense
  const fiTarget = annualExpense * 25;
  const fiCoverage = fiTarget > 0 ? (totalAssets / fiTarget) * 100 : 0;

  // Years to FI — scan the projection series for the first year where
  // projected assets >= 25 × that year's expenses (real moving target).
  let yearsToFI = null;
  let fiYear = null;
  try {
    const series = computeProjection();
    for (const row of series) {
      const yearExpense = (Number(row.annual_expense_lakh) || annualExpense / 100000) * 100000;
      const fiAtYear = yearExpense * 25;
      const assets = Number(row.total_assets_lakh) * 100000;
      if (fiAtYear > 0 && assets >= fiAtYear) {
        yearsToFI = row.year - new Date().getFullYear();
        fiYear = row.year;
        break;
      }
    }
  } catch (e) { console.warn("Years-to-FI compute failed:", e); }

  // ---- Render ----
  $("#kpi-networth").textContent = fmtINR(netWorth);
  $("#kpi-liquid-nw").textContent = fmtINR(liquidNW);
  $("#kpi-debt-ratio").textContent = fmtPct(debtRatio);
  $("#kpi-debt-ratio-meta").textContent = `${debtVerdict} · ${fmtINR(totalLiabilities)} debt`;
  $("#kpi-runway").textContent = runwayStr;

  $("#kpi-assets").textContent = fmtINR(totalAssets);
  $("#kpi-liabilities").textContent = "-" + fmtINR(totalLiabilities).replace("-","");
  $("#kpi-savings").textContent = fmtINR(annualInvestContrib);
  $("#kpi-savings-meta").textContent = annualIncome > 0 ? `of ${fmtINR(annualIncome)} income` : "no income set";
  $("#kpi-savings-rate").textContent = fmtPct(savingsRate);
  $("#kpi-monthly-planned").textContent = fmtINR(plannedMonthly());

  // This month spend
  const now = new Date();
  const thisMonthKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const monthTxns = appData.transactions.filter(t => monthKey(t.date) === thisMonthKey);
  const monthSpend = monthTxns.reduce((s, t) => s + Math.max(0, Number(t.amount || 0)), 0);
  $("#kpi-month-spend").textContent = fmtINR(monthSpend);

  const variance = monthSpend - plannedMonthly();
  const vEl = $("#kpi-variance");
  vEl.textContent = (variance >= 0 ? "+" : "") + fmtINR(variance);
  vEl.className = "kpi-value " + (variance > 0 ? "text-danger" : "text-success");

  $("#kpi-fi-coverage").textContent = fiTarget > 0 ? fmtPct(fiCoverage) : "—";

  // FI panel
  const setIf = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
  setIf("#fi-number", fiTarget > 0 ? fmtINR(fiTarget) : "—");
  if (yearsToFI != null) {
    setIf("#years-to-fi", yearsToFI + " yrs");
    setIf("#years-to-fi-meta", "Including " + Number(appData.assumptions.inflation_pct || 6) + "% expense inflation");
    setIf("#fi-year", String(fiYear));
    setIf("#fi-year-meta", "Age " + (37 + yearsToFI));
  } else {
    setIf("#years-to-fi", "∞");
    setIf("#years-to-fi-meta", "Current contributions don't outpace expense growth — increase savings or extend horizon");
    setIf("#fi-year", "—");
    setIf("#fi-year-meta", "Not reached in projection window");
  }
  setIf("#fi-coverage-big", fiTarget > 0 ? fmtPct(fiCoverage) : "—");
  setIf("#fi-coverage-meta", fiTarget > 0
    ? `Gap ${fmtINR(Math.max(0, fiTarget - totalAssets))}`
    : "Set expenses to compute");
  const bar = $("#fi-progress-bar");
  if (bar) bar.style.width = Math.max(0, Math.min(100, fiCoverage)) + "%";
  setIf("#fi-progress-label", fiTarget > 0 ? fmtPct(fiCoverage) + " of FI" : "—");

  // "As of" date string
  const asOf = $("#dash-as-of");
  if (asOf) asOf.textContent = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // Liquidity Ladder
  renderLiquidityLadder(investmentSegs, monthlyExpense);

  // Asset Allocation pie — sourced from Future tab investment segments (current_balance)
  const nonZero = investmentSegs.filter(s => Number(s.current_balance || 0) > 0);
  makeChart("chart-allocation", "doughnut", {
    labels: nonZero.map(s => s.name),
    datasets: [{
      data: nonZero.map(s => Number(s.current_balance || 0)),
      backgroundColor: COLORS,
      borderColor: "#1a2028",
      borderWidth: 2
    }]
  });

  // Net Worth Composition bar — each segment + loans (negative bar)
  const compLabels = [...investmentSegs.map(s => s.name), "Loans"];
  const compValues = [...investmentSegs.map(s => Number(s.current_balance || 0)), -loans.outstanding];
  const compColors = [...investmentSegs.map((_, i) => COLORS[i % COLORS.length]), COLORS[3]];
  makeChart("chart-networth", "bar", {
    labels: compLabels,
    datasets: [{ label: "₹", data: compValues, backgroundColor: compColors }]
  });

  // Spend by category last 30 days
  const since = new Date(); since.setDate(since.getDate() - 30);
  const recent = appData.transactions.filter(t => new Date(t.date) >= since && Number(t.amount) > 0);
  const byCat = {};
  recent.forEach(t => {
    byCat[t.category || "Uncategorized"] = (byCat[t.category || "Uncategorized"] || 0) + Number(t.amount);
  });
  const sortedCats = Object.entries(byCat).sort((a,b) => b[1]-a[1]);
  makeChart("chart-spend-cat", "doughnut", {
    labels: sortedCats.map(e => e[0]),
    datasets: [{ data: sortedCats.map(e => e[1]), backgroundColor: COLORS, borderColor: "#1a2028", borderWidth: 2 }]
  });

  // Monthly trend (last 12 months)
  const monthly = {};
  appData.transactions.forEach(t => {
    const k = monthKey(t.date);
    if (!k) return;
    monthly[k] = (monthly[k] || 0) + Math.max(0, Number(t.amount || 0));
  });
  const sortedMonths = Object.keys(monthly).sort().slice(-12);
  makeChart("chart-monthly-trend", "line", {
    labels: sortedMonths.map(monthLabel),
    datasets: [{
      label: "Spend",
      data: sortedMonths.map(k => monthly[k]),
      borderColor: COLORS[0],
      backgroundColor: "rgba(79,158,255,0.15)",
      fill: true, tension: 0.3
    }]
  });
}

/* -------------------- Investments tab -------------------- */
function renderInvestments() {
  const inv = totalInvestments();
  $("#inv-total-invested").textContent = fmtINR(inv.invested);
  $("#inv-total-current").textContent = fmtINR(inv.current);
  $("#inv-unrealised").textContent = fmtINR(inv.current - inv.invested);
  $("#inv-realised").textContent = fmtINR(inv.realized);

  // Category breakdown bar
  const cats = {};
  appData.investments.forEach(r => {
    const c = r.category || "Other";
    if (!cats[c]) cats[c] = { invested: 0, current: 0 };
    cats[c].invested += Number(r.invested_lakh || 0) * 100000;
    cats[c].current += Number(r.current_value_lakh || 0) * 100000;
  });
  const labels = Object.keys(cats);
  makeChart("chart-inv-category", "bar", {
    labels,
    datasets: [
      { label: "Invested", data: labels.map(l => cats[l].invested), backgroundColor: COLORS[7] },
      { label: "Current", data: labels.map(l => cats[l].current), backgroundColor: COLORS[1] }
    ]
  });

  // Table
  renderTable("tbl-investments", appData.investments, [
    { key: "entity", label: "Entity" },
    { key: "category", label: "Category" },
    { key: "term", label: "Term" },
    { key: "owner", label: "Owner" },
    { key: "invested_lakh", label: "Invested (L)", num: true },
    { key: "current_value_lakh", label: "Current (L)", num: true },
    { key: "realized_profit_lakh", label: "Realized (L)", num: true },
    { key: "expiry", label: "Expiry" },
    { key: "notes", label: "Notes" }
  ], "investments");
}

/* -------------------- Loans tab -------------------- */
function renderLoans() {
  const l = totalLoans();
  $("#loan-total-out").textContent = fmtINR(l.outstanding);
  $("#loan-total-emi").textContent = fmtINR(l.emi);
  $("#loan-active-count").textContent = l.activeCount;
  renderTable("tbl-loans", appData.loans, [
    { key: "category", label: "Category" },
    { key: "outstanding", label: "Outstanding", num: true, fmt: fmtINR },
    { key: "end_year", label: "End Year" },
    { key: "emi", label: "EMI", num: true, fmt: fmtINR },
    { key: "notes", label: "Notes" }
  ], "loans");
}

/* -------------------- Real Estate tab -------------------- */
function renderRealEstate() {
  const re = totalRealEstate();
  $("#re-count").textContent = appData.real_estate.length;
  $("#re-value").textContent = fmtINR(re.value);
  $("#re-loan").textContent = fmtINR(re.loan);
  $("#re-rent").textContent = fmtINR(re.rent);
  renderTable("tbl-real-estate", appData.real_estate, [
    { key: "property", label: "Property" },
    { key: "address", label: "Address" },
    { key: "owner", label: "Owner" },
    { key: "purchase_year", label: "Year" },
    { key: "acquired_cost", label: "Acquired", num: true, fmt: fmtINR },
    { key: "current_value", label: "Current Value", num: true, fmt: fmtINR },
    { key: "outstanding_loan", label: "Loan", num: true, fmt: fmtINR },
    { key: "monthly_rent", label: "Rent", num: true, fmt: fmtINR },
    { key: "notes", label: "Notes" }
  ], "real_estate");
}

/* -------------------- Expenses tab -------------------- */
function renderExpenses() {
  const mode = $("#exp-view-mode").value;
  populateExpensePeriod(mode);
  const period = $("#exp-period").value;

  let txns = appData.transactions.slice();
  if (mode === "month" && period) txns = txns.filter(t => monthKey(t.date) === period);
  else if (mode === "year" && period) txns = txns.filter(t => yearKey(t.date) === period);
  else if (mode === "category" && period) txns = txns.filter(t => (t.category || "") === period);

  // Summary
  const debits = txns.filter(t => Number(t.amount) > 0);
  const credits = txns.filter(t => Number(t.amount) < 0);
  const debitTotal = debits.reduce((s, t) => s + Number(t.amount), 0);
  const creditTotal = credits.reduce((s, t) => s + Number(t.amount), 0);
  $("#exp-summary").innerHTML = `
    <div class="summary"><span class="label">Transactions</span><span class="value">${txns.length}</span></div>
    <div class="summary"><span class="label">Total Spend</span><span class="value">${fmtINR(debitTotal)}</span></div>
    <div class="summary"><span class="label">Credits/Refunds</span><span class="value positive">${fmtINR(creditTotal)}</span></div>
    <div class="summary"><span class="label">Net</span><span class="value">${fmtINR(debitTotal + creditTotal)}</span></div>
  `;

  // Category pie
  const byCat = {};
  txns.forEach(t => {
    const c = t.category || "Uncategorized";
    byCat[c] = (byCat[c] || 0) + Math.max(0, Number(t.amount));
  });
  const sortedCat = Object.entries(byCat).sort((a,b) => b[1]-a[1]);
  makeChart("chart-exp-pie", "doughnut", {
    labels: sortedCat.map(e => e[0]),
    datasets: [{ data: sortedCat.map(e => e[1]), backgroundColor: COLORS, borderColor: "#1a2028", borderWidth: 2 }]
  });

  // Period trend (all-time view, regardless of filter)
  const trendBuckets = {};
  appData.transactions.forEach(t => {
    const k = mode === "year" ? yearKey(t.date) : monthKey(t.date);
    if (!k) return;
    trendBuckets[k] = (trendBuckets[k] || 0) + Math.max(0, Number(t.amount));
  });
  const sortedBuckets = Object.keys(trendBuckets).sort();
  makeChart("chart-exp-trend", "bar", {
    labels: sortedBuckets.map(k => mode === "year" ? k : monthLabel(k)),
    datasets: [{
      label: "Spend",
      data: sortedBuckets.map(k => trendBuckets[k]),
      backgroundColor: COLORS[0]
    }]
  });

  $("#exp-table-title").textContent = `Transactions (${txns.length})`;
  renderTable("tbl-expenses", txns, [
    { key: "date", label: "Date" },
    { key: "merchant", label: "Merchant" },
    { key: "category", label: "Category" },
    { key: "subcategory", label: "Subcategory" },
    { key: "amount", label: "Amount", num: true, fmt: fmtINR },
    { key: "card", label: "Source" },
    { key: "notes", label: "Notes" }
  ], "transactions");
}
function populateExpensePeriod(mode) {
  const sel = $("#exp-period");
  const prev = sel.value;
  let opts = [];
  if (mode === "month") {
    const keys = Array.from(new Set(appData.transactions.map(t => monthKey(t.date)).filter(Boolean))).sort().reverse();
    opts = keys.map(k => ({ value: k, label: monthLabel(k) }));
  } else if (mode === "year") {
    const keys = Array.from(new Set(appData.transactions.map(t => yearKey(t.date)).filter(Boolean))).sort().reverse();
    opts = keys.map(k => ({ value: k, label: k }));
  } else if (mode === "category") {
    const keys = Array.from(new Set(appData.transactions.map(t => t.category || "Uncategorized"))).sort();
    opts = keys.map(k => ({ value: k, label: k }));
  } else {
    opts = [{ value: "", label: "All" }];
  }
  sel.innerHTML = opts.map(o => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join("");
  // Preserve user selection across re-populates if still valid
  if (prev && opts.some(o => o.value === prev)) sel.value = prev;
  sel.style.display = mode === "all" ? "none" : "";
}

/* -------------------- Planned vs Actual -------------------- */
function findActualOverride(period, category) {
  return (appData.actual_overrides || []).find(o =>
    String(o.period) === String(period) && String(o.category) === String(category)
  );
}

function renderPlannedActual() {
  const mode = $("#pa-view-mode")?.value || "monthly";
  const scale = mode === "annual" ? "L" : "K";
  populatePlannedPeriod(mode);
  const period = $("#pa-period").value;

  // Filter transactions by period (month key or year key)
  const txns = appData.transactions.filter(t =>
    mode === "annual" ? yearKey(t.date) === period : monthKey(t.date) === period
  );

  // Compute actual from transactions
  const computedByCat = {};
  txns.forEach(t => {
    const c = t.category || "Uncategorized";
    computedByCat[c] = (computedByCat[c] || 0) + Number(t.amount);
  });

  // Aggregate planned by category from projection_segments (type=expense) — single source of truth.
  // The Planned Expenses tab manages these; this view aggregates them by their category.
  const plannedByCat = {};
  const expenseSegs = (appData.projection_segments || []).filter(s => s.type === "expense");
  expenseSegs.forEach(s => {
    const c = s.category || "Uncategorized";
    const annualV = effectiveAnnual(s);
    const v = mode === "annual" ? annualV : annualV / 12;
    plannedByCat[c] = (plannedByCat[c] || 0) + v;
  });
  // Legacy fallback: if no expense segments exist yet, fall back to the old planned_budget table
  // so users with pre-restructure data still see something.
  if (Object.keys(plannedByCat).length === 0 && Array.isArray(appData.planned_budget)) {
    const plannedField = mode === "annual" ? "annual" : "monthly";
    appData.planned_budget.forEach(p => {
      const c = p.category || "Uncategorized";
      const v = Number(p[plannedField] || 0)
        || (mode === "annual" ? Number(p.monthly || 0) * 12 : Number(p.annual || 0) / 12);
      plannedByCat[c] = (plannedByCat[c] || 0) + v;
    });
  }

  // Apply actual overrides for this period
  const periodOverrides = (appData.actual_overrides || []).filter(o => String(o.period) === String(period));
  const overrideCats = periodOverrides.map(o => o.category);

  // Union: planned + computed + overridden categories
  const allCats = Array.from(new Set([
    ...Object.keys(plannedByCat),
    ...Object.keys(computedByCat),
    ...overrideCats
  ])).sort();

  const rows = allCats.map(c => {
    const p = plannedByCat[c] || 0;
    const computed = computedByCat[c] || 0;
    const ov = findActualOverride(period, c);
    const isOverridden = !!ov;
    const a = isOverridden ? Number(ov.amount) : computed;
    const v = a - p;
    const vPct = p > 0 ? (v / p) * 100 : (a > 0 ? Infinity : 0);
    return { category: c, planned: p, actual: a, computed, isOverridden, variance: v, variance_pct: vPct };
  });

  const sumP = rows.reduce((s, r) => s + r.planned, 0);
  const sumA = rows.reduce((s, r) => s + r.actual, 0);
  $("#pa-planned").textContent = fmtScale(sumP, scale);
  $("#pa-actual").textContent = fmtScale(sumA, scale);
  const pv = sumA - sumP;
  const vEl = $("#pa-variance");
  vEl.textContent = (pv >= 0 ? "+" : "") + fmtScale(pv, scale);
  vEl.className = "value " + (pv > 0 ? "negative" : "positive");
  $("#pa-variance-pct").textContent = sumP > 0 ? fmtPct((pv / sumP) * 100) : "—";

  // Bar chart — sorted by variance abs
  const sorted = rows.slice().sort((a,b) => Math.abs(b.variance) - Math.abs(a.variance)).slice(0, 12);
  const yFmt = (v) => fmtScale(v, scale);
  makeChart("chart-pa-bar", "bar", {
    labels: sorted.map(r => r.category),
    datasets: [
      { label: "Planned", data: sorted.map(r => r.planned), backgroundColor: COLORS[0] },
      { label: "Actual", data: sorted.map(r => r.actual), backgroundColor: COLORS[3] }
    ]
  }, {
    scales: {
      y: { ticks: { color: "#9aa5b1", font: { size: 11 }, callback: yFmt }, grid: { color: "#2d3744" } }
    }
  });

  // Table — Actual column is editable
  const tbl = $("#tbl-planned-actual");
  const scaleDiv = scale === "L" ? 100000 : 1000;
  const scaleStep = scale === "L" ? "0.01" : "0.1";
  tbl.innerHTML = `
    <thead><tr>
      <th>Category</th>
      <th class="num">Planned (₹${scale})</th>
      <th class="num">Actual (₹${scale})</th>
      <th class="num">Variance (₹${scale})</th>
      <th class="num">Variance %</th>
      <th>Status</th>
      <th class="actions"></th>
    </tr></thead>
    <tbody>
      ${rows.map(r => `
        <tr data-category="${escapeHtml(r.category)}" ${r.isOverridden ? 'class="actual-overridden"' : ''}>
          <td>${escapeHtml(r.category)}</td>
          <td class="num">${fmtScale(r.planned, scale)}</td>
          <td class="num">
            <input type="number" step="${scaleStep}" class="actual-input ${r.isOverridden ? 'overridden' : ''}"
              data-category="${escapeHtml(r.category)}"
              data-computed="${r.computed}"
              value="${(r.actual / scaleDiv).toFixed(scale === 'L' ? 2 : 2)}"
              title="${r.isOverridden ? 'Manually overridden — edit to change, click Reset to revert' : 'Computed from transactions — edit to override'}">
          </td>
          <td class="num ${r.variance > 0 ? 'diff-over' : r.variance < 0 ? 'diff-under' : 'diff-neutral'}">${r.variance >= 0 ? '+' : ''}${fmtScale(r.variance, scale)}</td>
          <td class="num ${r.variance > 0 ? 'diff-over' : r.variance < 0 ? 'diff-under' : 'diff-neutral'}">${isFinite(r.variance_pct) ? fmtPct(r.variance_pct) : 'NEW'}</td>
          <td>${statusBadge(r)}${r.isOverridden ? ' <span class="lock-icon" title="Manually overridden">✎</span>' : ''}</td>
          <td class="actions">${r.isOverridden ? `<button class="btn-mini" data-reset-actual="${escapeHtml(r.category)}">Reset</button>` : ''}</td>
        </tr>
      `).join("")}
    </tbody>
  `;

  // Wire Actual input changes — save as override (in rupees)
  tbl.querySelectorAll(".actual-input").forEach(inp => {
    inp.addEventListener("change", () => {
      const category = inp.dataset.category;
      const raw = Number(inp.value);
      if (isNaN(raw)) return;
      const rupees = raw * scaleDiv;
      // Upsert override
      let ov = findActualOverride(period, category);
      if (ov) {
        ov.amount = rupees;
      } else {
        appData.actual_overrides.push({
          id: nextId(appData.actual_overrides),
          period,
          category,
          amount: rupees,
          notes: ""
        });
      }
      saveAll();
      renderPlannedActual();
    });
  });

  // Wire Reset buttons — remove override, revert to computed
  tbl.querySelectorAll("[data-reset-actual]").forEach(btn => {
    btn.onclick = () => {
      const category = btn.dataset.resetActual;
      appData.actual_overrides = (appData.actual_overrides || []).filter(o =>
        !(String(o.period) === String(period) && String(o.category) === String(category))
      );
      saveAll();
      renderPlannedActual();
      toast("Reverted " + category + " to computed value");
    };
  });

  renderSuggestions(rows, period, scale);
}
function statusBadge(r) {
  if (r.planned === 0 && r.actual > 0) return `<span class="sug-tag warn">UNPLANNED</span>`;
  if (r.actual === 0 && r.planned > 0) return `<span class="sug-tag info">UNUSED</span>`;
  if (r.variance_pct > 50) return `<span class="sug-tag danger">OVER</span>`;
  if (r.variance_pct > 10) return `<span class="sug-tag warn">OVER</span>`;
  if (r.variance_pct < -50) return `<span class="sug-tag info">UNDER</span>`;
  return `<span class="sug-tag good">ON PLAN</span>`;
}
function populatePlannedPeriod(mode = "monthly") {
  const sel = $("#pa-period");
  const prev = sel.value;
  const txnKeys = appData.transactions.map(t =>
    mode === "annual" ? yearKey(t.date) : monthKey(t.date)
  ).filter(Boolean);
  const keys = Array.from(new Set(txnKeys)).sort().reverse();
  if (!keys.length) {
    sel.innerHTML = `<option value="">(no transactions)</option>`;
    return;
  }
  sel.innerHTML = keys.map(k => `<option value="${k}">${mode === "annual" ? k : monthLabel(k)}</option>`).join("");
  if (prev && keys.includes(prev)) sel.value = prev;
}
function renderSuggestions(rows, period, scale = "K") {
  const list = $("#suggestions-list");
  const sugs = [];
  const f = (v) => fmtScale(v, scale);

  // 1. Major over-spends
  rows.filter(r => r.planned > 0 && r.variance > 0 && r.variance_pct > 50)
    .sort((a,b) => b.variance - a.variance)
    .slice(0, 5)
    .forEach(r => sugs.push({
      type: "danger", tag: "OVERSPEND",
      text: `<b>${escapeHtml(r.category)}</b>: spent ${f(r.actual)} vs planned ${f(r.planned)} (${fmtPct(r.variance_pct)} over). Consider reviewing recent transactions or revising the plan.`
    }));

  // 2. Unplanned categories
  rows.filter(r => r.planned === 0 && r.actual > 1000)
    .forEach(r => sugs.push({
      type: "warn", tag: "UNPLANNED",
      text: `<b>${escapeHtml(r.category)}</b> has ${f(r.actual)} of spend but is not in your plan. Add it to Planned Budget to track properly.`
    }));

  // 3. Big underspends -> maybe move budget elsewhere
  rows.filter(r => r.planned > 5000 && r.variance < 0 && r.variance_pct < -50)
    .forEach(r => sugs.push({
      type: "info", tag: "UNDERSPEND",
      text: `<b>${escapeHtml(r.category)}</b> planned ${f(r.planned)}, used only ${f(r.actual)}. ${f(-r.variance)} could be reallocated.`
    }));

  // 4. Plan health
  const onPlan = rows.filter(r => r.planned > 0 && Math.abs(r.variance_pct) < 10);
  if (onPlan.length > 0) sugs.push({
    type: "good", tag: "ON TRACK",
    text: `${onPlan.length} categor${onPlan.length === 1 ? 'y is' : 'ies are'} within 10% of plan: ${onPlan.slice(0,5).map(r => r.category).join(", ")}${onPlan.length > 5 ? '…' : ''}`
  });

  // 5. Pace check (mid-month)
  const today = new Date();
  const periodDate = new Date(period + "-01");
  const daysInMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0).getDate();
  const isCurrentMonth = today.getFullYear() === periodDate.getFullYear() && today.getMonth() === periodDate.getMonth();
  if (isCurrentMonth) {
    const daysElapsed = today.getDate();
    const expectedPace = daysElapsed / daysInMonth;
    const sumP = rows.reduce((s,r) => s + r.planned, 0);
    const sumA = rows.reduce((s,r) => s + r.actual, 0);
    const actualPace = sumP > 0 ? sumA / sumP : 0;
    if (actualPace > expectedPace * 1.2) {
      sugs.push({
        type: "warn", tag: "PACE",
        text: `${daysElapsed}/${daysInMonth} days in; you've used <b>${fmtPct(actualPace * 100)}</b> of monthly plan vs expected <b>${fmtPct(expectedPace * 100)}</b>. Slow down to stay on budget.`
      });
    }
  }

  if (sugs.length === 0) {
    list.innerHTML = `<li class="good"><span class="sug-tag good">PERFECT</span>No anomalies detected for this period.</li>`;
    return;
  }
  list.innerHTML = sugs.map(s => `<li class="${s.type}"><span class="sug-tag ${s.type}">${s.tag}</span>${s.text}</li>`).join("");
}

/* -------------------- Liquidity Ladder -------------------- */
function classifyLiquidity(name) {
  const n = (name || "").toLowerCase();
  if (/cash|saving|emergency|sweep/.test(n)) return "emergency";
  if (/liquid|money\s*market|mmf|ultra\s*short/.test(n)) return "short";
  if (/real\s*estate|retirement|^pf$|nps|provident|business/.test(n)) return "long";
  if (/gold|equity|mutual|stock|ulip/.test(n)) return "medium";
  if (/fd|fixed/.test(n)) return "medium"; // PPF/SSY long-term but mixed
  return "medium";
}

function renderLiquidityLadder(investmentSegs, monthlyExpense) {
  const bar = $("#liquidity-bar");
  const legend = $("#liquidity-legend");
  const insight = $("#liquidity-insight");
  if (!bar || !legend || !insight) return;

  const tiers = {
    emergency: { label: "Emergency", sub: "0-6 months · cash + savings", amount: 0, segments: [] },
    short:     { label: "Short",     sub: "6mo-2yr · liquid funds",      amount: 0, segments: [] },
    medium:    { label: "Medium",    sub: "2-7yr · equity, gold, FDs",   amount: 0, segments: [] },
    long:      { label: "Long",      sub: "7yr+ · real estate, retirement", amount: 0, segments: [] }
  };
  investmentSegs.forEach(s => {
    const tier = classifyLiquidity(s.name);
    const bal = Number(s.current_balance || 0);
    if (bal > 0 && tiers[tier]) {
      tiers[tier].amount += bal;
      tiers[tier].segments.push(s.name);
    }
  });
  const total = Object.values(tiers).reduce((sum, t) => sum + t.amount, 0);
  if (total === 0) {
    bar.innerHTML = '';
    legend.innerHTML = '<span class="muted small">No investment balances set yet.</span>';
    insight.textContent = '';
    return;
  }

  // Stacked horizontal bar (only show tiers with > 0)
  bar.innerHTML = Object.entries(tiers).map(([key, t]) => {
    const pct = t.amount / total * 100;
    if (pct < 0.5) return ''; // skip zero
    return `<div class="liquidity-segment tier-${key}" style="width:${pct}%" title="${t.label}: ${fmtINR(t.amount)} (${pct.toFixed(1)}%)">
      <span class="liquidity-segment-label">${pct >= 8 ? fmtPct(pct) : ''}</span>
    </div>`;
  }).join('');

  legend.innerHTML = Object.entries(tiers).map(([key, t]) => {
    const pct = total > 0 ? (t.amount / total * 100) : 0;
    return `
      <div class="liquidity-leg-row">
        <span class="dot tier-${key}"></span>
        <div class="liquidity-leg-text">
          <div class="liquidity-leg-name"><b>${t.label}</b> <span class="muted small">${t.sub}</span></div>
          <div class="liquidity-leg-amt">${fmtINR(t.amount)} <span class="muted small">(${fmtPct(pct)})</span></div>
        </div>
      </div>
    `;
  }).join('');

  // Insight: flag emergency-fund gap + long-term concentration
  const insights = [];
  const emergencyTarget = monthlyExpense * 6; // 6 months
  const liquidNow = tiers.emergency.amount + tiers.short.amount;
  if (monthlyExpense > 0 && liquidNow < emergencyTarget) {
    const gap = emergencyTarget - liquidNow;
    insights.push(`⚠️ Emergency fund gap: only ${fmtINR(liquidNow)} liquid vs target ${fmtINR(emergencyTarget)} (6× monthly expenses). Build up by <b>${fmtINR(gap)}</b> in a sweep-in FD or liquid fund.`);
  }
  const longPct = total > 0 ? (tiers.long.amount / total * 100) : 0;
  if (longPct > 60) {
    insights.push(`⚠️ ${fmtPct(longPct)} of net worth is locked in long-term assets (real estate + retirement). Consider rebalancing toward liquid assets if you anticipate large expenses in the next 2-7 years.`);
  } else if (longPct < 30 && total > 1000000) {
    insights.push(`✓ Healthy mix — only ${fmtPct(longPct)} locked in long-term assets.`);
  }
  insight.innerHTML = insights.length ? insights.join("<br>") : "✓ Liquidity distribution looks healthy.";
}

/* -------------------- Income tab -------------------- */
function renderCashFlowList(type, listEl, summaryEl, opts = {}) {
  const segs = (appData.projection_segments || []).filter(s => s.type === type);
  const totalAnnual = segs.reduce((sum, s) => sum + effectiveAnnual(s), 0);
  const activeNow = segs.filter(s => {
    const sy = Number(s.start_year) || 0;
    const ey = Number(s.end_year) || 9999;
    const y = new Date().getFullYear();
    return y >= sy && y <= ey && effectiveAnnual(s) > 0;
  });
  summaryEl.innerHTML = `
    <div class="summary"><span class="label">${opts.itemsLabel || 'Items'}</span><span class="value">${segs.length}</span></div>
    <div class="summary"><span class="label">Active this year</span><span class="value">${activeNow.length}</span></div>
    <div class="summary"><span class="label">Annual ${type === 'income' ? 'Income' : 'Expense'}</span><span class="value">${fmtINR(totalAnnual)}</span></div>
    <div class="summary"><span class="label">Monthly equivalent</span><span class="value">${fmtINR(totalAnnual / 12)}</span></div>
  `;

  if (segs.length === 0) {
    listEl.innerHTML = `<div class="muted" style="padding:20px;text-align:center">No ${type} items yet. Click <b>+ Add</b> above or <b>Load Sample</b> to start.</div>`;
    return;
  }

  listEl.innerHTML = `
    <div class="table-scroll">
      <table class="data-table seg-table">
        <thead><tr>
          <th>Name</th>
          <th class="num">Monthly ₹L</th>
          <th class="num">Annual ₹L</th>
          <th class="num">YoY %</th>
          <th class="num">Start</th>
          <th class="num">End</th>
          <th>Notes</th>
          <th></th>
        </tr></thead>
        <tbody>
          ${segs.map(s => `
            <tr data-seg-id="${s.id}">
              <td><input type="text" data-field="name" value="${escapeHtml(s.name || '')}"></td>
              <td><input type="number" step="0.001" class="num" data-field="monthly_amount" data-lakh="1" value="${toLakh(s.monthly_amount, 3)}"></td>
              <td><input type="number" step="0.01" class="num" data-field="annual_amount" data-lakh="1" value="${toLakh(s.annual_amount)}"></td>
              <td><input type="number" step="0.5" class="num" data-field="yoy_growth_pct" value="${s.yoy_growth_pct || 0}"></td>
              <td><input type="number" class="num" data-field="start_year" value="${s.start_year || ''}"></td>
              <td><input type="number" class="num" data-field="end_year" value="${s.end_year || ''}"></td>
              <td><input type="text" data-field="notes" value="${escapeHtml(s.notes || '')}"></td>
              <td class="actions"><button class="btn-mini danger" data-del-cf="${s.id}">×</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  listEl.querySelectorAll(`tr[data-seg-id] input[data-field]`).forEach(inp => {
    inp.addEventListener("change", () => {
      const tr = inp.closest("tr");
      const id = tr.dataset.segId;
      const seg = appData.projection_segments.find(s => String(s.id) === String(id));
      if (!seg) return;
      const f = inp.dataset.field;
      let v = inp.value;
      if (f !== "name" && f !== "notes") v = Number(v) || 0;
      if (inp.dataset.lakh === "1") v = v * 100000;
      seg[f] = v;
      // Auto-sync monthly <-> annual
      if (f === "monthly_amount") {
        seg.annual_amount = Number(v) * 12;
        const a = tr.querySelector('[data-field="annual_amount"]');
        if (a) a.value = toLakh(seg.annual_amount);
      } else if (f === "annual_amount") {
        seg.monthly_amount = Number(v) / 12;
        const m = tr.querySelector('[data-field="monthly_amount"]');
        if (m) m.value = toLakh(seg.monthly_amount, 3);
      }
      saveAll();
      // Re-render summary (cheap)
      renderCashFlowList(type, listEl, summaryEl, opts);
    });
  });
  listEl.querySelectorAll("[data-del-cf]").forEach(btn => {
    btn.onclick = () => {
      if (!confirm("Delete this item?")) return;
      const id = btn.dataset.delCf;
      appData.projection_segments = appData.projection_segments.filter(s => String(s.id) !== String(id));
      saveAll();
      renderCashFlowList(type, listEl, summaryEl, opts);
    };
  });
}

function renderIncome() {
  const listEl = $("#income-list");
  const summaryEl = $("#income-summary");
  if (!listEl || !summaryEl) return;
  renderCashFlowList("income", listEl, summaryEl, { itemsLabel: "Income Sources" });
}

// User's preferred expense category order
const EXPENSE_CATEGORY_ORDER = ["Grocery", "Utility", "Health", "Luxury", "Ofc", "Loan", "Annual Expense"];

// Standard category structure that the "Apply Standard Structure" button uses
const STANDARD_EXPENSE_STRUCTURE = [
  // Grocery (monthly)
  { name: "Milk",                   category: "Grocery",        monthly: 4000,  yoy: 6 },
  { name: "Grocery",                category: "Grocery",        monthly: 10000, yoy: 6 },
  { name: "Veg",                    category: "Grocery",        monthly: 2000,  yoy: 6 },
  { name: "Fruits",                 category: "Grocery",        monthly: 5000,  yoy: 6 },
  { name: "Veg Extra",              category: "Grocery",        monthly: 1000,  yoy: 6 },
  { name: "Akshaykalpa",            category: "Grocery",        monthly: 1000,  yoy: 6 },
  { name: "Maid/Car Cleaning",      category: "Grocery",        monthly: 3700,  yoy: 5 },
  // Utility
  { name: "IGL",                    category: "Utility",        monthly: 900,   yoy: 6 },
  { name: "Mobile",                 category: "Utility",        monthly: 250,   yoy: 5 },
  { name: "Electricity",            category: "Utility",        monthly: 500,   yoy: 5 },
  { name: "Water",                  category: "Utility",        monthly: 800,   yoy: 5 },
  { name: "Wifi",                   category: "Utility",        monthly: 1450,  yoy: 5 },
  // Health
  { name: "Medicine",               category: "Health",         monthly: 10000, yoy: 7 },
  { name: "Term Insurance",         category: "Health",         monthly: 5500,  yoy: 5,  end_year: 2080 },
  // Luxury
  { name: "Travel",                 category: "Luxury",         annual: 150000, yoy: 7,  end_year: 2080 },
  { name: "Shopping",               category: "Luxury",         monthly: 6250,  yoy: 7 },
  { name: "Weekend Munching",       category: "Luxury",         monthly: 2500,  yoy: 6 },
  // Ofc
  { name: "Petrol",                 category: "Ofc",            monthly: 4000,  yoy: 6 },
  { name: "Ofc Lunch",              category: "Ofc",            monthly: 1500,  yoy: 6,  end_year: 2046, notes: "Ends at retirement" },
  // Loan
  { name: "Home Loan",              category: "Loan",           monthly: 21500, yoy: 0,  end_year: 2040 },
  { name: "House Rent",             category: "Loan",           monthly: 35000, yoy: 6,  end_year: 2046 },
  { name: "Personal Loan",          category: "Loan",           monthly: 8500,  yoy: 0,  end_year: 2040 },
  // Annual Expense
  { name: "NPS",                    category: "Annual Expense", annual: 50000,  yoy: 5,  end_year: 2046 },
  { name: "Car Insurance",          category: "Annual Expense", annual: 12000,  yoy: 5 },
  { name: "Ruby LIC",               category: "Annual Expense", annual: 24000,  yoy: 5,  end_year: 2046 },
  { name: "Car Service",            category: "Annual Expense", annual: 12000,  yoy: 6 },
  { name: "School Fees",            category: "Annual Expense", annual: 300000, yoy: 8,  end_year: 2040 },
  { name: "Extra Curricular",       category: "Annual Expense", annual: 60000,  yoy: 7,  end_year: 2040 },
  { name: "La Maintenance",         category: "Annual Expense", annual: 39600,  yoy: 6 }
];

function applyStandardExpenseStructure() {
  const existing = (appData.projection_segments || []).filter(s => s.type === "expense");
  if (existing.length > 0) {
    if (!confirm(`Replace your ${existing.length} current expense item(s) with the standard category structure (${STANDARD_EXPENSE_STRUCTURE.length} items in ${EXPENSE_CATEGORY_ORDER.length} categories)?\n\nYour income and investment data is NOT affected.`)) return;
  }
  // Remove existing expense segments, keep income + investment
  appData.projection_segments = (appData.projection_segments || []).filter(s => s.type !== "expense");
  const startYear = new Date().getFullYear();
  STANDARD_EXPENSE_STRUCTURE.forEach(e => {
    appData.projection_segments.push({
      id: nextId(appData.projection_segments),
      name: e.name,
      type: "expense",
      monthly_amount: e.monthly || 0,
      annual_amount: e.annual || (e.monthly ? e.monthly * 12 : 0),
      yoy_growth_pct: e.yoy != null ? e.yoy : 6,
      return_pct: 0,
      start_year: startYear,
      end_year: e.end_year || 2090,
      current_balance: 0,
      category: e.category,
      notes: e.notes || ""
    });
  });
  saveAll();
  renderPlannedExpenses();
  toast(`Loaded ${STANDARD_EXPENSE_STRUCTURE.length} expense items across ${EXPENSE_CATEGORY_ORDER.length} categories. Edit amounts to match your situation.`);
}

function renderPlannedExpenses() {
  const listEl = $("#planned-expenses-list");
  const summaryEl = $("#planned-exp-summary");
  if (!listEl || !summaryEl) return;

  const segs = (appData.projection_segments || []).filter(s => s.type === "expense");

  // Summary
  const totalAnnual = segs.reduce((sum, s) => sum + effectiveAnnual(s), 0);
  const activeNow = segs.filter(s => {
    const sy = Number(s.start_year) || 0;
    const ey = Number(s.end_year) || 9999;
    const y = new Date().getFullYear();
    return y >= sy && y <= ey && effectiveAnnual(s) > 0;
  });
  summaryEl.innerHTML = `
    <div class="summary"><span class="label">Items</span><span class="value">${segs.length}</span></div>
    <div class="summary"><span class="label">Active this year</span><span class="value">${activeNow.length}</span></div>
    <div class="summary"><span class="label">Annual Expense</span><span class="value">${fmtINR(totalAnnual)}</span></div>
    <div class="summary"><span class="label">Monthly equivalent</span><span class="value">${fmtINR(totalAnnual / 12)}</span></div>
  `;

  if (segs.length === 0) {
    listEl.innerHTML = `
      <div class="muted" style="padding:30px;text-align:center">
        <p>No expense items yet.</p>
        <button class="btn primary" id="btn-apply-exp-structure-empty">Apply Standard Category Structure</button>
        <p class="small" style="margin-top:8px">Loads 29 sample items across 7 categories (Grocery, Utility, Health, Luxury, Ofc, Loan, Annual Expense). Edit amounts after loading.</p>
      </div>
    `;
    $("#btn-apply-exp-structure-empty")?.addEventListener("click", applyStandardExpenseStructure);
    return;
  }

  // Group by category
  const groups = {};
  segs.forEach(s => {
    const cat = s.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });
  const orderedCats = [
    ...EXPENSE_CATEGORY_ORDER.filter(c => groups[c]),
    ...Object.keys(groups).filter(c => !EXPENSE_CATEGORY_ORDER.includes(c)).sort()
  ];

  listEl.innerHTML = orderedCats.map(cat => {
    const items = groups[cat] || [];
    const catTotal = items.reduce((sum, s) => sum + effectiveAnnual(s), 0);
    return `
      <div class="exp-group">
        <div class="exp-group-head">
          <h4>${escapeHtml(cat)} <span class="exp-group-count">${items.length}</span></h4>
          <div class="exp-group-meta">
            <span class="muted small">Annual ${fmtINR(catTotal)} · Monthly ${fmtINR(catTotal / 12)}</span>
            <button class="btn btn-sm" data-add-cat="${escapeHtml(cat)}">+ Add to ${escapeHtml(cat)}</button>
          </div>
        </div>
        <div class="table-scroll">
          <table class="data-table seg-table">
            <thead><tr>
              <th>Sub-category</th>
              <th class="num">Monthly ₹L</th>
              <th class="num">Annual ₹L</th>
              <th class="num">YoY %</th>
              <th class="num">Start</th>
              <th class="num">End</th>
              <th>Notes</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${items.map(s => `
                <tr data-seg-id="${s.id}">
                  <td><input type="text" data-field="name" value="${escapeHtml(s.name || '')}"></td>
                  <td><input type="number" step="0.001" class="num" data-field="monthly_amount" data-lakh="1" value="${toLakh(s.monthly_amount, 3)}"></td>
                  <td><input type="number" step="0.01" class="num" data-field="annual_amount" data-lakh="1" value="${toLakh(s.annual_amount)}"></td>
                  <td><input type="number" step="0.5" class="num" data-field="yoy_growth_pct" value="${s.yoy_growth_pct || 0}"></td>
                  <td><input type="number" class="num" data-field="start_year" value="${s.start_year || ''}"></td>
                  <td><input type="number" class="num" data-field="end_year" value="${s.end_year || ''}"></td>
                  <td><input type="text" data-field="notes" value="${escapeHtml(s.notes || '')}"></td>
                  <td class="actions"><button class="btn-mini danger" data-del-cf="${s.id}">×</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');

  // Wire inputs (reuse same change logic)
  listEl.querySelectorAll(`tr[data-seg-id] input[data-field]`).forEach(inp => {
    inp.addEventListener("change", () => {
      const tr = inp.closest("tr");
      const id = tr.dataset.segId;
      const seg = appData.projection_segments.find(s => String(s.id) === String(id));
      if (!seg) return;
      const f = inp.dataset.field;
      let v = inp.value;
      if (f !== "name" && f !== "notes" && f !== "category") v = Number(v) || 0;
      if (inp.dataset.lakh === "1") v = v * 100000;
      seg[f] = v;
      if (f === "monthly_amount") {
        seg.annual_amount = Number(v) * 12;
        const a = tr.querySelector('[data-field="annual_amount"]');
        if (a) a.value = toLakh(seg.annual_amount);
      } else if (f === "annual_amount") {
        seg.monthly_amount = Number(v) / 12;
        const m = tr.querySelector('[data-field="monthly_amount"]');
        if (m) m.value = toLakh(seg.monthly_amount, 3);
      }
      saveAll();
      // Lightweight re-render to update summary + group totals
      renderPlannedExpenses();
    });
  });
  listEl.querySelectorAll("[data-del-cf]").forEach(btn => {
    btn.onclick = () => {
      if (!confirm("Delete this expense item?")) return;
      const id = btn.dataset.delCf;
      appData.projection_segments = appData.projection_segments.filter(s => String(s.id) !== String(id));
      saveAll();
      renderPlannedExpenses();
    };
  });
  listEl.querySelectorAll("[data-add-cat]").forEach(btn => {
    btn.onclick = () => {
      const cat = btn.dataset.addCat;
      appData.projection_segments.push({
        id: nextId(appData.projection_segments),
        name: "New item",
        type: "expense",
        monthly_amount: 0,
        annual_amount: 0,
        yoy_growth_pct: 6,
        return_pct: 0,
        start_year: new Date().getFullYear(),
        end_year: 2090,
        current_balance: 0,
        category: cat,
        notes: ""
      });
      saveAll();
      renderPlannedExpenses();
    };
  });
}

function addCashFlowItem(type, name) {
  const startY = new Date().getFullYear();
  appData.projection_segments.push({
    id: nextId(appData.projection_segments),
    name: name || "New " + type,
    type,
    monthly_amount: 0,
    annual_amount: 0,
    yoy_growth_pct: type === "income" ? 8 : 6,
    return_pct: 0,
    start_year: startY,
    end_year: type === "income" ? 2046 : 2090,
    current_balance: 0,
    notes: ""
  });
  saveAll();
}

/* -------- Goals -------- */
function computeGoalStatus(g) {
  const currentYear = new Date().getFullYear();
  const years = Math.max(0, Number(g.target_year) - currentYear);
  const r = (Number(g.expected_return_pct) || 8) / 100;
  const target = Number(g.target_amount) || 0;
  const current = Number(g.current_allocation) || 0;
  const monthly = Number(g.monthly_contribution) || 0;

  // Future value of current balance compounding
  const fvCurrent = current * Math.pow(1 + r, years);
  // FV of monthly contributions (annuity due, approximated as ordinary annuity * 12 months)
  const fvContrib = monthly > 0 && r > 0
    ? monthly * 12 * (Math.pow(1 + r, years) - 1) / r
    : monthly * 12 * years;

  const projected = fvCurrent + fvContrib;
  const gap = target - projected;
  const onTrackPct = target > 0 ? Math.min(200, (projected / target) * 100) : 0;
  const currentPct = target > 0 ? (current / target) * 100 : 0;

  // Required monthly to hit target exactly
  const remaining = Math.max(0, target - fvCurrent);
  const requiredMonthly = r > 0 && years > 0
    ? remaining * r / (12 * (Math.pow(1 + r, years) - 1))
    : (years > 0 ? remaining / (12 * years) : 0);

  let status = "ON TRACK";
  if (years === 0) status = target > current ? "DUE NOW" : "ACHIEVED";
  else if (projected >= target * 1.1) status = "AHEAD";
  else if (projected >= target * 0.9) status = "ON TRACK";
  else if (projected >= target * 0.6) status = "BEHIND";
  else status = "FAR BEHIND";

  return { years, target, current, monthly, projected, gap, onTrackPct, currentPct, requiredMonthly, status };
}

function renderGoals() {
  const goals = appData.goals || [];
  const list = $("#goals-list");
  const summary = $("#goals-summary");
  if (!list || !summary) return;

  if (goals.length === 0) {
    summary.innerHTML = '';
    list.innerHTML = `
      <div class="card" style="text-align:center;padding:40px">
        <p class="muted">No goals yet. Click <b>+ Add Goal</b> to define your first milestone (retirement, education, home, travel, etc.).</p>
      </div>
    `;
    return;
  }

  // Summary: total target, total current, projected total, on-track count
  const totalTarget = goals.reduce((s, g) => s + (Number(g.target_amount) || 0), 0);
  const totalCurrent = goals.reduce((s, g) => s + (Number(g.current_allocation) || 0), 0);
  const totalMonthly = goals.reduce((s, g) => s + (Number(g.monthly_contribution) || 0), 0);
  const statuses = goals.map(g => computeGoalStatus(g).status);
  const onTrackCount = statuses.filter(s => s === "ON TRACK" || s === "AHEAD" || s === "ACHIEVED").length;

  summary.innerHTML = `
    <div class="summary"><span class="label">Total Goals</span><span class="value">${goals.length}</span></div>
    <div class="summary"><span class="label">Combined Target</span><span class="value">${fmtINR(totalTarget)}</span></div>
    <div class="summary"><span class="label">Current Allocated</span><span class="value">${fmtINR(totalCurrent)}</span></div>
    <div class="summary"><span class="label">Total Monthly Contrib</span><span class="value">${fmtINR(totalMonthly)}</span></div>
    <div class="summary"><span class="label">On Track</span><span class="value">${onTrackCount} / ${goals.length}</span></div>
  `;

  // Sort by target_year (nearest first)
  const sorted = goals.slice().sort((a, b) => Number(a.target_year) - Number(b.target_year));
  list.innerHTML = sorted.map(g => {
    const s = computeGoalStatus(g);
    const statusClass = ({
      "ACHIEVED": "good", "AHEAD": "good", "ON TRACK": "good",
      "BEHIND": "warn", "FAR BEHIND": "danger", "DUE NOW": "danger"
    })[s.status] || "neutral";
    const pri = (g.priority || "").toLowerCase();
    const priClass = pri === "high" ? "high" : pri === "low" ? "low" : "medium";
    const gapText = s.gap > 0
      ? `Need <b>${fmtINR(s.gap)}</b> more`
      : `Surplus <b>${fmtINR(-s.gap)}</b>`;
    return `
      <div class="card goal-card" data-goal-id="${g.id}">
        <div class="goal-head">
          <div class="goal-title">
            <h3>${escapeHtml(g.name)}</h3>
            <span class="pri-pill pri-${priClass}">${escapeHtml(g.priority || "medium")}</span>
          </div>
          <div class="goal-target-block">
            <div class="goal-target-amount">${fmtINR(s.target)}</div>
            <div class="goal-target-year">by ${g.target_year} · ${s.years} ${s.years === 1 ? "yr" : "yrs"} left</div>
          </div>
          <span class="goal-status status-${statusClass}">${s.status}</span>
        </div>
        <div class="goal-progress" title="Projected coverage at target year">
          <div class="goal-progress-bar status-${statusClass}" style="width:${Math.min(100, s.onTrackPct)}%"></div>
          <div class="goal-progress-marker" style="left:${Math.min(99, s.currentPct)}%" title="Currently allocated"></div>
        </div>
        <div class="goal-progress-legend">
          <span><span class="dot now"></span>Now (${fmtPct(s.currentPct)})</span>
          <span><span class="dot proj"></span>Projected at ${g.target_year} (${fmtPct(Math.min(200, s.onTrackPct))})</span>
        </div>
        <div class="goal-stats">
          <div class="goal-stat"><span class="lbl">Current</span><span class="val">${fmtINR(s.current)}</span></div>
          <div class="goal-stat"><span class="lbl">Monthly Contrib</span><span class="val">${fmtINR(s.monthly)}</span></div>
          <div class="goal-stat"><span class="lbl">Required/mo</span><span class="val">${fmtINR(s.requiredMonthly)}</span></div>
          <div class="goal-stat"><span class="lbl">Projected</span><span class="val">${fmtINR(s.projected)}</span></div>
          <div class="goal-stat"><span class="lbl">Return Assumed</span><span class="val">${fmtPct(Number(g.expected_return_pct) || 8)}</span></div>
          <div class="goal-stat"><span class="lbl">Gap</span><span class="val ${s.gap > 0 ? 'text-danger' : 'text-success'}">${gapText}</span></div>
        </div>
        ${g.linked_segment ? `<div class="goal-linked muted small">Linked to segment: <b>${escapeHtml(g.linked_segment)}</b></div>` : ''}
        ${g.notes ? `<div class="goal-notes muted small">${escapeHtml(g.notes)}</div>` : ''}
        <div class="goal-actions">
          <button class="btn ghost btn-sm" data-edit-goal="${g.id}">Edit</button>
          <button class="btn ghost btn-sm" data-del-goal="${g.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");

  list.querySelectorAll("[data-edit-goal]").forEach(btn => {
    btn.onclick = () => openEditModal("goals", btn.dataset.editGoal);
  });
  list.querySelectorAll("[data-del-goal]").forEach(btn => {
    btn.onclick = () => {
      if (!confirm("Delete this goal?")) return;
      appData.goals = appData.goals.filter(g => String(g.id) !== String(btn.dataset.delGoal));
      saveAll();
      renderGoals();
      toast("Deleted");
    };
  });
}

/* -------------------- Future Projections -------------------- */
function applyRealReturnAdjustment(series) {
  const isReal = $("#real-return-toggle")?.checked || false;
  if (!isReal) return series;
  const inflation = (Number(appData.assumptions.inflation_pct) || 6) / 100;
  const startYear = new Date().getFullYear();
  return series.map(r => {
    const yrOff = Number(r.year) - startYear;
    if (yrOff <= 0) return r;
    const factor = Math.pow(1 + inflation, yrOff);
    return Object.assign({}, r, {
      total_assets_lakh: +(Number(r.total_assets_lakh) / factor).toFixed(2),
      annual_expense_lakh: +(Number(r.annual_expense_lakh) / factor).toFixed(2),
      annual_income_lakh: +(Number(r.annual_income_lakh) / factor).toFixed(2),
      annual_investment_contrib_lakh: r.annual_investment_contrib_lakh != null
        ? +(Number(r.annual_investment_contrib_lakh) / factor).toFixed(2)
        : undefined,
      net_change_lakh: +(Number(r.net_change_lakh) / factor).toFixed(2)
    });
  });
}

function renderProjections() {
  ensurePensionAnnuitySegment();
  const setVal = (sel, v) => { const el = $(sel); if (el) el.value = v; };
  setVal("#assump-return", appData.assumptions.return_pct);
  setVal("#assump-inflation", appData.assumptions.inflation_pct);
  setVal("#assump-expense", appData.assumptions.annual_expense);
  setVal("#assump-years", appData.assumptions.years);
  setVal("#assump-rebalance-year", appData.assumptions.rebalance_year || 2049);
  setVal("#assump-nps-unlock-year", appData.assumptions.nps_unlock_year || 2049);
  setVal("#assump-nps-annuity-pct", appData.assumptions.nps_annuity_pct || 40);

  // Auto-load projection_segments from embedded seed if empty (defensive)
  if ((!appData.projection_segments || appData.projection_segments.length === 0)
      && window.EMBEDDED_SEED && window.EMBEDDED_SEED.projection_segments) {
    try {
      const rows = parseCSV(window.EMBEDDED_SEED.projection_segments);
      coerceNumeric("projection_segments", rows);
      appData.projection_segments = rows;
      saveAll();
      console.log("Auto-loaded " + rows.length + " projection segments from embedded seed");
    } catch (e) { console.error("Auto-load segments failed:", e); }
  }

  // Segments table
  renderSegmentsEditor();

  // Run projection (segment-driven, respects locked rows)
  const series = computeProjection();
  // Persist computed values back to future_projections (preserving locks)
  appData.future_projections = series.map(r => ({
    id: r.id, year: r.year, age: r.age, phase: r.phase,
    total_assets_lakh: r.total_assets_lakh,
    annual_expense_lakh: r.annual_expense_lakh,
    annual_income_lakh: r.annual_income_lakh,
    net_change_lakh: r.net_change_lakh,
    locked: r.locked || "",
    notes: r.notes || ""
  }));

  // Apply real-return adjustment for display (does not modify saved data)
  const displaySeries = applyRealReturnAdjustment(series);
  const isReal = $("#real-return-toggle")?.checked || false;
  const realSuffix = isReal ? " · today's ₹" : "";

  makeChart("chart-projection", "line", {
    labels: displaySeries.map(r => r.year),
    datasets: [{
      label: "Net Worth (₹L)" + realSuffix,
      data: displaySeries.map(r => Number(r.total_assets_lakh) || 0),
      borderColor: COLORS[1],
      backgroundColor: "rgba(52,211,153,0.15)",
      fill: true, tension: 0.3
    }, {
      label: "Annual Income (₹L)" + realSuffix,
      data: displaySeries.map(r => Number(r.annual_income_lakh) || 0),
      borderColor: COLORS[0],
      backgroundColor: "transparent",
      tension: 0.3
    }, {
      label: "Annual Expense (₹L)" + realSuffix,
      data: displaySeries.map(r => Number(r.annual_expense_lakh) || 0),
      borderColor: COLORS[3],
      backgroundColor: "transparent",
      tension: 0.3
    }]
  });

  // Editable projection table (uses displaySeries so values match the chart)
  renderProjectionTable(displaySeries);
}

function findYearlyOverride(segId, year) {
  return (appData.projection_segment_yearly || []).find(o =>
    String(o.segment_id) === String(segId) && Number(o.year) === Number(year)
  );
}
function effectiveAnnual(seg) {
  // Monthly takes precedence if non-zero; else use annual_amount.
  // (After auto-sync in the editor, both should agree anyway.)
  const monthly = Number(seg.monthly_amount || 0);
  const annual = Number(seg.annual_amount || 0);
  return monthly > 0 ? monthly * 12 : annual;
}
// Display helpers for lakh-formatted inputs (storage stays in rupees)
const toLakh = (rupees, decimals = 2) => (Number(rupees || 0) / 100000).toFixed(decimals);
const fromLakh = (lakhs) => Number(lakhs || 0) * 100000;
function contribAtYear(seg, year) {
  const sy = Number(seg.start_year) || 0;
  const ey = Number(seg.end_year) || 9999;
  if (year < sy || year > ey) return 0;
  // Check per-year override first
  const ov = findYearlyOverride(seg.id, year);
  if (ov && ov.annual_amount !== "" && ov.annual_amount != null && !isNaN(Number(ov.annual_amount))) {
    return Number(ov.annual_amount);
  }
  const yearsIn = year - sy;
  const baseAnnual = effectiveAnnual(seg);
  const yoy = Number(seg.yoy_growth_pct || 0) / 100;
  return baseAnnual * Math.pow(1 + yoy, yearsIn);
}
function returnAtYear(seg, year) {
  const ov = findYearlyOverride(seg.id, year);
  if (ov && ov.return_pct !== "" && ov.return_pct != null && !isNaN(Number(ov.return_pct))) {
    return Number(ov.return_pct) / 100;
  }
  return Number(seg.return_pct || 0) / 100;
}

function computeProjection() {
  const segments = appData.projection_segments || [];
  const startYear = new Date().getFullYear();
  const assumptions = appData.assumptions || {};
  const years = Number(assumptions.years) || 40;
  const defaultReturn = (Number(assumptions.return_pct) || 8) / 100;

  const investments = segments.filter(s => s.type === "investment");
  const incomes = segments.filter(s => s.type === "income");
  const expenses = segments.filter(s => s.type === "expense");

  // Per-segment balance tracking — each investment compounds at its own return rate
  // Net worth is purely the sum of investment balances (income/expense are display-only,
  // since income is already allocated into investments + expenses by the user).
  const balances = {};
  investments.forEach(s => { balances[s.id] = Number(s.current_balance || 0); });

  // Locked overrides
  const overrides = {};
  (appData.future_projections || []).forEach(r => {
    if (r.locked === true || r.locked === "true" || r.locked === "TRUE" || r.locked === 1) {
      overrides[Number(r.year)] = r;
    }
  });

  const initialAssets = Object.values(balances).reduce((a, b) => a + b, 0);
  // Pre-compute segment-id index for milestone rebalances
  const detSegIdx = buildSegmentIndex(investments, "id");
  const detFlags = { equityRebalanced: false, npsRedeemed: false };

  const rows = [];
  for (let i = 0; i <= years; i++) {
    const year = startYear + i;
    const age = 37 + i;

    const yearIncome = incomes.reduce((sum, s) => sum + contribAtYear(s, year), 0);
    const yearExpense = expenses.reduce((sum, s) => sum + contribAtYear(s, year), 0);
    let totalInvestContrib = 0;
    investments.forEach(s => { totalInvestContrib += contribAtYear(s, year); });

    // Year 0 (current year) is a snapshot of starting balances — no growth or contribution yet.
    // Years 1+ apply each segment's own ROI and any contribution for that year.
    if (i > 0) {
      investments.forEach(s => {
        const ret = returnAtYear(s, year);
        const bal = balances[s.id] || 0;
        const contrib = contribAtYear(s, year);
        balances[s.id] = bal * (1 + ret) + contrib * (1 + ret * 0.5);
      });

      // Apply milestone rebalances (Equity → FD; PF/NPS 60/40 split at age 60)
      applyMilestones(balances, detSegIdx, year, appData.assumptions, detFlags);

      // Cash-flow shortfall: when Income can't cover (Expenses + Contributions),
      // the deficit is withdrawn proportionally from investment balances.
      // Surplus income (when Income > Expenses + Contributions) is ignored
      // (user's model: income is fully allocated; surplus is consumed, not invested).
      const netCashFlow = yearIncome - yearExpense - totalInvestContrib;
      if (netCashFlow < 0) {
        const shortfall = -netCashFlow;
        const totalBal = Object.values(balances).reduce((a, b) => a + b, 0);
        if (totalBal > 0) {
          const ratio = Math.min(1, shortfall / totalBal);
          Object.keys(balances).forEach(k => { balances[k] = balances[k] * (1 - ratio); });
        }
      }
    }

    // Net worth = sum of investment balances (after returns, contributions, and any drawdown)
    let totalAssets = Object.values(balances).reduce((a, b) => a + b, 0);

    // Manual override: scale balances proportionally to honor lock
    const ov = overrides[year];
    if (ov && ov.total_assets_lakh !== "" && ov.total_assets_lakh != null) {
      const target = Number(ov.total_assets_lakh) * 100000;
      if (totalAssets > 0) {
        const ratio = target / totalAssets;
        Object.keys(balances).forEach(k => { balances[k] *= ratio; });
      }
      totalAssets = target;
    }

    const prevAssets = i === 0 ? initialAssets : rows[i - 1].total_assets_lakh * 100000;
    const netChange = totalAssets - prevAssets;
    const phase = year <= 2046 ? "Earning"
                : year <= 2065 ? "Retirement"
                : year <= 2076 ? "Late Retirement"
                : "Decline";

    rows.push({
      id: i + 1,
      year, age, phase,
      total_assets_lakh: +(totalAssets / 100000).toFixed(2),
      annual_expense_lakh: +(yearExpense / 100000).toFixed(2),
      annual_income_lakh: +(yearIncome / 100000).toFixed(2),
      annual_investment_contrib_lakh: +(totalInvestContrib / 100000).toFixed(2),
      net_change_lakh: +(netChange / 100000).toFixed(2),
      locked: ov ? true : false,
      notes: ov ? (ov.notes || "") : ""
    });
  }
  return rows;
}

/* -------- Segments editor (with per-year detail) -------- */
let expandedSegmentId = null; // tracks which segment is showing year detail

function renderSegmentsEditor() {
  const container = $("#segments-editor");
  if (!container) return;
  const segs = appData.projection_segments || [];

  if (segs.length === 0) {
    container.innerHTML = `
      <div class="muted" style="text-align:center;padding:20px">
        No segments yet. <button class="btn primary" id="btn-seed-segments">Load default segments</button>
      </div>
    `;
    $("#btn-seed-segments").onclick = () => {
      if (window.EMBEDDED_SEED && window.EMBEDDED_SEED.projection_segments) {
        const rows = parseCSV(window.EMBEDDED_SEED.projection_segments);
        coerceNumeric("projection_segments", rows);
        appData.projection_segments = rows;
        saveAll();
        renderProjections();
        toast("Loaded " + rows.length + " default segments");
      }
    };
    return;
  }

  const groups = { income: [], investment: [], expense: [] };
  segs.forEach(s => { (groups[s.type] || (groups.expense)).push(s); });

  const renderSegmentRow = (s) => {
    const isInvest = s.type === "investment";
    const isMaster = /salary/i.test(s.name || "");
    const isExpanded = String(s.id) === String(expandedSegmentId);
    // Read-only on Future tab — amounts/balances are edited in source tabs
    const baseCols = isInvest ? `
      <td><span class="num readonly-cell" title="Edit in Investments / Real Estate tab">${toLakh(s.current_balance)}</span></td>
      <td><span class="num readonly-cell" title="Edit in Investments tab">${toLakh(s.annual_amount)}</span></td>
      <td><input type="number" class="num" step="0.1" data-field="return_pct" value="${s.return_pct || 0}"></td>
      <td><input type="number" class="num" step="0.5" data-field="yoy_growth_pct" value="${s.yoy_growth_pct || 0}"></td>
    ` : `
      <td><span class="num readonly-cell" title="Edit in ${s.type === 'income' ? 'Income' : 'Planned Expenses'} tab">${toLakh(s.monthly_amount, 3)}</span></td>
      <td><span class="num readonly-cell" title="Edit in ${s.type === 'income' ? 'Income' : 'Planned Expenses'} tab">${toLakh(s.annual_amount)}</span></td>
      <td><input type="number" class="num" step="0.5" data-field="yoy_growth_pct" value="${s.yoy_growth_pct || 0}"></td>
    `;
    const colspan = isInvest ? 8 : 7;
    // Source tab link
    const sourceTab = s.type === "income" ? "income"
                    : s.type === "expense" ? "planned-expenses"
                    : /real\s*estate/i.test(s.name || "") ? "real-estate"
                    : "investments";
    const sourceLabel = sourceTab === "income" ? "Income"
                      : sourceTab === "planned-expenses" ? "Planned Expenses"
                      : sourceTab === "real-estate" ? "Real Estate"
                      : "Investments";
    const masterTag = isMaster ? `<span class="master-tag" title="Salary start/end drives Bonus and all Investment segments">MASTER</span>` : '';
    return `
      <tr data-seg-id="${s.id}" class="seg-base-row ${isExpanded ? 'expanded' : ''} ${isMaster ? 'is-master' : ''}">
        <td>
          <button class="btn-expand" data-toggle-seg="${s.id}" title="${isExpanded ? 'Hide' : 'Show'} year-by-year detail">${isExpanded ? '▼' : '▶'}</button>
          <input type="text" data-field="name" value="${escapeHtml(s.name)}" style="display:inline-block;width:calc(100% - 90px)">
          ${masterTag}
        </td>
        ${baseCols}
        <td><input type="number" class="num" data-field="start_year" value="${s.start_year || ''}"></td>
        <td><input type="number" class="num" data-field="end_year" value="${s.end_year || ''}"></td>
        <td class="actions">
          <a class="src-link" data-jump-tab="${sourceTab}" title="Edit amounts in source tab">↗ ${sourceLabel}</a>
          <button class="btn-mini danger" data-del-seg="${s.id}">×</button>
        </td>
      </tr>
      ${isExpanded ? `<tr class="seg-detail-row"><td colspan="${colspan}">${renderYearDetail(s)}</td></tr>` : ''}
    `;
  };

  const renderInvestmentGroup = (list) => {
    const total = list.reduce((sum, s) => sum + effectiveAnnual(s), 0);
    const totalBal = list.reduce((sum, s) => sum + Number(s.current_balance || 0), 0);
    return `
      <div class="seg-group">
        <div class="seg-group-header">
          <h4>Investment Contributions (${list.length}) · Current ${fmtINR(totalBal)} · Base annual ${fmtINR(total)}</h4>
          <button class="btn btn-sm" data-add-type="investment">+ Add Category</button>
        </div>
        <div class="table-scroll">
          <table class="data-table seg-table">
            <thead><tr>
              <th>Asset Category</th>
              <th class="num">Current Balance ₹L</th>
              <th class="num">Annual Contribution ₹L</th>
              <th class="num">Expected ROI %</th>
              <th class="num">Contrib YoY %</th>
              <th class="num">Start</th>
              <th class="num">End</th>
              <th></th>
            </tr></thead>
            <tbody>${list.map(renderSegmentRow).join("")}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderFlowGroup = (label, list, type) => {
    const total = list.reduce((sum, s) => sum + effectiveAnnual(s), 0);
    return `
      <div class="seg-group">
        <div class="seg-group-header">
          <h4>${label} (${list.length}) · Base annual ${fmtINR(total)}</h4>
          <button class="btn btn-sm" data-add-type="${type}">+ Add ${type}</button>
        </div>
        <div class="table-scroll">
          <table class="data-table seg-table">
            <thead><tr>
              <th>Name</th>
              <th class="num">Monthly ₹L</th>
              <th class="num">Annual ₹L</th>
              <th class="num">YoY %</th>
              <th class="num">Start</th>
              <th class="num">End</th>
              <th></th>
            </tr></thead>
            <tbody>${list.map(renderSegmentRow).join("")}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="muted small" style="margin-bottom:8px">Click ▶ on any row to set per-year contribution and ROI. Base values + YoY % drive computed defaults; any year you edit becomes a locked override.</div>
    ${renderFlowGroup("Income", groups.income, "income")}
    ${renderInvestmentGroup(groups.investment)}
    ${renderFlowGroup("Expenses", groups.expense, "expense")}
  `;

  // Wire expand toggles
  container.querySelectorAll("[data-toggle-seg]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.toggleSeg;
      expandedSegmentId = (String(expandedSegmentId) === String(id)) ? null : id;
      renderSegmentsEditor();
    };
  });
  // Wire base-row inputs (with debounced re-projection)
  container.querySelectorAll(".seg-base-row input[data-field]").forEach(inp => {
    inp.addEventListener("change", () => {
      const tr = inp.closest("tr");
      const id = tr.dataset.segId;
      const seg = appData.projection_segments.find(s => String(s.id) === String(id));
      if (!seg) return;
      const f = inp.dataset.field;
      let v = inp.value;
      if (f !== "name") v = Number(v) || 0;
      // Lakh-marked inputs: convert lakhs → rupees for storage
      if (inp.dataset.lakh === "1") v = v * 100000;
      seg[f] = v;

      // Auto-sync monthly <-> annual so the two stay consistent (storage in rupees)
      if (f === "monthly_amount") {
        seg.annual_amount = Number(v) * 12;
        const a = tr.querySelector('[data-field="annual_amount"]');
        if (a) a.value = toLakh(seg.annual_amount);
      } else if (f === "annual_amount") {
        seg.monthly_amount = Number(v) / 12;
        const m = tr.querySelector('[data-field="monthly_amount"]');
        if (m) m.value = toLakh(seg.monthly_amount, 3);
      }

      // Master control: Salary's start_year/end_year propagates to:
      //  - all Income segments
      //  - all Investment segments
      //  - House Rent expense (assumed to end when working/relocation period ends)
      if (/salary/i.test(seg.name || "") && (f === "start_year" || f === "end_year")) {
        let count = 0;
        appData.projection_segments.forEach(other => {
          if (other.id === seg.id) return;
          const isHouseRent = other.type === "expense" && /house\s*rent|^rent$/i.test(other.name || "");
          if (other.type === "income" || other.type === "investment" || isHouseRent) {
            other[f] = v;
            count++;
          }
        });
        saveAll();
        renderSegmentsEditor();
        reprojectAndRefresh();
        toast(`Propagated Salary ${f.replace("_", " ")} = ${v} to ${count} linked segments (Income, Investments, House Rent)`);
        return;
      }

      saveAll();
      reprojectAndRefresh();
    });
  });
  container.querySelectorAll("[data-del-seg]").forEach(btn => {
    btn.onclick = () => {
      if (!confirm("Delete this segment and all its year overrides?")) return;
      const id = btn.dataset.delSeg;
      appData.projection_segments = appData.projection_segments.filter(s => String(s.id) !== String(id));
      appData.projection_segment_yearly = appData.projection_segment_yearly.filter(o => String(o.segment_id) !== String(id));
      saveAll();
      renderProjections();
    };
  });
  container.querySelectorAll("[data-add-type]").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.addType;
      // Inherit Salary's start/end for new Income or Investment segments
      const salary = appData.projection_segments.find(s => /salary/i.test(s.name || ""));
      const inherit = salary && (type === "income" || type === "investment");
      const defaultStart = inherit ? Number(salary.start_year) : new Date().getFullYear();
      const defaultEnd = inherit ? Number(salary.end_year) : 2090;
      appData.projection_segments.push({
        id: nextId(appData.projection_segments),
        name: "New " + type, type,
        monthly_amount: 0, annual_amount: 0, yoy_growth_pct: 0,
        return_pct: type === "investment" ? 8 : 0,
        start_year: defaultStart, end_year: defaultEnd,
        current_balance: 0, notes: ""
      });
      saveAll();
      renderProjections();
    };
  });
  // Wire year-detail inputs
  wireYearDetailInputs(container);
}

function reprojectAndRefresh() {
  const series = computeProjection();
  appData.future_projections = series.map(r => ({
    id: r.id, year: r.year, age: r.age, phase: r.phase,
    total_assets_lakh: r.total_assets_lakh,
    annual_expense_lakh: r.annual_expense_lakh,
    annual_income_lakh: r.annual_income_lakh,
    net_change_lakh: r.net_change_lakh,
    locked: r.locked ? "true" : "",
    notes: r.notes || ""
  }));
  saveAll();
  const displaySeries = applyRealReturnAdjustment(series);
  renderProjectionTable(displaySeries);
  if (charts["chart-projection"]) {
    const ds = charts["chart-projection"].data.datasets;
    ds[0].data = displaySeries.map(r => r.total_assets_lakh);
    ds[1].data = displaySeries.map(r => r.annual_income_lakh);
    ds[2].data = displaySeries.map(r => r.annual_expense_lakh);
    charts["chart-projection"].update();
  }
  updateSegmentGroupTotals();
}

function renderYearDetail(seg) {
  const isInvest = seg.type === "investment";
  const sy = Number(seg.start_year) || new Date().getFullYear();
  const ey = Math.min(Number(seg.end_year) || 2090, sy + 60);
  const yearList = [];
  for (let y = sy; y <= ey; y++) yearList.push(y);

  const rows = yearList.map(y => {
    const ov = findYearlyOverride(seg.id, y);
    const computedContrib = contribAtYear({...seg, annual_amount: seg.annual_amount, monthly_amount: seg.monthly_amount, yoy_growth_pct: seg.yoy_growth_pct, start_year: seg.start_year, end_year: seg.end_year}, y);
    // ^ compute without override - temporarily ignore: easier to just compute base+yoy here
    const yearsIn = y - sy;
    const baseAnnual = effectiveAnnual(seg);
    const yoy = Number(seg.yoy_growth_pct || 0) / 100;
    const defaultContrib = baseAnnual * Math.pow(1 + yoy, yearsIn);
    const defaultROI = Number(seg.return_pct || 0);
    const isOverContrib = ov && ov.annual_amount !== "" && ov.annual_amount != null && !isNaN(Number(ov.annual_amount));
    const isOverROI = ov && ov.return_pct !== "" && ov.return_pct != null && !isNaN(Number(ov.return_pct));
    return `
      <tr data-year="${y}" data-seg-id="${seg.id}">
        <td>${y}</td>
        <td>
          <input type="number" step="0.01" class="num year-cell ${isOverContrib ? 'overridden' : ''}"
            data-yfield="annual_amount" data-year="${y}" data-seg-id="${seg.id}" data-lakh="1"
            placeholder="${toLakh(defaultContrib)}"
            value="${isOverContrib ? toLakh(ov.annual_amount) : ''}">
        </td>
        ${isInvest ? `
        <td>
          <input type="number" class="num year-cell ${isOverROI ? 'overridden' : ''}" step="0.1"
            data-yfield="return_pct" data-year="${y}" data-seg-id="${seg.id}"
            placeholder="${defaultROI}"
            value="${isOverROI ? ov.return_pct : ''}">
        </td>
        ` : ''}
        <td class="actions">
          ${ov ? `<button class="btn-mini" data-clear-year="${y}" data-seg-id="${seg.id}">Reset</button>` : ''}
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="year-detail">
      <div class="muted small" style="margin-bottom:6px">
        Year-by-year overrides for <b>${escapeHtml(seg.name)}</b>. Blank = use base+YoY (shown as placeholder). Type a value to lock that year. All ₹ values in lakhs.
      </div>
      <div class="table-scroll" style="max-height:400px">
        <table class="data-table year-detail-table">
          <thead><tr>
            <th>Year</th>
            <th class="num">Annual Contribution ₹L</th>
            ${isInvest ? '<th class="num">Expected ROI %</th>' : ''}
            <th></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function wireYearDetailInputs(container) {
  container.querySelectorAll(".year-cell").forEach(inp => {
    inp.addEventListener("change", () => {
      const segId = inp.dataset.segId;
      const year = Number(inp.dataset.year);
      const field = inp.dataset.yfield;
      const val = inp.value.trim();
      let ov = appData.projection_segment_yearly.find(o =>
        String(o.segment_id) === String(segId) && Number(o.year) === year
      );
      if (val === "") {
        // Clear this field's override
        if (ov) {
          ov[field] = "";
          // If both fields blank, remove the whole row
          if ((!ov.annual_amount || ov.annual_amount === "") && (!ov.return_pct || ov.return_pct === "")) {
            appData.projection_segment_yearly = appData.projection_segment_yearly.filter(o2 => o2 !== ov);
          }
        }
      } else {
        const n = Number(val);
        if (isNaN(n)) return;
        if (!ov) {
          ov = { id: nextId(appData.projection_segment_yearly), segment_id: segId, year, annual_amount: "", return_pct: "", notes: "" };
          appData.projection_segment_yearly.push(ov);
        }
        // annual_amount input is in lakhs → store as rupees; return_pct stays as percentage
        ov[field] = inp.dataset.lakh === "1" ? n * 100000 : n;
      }
      saveAll();
      // Refresh expanded detail in-place + projection
      const seg = appData.projection_segments.find(s => String(s.id) === String(segId));
      if (seg) {
        const detailTd = inp.closest(".seg-detail-row")?.querySelector("td");
        if (detailTd) {
          detailTd.innerHTML = renderYearDetail(seg);
          wireYearDetailInputs(detailTd);
        }
      }
      reprojectAndRefresh();
    });
  });
  container.querySelectorAll("[data-clear-year]").forEach(btn => {
    btn.onclick = () => {
      const segId = btn.dataset.segId;
      const year = Number(btn.dataset.clearYear);
      appData.projection_segment_yearly = appData.projection_segment_yearly.filter(o =>
        !(String(o.segment_id) === String(segId) && Number(o.year) === year)
      );
      saveAll();
      const seg = appData.projection_segments.find(s => String(s.id) === String(segId));
      if (seg) {
        const detailTd = btn.closest(".seg-detail-row")?.querySelector("td");
        if (detailTd) {
          detailTd.innerHTML = renderYearDetail(seg);
          wireYearDetailInputs(detailTd);
        }
      }
      reprojectAndRefresh();
    };
  });
}

function updateSegmentGroupTotals() {
  // Refresh totals shown in group headers without full re-render
  ["income","investment","expense"].forEach(t => {
    const segs = appData.projection_segments.filter(s => s.type === t);
    const total = segs.reduce((sum, s) => sum + effectiveAnnual(s), 0);
    const totalBal = segs.reduce((sum, s) => sum + Number(s.current_balance || 0), 0);
    const header = document.querySelector(`[data-add-type="${t}"]`)?.closest(".seg-group-header")?.querySelector("h4");
    if (header) {
      const label = t === "income" ? "Income" : t === "investment" ? "Investment Contributions" : "Expenses";
      header.textContent = t === "investment"
        ? `${label} (${segs.length}) · Current ${fmtINR(totalBal)} · Base annual ${fmtINR(total)}`
        : `${label} (${segs.length}) · Base annual ${fmtINR(total)}`;
    }
  });
}

/* -------- Sync investment balances from holdings (Investments + Real Estate tabs) -------- */
// Each Future-tab investment segment's current_balance is recomputed by aggregating
// the granular holdings from the Investments tab (by category) and Real Estate tab (sum).
function syncInvestmentBalancesFromHoldings() {
  let updated = 0;
  const segments = appData.projection_segments || [];

  // Map: segment name pattern → category match in investments table
  // Investments tab categories: Equity, FD, Gold, Retirement, Business
  const categoryMap = [
    { segPattern: /^business$/i,                  invCat: /^business$/i },
    { segPattern: /^equity$/i,                    invCat: /^equity$/i },
    { segPattern: /fd|fixed\s*income/i,           invCat: /^fd$/i },
    { segPattern: /^gold$/i,                      invCat: /^gold$/i },
    { segPattern: /retirement|pf\s*\+\s*nps/i,    invCat: /^retirement$/i }
  ];

  categoryMap.forEach(({ segPattern, invCat }) => {
    const seg = segments.find(s => s.type === "investment" && segPattern.test(s.name || ""));
    if (!seg) return;
    const totalRupees = (appData.investments || [])
      .filter(inv => invCat.test(inv.category || ""))
      .reduce((sum, inv) => sum + Number(inv.current_value_lakh || 0) * 100000, 0);
    seg.current_balance = totalRupees;
    updated++;
  });

  // Real Estate: aggregate property current_value (minus outstanding_loan? user choice — using gross value here to match Real Estate segment semantics)
  const reSeg = segments.find(s => s.type === "investment" && /real\s*estate/i.test(s.name || ""));
  if (reSeg) {
    const reTotal = (appData.real_estate || [])
      .reduce((sum, p) => sum + Number(p.current_value || 0), 0);
    reSeg.current_balance = reTotal;
    updated++;
  }

  saveAll();
  return { updated };
}

/* -------- Milestone rebalancing helpers -------- */
// Find segment ids/indices by name pattern (case-insensitive).
function buildSegmentIndex(investments, mode = "id") {
  const find = (pattern) => {
    const seg = investments.find(s => pattern.test(s.name || ""));
    if (!seg) return null;
    return mode === "id" ? seg.id : investments.indexOf(seg);
  };
  return {
    equity: find(/\bequity\b/i),
    fd: find(/\bfd\b|fixed\s*income/i),
    retirement: find(/retirement|pf\s*\+\s*nps|^pf$|^nps$/i),
    pension: find(/pension|annuity/i)
  };
}

function applyMilestones(balances, segIdx, year, assumptions, flags) {
  const rebalYr = Number(assumptions.rebalance_year) || 0;
  const npsYr = Number(assumptions.nps_unlock_year) || 0;
  const annuityPct = (Number(assumptions.nps_annuity_pct) || 40) / 100;

  // 1) Equity → FD/Debt rebalance
  if (rebalYr && year >= rebalYr && !flags.equityRebalanced) {
    if (segIdx.equity != null && segIdx.fd != null && (balances[segIdx.equity] || 0) > 0) {
      balances[segIdx.fd] = (balances[segIdx.fd] || 0) + balances[segIdx.equity];
      balances[segIdx.equity] = 0;
    }
    flags.equityRebalanced = true;
  }

  // 2) PF/NPS redemption: split 60% → FD, 40% → Pension Annuity
  if (npsYr && year >= npsYr && !flags.npsRedeemed) {
    if (segIdx.retirement != null && (balances[segIdx.retirement] || 0) > 0) {
      const bal = balances[segIdx.retirement];
      const toLiquid = bal * (1 - annuityPct);
      const toAnnuity = bal * annuityPct;
      if (segIdx.fd != null) balances[segIdx.fd] = (balances[segIdx.fd] || 0) + toLiquid;
      if (segIdx.pension != null) balances[segIdx.pension] = (balances[segIdx.pension] || 0) + toAnnuity;
      else if (segIdx.fd != null) balances[segIdx.fd] += toAnnuity;  // fallback if no annuity segment
      balances[segIdx.retirement] = 0;
    }
    flags.npsRedeemed = true;
  }
}

// Ensure Pension Annuity segment exists for users who already have other segments (idempotent).
// Skips entirely if the user has no segments at all (fresh visitor — we don't auto-create).
function ensurePensionAnnuitySegment() {
  if (!appData.projection_segments || appData.projection_segments.length === 0) return;
  const hasPension = appData.projection_segments.some(s => /pension|annuity/i.test(s.name || ""));
  if (!hasPension) {
    appData.projection_segments.push({
      id: nextId(appData.projection_segments),
      name: "Pension Annuity",
      type: "investment",
      monthly_amount: 0,
      annual_amount: 0,
      yoy_growth_pct: 0,
      return_pct: 6,
      start_year: 2049,
      end_year: 2090,
      current_balance: 0,
      notes: "Auto-created. Receives 40% of PF+NPS at age 60 (regulatory annuity)."
    });
    saveAll();
  }
}

/* -------- Monte Carlo Simulation -------- */
const MC_VOLATILITY = {
  business:     0.30,
  equity:       0.18,
  gold:         0.15,
  "real estate": 0.08,
  retirement:   0.04,
  "pf + nps":   0.05,
  pf:           0.03,
  nps:          0.06,
  "fd / fixed": 0.02,
  "fixed income": 0.02,
  fd:           0.02,
  "pension annuity": 0.015,
  annuity:      0.015,
  pension:      0.02
};
function getMCVolatility(name) {
  const n = (name || "").toLowerCase();
  // longest-match wins
  const keys = Object.keys(MC_VOLATILITY).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (n.includes(k)) return MC_VOLATILITY[k];
  }
  return 0.10;
}
function randNormal() {
  let u = Math.random();
  while (u === 0) u = Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function runMonteCarlo(numSims = 200) {
  const segments = appData.projection_segments || [];
  const investments = segments.filter(s => s.type === "investment");
  const incomes = segments.filter(s => s.type === "income");
  const expenses = segments.filter(s => s.type === "expense");
  const startYear = new Date().getFullYear();
  const years = Number(appData.assumptions.years) || 40;

  const segParams = investments.map(s => ({
    id: s.id,
    name: s.name,
    initial: Number(s.current_balance || 0),
    meanReturn: Number(s.return_pct || 0) / 100,
    vol: getMCVolatility(s.name),
    startYear: Number(s.start_year) || startYear,
    endYear: Number(s.end_year) || 9999,
    annualBase: effectiveAnnual(s),
    yoy: Number(s.yoy_growth_pct || 0) / 100
  }));

  // Deterministic income/expense per year (Monte Carlo only randomizes investment returns)
  const yearStream = [];
  for (let i = 0; i <= years; i++) {
    const year = startYear + i;
    let income = 0, expense = 0;
    incomes.forEach(s => { income += contribAtYear(s, year); });
    expenses.forEach(s => { expense += contribAtYear(s, year); });
    yearStream.push({ year, income, expense });
  }

  // Build name-based index for milestone rebalances (array indices, matches segParams)
  const mcSegIdx = buildSegmentIndex(investments, "index");

  const allPaths = [];
  let alivePaths = 0;
  for (let sim = 0; sim < numSims; sim++) {
    const balances = segParams.map(s => s.initial);
    const path = [];
    let alive = true;
    const flags = { equityRebalanced: false, npsRedeemed: false };
    for (let i = 0; i <= years; i++) {
      if (i > 0) {
        const year = startYear + i;
        let totalContrib = 0;
        segParams.forEach((s, idx) => {
          if (year < s.startYear || year > s.endYear) return;
          const yearsIn = year - s.startYear;
          const contrib = s.annualBase * Math.pow(1 + s.yoy, yearsIn);
          totalContrib += contrib;
          const ret = s.meanReturn + s.vol * randNormal();
          balances[idx] = balances[idx] * (1 + ret) + contrib * (1 + ret * 0.5);
        });

        // Milestone rebalances (each simulation independently tracks flags)
        applyMilestones(balances, mcSegIdx, year, appData.assumptions, flags);

        // Shortfall drawdown
        const yd = yearStream[i];
        const netCash = yd.income - yd.expense - totalContrib;
        if (netCash < 0) {
          const shortfall = -netCash;
          const totalBal = balances.reduce((a, b) => a + b, 0);
          if (totalBal > 0) {
            const ratio = Math.min(1, shortfall / totalBal);
            for (let j = 0; j < balances.length; j++) balances[j] *= (1 - ratio);
          }
        }
      }
      const total = balances.reduce((a, b) => a + Math.max(0, b), 0);
      path.push(total);
      if (total <= 0) alive = false;
    }
    if (alive) alivePaths++;
    allPaths.push(path);
  }

  const percentile = (sortedArr, p) => sortedArr[Math.min(sortedArr.length - 1, Math.max(0, Math.floor(sortedArr.length * p)))];
  const p10 = [], p25 = [], p50 = [], p75 = [], p90 = [];
  for (let i = 0; i <= years; i++) {
    const yearVals = allPaths.map(p => p[i]).sort((a, b) => a - b);
    p10.push(percentile(yearVals, 0.10));
    p25.push(percentile(yearVals, 0.25));
    p50.push(percentile(yearVals, 0.50));
    p75.push(percentile(yearVals, 0.75));
    p90.push(percentile(yearVals, 0.90));
  }

  // Diagnostics: when does the median path go negative? what's the average shortfall?
  let medianDeathYear = null;
  for (let i = 0; i <= years; i++) {
    if (p50[i] <= 0) { medianDeathYear = yearStream[i].year; break; }
  }
  // Peak balance year in median
  let peakIdx = 0;
  for (let i = 1; i <= years; i++) {
    if (p50[i] > p50[peakIdx]) peakIdx = i;
  }
  const peakYear = yearStream[peakIdx].year;
  const peakValue = p50[peakIdx];

  return {
    successRate: alivePaths / numSims * 100,
    years: yearStream.map(y => y.year),
    yearStream,
    p10, p25, p50, p75, p90,
    final: { p10: p10[years], p50: p50[years], p90: p90[years] },
    peakYear, peakValue, medianDeathYear,
    numSims
  };
}

function renderMonteCarlo() {
  const result = runMonteCarlo(200);
  const kpis = $("#mc-kpis");
  if (kpis) {
    const successColor = result.successRate >= 80 ? "text-success" : result.successRate >= 50 ? "text-warning" : "text-danger";
    kpis.innerHTML = `
      <div class="mc-kpi mc-kpi-primary">
        <div class="mc-kpi-label">Success Rate</div>
        <div class="mc-kpi-value ${successColor}">${fmtPct(result.successRate)}</div>
        <div class="mc-kpi-meta">${result.numSims} simulations · % staying positive through horizon</div>
      </div>
      <div class="mc-kpi">
        <div class="mc-kpi-label">Worst Case (10th)</div>
        <div class="mc-kpi-value">${fmtINR(result.final.p10)}</div>
        <div class="mc-kpi-meta">Bottom 10% of outcomes</div>
      </div>
      <div class="mc-kpi">
        <div class="mc-kpi-label">Median Outcome</div>
        <div class="mc-kpi-value">${fmtINR(result.final.p50)}</div>
        <div class="mc-kpi-meta">Most likely net worth</div>
      </div>
      <div class="mc-kpi">
        <div class="mc-kpi-label">Best Case (90th)</div>
        <div class="mc-kpi-value">${fmtINR(result.final.p90)}</div>
        <div class="mc-kpi-meta">Top 10% of outcomes</div>
      </div>
    `;
  }

  // Apply real-return adjustment to MC results if toggle is on
  const isReal = $("#real-return-toggle")?.checked || false;
  const inflation = (Number(appData.assumptions.inflation_pct) || 6) / 100;
  const startYear = new Date().getFullYear();
  const adj = (arr) => isReal ? arr.map((v, i) => v / Math.pow(1 + inflation, i)) : arr;

  const labels = result.years;
  const toL = (a) => a.map(v => +(v / 100000).toFixed(2));
  makeChart("chart-monte-carlo", "line", {
    labels,
    datasets: [
      {
        label: "Worst (10th %ile)",
        data: toL(adj(result.p10)),
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244,63,94,0.10)",
        borderWidth: 1.5,
        borderDash: [4, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 0
      },
      {
        label: "Median (50th %ile)",
        data: toL(adj(result.p50)),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139,92,246,0.12)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        pointRadius: 0
      },
      {
        label: "Best (90th %ile)",
        data: toL(adj(result.p90)),
        borderColor: "#10d9a3",
        backgroundColor: "rgba(16,217,163,0.06)",
        borderWidth: 1.5,
        borderDash: [4, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 0
      }
    ]
  });

  // Verdict + diagnostics
  const verdictEl = $("#mc-explanation");
  const diagEl = $("#mc-diagnostics");
  if (verdictEl) {
    const sr = result.successRate;
    let tone = "good", title = "Very Robust";
    if (sr >= 90)      { tone = "good";   title = "Very Robust"; }
    else if (sr >= 75) { tone = "good";   title = "Robust"; }
    else if (sr >= 50) { tone = "warn";   title = "Moderate Risk"; }
    else if (sr >= 25) { tone = "warn";   title = "Fragile"; }
    else               { tone = "danger"; title = "Plan Fails"; }
    const blurb = sr >= 75 ? "Your plan survives most simulated futures."
      : sr >= 50 ? "About half of simulated futures sustain to horizon. Build margin."
      : "Most simulated futures deplete the corpus before horizon. Action required.";
    verdictEl.innerHTML = `<div class="mc-verdict-${tone}"><span class="mc-verdict-title">${title}</span> · ${blurb}</div>`;
  }

  if (diagEl) {
    const segs = appData.projection_segments || [];
    const incomes = segs.filter(s => s.type === "income");
    const expenses = segs.filter(s => s.type === "expense");
    const investments = segs.filter(s => s.type === "investment");
    const annualIncome = incomes.reduce((s,r) => s + effectiveAnnual(r), 0);
    const annualExpense = expenses.reduce((s,r) => s + effectiveAnnual(r), 0);
    const annualContrib = investments.reduce((s,r) => s + effectiveAnnual(r), 0);
    const netCash = annualIncome - annualExpense - annualContrib;

    const items = [];
    items.push(`<div class="mc-diag-item"><span class="mc-diag-label">Peak corpus (median)</span><span class="mc-diag-val">${fmtINR(result.peakValue)} in ${result.peakYear}</span></div>`);
    if (result.medianDeathYear) {
      items.push(`<div class="mc-diag-item warn"><span class="mc-diag-label">Median path depletes</span><span class="mc-diag-val">in ${result.medianDeathYear} (age ${37 + (result.medianDeathYear - new Date().getFullYear())})</span></div>`);
    }
    items.push(`<div class="mc-diag-item ${netCash < 0 ? 'danger' : 'good'}"><span class="mc-diag-label">Year-1 net cash flow</span><span class="mc-diag-val">${fmtINR(netCash)} (income ${fmtINR(annualIncome)} − expense ${fmtINR(annualExpense)} − savings ${fmtINR(annualContrib)})</span></div>`);
    // Milestones
    const rebalYr = Number(appData.assumptions.rebalance_year) || 0;
    const npsYr = Number(appData.assumptions.nps_unlock_year) || 0;
    const annuityPct = Number(appData.assumptions.nps_annuity_pct) || 40;
    if (rebalYr) {
      items.push(`<div class="mc-diag-item good"><span class="mc-diag-label">Equity → Debt rebalance</span><span class="mc-diag-val">${rebalYr} (age ${37 + (rebalYr - new Date().getFullYear())}) · cuts sequence risk</span></div>`);
    }
    if (npsYr) {
      items.push(`<div class="mc-diag-item good"><span class="mc-diag-label">PF/NPS unlock</span><span class="mc-diag-val">${npsYr} · ${100-annuityPct}% to FD, ${annuityPct}% to Annuity</span></div>`);
    }

    // Suggestions
    const fixes = [];
    if (netCash < 0) {
      fixes.push(`<b>Cash-flow shortfall today</b>: your income (${fmtINR(annualIncome)}) doesn't cover expenses + contributions. Either raise Salary, cut Expenses, or reduce planned Investment Contributions.`);
    }
    const salary = investments.length && incomes.find(s => /salary/i.test(s.name || ""));
    if (salary && Number(salary.end_year) < 2055) {
      fixes.push(`<b>Salary ends in ${salary.end_year}</b> (age ${37 + (Number(salary.end_year) - new Date().getFullYear())}). After that, expenses run the corpus down. Extend Salary end year or add other income streams (Rental, Consulting).`);
    }
    const rental = incomes.find(s => /rental|rent income/i.test(s.name || ""));
    if (rental && effectiveAnnual(rental) === 0) {
      fixes.push(`<b>Rental income is ₹0</b>. With ${appData.real_estate?.length || 0} properties on file, you could project rental income — even 2% yield on real estate adds material support.`);
    }
    if (annualContrib < annualIncome * 0.2) {
      fixes.push(`<b>Savings rate is ${fmtPct(annualIncome > 0 ? annualContrib / annualIncome * 100 : 0)}</b>. A 25-40% savings rate during peak earning years dramatically improves outcomes.`);
    }
    if (fixes.length) {
      items.push(`<div class="mc-fixes"><b>Suggested fixes</b><ul>${fixes.map(f => '<li>' + f + '</li>').join('')}</ul></div>`);
    }
    diagEl.innerHTML = items.join("");
  }
}

/* -------- Editable projection table -------- */
function renderProjectionTable(series) {
  const tbl = $("#tbl-projections");
  if (!tbl) return;
  tbl.innerHTML = `
    <thead><tr>
      <th>Year</th><th>Age</th><th>Phase</th>
      <th class="num">Total Assets (₹L)</th>
      <th class="num">Income (₹L)</th>
      <th class="num">Expense (₹L)</th>
      <th class="num">Net Δ (₹L)</th>
      <th>Notes</th>
      <th class="actions"></th>
    </tr></thead>
    <tbody>
      ${series.map(r => `
        <tr ${r.locked ? 'class="locked-row"' : ''} data-year="${r.year}">
          <td>${r.year}</td>
          <td>${r.age}</td>
          <td>${escapeHtml(r.phase)}</td>
          <td class="num"><input type="number" step="0.01" data-proj-field="total_assets_lakh" value="${r.total_assets_lakh}"></td>
          <td class="num"><input type="number" step="0.01" data-proj-field="annual_income_lakh" value="${r.annual_income_lakh}"></td>
          <td class="num"><input type="number" step="0.01" data-proj-field="annual_expense_lakh" value="${r.annual_expense_lakh}"></td>
          <td class="num ${r.net_change_lakh < 0 ? 'diff-over' : 'diff-under'}">${r.net_change_lakh >= 0 ? '+' : ''}${r.net_change_lakh}</td>
          <td><input type="text" data-proj-field="notes" value="${escapeHtml(r.notes || '')}"></td>
          <td class="actions">
            ${r.locked ? `<span title="Locked - manually overridden" class="lock-icon">🔒</span><button class="btn-mini" data-unlock="${r.year}">Unlock</button>` : ''}
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
  tbl.querySelectorAll("input[data-proj-field]").forEach(inp => {
    inp.addEventListener("change", () => {
      const tr = inp.closest("tr");
      const year = Number(tr.dataset.year);
      const field = inp.dataset.projField;
      let row = appData.future_projections.find(r => Number(r.year) === year);
      if (!row) {
        row = { id: nextId(appData.future_projections), year };
        appData.future_projections.push(row);
      }
      const v = field === "notes" ? inp.value : Number(inp.value);
      row[field] = v;
      row.locked = "true"; // any manual edit locks the row
      saveAll();
      renderProjections();
    });
  });
  tbl.querySelectorAll("[data-unlock]").forEach(btn => {
    btn.onclick = () => {
      const year = Number(btn.dataset.unlock);
      const row = appData.future_projections.find(r => Number(r.year) === year);
      if (row) row.locked = "";
      saveAll();
      renderProjections();
    };
  });
}

/* -------------------- Generic Table Renderer -------------------- */
function renderTable(tableId, rows, columns, entityName, opts = {}) {
  const tbl = $("#" + tableId);
  if (!tbl) return;
  const headerCells = columns.map(c => `<th class="${c.num ? 'num' : ''}">${escapeHtml(c.label)}</th>`).join("");
  const actionHeader = opts.noEdit ? "" : `<th class="actions">Actions</th>`;
  const bodyRows = rows.map((row) => {
    const cells = columns.map(c => {
      let v = row[c.key];
      if (v === undefined || v === null) v = "";
      if (c.fmt) v = c.fmt(v);
      else if (c.num && typeof v === "number") v = v.toLocaleString("en-IN");
      return `<td class="${c.num ? 'num' : ''}">${escapeHtml(v)}</td>`;
    }).join("");
    const actions = opts.noEdit ? "" : `
      <td class="actions">
        <button class="btn-mini" data-action="edit" data-entity="${entityName}" data-id="${row.id}">Edit</button>
        <button class="btn-mini danger" data-action="delete" data-entity="${entityName}" data-id="${row.id}">Delete</button>
      </td>
    `;
    return `<tr>${cells}${actions}</tr>`;
  }).join("");
  tbl.innerHTML = `<thead><tr>${headerCells}${actionHeader}</tr></thead><tbody>${bodyRows || `<tr><td colspan="${columns.length + 1}" class="muted">No data. Import CSV or click + Add.</td></tr>`}</tbody>`;
  // Wire actions
  tbl.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const entity = btn.dataset.entity;
      if (btn.dataset.action === "edit") openEditModal(entity, id);
      else if (btn.dataset.action === "delete") deleteRow(entity, id);
    });
  });
}

/* -------------------- Add / Edit / Delete -------------------- */
function openEditModal(entityName, id) {
  const columns = CSV_SCHEMAS[entityName];
  const row = id ? appData[entityName].find(r => String(r.id) === String(id)) : {};
  const isNew = !row || !row.id;
  $("#modal-title").textContent = (isNew ? "Add " : "Edit ") + entityName.replace(/_/g, " ");

  // For transactions, prefill with helpful defaults and use datalists
  if (entityName === "transactions" && isNew) {
    row.date = new Date().toISOString().slice(0, 10);
    row.card = row.card || "Cash";
  }

  // Build datalists for transactions (categories, subcategories, cards)
  const datalistsHtml = entityName === "transactions" ? `
    <datalist id="dl-category">${getCategories().map(c => `<option value="${escapeHtml(c)}"></option>`).join("")}</datalist>
    <datalist id="dl-subcategory">${getSubcategories().map(c => `<option value="${escapeHtml(c)}"></option>`).join("")}</datalist>
    <datalist id="dl-card">${getCards().map(c => `<option value="${escapeHtml(c)}"></option>`).join("")}</datalist>
  ` : "";

  $("#modal-body").innerHTML = datalistsHtml + columns.map(col => {
    if (col === "id") return "";
    const val = row ? (row[col] || "") : "";
    let inputHtml;
    if (entityName === "transactions" && col === "category") {
      inputHtml = `<input type="text" list="dl-category" data-field="${col}" value="${escapeHtml(val)}" autocomplete="off" placeholder="Pick or type new…">`;
    } else if (entityName === "transactions" && col === "subcategory") {
      inputHtml = `<input type="text" list="dl-subcategory" data-field="${col}" value="${escapeHtml(val)}" autocomplete="off" placeholder="Pick or type new…">`;
    } else if (entityName === "transactions" && col === "card") {
      inputHtml = `<input type="text" list="dl-card" data-field="${col}" value="${escapeHtml(val)}" autocomplete="off" placeholder="Pick or type new…">`;
    } else if (col === "date") {
      inputHtml = `<input type="date" data-field="${col}" value="${escapeHtml(val)}">`;
    } else if (col === "amount" || col.endsWith("_amount") || col.endsWith("_lakh") || col === "outstanding" || col === "emi" || col === "monthly" || col === "annual") {
      inputHtml = `<input type="number" step="0.01" data-field="${col}" value="${escapeHtml(val)}">`;
    } else {
      inputHtml = `<input type="text" data-field="${col}" value="${escapeHtml(val)}">`;
    }
    return `
      <div class="form-row">
        <label>${col.replace(/_/g, " ")}</label>
        ${inputHtml}
      </div>
    `;
  }).join("");

  // Filter subcategory datalist when category changes
  if (entityName === "transactions") {
    const catInp = $("#modal-body input[data-field='category']");
    const subList = $("#dl-subcategory");
    const refreshSubList = () => {
      const subs = getSubcategories(catInp.value);
      if (subList) subList.innerHTML = subs.map(c => `<option value="${escapeHtml(c)}"></option>`).join("");
    };
    if (catInp) {
      catInp.addEventListener("input", refreshSubList);
      catInp.addEventListener("change", refreshSubList);
    }
  }

  $("#modal").classList.remove("hidden");
  $("#modal-save").onclick = () => {
    const updated = isNew ? { id: nextId(appData[entityName]) } : Object.assign({}, row);
    $$("#modal-body [data-field]").forEach(inp => {
      updated[inp.dataset.field] = inp.value;
    });
    coerceNumeric(entityName, [updated]);
    if (isNew) appData[entityName].push(updated);
    else {
      const idx = appData[entityName].findIndex(r => String(r.id) === String(id));
      if (idx >= 0) appData[entityName][idx] = updated;
    }
    // Auto-register new taxonomy values
    if (entityName === "transactions") {
      let added = false;
      if (updated.category) added |= addToTaxonomy("category", updated.category, "");
      if (updated.subcategory) added |= addToTaxonomy("subcategory", updated.subcategory, updated.category || "");
      if (updated.card) added |= addToTaxonomy("card", updated.card, "");
    }
    saveAll();
    closeModal();
    renderAll();
    toast(isNew ? "Added" : "Updated");
  };
}
function deleteRow(entityName, id) {
  if (!confirm("Delete this row?")) return;
  appData[entityName] = appData[entityName].filter(r => String(r.id) !== String(id));
  saveAll();
  renderAll();
  toast("Deleted");
}
function closeModal() { $("#modal").classList.add("hidden"); }

/* -------------------- Taxonomy editor (Settings) -------------------- */
function renderTaxonomyEditor() {
  const container = $("#taxonomy-editor");
  if (!container) return;
  const items = appData.taxonomy || [];

  const groupHtml = (type, label) => {
    const list = items.filter(t => t.type === type).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return `
      <div class="tax-group">
        <div class="tax-group-head">
          <h4>${label} <span class="muted small">(${list.length})</span></h4>
          <div class="tax-add-row">
            <input type="text" class="tax-add-name" placeholder="New ${type}…">
            ${type === "subcategory" ? `<input type="text" class="tax-add-parent" placeholder="Parent category">` : ""}
            <button class="btn btn-sm" data-tax-add="${type}">+ Add</button>
          </div>
        </div>
        <div class="tax-pills" data-tax-list="${type}">
          ${list.length === 0 ? '<span class="muted small">No entries yet.</span>' : list.map(t => `
            <span class="tax-pill" data-tax-id="${t.id}">
              <input type="text" class="tax-pill-name" value="${escapeHtml(t.name)}" data-field="name">
              ${type === "subcategory" ? `<input type="text" class="tax-pill-parent" value="${escapeHtml(t.parent || '')}" data-field="parent" placeholder="parent">` : ""}
              <button class="btn-mini danger" data-tax-del="${t.id}" title="Delete">×</button>
            </span>
          `).join("")}
        </div>
      </div>
    `;
  };

  container.innerHTML =
    groupHtml("category", "Categories") +
    groupHtml("subcategory", "Subcategories") +
    groupHtml("card", "Cards / Sources");

  // Add new
  container.querySelectorAll("[data-tax-add]").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.taxAdd;
      const group = btn.closest(".tax-group");
      const nameInput = group.querySelector(".tax-add-name");
      const parentInput = group.querySelector(".tax-add-parent");
      const name = (nameInput.value || "").trim();
      const parent = (parentInput?.value || "").trim();
      if (!name) { toast("Name required", "warn"); return; }
      const added = addToTaxonomy(type, name, parent);
      if (!added) { toast("Already exists", "warn"); return; }
      saveAll();
      nameInput.value = ""; if (parentInput) parentInput.value = "";
      renderTaxonomyEditor();
      toast("Added " + name);
    };
  });

  // Delete
  container.querySelectorAll("[data-tax-del]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.taxDel;
      const entry = appData.taxonomy.find(t => String(t.id) === String(id));
      if (!confirm("Delete " + (entry?.name || "entry") + "?")) return;
      appData.taxonomy = appData.taxonomy.filter(t => String(t.id) !== String(id));
      saveAll();
      renderTaxonomyEditor();
      toast("Deleted");
    };
  });

  // Inline edit
  container.querySelectorAll(".tax-pill input").forEach(inp => {
    inp.addEventListener("change", () => {
      const pill = inp.closest(".tax-pill");
      const id = pill.dataset.taxId;
      const entry = appData.taxonomy.find(t => String(t.id) === String(id));
      if (!entry) return;
      entry[inp.dataset.field] = inp.value;
      saveAll();
      toast("Updated");
    });
  });
}

/* -------------------- PDF Statement Parsers -------------------- */
async function extractPdfText(file) {
  if (typeof pdfjsLib === "undefined") {
    throw new Error("pdf.js library not loaded — check internet connection (CDN) or download to lib/");
  }
  const buf = await file.arrayBuffer();
  // Try with worker; if that fails, disable worker and retry (works on file://)
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  } catch (e) {
    console.warn("pdf.js worker failed, retrying without worker:", e.message);
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
    pdf = await pdfjsLib.getDocument({ data: buf, disableWorker: true }).promise;
  }
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  return { text, pages: pdf.numPages };
}

function detectPdfFormat(text) {
  // Be permissive — sample many keywords
  if (/ICICI\s*Bank|Emeralde|icici\s*Bank/i.test(text)) return "ICICI";
  if (/SBI\s*Card|SBICPSL|sbicard\.com|SBI\s*CARD|CASHB.CK\s*SBI/i.test(text)) return "SBI";
  if (/Axis\s*Bank|AXIS\s*BANK|Airtel\s*Axis|axisbank\.com/i.test(text)) return "Axis";
  return null;
}

async function parsePdf(file) {
  $("#pdf-status").textContent = "Reading PDF…";
  $("#pdf-preview").innerHTML = "";
  try {
    const { text, pages } = await extractPdfText(file);
    if (!text || text.length < 100) {
      $("#pdf-status").innerHTML = `<span class="negative">PDF text empty or too short (${text.length} chars). The PDF may be scanned/image-based. Try a different copy or use Generic CSV Upload below.</span>`;
      showRawTextPreview(text);
      return;
    }
    const fmt = detectPdfFormat(text);
    if (!fmt) {
      $("#pdf-status").innerHTML = `<span class="negative">Unrecognized PDF format. Supported: ICICI, SBI, Axis. See raw extract below — share with us if you want this format added.</span>`;
      showRawTextPreview(text);
      return;
    }
    let txns;
    if (fmt === "ICICI") txns = extractICICITransactions(text);
    else if (fmt === "SBI") txns = extractSBITransactions(text);
    else if (fmt === "Axis") txns = extractAxisTransactions(text);

    if (!txns || !txns.length) {
      $("#pdf-status").innerHTML = `<span class="negative">${fmt} PDF detected (${pages} pages, ${text.length} chars) but no transactions extracted. Format may have changed. Raw extract below.</span>`;
      showRawTextPreview(text);
      return;
    }
    txns.forEach(t => {
      const matched = MERCHANT_RULES.find(r => r.match.test(t.merchant));
      if (matched) { t.category = matched.cat; t.subcategory = matched.sub; if (matched.note) t.notes = matched.note; }
      else { t.category = "Uncategorized"; }
    });
    txns.forEach(t => {
      if (/POLICYBAZAAR/i.test(t.merchant) && t.amount > 15000) {
        t.category = "Investment"; t.subcategory = "ULIP"; t.notes = "Large PolicyBazaar - likely ULIP";
      }
    });
    renderPdfPreview(txns, fmt);
    $("#pdf-status").innerHTML = `<span class="positive">Detected <b>${fmt}</b> statement (${pages} pages). Parsed ${txns.length} transactions. Review below, then click Import.</span>`;
  } catch (e) {
    console.error("PDF parse error:", e);
    $("#pdf-status").innerHTML = `<span class="negative">Parse failed: ${escapeHtml(e.message)}. Check browser console (F12) for details.</span>`;
  }
}

function showRawTextPreview(text) {
  const full = text || "";
  // Find the transactions section if possible
  const txnMarkers = /TRANSACTIONS FOR|Transaction Details|DATE\s+TRANSACTION/i;
  const idx = full.search(txnMarkers);
  const startIdx = idx > 0 ? Math.max(0, idx - 50) : 0;
  const snippet = full.substring(startIdx, startIdx + 3500);
  $("#pdf-preview").innerHTML = `
    <details open>
      <summary class="muted small" style="cursor:pointer;margin-top:10px">Show raw extracted text (${full.length} chars total — showing ${snippet.length} from offset ${startIdx})</summary>
      <pre style="background:var(--bg-elev);padding:10px;border-radius:6px;font-size:11px;overflow:auto;max-height:400px;white-space:pre-wrap;word-break:break-all">${escapeHtml(snippet)}</pre>
    </details>
  `;
}

function extractICICITransactions(text) {
  const txns = [];
  const flat = text.replace(/\s+/g, " ");
  const pattern = /(\d{2}\/\d{2}\/\d{4})\s+(\d{8,})\s+(.+?)\s+(\d+)\s+([\d,]+\.\d{2})(\s+CR)?(?=\s+\d{2}\/\d{2}\/\d{4}|\s+#\s+International|\s+Page|\s*$)/g;
  let m;
  while ((m = pattern.exec(flat)) !== null) {
    const [, date, , merchant, , amountStr, isCR] = m;
    const amt = Number(amountStr.replace(/,/g, ""));
    if (/BBPS Payment received|Payment received/i.test(merchant)) continue;
    const [d, mo, y] = date.split("/");
    txns.push({
      date: `${y}-${mo}-${d}`,
      merchant: merchant.trim(),
      amount: isCR ? -amt : amt,
      category: "Uncategorized", subcategory: "",
      card: "ICICI", source_statement: "ICICI PDF Import", notes: ""
    });
  }
  return txns;
}

const MONTH_MAP = { Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12" };

function extractSBITransactions(text) {
  // Position-based extraction: locate each date anchor, then find the nearest
  // amount+D/C marker within the next date's window. Everything between is merchant.
  const txns = [];
  const flat = text.replace(/\s+/g, " ");

  // 1) Find all DD MMM YY anchors
  const datePattern = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{2})\b/g;
  const dateMatches = [];
  let dm;
  while ((dm = datePattern.exec(flat)) !== null) {
    // Skip dates with 4-digit-looking year follow-up (e.g. "18 May 2026" has year 26 + "26" later)
    const after = flat.charAt(datePattern.lastIndex);
    if (after && /\d/.test(after)) continue; // year part of a 4-digit year
    dateMatches.push({
      pos: dm.index,
      end: datePattern.lastIndex,
      dd: dm[1], mon: dm[2], yy: dm[3]
    });
  }

  const HEADER_NOISE = /TRANSACTIONS FOR|GSTIN|Statement Period|Outstanding|Important|Date Amount|CASHBACK|CKYC|For Statement|HSN Code|Authorized Signatory|Name\s+[A-Z]{3,}|to\b/i;

  // 2) For each date anchor, find amount+D/C in the segment up to next anchor
  for (let i = 0; i < dateMatches.length; i++) {
    const d = dateMatches[i];
    const nextStart = i + 1 < dateMatches.length ? dateMatches[i + 1].pos : flat.length;
    const segment = flat.substring(d.end, nextStart);

    // Find FIRST amount + D/C in segment
    const amtMatch = segment.match(/([\d,]+\.\d{2})\s+([DC])(?:\s|$)/);
    if (!amtMatch) continue;

    let merchant = segment.substring(0, amtMatch.index).trim();
    if (!merchant || merchant.length < 3) continue;
    if (HEADER_NOISE.test(merchant)) continue;
    if (/^[\d.,\s]+$/.test(merchant)) continue;
    // Strip a leading "to" if date was inside "Statement Period: 19 Apr 26 to 18 May 26"
    if (/^to\s+/i.test(merchant)) continue;

    const amt = Number(amtMatch[1].replace(/,/g, ""));
    const dc = amtMatch[2];
    const year = "20" + d.yy;
    const month = MONTH_MAP[d.mon];
    const day = String(d.dd).padStart(2, "0");
    txns.push({
      date: `${year}-${month}-${day}`,
      merchant,
      amount: dc === "C" ? -amt : amt,
      category: "Uncategorized", subcategory: "",
      card: "SBI Cashback", source_statement: "SBI PDF Import", notes: ""
    });
  }
  return txns;
}

function extractAxisTransactions(text) {
  // Axis format: "DD/MM/YYYY <MERCHANT> [CATEGORY] <AMOUNT> Dr/Cr"
  // Example: "15/06/2025 AIRTEL PAYMENTS BANK L,GURGAON UTILITIES 1,412.46 Dr"
  const txns = [];
  const flat = text.replace(/\s+/g, " ");
  const pattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+(Dr|Cr)(?=\s|$)/g;
  let m;
  while ((m = pattern.exec(flat)) !== null) {
    const [, date, merchant, amountStr, dc] = m;
    const amt = Number(amountStr.replace(/,/g, ""));
    if (!merchant || merchant.length < 3) continue;
    // Skip noise/headers
    if (/Total Payment|Minimum Payment|Statement Period|Previous Balance|Account Summary|Cashback|Card No|Page \d|TRANSACTIONS FOR|Name\s+[A-Z]{3,}/i.test(merchant)) continue;
    // Split merchant + category — category is often last word(s) all-caps with dashes
    let merchantClean = merchant.trim();
    const catMatch = merchantClean.match(/\s+([A-Z][A-Z &/-]{4,})$/);
    let categoryHint = "";
    if (catMatch) {
      categoryHint = catMatch[1].trim();
      merchantClean = merchantClean.replace(/\s+[A-Z][A-Z &/-]{4,}$/, "").trim();
    }
    const [d, mo, y] = date.split("/");
    txns.push({
      date: `${y}-${mo}-${d}`,
      merchant: merchantClean,
      amount: dc === "Cr" ? -amt : amt,
      category: "Uncategorized", subcategory: categoryHint,
      card: "Axis Airtel", source_statement: "Axis PDF Import", notes: ""
    });
  }
  return txns;
}
let pendingPdfTxns = [];
function renderPdfPreview(txns, bankFmt) {
  pendingPdfTxns = txns;
  const html = `
    <div class="muted small" style="margin:6px 0">Source: ${bankFmt || 'PDF'} · ${txns.length} txn(s) · Net: ${fmtINR(txns.reduce((s,t) => s + Number(t.amount), 0))}</div>
    <div class="txn-preview">
      <table class="data-table">
        <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th>Card</th><th class="num">Amount</th></tr></thead>
        <tbody>
          ${txns.map(t => `
            <tr>
              <td>${escapeHtml(t.date)}</td>
              <td>${escapeHtml(t.merchant)}</td>
              <td>${escapeHtml(t.category)}${t.subcategory ? ' / ' + escapeHtml(t.subcategory) : ''}</td>
              <td>${escapeHtml(t.card)}</td>
              <td class="num">${fmtINR(t.amount)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn primary" id="btn-pdf-import">Import ${txns.length} Transactions</button>
      <button class="btn" id="btn-pdf-cancel">Cancel</button>
    </div>
  `;
  $("#pdf-preview").innerHTML = html;
  $("#btn-pdf-import").onclick = () => {
    let added = 0;
    pendingPdfTxns.forEach(t => {
      const exists = appData.transactions.some(e => e.date === t.date && e.merchant === t.merchant && Number(e.amount) === Number(t.amount));
      if (exists) return;
      t.id = nextId(appData.transactions);
      appData.transactions.push(t);
      added++;
    });
    saveAll();
    pendingPdfTxns = [];
    $("#pdf-preview").innerHTML = "";
    $("#pdf-status").innerHTML = `<span class="positive">Imported ${added} new transactions (skipped ${txns.length - added} duplicates).</span>`;
    renderAll();
  };
  $("#btn-pdf-cancel").onclick = () => {
    pendingPdfTxns = [];
    $("#pdf-preview").innerHTML = "";
    $("#pdf-status").textContent = "Cancelled.";
  };
}

/* -------------------- Generic CSV / Bank CSV Upload -------------------- */
function handleGenericCsvUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const rows = parseCSV(e.target.result);
    if (!rows.length) { $("#csv-status").textContent = "Empty file."; return; }
    let added = 0;
    rows.forEach(r => {
      if (!r.date || !r.merchant || r.amount === undefined) return;
      const newRow = {
        id: nextId(appData.transactions),
        date: r.date,
        merchant: r.merchant,
        amount: Number(String(r.amount).replace(/,/g,'')),
        category: r.category || "Uncategorized",
        subcategory: r.subcategory || "",
        card: r.card || "Manual",
        source_statement: r.source_statement || file.name,
        notes: r.notes || ""
      };
      // Auto-categorize if missing
      if (newRow.category === "Uncategorized") {
        const m = MERCHANT_RULES.find(rl => rl.match.test(newRow.merchant));
        if (m) { newRow.category = m.cat; newRow.subcategory = m.sub; }
      }
      appData.transactions.push(newRow);
      added++;
    });
    saveAll();
    $("#csv-status").innerHTML = `<span class="positive">Imported ${added} transactions from ${escapeHtml(file.name)}.</span>`;
    renderAll();
  };
  reader.readAsText(file);
}
function handleBankCsvUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const rows = parseCSV(e.target.result);
    if (!rows.length) { $("#bank-status").textContent = "Empty file."; return; }
    let added = 0;
    rows.forEach(r => {
      const debit = Number(String(r.debit || "0").replace(/,/g,'')) || 0;
      const credit = Number(String(r.credit || "0").replace(/,/g,'')) || 0;
      const amt = debit > 0 ? debit : -credit;
      if (!r.date || (debit === 0 && credit === 0)) return;
      const merchant = r.description || r.narration || r.merchant || "Bank Txn";
      const newRow = {
        id: nextId(appData.transactions),
        date: r.date,
        merchant,
        amount: amt,
        category: "Uncategorized",
        subcategory: "",
        card: "Bank",
        source_statement: file.name,
        notes: ""
      };
      const m = MERCHANT_RULES.find(rl => rl.match.test(merchant));
      if (m) { newRow.category = m.cat; newRow.subcategory = m.sub; }
      appData.transactions.push(newRow);
      added++;
    });
    saveAll();
    $("#bank-status").innerHTML = `<span class="positive">Imported ${added} entries from ${escapeHtml(file.name)}.</span>`;
    renderAll();
  };
  reader.readAsText(file);
}

/* -------------------- Bulk Import -------------------- */
function handleBulkImport(files) {
  let imported = 0;
  let done = 0;
  Array.from(files).forEach(file => {
    const name = file.name.replace(/\.csv$/i, "");
    if (!SEED_FILES[name]) {
      done++; checkDone();
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      coerceNumeric(name, rows);
      appData[name] = rows;
      imported++;
      done++;
      checkDone();
    };
    reader.readAsText(file);
  });
  function checkDone() {
    if (done === files.length) {
      saveAll();
      renderAll();
      $("#bulk-status").innerHTML = `<span class="positive">Loaded ${imported} CSV file(s).</span>`;
    }
  }
}

/* -------------------- Wire UI -------------------- */
function wireUI() {
  // Settings-only global buttons (Import/Export CSVs moved out of topbar)
  const wireSafe = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  wireSafe("#btn-export-all", () => {
    Object.keys(CSV_SCHEMAS).forEach(name => exportTable(name));
  });
  // "Import All CSVs" is now a label wrapping the hidden file input — clicking the label opens the picker.
  // Legacy alias if present anywhere:
  wireSafe("#btn-export-all-2", () => Object.keys(CSV_SCHEMAS).forEach(name => exportTable(name)));
  wireSafe("#btn-load-seed", loadSeed);
  // Welcome-card actions
  wireSafe("#btn-welcome-seed", () => { loadSeed(); });
  wireSafe("#btn-welcome-import", () => {
    // Jump to Settings tab → bulk import
    const settingsBtn = document.querySelector('.nav-item[data-tab="settings"]');
    if (settingsBtn) settingsBtn.click();
    setTimeout(() => $("#bulk-import")?.click(), 200);
  });
  wireSafe("#btn-welcome-manual", () => {
    // Jump to Expenses tab so user can start adding transactions
    const expBtn = document.querySelector('.nav-item[data-tab="expenses"]');
    if (expBtn) expBtn.click();
  });
  wireSafe("#btn-clear-data", () => {
    if (!confirm("Clear all stored data? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    Object.keys(appData).forEach(k => { if (Array.isArray(appData[k])) appData[k] = []; });
    appData.assumptions = { return_pct: 8, inflation_pct: 6, annual_expense: 2700000, years: 30 };
    renderAll();
    toast("Cleared.");
  });

  // Per-table import/export
  ["investments","loans","real-estate","transactions","planned","projections","projection-segments"].forEach(short => {
    const map = { "real-estate": "real_estate", "planned": "planned_budget", "projections": "future_projections", "projection-segments": "projection_segments" };
    const name = map[short] || short;
    const btn = $("#btn-export-" + short);
    if (btn) btn.onclick = () => exportTable(name);
    const imp = $("#import-" + short);
    if (imp) imp.onchange = e => { if (e.target.files[0]) importTable(name, e.target.files[0]); };
  });

  // + Add buttons (null-safe)
  const wire = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  wire("#btn-add-investment", () => openEditModal("investments", null));
  wire("#btn-add-loan", () => openEditModal("loans", null));
  wire("#btn-add-property", () => openEditModal("real_estate", null));
  wire("#btn-add-txn", () => openEditModal("transactions", null));
  wire("#btn-edit-plan", () => openPlanEditor());
  wire("#btn-add-proj", () => openEditModal("future_projections", null));
  wire("#btn-add-goal", () => openEditModal("goals", null));

  // Income tab buttons
  wire("#btn-add-income", () => {
    addCashFlowItem("income", "New Income");
    renderIncome();
    toast("Income source added — fill in monthly or annual amount");
  });
  wire("#btn-load-sample-income", () => {
    if (window.EMBEDDED_SEED?.projection_segments) {
      const rows = parseCSV(window.EMBEDDED_SEED.projection_segments);
      coerceNumeric("projection_segments", rows);
      const incomeRows = rows.filter(r => r.type === "income");
      incomeRows.forEach(r => {
        if (!appData.projection_segments.some(s => s.name === r.name && s.type === "income")) {
          r.id = nextId(appData.projection_segments);
          appData.projection_segments.push(r);
        }
      });
      saveAll();
      renderIncome();
      toast(`Loaded ${incomeRows.length} sample income sources`);
    }
  });

  // Planned Expenses tab buttons
  wire("#btn-add-planned-expense", () => {
    addCashFlowItem("expense", "New Expense");
    renderPlannedExpenses();
    toast("Expense item added — fill in monthly or annual amount");
  });
  wire("#btn-apply-exp-structure", applyStandardExpenseStructure);

  // Sync Investment balances from Investments + Real Estate tabs
  wire("#btn-sync-investments", () => {
    const result = syncInvestmentBalancesFromHoldings();
    renderProjections();
    toast(`Synced ${result.updated} investment categor${result.updated === 1 ? 'y' : 'ies'} from holdings + Real Estate`);
  });
  const goalsImp = $("#import-goals");
  if (goalsImp) goalsImp.onchange = e => { if (e.target.files[0]) importTable("goals", e.target.files[0]); };
  wire("#btn-export-goals", () => exportTable("goals"));

  // Modal
  $("#modal-close").onclick = closeModal;
  $("#modal-cancel").onclick = closeModal;
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

  // Expenses controls
  $("#exp-view-mode").onchange = renderExpenses;
  $("#exp-period").onchange = renderExpenses;

  // Planned vs Actual controls
  $("#pa-period").onchange = renderPlannedActual;
  const paMode = $("#pa-view-mode");
  if (paMode) paMode.onchange = renderPlannedActual;

  // Statement uploads
  $("#upload-icici-pdf").onchange = e => { if (e.target.files[0]) parsePdf(e.target.files[0]); };
  $("#upload-generic-csv").onchange = e => { if (e.target.files[0]) handleGenericCsvUpload(e.target.files[0]); };
  $("#upload-bank-csv").onchange = e => { if (e.target.files[0]) handleBankCsvUpload(e.target.files[0]); };

  // Bulk import
  $("#bulk-import").onchange = e => { if (e.target.files.length) handleBulkImport(e.target.files); };

  // Projections
  const getNum = (sel, fallback) => {
    const el = $(sel);
    return el ? (Number(el.value) || fallback) : fallback;
  };
  wire("#btn-run-projection", () => {
    appData.assumptions = Object.assign({}, appData.assumptions, {
      return_pct: getNum("#assump-return", 8),
      inflation_pct: getNum("#assump-inflation", 6),
      annual_expense: getNum("#assump-expense", 2700000),
      years: getNum("#assump-years", 40),
      rebalance_year: getNum("#assump-rebalance-year", 2049),
      nps_unlock_year: getNum("#assump-nps-unlock-year", 2049),
      nps_annuity_pct: getNum("#assump-nps-annuity-pct", 40)
    });
    appData.future_projections = computeProjection();
    saveAll();
    renderProjections();
    toast("Projection recomputed with milestones applied.");
  });
  wire("#btn-unlock-all-years", () => {
    if (!confirm("Clear all manual year-cell locks in the projection table?")) return;
    (appData.future_projections || []).forEach(r => { r.locked = ""; });
    saveAll();
    renderProjections();
    toast("All year locks cleared. Projection now fully computed from segments.");
  });
  const realToggle = $("#real-return-toggle");
  if (realToggle) realToggle.addEventListener("change", () => {
    renderProjections();
    toast(realToggle.checked ? "Showing in today's purchasing power" : "Showing nominal ₹");
  });
  wire("#btn-run-monte-carlo", () => {
    const btn = $("#btn-run-monte-carlo");
    if (btn) btn.disabled = true;
    setTimeout(() => {
      try { renderMonteCarlo(); } finally { if (btn) btn.disabled = false; }
    }, 30);
    toast("Running 200 simulations…");
  });
}

function openPlanEditor() {
  // Edit planned budget in a table
  $("#modal-title").textContent = "Edit Planned Budget";
  const items = appData.planned_budget;
  const html = `
    <table class="data-table">
      <thead><tr><th>Category</th><th>Subcategory</th><th class="num">Monthly ₹</th><th class="num">Annual ₹</th><th>Mode</th><th></th></tr></thead>
      <tbody id="plan-rows">
        ${items.map((p, idx) => `
          <tr>
            <td><input type="text" data-idx="${idx}" data-field="category" value="${escapeHtml(p.category || '')}"></td>
            <td><input type="text" data-idx="${idx}" data-field="subcategory" value="${escapeHtml(p.subcategory || '')}"></td>
            <td><input type="number" data-idx="${idx}" data-field="monthly" value="${p.monthly || 0}"></td>
            <td><input type="number" data-idx="${idx}" data-field="annual" value="${p.annual || 0}"></td>
            <td><input type="text" data-idx="${idx}" data-field="payment_mode" value="${escapeHtml(p.payment_mode || '')}"></td>
            <td><button class="btn-mini danger" data-del="${idx}">×</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <button class="btn" id="plan-add-row" style="margin-top:10px">+ Add Row</button>
  `;
  $("#modal-body").innerHTML = html;
  $("#modal").classList.remove("hidden");
  $("#plan-add-row").onclick = () => {
    appData.planned_budget.push({ id: nextId(appData.planned_budget), category: "", subcategory: "", monthly: 0, annual: 0, payment_mode: "", notes: "" });
    openPlanEditor();
  };
  $$("#plan-rows [data-del]").forEach(b => b.onclick = () => {
    appData.planned_budget.splice(Number(b.dataset.del), 1);
    openPlanEditor();
  });
  $("#modal-save").onclick = () => {
    $$("#plan-rows input").forEach(inp => {
      const idx = Number(inp.dataset.idx);
      const field = inp.dataset.field;
      let v = inp.value;
      if (field === "monthly" || field === "annual") v = Number(v) || 0;
      if (appData.planned_budget[idx]) appData.planned_budget[idx][field] = v;
    });
    // Auto-fill annual from monthly if blank
    appData.planned_budget.forEach(p => {
      if (!p.annual && p.monthly) p.annual = Number(p.monthly) * 12;
    });
    saveAll();
    closeModal();
    renderAll();
    toast("Plan saved.");
  };
}

/* -------------------- Init -------------------- */
function init() {
  // URL-based reset: visit index.html?reset=1 to wipe localStorage and reload
  const params = new URLSearchParams(window.location.search);
  if (params.has("reset")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    history.replaceState({}, "", window.location.pathname);
    location.reload();
    return;
  }

  initTheme();
  initTabs();
  initDrawer();
  wireUI();
  updateTopbarTitle("dashboard");
  loadAll();      // populates appData from localStorage if present, otherwise leaves it empty
  renderAll();    // empty state shows a welcome card with explicit opt-in to load sample data
}
document.addEventListener("DOMContentLoaded", init);
