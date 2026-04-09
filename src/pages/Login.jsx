import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

const THEMES_PREVIEW = [
  { icon:"🌙", label:"Dark" }, { icon:"☀️", label:"Light" }, { icon:"💰", label:"Money" }
];

export default function Login() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try { await signInWithPopup(auth, provider); }
    catch(err) { alert("Login failed: " + err.message); setLoading(false); }
  }

  return (
    <div style={{
      minHeight:"100vh",
      background:"#0d1117",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"1rem", fontFamily:"'Space Grotesk',sans-serif",
      position:"relative", overflow:"hidden",
    }}>
      {/* Glow blobs */}
      {[["#00d4b8","top:-120px;right:-80px"],["#7c3aed","bottom:-80px;left:-60px"]].map(([c,p],i)=>(
        <div key={i} style={{
          position:"fixed", width:320, height:320, borderRadius:"50%",
          background:`radial-gradient(circle, ${c}25, transparent 70%)`,
          pointerEvents:"none",
          ...Object.fromEntries(p.split(";").map(s=>s.split(":")))
        }}/>
      ))}

      {/* Grid pattern */}
      <div style={{
        position:"fixed", inset:0, opacity:0.04,
        backgroundImage:"linear-gradient(#00d4b8 1px,transparent 1px),linear-gradient(90deg,#00d4b8 1px,transparent 1px)",
        backgroundSize:"40px 40px", pointerEvents:"none",
      }}/>

      <div style={{
        background:"#161b22", border:"1px solid #30363d",
        borderRadius:24, padding:"2.5rem 2rem",
        maxWidth:420, width:"100%",
        boxShadow:"0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,184,0.08)",
        position:"relative", zIndex:1, textAlign:"center",
      }}>
        <img src="/logo.png" alt="SpendSmart" style={{ width:200, marginBottom:"0.5rem" }}/>

        <p style={{ color:"#7d8590", fontSize:"0.9rem", marginBottom:"1.75rem",
          fontWeight:500, lineHeight:1.6 }}>
          Track every rupee. Know your patterns.<br/>
          <span style={{ color:"#00d4b8", fontWeight:700 }}>Spend Smart, live smart.</span>
        </p>

        {/* Features */}
        <div style={{
          display:"flex", justifyContent:"center", gap:"0.5rem",
          flexWrap:"wrap", marginBottom:"1.5rem",
        }}>
          {["📊 Charts","🎯 Budget","🔔 Roasts","🌙 Dark Mode","💰 Money Theme"].map(f=>(
            <span key={f} style={{
              background:"#21262d", border:"1px solid #30363d",
              color:"#7d8590", borderRadius:20, padding:"4px 12px",
              fontSize:"0.75rem", fontWeight:600,
            }}>{f}</span>
          ))}
        </div>

        {/* Theme previews */}
        <div style={{
          display:"flex", gap:"0.5rem", justifyContent:"center",
          marginBottom:"1.5rem",
        }}>
          {THEMES_PREVIEW.map(tp=>(
            <div key={tp.icon} style={{
              background:"#21262d", border:"1px solid #30363d",
              borderRadius:10, padding:"6px 14px",
              fontSize:"0.75rem", color:"#7d8590", fontWeight:600,
            }}>
              {tp.icon} {tp.label}
            </div>
          ))}
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
          gap:"0.75rem", background:"#00d4b8", border:"none",
          borderRadius:14, padding:"0.9rem 1.5rem",
          fontSize:"1rem", fontWeight:800, color:"#0d1117",
          cursor:loading?"not-allowed":"pointer",
          fontFamily:"'Space Grotesk',sans-serif",
          boxShadow:"0 4px 24px rgba(0,212,184,0.35)",
          transition:"all 0.2s", opacity:loading?0.7:1,
        }}
        onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(0,212,184,0.5)"; }}}
        onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 24px rgba(0,212,184,0.35)"; }}
        >
          {loading ? (
            <span style={{ animation:"pulse 1s infinite" }}>Signing in...</span>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="" style={{width:20,height:20}}/>
              Continue with Google
            </>
          )}
        </button>

        <p style={{ marginTop:"1.25rem", fontSize:"0.72rem", color:"#484f58" }}>
          Free forever · Your data stays private · No ads
        </p>
      </div>
    </div>
  );
}