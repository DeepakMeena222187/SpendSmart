// ─────────────────────────────────────────────────────────────────────────────
//  Dashboard.jsx  —  Full redesign
//  3 themes: Dark (crypto) · Light (mint) · Money (gold)
//  Charts: Donut · Daily Area · Monthly Bar
//  Hindi roasts per category · Budget titles · PWA install · Responsive
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from "react";
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ExpenseForm  from "../components/ExpenseForm";
import ExpenseList  from "../components/ExpenseList";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

// ── Categories & colours ─────────────────────────────────────────────────────
export const CATEGORIES = [
  "Food","Transport","Shopping","Entertainment",
  "Health","Education","Utilities","Other",
];
export const CATEGORY_COLORS = {
  Food:"#ef5350", Transport:"#ab47bc", Shopping:"#42a5f5",
  Entertainment:"#26a69a", Health:"#ec407a", Education:"#7e57c2",
  Utilities:"#ff7043", Other:"#78909c",
};

// ── 3 full themes ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    name:"dark", icon:"🌙",
    bg:"#0d1117", surface:"#161b22", surface2:"#21262d",
    border:"#30363d", text:"#e6edf3", textMuted:"#7d8590",
    accent:"#00d4b8", accent2:"#00fff5",
    accentGlow:"rgba(0,212,184,0.25)", navBg:"#0d1117",
    cardShadow:"0 4px 24px rgba(0,0,0,0.4)",
    gradStart:"#00d4b822", gradEnd:"transparent",
    chartGrid:"#21262d", btnBg:"#21262d", btnText:"#e6edf3",
  },
  light: {
    name:"light", icon:"☀️",
    bg:"#f0faf8", surface:"#ffffff", surface2:"#e8f5f2",
    border:"#cce8e4", text:"#1a2e2b", textMuted:"#558a80",
    accent:"#00897b", accent2:"#00bfa5",
    accentGlow:"rgba(0,137,123,0.15)", navBg:"#00897b",
    cardShadow:"0 4px 20px rgba(0,137,123,0.1)",
    gradStart:"#00897b22", gradEnd:"transparent",
    chartGrid:"#e8f5f2", btnBg:"#e8f5f2", btnText:"#1a2e2b",
  },
  money: {
    name:"money", icon:"💰",
    bg:"#0a0f1e", surface:"#0f1a30", surface2:"#162040",
    border:"#1e3a6e", text:"#f0e6c8", textMuted:"#a08050",
    accent:"#ffd700", accent2:"#ffaa00",
    accentGlow:"rgba(255,215,0,0.2)", navBg:"#070d1a",
    cardShadow:"0 4px 24px rgba(0,0,0,0.5)",
    gradStart:"#ffd70022", gradEnd:"transparent",
    chartGrid:"#162040", btnBg:"#162040", btnText:"#f0e6c8",
  },
};

// ── Budget spending titles ────────────────────────────────────────────────────
const SPENDING_TITLES = [
  {
    key:"kanjoos", emoji:"🤏", label:"Kanjoos",
    desc:"Bhai kharch bhi kar! Paisa sirf dekhne ke liye nahi hota 😂",
    color:"#42a5f5",
    check:(s,l) => l>0 && s < l*0.75,
  },
  {
    key:"disciplined", emoji:"😎", label:"Disciplined Loog",
    desc:"Budget ka samman karta hai tu! Ekdum solid banda 🫡",
    color:"#00c853",
    check:(s,l) => l>0 && s>=l*0.75 && s<=l,
  },
  {
    key:"andha", emoji:"🔥", label:"Andha Paisa",
    desc:"Budget toot gaya bhai! Paisa rocket mein daal diya kya? 💸",
    color:"#ff5252",
    check:(s,l) => l>0 && s>l,
  },
];

// ── Funny Hindi roasts per category ──────────────────────────────────────────
const ROASTS = {
  Food: [
    "Kitna khata hai bhai! 🍕 Ya dost ko party de raha hai? Mujhe bhi dede!",
    "Zomato ka shareholder ban ja seedha, itna order karta hai! 🍱",
    "Bhai pet hai ya black hole? Gravity bhi nahi rok pa rahi! 😂",
    "Swiggy wale tere ghar ka address zubaan par yaad kar lete honge! 🛵",
  ],
  Transport: [
    "Itna ghoomta hai bhai! GPS laga le khud mein seedha! 🚗",
    "Ola-Uber ka CEO banne wala hai tu is rate se! 🚕",
    "Petrol price dekh ke rona aata hai na? Welcome to the club! ⛽",
    "Bhai cycle le le, paisa bhi bachega, sehat bhi banegi! 🚴",
  ],
  Shopping: [
    "Amazon Prime membership le le bhai, kuch toh discount milega! 🛍️",
    "Cart mein dala → kharida → regret kiya → repeat. Cycle complete! 😅",
    "Ghar warehouse ban gaya hoga tera by now bhai! 📦",
    "Myntra wale toh tere liye special sale karte honge! 👗",
  ],
  Entertainment: [
    "Netflix, Prime, Hotstar - seedha cinema hall kharid le bhai! 🎬",
    "Popcorn ka budget alag se hai kya? 🍿 Pata nahi chalega!",
    "Itna entertainment? Bhai life mein bhi thoda invest kar! 😂",
    "Bhai OTT subscriptions ka hisaab laga ek baar, shock lagega! 📺",
  ],
  Health: [
    "Gym ka paisa de raha hai, jaata bhi hai ya sirf guilt leta hai? 💪",
    "Doctor aur gym dono ko paisa ja raha hai - balance hai bhai! 🏥",
    "Protein powder itna expensive hai, dal bhi toh protein hai yaar! 🥗",
    "Healthy rehna India mein sabse mehenga hobby hai! 🏃",
  ],
  Education: [
    "Are bhai bhoot padh raha hai! IIT-JEE direct crack kar le! 📚",
    "Itni books - padhta bhi hai ya sirf kharidta hai collection ke liye? 😅",
    "Bhai scholar ban ja, fees wapas milegi scholarship mein! 🎓",
    "Google bhi free hai bhai, par soch toh tera hai! 🤓",
  ],
  Utilities: [
    "Bijli ka bill dekh ke BESCOM wale khushi se naach rahe honge! ⚡",
    "AC 18° pe chala raha hai kya? Antarctica banana hai ghar ko? ❄️",
    "Bhai solar panel laga le, ek saal mein paisa wapas aayega! ☀️",
    "Ghar mein server farm hai kya? Itni bijli? 💻",
  ],
  Other: [
    "Kahan gaya paisa? Mystery hai yaar, even Sherlock nahi dhundh payega! 🤔",
    "Miscellaneous matlab - mat pucho kya kiya, izzat reh jaayegi! 😂",
    "Other category mein sab jaata hai jo explain nahi kar sakte 🙈",
    "Bhai agar khud nahi pata toh hum kya bolein? 😂",
  ],
};

function getRoast(category) {
  const arr = ROASTS[category] || ROASTS.Other;
  return arr[Math.floor(Date.now() / 3600000) % arr.length];
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth;
    return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

// ── Budget progress bar ───────────────────────────────────────────────────────
function BudgetBar({ spent, limit, t }) {
  const pct  = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const over = limit > 0 && spent > limit;
  return (
    <div style={{ width:"100%", marginTop:8 }}>
      <div style={{
        height:8, background:t.surface2,
        borderRadius:99, overflow:"hidden",
      }}>
        <div style={{
          height:"100%", width:`${pct}%`,
          background: over
            ? "linear-gradient(90deg,#ff5252,#ff1744)"
            : `linear-gradient(90deg,${t.accent},${t.accent2})`,
          borderRadius:99,
          transition:"width 0.8s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 10px ${t.accentGlow}`,
        }}/>
      </div>
      <div style={{
        display:"flex", justifyContent:"space-between",
        fontSize:"0.72rem", color:t.textMuted, marginTop:4, fontWeight:600,
      }}>
        <span>₹{spent.toLocaleString()} spent</span>
        <span style={{ color: over ? "#ff5252" : t.accent }}>
          {pct.toFixed(0)}% · {over ? `₹${(spent-limit).toLocaleString()} over!` : `₹${(limit-spent).toLocaleString()} left`}
        </span>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, t, delay=0 }) {
  return (
    <div className="fade-up" style={{
      background:t.surface, border:`1px solid ${t.border}`,
      borderRadius:16, padding:"1.1rem 1.25rem",
      boxShadow:t.cardShadow,
      animationDelay:`${delay}ms`,
      transition:"transform 0.2s, box-shadow 0.2s",
      cursor:"default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform="translateY(-3px)";
      e.currentTarget.style.boxShadow=`0 8px 32px ${t.accentGlow}`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform="translateY(0)";
      e.currentTarget.style.boxShadow=t.cardShadow;
    }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:"0.72rem", color:t.textMuted, fontWeight:600,
            textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>
            {label}
          </p>
          <p style={{ fontSize:"1.5rem", fontWeight:800, color:t.text,
            fontFamily:"'Syne',sans-serif", lineHeight:1 }}>
            {value}
          </p>
          {sub && <p style={{ fontSize:"0.75rem", color:t.accent, marginTop:4, fontWeight:600 }}>{sub}</p>}
        </div>
        <span style={{ fontSize:"1.6rem", opacity:0.8 }}>{icon}</span>
      </div>
    </div>
  );
}

// ── Custom tooltip for charts ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:t.surface2, border:`1px solid ${t.border}`,
      borderRadius:10, padding:"8px 14px", fontSize:"0.82rem",
      color:t.text, boxShadow:t.cardShadow,
    }}>
      <p style={{ color:t.textMuted, marginBottom:4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:t.accent, fontWeight:700 }}>
          ₹{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  // ── State ──
  const [expenses,     setExpenses]     = useState([]);
  const [filterMonth,  setFilterMonth]  = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  const [limit,        setLimit]        = useState(() =>
    parseFloat(localStorage.getItem("spendLimit") || "0")
  );
  const [limitInput,   setLimitInput]   = useState(() =>
    localStorage.getItem("spendLimit") || ""
  );
  const [editingLimit, setEditingLimit] = useState(false);
  const [themeName,    setThemeName]    = useState(() =>
    localStorage.getItem("ssTheme") || "dark"
  );
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIOSHint,   setShowIOSHint]   = useState(false);
  const [isInstalled,   setIsInstalled]   = useState(
    window.matchMedia("(display-mode: standalone)").matches
  );

  const t = THEMES[themeName] || THEMES.dark;

  // ── PWA install prompt ──
  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    if (isIOS) { setShowIOSHint(true); setTimeout(() => setShowIOSHint(false), 5000); return; }
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => { setInstallPrompt(null); setIsInstalled(true); });
    }
  }

  // ── Theme toggle ──
  function cycleTheme() {
    const order = ["dark","light","money"];
    const next  = order[(order.indexOf(themeName)+1) % order.length];
    setThemeName(next);
    localStorage.setItem("ssTheme", next);
  }

  // ── Firestore listener ──
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db,"expenses"),
      where("uid","==",user.uid),
      orderBy("date","desc")
    );
    return onSnapshot(q, snap => {
      setExpenses(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    });
  }, [user]);

  // ── Add / Delete ──
  async function addExpense(formData) {
    try {
      await addDoc(collection(db,"expenses"), {
        uid:user.uid, title:formData.title,
        amount:parseFloat(formData.amount),
        category:formData.category, date:formData.date,
        createdAt:serverTimestamp(),
      });
    } catch(err) { console.error(err.message); }
  }
  async function deleteExpense(id) {
    try { await deleteDoc(doc(db,"expenses",id)); }
    catch(err) { console.error(err.message); }
  }

  // ── Limit save ──
  function saveLimit() {
    const val = parseFloat(limitInput);
    if (!isNaN(val) && val >= 0) {
      setLimit(val);
      localStorage.setItem("spendLimit", val);
    }
    setEditingLimit(false);
  }

  // ── Derived data ──
  const filtered      = expenses.filter(e => e.date?.startsWith(filterMonth));
  const total         = filtered.reduce((s,e) => s+e.amount, 0);
  const spendTitle    = SPENDING_TITLES.find(st => st.check(total,limit));

  // Top category for roast
  const topCategory = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.category] = (map[e.category]||0)+e.amount; });
    const entries = Object.entries(map).sort((a,b) => b[1]-a[1]);
    if (!entries.length) return null;
    const [cat, amt] = entries[0];
    const pct = total > 0 ? (amt/total)*100 : 0;
    return pct > 35 ? cat : null;
  }, [filtered, total]);

  // Daily area chart data
  const dailyData = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.date] = (map[e.date]||0)+e.amount; });
    const [yr, mo] = filterMonth.split("-").map(Number);
    const days = new Date(yr, mo, 0).getDate();
    return Array.from({length:days}, (_,i) => {
      const day  = String(i+1).padStart(2,"0");
      const date = `${filterMonth}-${day}`;
      return { day:i+1, amount:parseFloat((map[date]||0).toFixed(0)) };
    });
  }, [filtered, filterMonth]);

  // Monthly bar chart data (last 6 months)
  const monthlyBar = useMemo(() => {
    const result = [];
    for (let i=5; i>=0; i--) {
      const d = new Date(); d.setMonth(d.getMonth()-i);
      const key   = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const label = d.toLocaleString("default",{month:"short"});
      const amt   = expenses.filter(e=>e.date?.startsWith(key))
                            .reduce((s,e)=>s+e.amount,0);
      result.push({ month:label, amount:parseFloat(amt.toFixed(0)) });
    }
    return result;
  }, [expenses]);

  // Category donut data
  const donutData = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.category]=(map[e.category]||0)+e.amount; });
    return Object.entries(map)
      .map(([name,value]) => ({ name, value:parseFloat(value.toFixed(2)) }))
      .sort((a,b)=>b.value-a.value);
  }, [filtered]);

  // ── Layout helpers ──
  const cols = (mobile, tablet, desktop) =>
    bp==="mobile" ? mobile : bp==="tablet" ? tablet : desktop;

  // ── Card style helper ──
  const card = (extra={}) => ({
    background:t.surface, border:`1px solid ${t.border}`,
    borderRadius:20, padding:"1.4rem 1.5rem",
    boxShadow:t.cardShadow, transition:"all 0.4s ease",
    ...extra,
  });

  // ── Section title ──
  const sectionTitle = (txt) => (
    <h2 style={{
      fontSize:"0.85rem", fontWeight:700, color:t.textMuted,
      textTransform:"uppercase", letterSpacing:1.5,
      marginBottom:"1rem", fontFamily:"'Space Grotesk',sans-serif",
    }}>{txt}</h2>
  );

  return (
    <div style={{
      minHeight:"100vh", background:t.bg, color:t.text,
      fontFamily:"'Space Grotesk',sans-serif",
      transition:"background 0.5s ease, color 0.5s ease",
    }}>

      {/* ── iOS hint toast ─────────────────────────────────────────── */}
      {showIOSHint && (
        <div style={{
          position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
          background:t.surface2, border:`1px solid ${t.border}`,
          borderRadius:14, padding:"12px 20px", zIndex:9999,
          fontSize:"0.85rem", color:t.text, boxShadow:t.cardShadow,
          whiteSpace:"nowrap",
        }}>
          Tap <strong>Share ↑</strong> → <strong>"Add to Home Screen"</strong> 📱
        </div>
      )}

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header style={{
        background: themeName==="dark"
          ? "rgba(13,17,23,0.95)"
          : themeName==="money"
          ? "rgba(7,13,26,0.98)"
          : t.accent,
        backdropFilter:"blur(12px)",
        borderBottom:`1px solid ${t.border}`,
        padding:`0 ${isMobile?"1rem":"1.5rem"}`,
        display:"flex", alignItems:"center",
        justifyContent:"space-between", height:64,
        position:"sticky", top:0, zIndex:100,
        transition:"background 0.5s ease",
      }}>
        <img src="/logo.png" alt="SpendSmart"
          style={{ height:isMobile?30:38, objectFit:"contain" }} />

        <div style={{ display:"flex", alignItems:"center", gap:isMobile?"8px":"12px" }}>

          {/* PWA Install btn — only if not installed */}
          {!isInstalled && (
            <button onClick={handleInstall} style={{
              background:t.accentGlow, border:`1px solid ${t.accent}`,
              color:t.accent, borderRadius:20, padding:"5px 12px",
              fontSize:"0.75rem", fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", gap:4,
            }}>
              📲 {isMobile ? "Install" : "Add to Home"}
            </button>
          )}

          {/* Theme cycler */}
          <button onClick={cycleTheme} title="Switch theme" style={{
            background:t.btnBg, border:`1px solid ${t.border}`,
            borderRadius:10, padding:"6px 10px",
            fontSize:"1rem", cursor:"pointer",
            transition:"transform 0.2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="rotate(20deg)"}
          onMouseLeave={e=>e.currentTarget.style.transform="rotate(0deg)"}
          >
            {THEMES[themeName].icon}
          </button>

          {/* Spending title badge */}
          {spendTitle && !isMobile && (
            <div style={{
              background:`${spendTitle.color}22`,
              border:`1px solid ${spendTitle.color}44`,
              borderRadius:20, padding:"4px 12px",
              display:"flex", alignItems:"center", gap:6,
            }}>
              <span>{spendTitle.emoji}</span>
              <span style={{ color:spendTitle.color, fontWeight:700, fontSize:"0.78rem" }}>
                {spendTitle.label}
              </span>
            </div>
          )}

          {/* Avatar */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <img src={user.photoURL||""} alt=""
              style={{ width:36, height:36, borderRadius:"50%",
                border:`2px solid ${t.accent}`,
                boxShadow:`0 0 12px ${t.accentGlow}` }} />
            {!isMobile && (
              <span style={{ color:t.text, fontWeight:700, fontSize:"0.9rem" }}>
                {user.displayName?.split(" ")[0]}
              </span>
            )}
          </div>

          <button onClick={()=>signOut(auth)} style={{
            background:"transparent", border:`1px solid ${t.border}`,
            color:t.textMuted, borderRadius:10, padding:"6px 12px",
            fontSize:"0.82rem", fontWeight:600, cursor:"pointer",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=t.accent; e.currentTarget.style.color=t.accent; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.color=t.textMuted; }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"1rem":"1.5rem 1.5rem 3rem" }}>

        {/* ── Month + budget row ─────────────────────────────────────── */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "auto 1fr",
          gap:"1rem", marginBottom:"1.25rem",
        }}>
          {/* Month picker */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ color:t.textMuted, fontSize:"0.85rem", fontWeight:600 }}>📅</span>
            <input type="month" value={filterMonth}
              onChange={e=>setFilterMonth(e.target.value)}
              style={{
                background:t.surface, border:`1px solid ${t.border}`,
                borderRadius:10, padding:"8px 14px",
                fontSize:"0.95rem", fontWeight:700,
                color:t.accent, outline:"none",
                fontFamily:"'Space Grotesk',sans-serif",
              }}
            />
          </div>

          {/* Budget banner */}
          <div style={{ ...card(), padding:"1rem 1.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"0.75rem" }}>
              <span style={{ fontWeight:700, color:t.text, fontSize:"0.88rem" }}>
                📊 Monthly Budget
              </span>

              {editingLimit ? (
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <input type="number" value={limitInput}
                    onChange={e=>setLimitInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&saveLimit()}
                    placeholder="e.g. 10000" autoFocus
                    style={{
                      background:t.surface2, border:`1px solid ${t.accent}`,
                      borderRadius:8, padding:"5px 10px",
                      color:t.text, outline:"none", width:130,
                      fontFamily:"'Space Grotesk',sans-serif", fontWeight:700,
                    }}
                  />
                  <button onClick={saveLimit} style={{
                    background:t.accent, color:"#000", border:"none",
                    borderRadius:8, padding:"5px 16px",
                    fontWeight:800, cursor:"pointer",
                    fontFamily:"'Space Grotesk',sans-serif",
                  }}>Save</button>
                  <button onClick={()=>setEditingLimit(false)} style={{
                    background:t.surface2, border:`1px solid ${t.border}`,
                    color:t.textMuted, borderRadius:8, padding:"5px 12px",
                    cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif",
                  }}>✕</button>
                </div>
              ) : (
                <>
                  <span style={{ fontWeight:800, color:t.accent, fontSize:"1.05rem" }}>
                    {limit>0 ? `₹${limit.toLocaleString()}` : "Not set"}
                  </span>
                  <button onClick={()=>setEditingLimit(true)} style={{
                    background:t.surface2, border:`1px solid ${t.border}`,
                    color:t.textMuted, borderRadius:8, padding:"4px 12px",
                    fontSize:"0.78rem", fontWeight:700, cursor:"pointer",
                    fontFamily:"'Space Grotesk',sans-serif",
                  }}>
                    {limit>0 ? "✏️ Edit" : "➕ Set"}
                  </button>

                  {spendTitle && (
                    <span style={{
                      marginLeft:"auto", fontSize:"0.78rem",
                      color:spendTitle.color, fontWeight:700,
                      background:`${spendTitle.color}18`, borderRadius:8, padding:"3px 10px",
                    }}>
                      {spendTitle.emoji} {spendTitle.desc}
                    </span>
                  )}
                </>
              )}
            </div>
            {limit>0 && !editingLimit && <BudgetBar spent={total} limit={limit} t={t}/>}
          </div>
        </div>

        {/* ── Stat cards ────────────────────────────────────────────── */}
        <div style={{
          display:"grid",
          gridTemplateColumns:`repeat(${cols(2,4,4)}, 1fr)`,
          gap:"1rem", marginBottom:"1.25rem",
        }}>
          <StatCard label="Total This Month" value={`₹${total.toLocaleString("en-IN",{minimumFractionDigits:0})}`}
            icon="💸" t={t} delay={0}
            sub={limit>0 ? (total>limit?"Over budget!":"Within budget ✓") : null} />
          <StatCard label="Transactions" value={filtered.length} icon="🧾" t={t} delay={50}
            sub={filtered.length>0 ? `Avg ₹${(total/filtered.length).toFixed(0)}` : null} />
          <StatCard label="Top Category" t={t} delay={100} icon="🏆"
            value={(() => {
              const map={};
              filtered.forEach(e=>{map[e.category]=(map[e.category]||0)+e.amount;});
              const top=Object.entries(map).sort((a,b)=>b[1]-a[1])[0];
              return top ? top[0] : "—";
            })()}
          />
          <StatCard label="This vs Last Month" t={t} delay={150} icon="📈"
            value={(() => {
              const d=new Date(); d.setMonth(d.getMonth()-1);
              const prev=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
              const prevTotal=expenses.filter(e=>e.date?.startsWith(prev)).reduce((s,e)=>s+e.amount,0);
              if (!prevTotal) return "New!";
              const diff=((total-prevTotal)/prevTotal*100).toFixed(0);
              return `${diff>0?"+":""}${diff}%`;
            })()}
          />
        </div>

        {/* ── Hindi roast banner ────────────────────────────────────── */}
        {topCategory && (
          <div className="fade-up" style={{
            ...card({ padding:"1rem 1.5rem", marginBottom:"1.25rem" }),
            borderLeft:`4px solid ${CATEGORY_COLORS[topCategory]}`,
            display:"flex", alignItems:"center", gap:"1rem",
          }}>
            <span style={{ fontSize:"1.8rem" }}>
              {{ Food:"🍕", Transport:"🚗", Shopping:"🛍️", Entertainment:"🎬",
                 Health:"💪", Education:"📚", Utilities:"⚡", Other:"🤔" }[topCategory]}
            </span>
            <div>
              <p style={{ fontSize:"0.72rem", color:t.textMuted, fontWeight:700,
                textTransform:"uppercase", letterSpacing:1 }}>
                {topCategory} is your top spend
              </p>
              <p style={{ color:t.text, fontWeight:600, fontSize:"0.9rem", marginTop:2 }}>
                {getRoast(topCategory)}
              </p>
            </div>
          </div>
        )}

        {/* ── Charts row 1: Daily area + Donut ─────────────────────── */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
          gap:"1.25rem", marginBottom:"1.25rem",
        }}>
          {/* Daily spending area chart */}
          <div style={card()}>
            {sectionTitle("Daily Spending — This Month")}
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{top:4,right:4,bottom:0,left:-20}}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={t.accent} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={t.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                <XAxis dataKey="day" tick={{fill:t.textMuted, fontSize:10}}
                  axisLine={false} tickLine={false}
                  ticks={[1,5,10,15,20,25,30]} />
                <YAxis tick={{fill:t.textMuted, fontSize:10}}
                  axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip t={t}/>}/>
                <Area type="monotone" dataKey="amount" stroke={t.accent}
                  strokeWidth={2.5} fill="url(#areaGrad)" dot={false}
                  activeDot={{r:5, fill:t.accent, stroke:t.surface}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category donut */}
          <div style={card()}>
            {sectionTitle("By Category")}
            {donutData.length === 0 ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                height:200, color:t.textMuted, fontSize:"0.85rem" }}>
                No data yet 📊
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {donutData.map(e => (
                      <Cell key={e.name} fill={CATEGORY_COLORS[e.name]||"#aaa"}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={v=>`₹${v.toLocaleString()}`}
                    contentStyle={{ background:t.surface2, border:`1px solid ${t.border}`,
                      borderRadius:10, color:t.text, fontFamily:"'Space Grotesk',sans-serif" }}/>
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={v=><span style={{color:t.text,fontSize:"0.75rem"}}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Chart row 2: Monthly bar ──────────────────────────────── */}
        <div style={{ ...card(), marginBottom:"1.25rem" }}>
          {sectionTitle("Last 6 Months Overview")}
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyBar} margin={{top:4,right:4,bottom:0,left:-20}}
              barSize={isMobile?18:28}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false}/>
              <XAxis dataKey="month" tick={{fill:t.textMuted, fontSize:11}}
                axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:t.textMuted, fontSize:10}}
                axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip t={t}/>}/>
              <Bar dataKey="amount" radius={[8,8,0,0]}>
                {monthlyBar.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.month === new Date().toLocaleString("default",{month:"short"})
                      ? t.accent : `${t.accent}55`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Add form + Expense list ───────────────────────────────── */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "380px 1fr",
          gap:"1.25rem",
        }}>
          <div style={card()}>
            <h2 style={{ fontSize:"1rem", fontWeight:800, color:t.text,
              marginBottom:"1.1rem", fontFamily:"'Syne',sans-serif" }}>
              ➕ Add Expense
            </h2>
            <ExpenseForm onAdd={addExpense}/>
          </div>

          <div style={card()}>
            <h2 style={{ fontSize:"1rem", fontWeight:800, color:t.text,
              marginBottom:"1.1rem", fontFamily:"'Syne',sans-serif",
              display:"flex", alignItems:"center", gap:10 }}>
              🧾 Transactions —{" "}
              {new Date(filterMonth+"-02").toLocaleString("default",{month:"long",year:"numeric"})}
              <span style={{ fontWeight:600, color:t.textMuted, fontSize:"0.85rem" }}>
                ({filtered.length})
              </span>
            </h2>
            <ExpenseList expenses={filtered} onDelete={deleteExpense}/>
          </div>
        </div>

      </main>
    </div>
  );
}