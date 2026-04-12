import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const API_URL = "https://mediavue-backend-production.up.railway.app";
const FREE_LIMIT = 5;
const STORAGE_KEY = "mv_reads";
const RESET_KEY = "mv_reset";
const PROFILE_KEY = "mv_profile";
const THEME_KEY = "mv_theme";

// Stripe config
const STRIPE_PK = "pk_test_51TIeliCNh46FhHW7NcuzCh7D8YE0nIvu8ptqVjHNgYkJg9j9utCvuxTTlcB4C3xGivRfEnWuwmkFSurQ6HdmoVfV00vP1rCMG3";

// Stripe checkout — redirects to Stripe hosted page
// priceId comes from your Stripe dashboard (price_xxx)
async function openStripeCheckout(priceId, email) {
  try {
    const res = await fetch(`${API_URL}/api/stripe/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: priceId === "price_1TIetmCNh46FhHW7NnpwHfzE" ? "monthly"
            : priceId === "price_1TIeuNCNh46FhHW76z9lKZTY" ? "annual"
            : "student",
        userEmail: email,
        userId: "",
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else console.error("Stripe error", data);
  } catch (e) {
    console.error("Stripe checkout error", e);
  }
}

// Supabase config
const SUPABASE_URL = "https://ffkksnejsgxeglqhjujy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZma2tzbmVqc2d4ZWdscWhqdWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMjEzNjEsImV4cCI6MjA5MDg5NzM2MX0.0DoVlYkw12jAW1gbMYv5dMu1QE5U9af47H3PQtySmPc";

// Supabase auth helpers
async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON,
      "Authorization": `Bearer ${SUPABASE_ANON}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

async function signUp(email, password) {
  return supabaseRequest("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function signIn(email, password) {
  return supabaseRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function signInWithGoogle() {
  const redirectTo = window.location.origin + window.location.pathname;
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
}

// Parse session from URL hash after OAuth redirect
function parseSessionFromUrl() {
  try {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash;
    if (!hash) return null;
    const params = new URLSearchParams(hash.replace("#", ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token) return null;
    // Clean URL
    window.history.replaceState({}, "", window.location.pathname);
    return { access_token, refresh_token, user: {} };
  } catch { return null; }
}

// Get user info from access token
async function getUser(accessToken) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${accessToken}` }
    });
    return res.json();
  } catch { return null; }
}

async function signOut(accessToken) {
  return supabaseRequest("/auth/v1/logout", {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}` },
  });
}

function getStoredSession() {
  try { return JSON.parse(localStorage.getItem("mv_session") || "null"); } catch { return null; }
}

function storeSession(session) {
  try { localStorage.setItem("mv_session", JSON.stringify(session)); } catch {}
}

function clearSession() {
  try { localStorage.removeItem("mv_session"); } catch {}
}

// Category gradient fallbacks — no external images needed
const CAT_GRADIENTS = {
  "Politique":    "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
  "Économie":     "linear-gradient(135deg,#0a1628 0%,#0e2d1f 50%,#0a4f3f 100%)",
  "International":"linear-gradient(135deg,#1a0a2e 0%,#16213e 50%,#2d1b69 100%)",
  "Social":       "linear-gradient(135deg,#1a1200 0%,#2d1f00 50%,#3d2800 100%)",
  "Justice":      "linear-gradient(135deg,#1a0a0a 0%,#2d1010 50%,#3d1515 100%)",
  "Médias":       "linear-gradient(135deg,#0a1a1a 0%,#0d2626 50%,#0f3333 100%)",
  "Technologie":  "linear-gradient(135deg,#0a0a1a 0%,#10102e 50%,#1a1a4a 100%)",
  "Environnement":"linear-gradient(135deg,#0a1a0a 0%,#0d2010 50%,#0f3015 100%)",
  "default":      "linear-gradient(135deg,#111 0%,#1a1a1a 50%,#222 100%)",
};

const CAT_ICONS = {
  "Politique": "🏛️", "Économie": "📈", "International": "🌍",
  "Social": "🤝", "Justice": "⚖️", "Médias": "📺",
  "Technologie": "💻", "Environnement": "🌿", "default": "📰",
};

const SOURCES = [
  { id: "lemonde", name: "Le Monde", orientation: "centre-gauche", orientationScore: 2, factuality: "Élevée", owner: "Xavier Niel / Matthieu Pigasse", ownerType: "milliardaires indépendants", logo: "LM", color: "#2471a3" },
  { id: "lefigaro", name: "Le Figaro", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "Famille Dassault", ownerType: "groupe industriel", logo: "LF", color: "#922b21" },
  { id: "liberation", name: "Libération", orientation: "gauche", orientationScore: 1, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "LIB", color: "#c0392b" },
  { id: "mediapart", name: "Médiapart", orientation: "gauche", orientationScore: 0, factuality: "Élevée", owner: "Indépendant", ownerType: "indépendant", logo: "MP", color: "#e74c3c" },
  { id: "bfmtv", name: "BFMTV", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "BFM", color: "#1a6fa8" },
  { id: "lesechos", name: "Les Échos", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LE", color: "#0e6655" },
  { id: "cnews", name: "CNews", orientation: "droite extrême", orientationScore: 5, factuality: "Mixte", owner: "Vincent Bolloré (Vivendi)", ownerType: "milliardaire conservateur", logo: "CN", color: "#555" },
  { id: "franceinfo", name: "France Info", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Télévisions", ownerType: "service public", logo: "FI", color: "#d35400" },
  { id: "france24", name: "France 24", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Médias Monde", ownerType: "service public", logo: "F24", color: "#1e8449" },
  { id: "leparisien", name: "Le Parisien", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LP", color: "#a04000" },
  { id: "blast", name: "Blast", orientation: "gauche", orientationScore: 0, factuality: "Moyenne", owner: "Indépendant", ownerType: "indépendant", logo: "BL", color: "#6c3483" },
  { id: "marianne", name: "Marianne", orientation: "centre-gauche", orientationScore: 2, factuality: "Moyenne", owner: "Czech Media Invest", ownerType: "milliardaire étranger", logo: "MAR", color: "#1a5276" },
  { id: "lepoint", name: "Le Point", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "François Pinault", ownerType: "milliardaire luxe", logo: "PT", color: "#2e4057" },
  { id: "valeursactuelles", name: "Valeurs Actuelles", orientation: "droite extrême", orientationScore: 5, factuality: "Faible", owner: "Groupe Valmonde", ownerType: "groupe conservateur", logo: "VA", color: "#616a6b" },
  { id: "20minutes", name: "20 Minutes", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Rossel", ownerType: "groupe de presse", logo: "20M", color: "#1e8449" },
  { id: "ouestfrance", name: "Ouest-France", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Association SIPA", ownerType: "indépendant", logo: "OF", color: "#2e4057" },
  { id: "lobs", name: "L'Obs", orientation: "centre-gauche", orientationScore: 1, factuality: "Élevée", owner: "Groupe Le Monde", ownerType: "milliardaires indépendants", logo: "OBS", color: "#a04000" },
  { id: "humanite", name: "L'Humanité", orientation: "gauche", orientationScore: 0, factuality: "Moyenne", owner: "Société coopérative", ownerType: "indépendant", logo: "HUM", color: "#922b21" },
  { id: "lacroix", name: "La Croix", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Groupe Bayard", ownerType: "groupe catholique", logo: "CRX", color: "#6c3483" },
  { id: "lexpress", name: "L'Express", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Alain Weill / Altice", ownerType: "milliardaire télécom", logo: "EXP", color: "#922b21" },
];

const CATEGORIES = ["Tout", "Politique", "Économie", "Social", "International", "Justice", "Médias", "Technologie", "Environnement"];

const ORI_COLOR = {
  "gauche": "#e74c3c", "centre-gauche": "#e67e22", "centre": "#7f8c8d",
  "centre-droite": "#3498db", "droite": "#5d6d7e", "droite extrême": "#3d3d3d",
};

const OWNER_TYPE_COLOR = {
  "indépendant": "#1e8449", "milliardaires indépendants": "#b7770d",
  "milliardaire télécom": "#c0392b", "milliardaire conservateur": "#6c3483",
  "milliardaire luxe": "#1a6fa8", "groupe industriel": "#616a6b",
  "service public": "#1e8449", "milliardaire étranger": "#d35400",
  "groupe de presse": "#616a6b", "groupe catholique": "#6c3483", "groupe conservateur": "#616a6b",
};

function getSource(id) {
  return SOURCES.find(s => s.id === id) || { logo: (id||"?").slice(0,2).toUpperCase(), color:"#2a2a2a", name:id||"Inconnu", orientation:"centre", orientationScore:3, owner:"Inconnu", ownerType:"inconnu" };
}
function isBreaking(story) {
  if (!story.published_at) return false;
  return (Date.now() - new Date(story.published_at)) / 3600000 < 6 && (story.coverageCount||story.coverage_count||0) >= 3;
}
function getScore(cov) {
  const g=cov?.gauche||0, c=cov?.centre||0, d=cov?.droite||0, total=g+c+d;
  if (!total) return 0;
  return Math.round(([g>0,c>0,d>0].filter(Boolean).length/3)*100);
}
function getReadsToday() {
  try {
    const today = new Date().toDateString();
    if (localStorage.getItem(RESET_KEY) !== today) { localStorage.setItem(RESET_KEY,today); localStorage.setItem(STORAGE_KEY,"0"); return 0; }
    return parseInt(localStorage.getItem(STORAGE_KEY)||"0");
  } catch { return 0; }
}
function incrementReads() {
  try { const n=getReadsToday()+1; localStorage.setItem(STORAGE_KEY,String(n)); return n; } catch { return 0; }
}
function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{"gauche":0,"centre":0,"droite":0,"total":0,"sources":{}}'); }
  catch { return {gauche:0,centre:0,droite:0,total:0,sources:{}}; }
}
function updateProfile(sourceIds) {
  try {
    const p=getProfile(); p.total+=1;
    (sourceIds||[]).forEach(id => {
      const s=getSource(id); const sc=s.orientationScore;
      if(sc<=1) p.gauche++; else if(sc<=3) p.centre++; else p.droite++;
      p.sources[id]=(p.sources[id]||0)+1;
    });
    localStorage.setItem(PROFILE_KEY,JSON.stringify(p));
  } catch {}
}
function getCategoryGradient(category) {
  return CAT_GRADIENTS[category] || CAT_GRADIENTS["default"];
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <span style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:"900",color:"white",letterSpacing:"-0.03em"}}>
      Média<span style={{color:"#e74c3c"}}>Vue</span>
    </span>
  );
}

// ── Source Chip ───────────────────────────────────────────────────────────────
function SrcChip({id, size=26}) {
  const s = getSource(id);
  return (
    <div title={s.name} style={{width:size,height:size,borderRadius:"5px",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(7,size*0.28),color:"white",fontFamily:"'IBM Plex Mono',monospace",fontWeight:"700",flexShrink:0}}>
      {s.logo}
    </div>
  );
}

// ── Animated Bias Bar ─────────────────────────────────────────────────────────
function BiasBar({cov, animate=false}) {
  const [visible, setVisible] = useState(!animate);
  const ref = useRef();
  useEffect(() => {
    if (!animate) return;
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setVisible(true); }, {threshold:0.3});
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animate]);

  const g=cov?.gauche||0, c=cov?.centre||0, d=cov?.droite||0, total=g+c+d;
  if (!total) return null;
  const gPct=Math.round((g/total)*100), cPct=Math.round((c/total)*100), dPct=Math.round((d/total)*100);
  return (
    <div ref={ref}>
      <div style={{display:"flex",height:"5px",borderRadius:"3px",overflow:"hidden",background:"#222",gap:"2px"}}>
        <div style={{width:visible?`${gPct}%`:"0%",background:"#e74c3c",transition:"width 0.8s ease",borderRadius:"3px"}} />
        <div style={{width:visible?`${cPct}%`:"0%",background:"#555",transition:"width 0.8s ease 0.1s",borderRadius:"3px"}} />
        <div style={{width:visible?`${dPct}%`:"0%",background:"#3d7ebf",transition:"width 0.8s ease 0.2s",borderRadius:"3px"}} />
      </div>
      <div style={{display:"flex",gap:"14px",marginTop:"6px"}}>
        {[["Gauche",g,"#e74c3c"],["Centre",c,"#888"],["Droite",d,"#3d7ebf"]].map(([label,val,color])=>(
          <span key={label} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:val>0?color:"#2a2a2a",display:"flex",alignItems:"center",gap:"4px"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:val>0?color:"#2a2a2a",display:"inline-block"}}/>
            {label} {val}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Score Pill ────────────────────────────────────────────────────────────────
function ScorePill({score}) {
  const {color,label} = score>=80?{color:"#1e8449",label:"Équilibré"}:score>=40?{color:"#b7770d",label:"Partiel"}:{color:"#c0392b",label:"Unilatéral"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:"4px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color,border:`1px solid ${color}44`,background:`${color}18`,padding:"2px 8px",borderRadius:"10px"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:color,display:"inline-block"}}/>{label}
    </span>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({gauche, centre, droite}) {
  const total = gauche+centre+droite;
  if (!total) return null;
  const size = 160, cx=80, cy=80, r=60, stroke=22;
  const circ = 2*Math.PI*r;
  const gPct=gauche/total, cPct=centre/total, dPct=droite/total;
  const segments = [
    {pct:gPct, color:"#e74c3c", offset:0},
    {pct:cPct, color:"#555", offset:gPct},
    {pct:dPct, color:"#3d7ebf", offset:gPct+cPct},
  ].filter(s=>s.pct>0);
  const dominant = gauche>=centre&&gauche>=droite?"G":droite>=centre&&droite>=gauche?"D":"C";
  const domColor = dominant==="G"?"#e74c3c":dominant==="D"?"#3d7ebf":"#888";
  const domLabel = dominant==="G"?"Gauche":dominant==="D"?"Droite":"Centre";
  const domPct = dominant==="G"?Math.round(gPct*100):dominant==="D"?Math.round(dPct*100):Math.round(cPct*100);
  return (
    <div style={{display:"flex",alignItems:"center",gap:"24px"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a1a" strokeWidth={stroke}/>
        {segments.map((seg,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${seg.pct*circ} ${circ}`}
            strokeDashoffset={-seg.offset*circ}
            style={{transition:"stroke-dasharray 1s ease"}}/>
        ))}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" style={{transform:"rotate(90deg)",transformOrigin:`${cx}px ${cy}px`}}>
          <tspan x={cx} dy="-8" style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:"900",fill:domColor}}>{domPct}%</tspan>
          <tspan x={cx} dy="20" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",fill:"#333"}}>{domLabel}</tspan>
        </text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {[["Gauche",Math.round(gPct*100),"#e74c3c"],[" Centre",Math.round(cPct*100),"#888"],["Droite",Math.round(dPct*100),"#3d7ebf"]].map(([label,pct,color])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{width:10,height:10,borderRadius:"50%",background:color,display:"inline-block",flexShrink:0}}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color:"#444",width:"50px"}}>{label}</span>
            <div style={{width:"80px",height:"4px",background:"#1a1a1a",borderRadius:"2px",overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"2px",transition:"width 1s ease"}}/>
            </div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color}}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Paywall Modal ─────────────────────────────────────────────────────────────
function PaywallModal({onClose, onPremium, session}) {
  const [showStudent, setShowStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentSubmitted, setStudentSubmitted] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  // Replace these with your actual Stripe Price IDs once created
  const PRICE_MONTHLY = "price_1TIetmCNh46FhHW7NnpwHfzE";
  const PRICE_ANNUAL  = "price_1TIeuNCNh46FhHW76z9lKZTY";
  const PRICE_STUDENT = "price_1TIevCCNh46FhHW7V8LAtkno";

  const handlePlan = async (priceId, planName) => {
    // If price IDs not set yet, just unlock locally
    if (priceId.includes("HERE")) { onPremium(); return; }
    setLoadingPlan(planName);
    const email = session?.user?.email || "";
    await openStripeCheckout(priceId, email);
    setLoadingPlan(null);
  };

  // Check if returning from successful Stripe checkout
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("premium=1")) {
      onPremium();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",backdropFilter:"blur(8px)"}}>
      <div style={{background:"#141414",maxWidth:"400px",width:"100%",borderRadius:"20px",border:"1px solid #1f1f1f",overflow:"hidden"}}>
        <div style={{padding:"28px 26px 22px",textAlign:"center",borderBottom:"1px solid #191919"}}>
          <Logo/>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.15em",color:"#333",marginTop:"18px",marginBottom:"8px",textTransform:"uppercase"}}>Limite quotidienne atteinte</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:"700",color:"#f0ede8",lineHeight:"1.3"}}>Vous avez lu vos {FREE_LIMIT} histoires gratuites aujourd'hui</h2>
        </div>
        <div style={{padding:"20px 26px"}}>
          {!showStudent ? (<>
            {[
              {label:"Mensuel", price:"4,99€", sub:"par mois", hi:false, priceId:PRICE_MONTHLY},
              {label:"Annuel",  price:"49€",   sub:"par an · économisez 18%", hi:true, priceId:PRICE_ANNUAL}
            ].map(({label,price,sub,hi,priceId})=>(
              <button key={label} onClick={()=>handlePlan(priceId,label)} disabled={loadingPlan===label}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"14px 16px",marginBottom:"8px",border:`1.5px solid ${hi?"#e74c3c":"#222"}`,background:hi?"#1c0808":"transparent",cursor:"pointer",borderRadius:"10px",opacity:loadingPlan===label?0.7:1}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:"700",color:"#f0ede8"}}>{loadingPlan===label?"Chargement...":label}</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:"700",color:hi?"#e74c3c":"#f0ede8"}}>{price}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#444"}}>{sub}</div>
                </div>
              </button>
            ))}
              <button onClick={()=>setShowStudent(true)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",marginBottom:"12px",border:"1px dashed #1e8449",background:"#0a1a0a",cursor:"pointer",borderRadius:"10px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <span style={{fontSize:"14px"}}>🎓</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:"14px",fontWeight:"700",color:"#f0ede8"}}>Tarif étudiant</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#1e8449"}}>Vérification par email universitaire</div>
                  </div>
                </div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:"700",color:"#1e8449"}}>1,99€<span style={{fontSize:"11px",color:"#555",fontWeight:"400"}}>/mois</span></div>
              </button>
            <button onClick={onClose} style={{width:"100%",padding:"10px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#2a2a2a"}}>Revenir demain</button>
            <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#222",textAlign:"center",marginTop:"10px",letterSpacing:"0.06em"}}>AUCUNE PUBLICITÉ · 100% INDÉPENDANT</p>
          </>) : studentSubmitted ? (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:"28px",marginBottom:"12px"}}>📧</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:"700",color:"#f0ede8",marginBottom:"8px"}}>Email vérifié !</div>
              <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#555",lineHeight:"1.5",marginBottom:"16px"}}>Profitez du tarif étudiant à 1,99€/mois.</p>
              <button onClick={()=>handlePlan(PRICE_STUDENT,"Étudiant")} style={{width:"100%",padding:"12px",background:"#1e8449",color:"white",border:"none",borderRadius:"8px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>
                {loadingPlan==="Étudiant"?"Chargement...":"Activer le tarif étudiant"}
              </button>
            </div>
          ) : (
            <div>
              <button onClick={()=>setShowStudent(false)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",marginBottom:"14px",padding:0}}>← Retour</button>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:"700",color:"#f0ede8",marginBottom:"6px"}}>Tarif étudiant — 1,99€/mois</div>
              <input type="email" value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} placeholder="prenom.nom@univ-paris.fr"
                style={{width:"100%",padding:"12px 14px",border:"1px solid #222",background:"#0f0f0f",fontFamily:"'Source Serif 4',serif",fontSize:"14px",color:"#f0ede8",borderRadius:"8px",outline:"none",marginBottom:"10px"}}/>
              <button onClick={()=>studentEmail.includes("@")&&setStudentSubmitted(true)} style={{width:"100%",padding:"12px",background:"#1e8449",color:"white",border:"none",borderRadius:"8px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",opacity:studentEmail.includes("@")?1:0.4}}>
                Vérifier mon statut étudiant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Get best available image from story articles
function getStoryImage(story) {
  return story?.articles?.find(a => a.imageUrl || a.image_url)?.imageUrl
    || story?.articles?.find(a => a.imageUrl || a.image_url)?.image_url
    || null;
}

// ── Source Name Pill ──────────────────────────────────────────────────────────
function SrcName({id, size="sm"}) {
  const s = getSource(id);
  const fs = size==="sm" ? "10px" : size==="md" ? "12px" : "14px";
  const py = size==="sm" ? "3px" : "5px";
  const px = size==="sm" ? "8px" : "12px";
  return (
    <div title={s.name} style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:`${py} ${px}`,background:s.color,borderRadius:"5px",flexShrink:0}}>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:fs,color:"white",fontWeight:"600",whiteSpace:"nowrap"}}>{s.name}</span>
    </div>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────
function StoryCard({story, onClick, locked, onLock}) {
  const cov = story.coverageByOrientation||story.coverage_by_orientation||{};
  const srcIds = story.sourceIds||story.source_ids||[];
  const articleImg = getStoryImage(story);
  const breaking = isBreaking(story);
  const catIcon = CAT_ICONS[story.category]||CAT_ICONS["default"];
  const gradient = getCategoryGradient(story.category);

  return (
    <div onClick={locked?onLock:()=>onClick(story)}
      style={{background:"#161616",borderRadius:"16px",overflow:"hidden",cursor:"pointer",marginBottom:"12px",border:"1px solid #1e1e1e",transition:"border-color 0.2s,transform 0.15s,box-shadow 0.2s",position:"relative",boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="#333";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.4)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e1e1e";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.3)";}}>

      {locked && (
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,#0f0f0f 75%)",zIndex:2,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:"18px",borderRadius:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px",background:"#e74c3c",color:"white",padding:"8px 18px",borderRadius:"20px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"0.1em"}}>🔒 Passer à Premium</div>
        </div>
      )}

      {/* Hero image — article image or gradient fallback */}
      <div style={{height:"190px",overflow:"hidden",position:"relative",flexShrink:0,background:gradient}}>
        {articleImg && (
          <img src={articleImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}
            onError={e=>{e.target.style.display="none";}}/>
        )}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(22,22,22,0.95) 100%)"}}/>
        {/* Category badge over image */}
        <div style={{position:"absolute",top:"12px",left:"12px",display:"flex",alignItems:"center",gap:"6px",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",padding:"5px 10px",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.08)"}}>
          <span style={{fontSize:"12px"}}>{catIcon}</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"rgba(255,255,255,0.7)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{story.category||"Actualité"}</span>
        </div>
        {breaking && (
          <div style={{position:"absolute",top:"12px",right:"12px",display:"flex",alignItems:"center",gap:"5px",background:"#e74c3c",padding:"4px 10px",borderRadius:"4px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"white",letterSpacing:"0.1em"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"white",display:"inline-block"}}/>BREAKING
          </div>
        )}
        <div style={{position:"absolute",bottom:"12px",right:"12px"}}>
          <ScorePill score={getScore(cov)}/>
        </div>
      </div>

      <div style={{padding:"14px 15px 15px"}}>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:"700",color:"#f0ede8",lineHeight:"1.35",margin:"0 0 8px"}}>{story.title}</h3>

        {story.summary && (
          <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#505050",lineHeight:"1.55",margin:"0 0 12px"}}>
            {story.summary.slice(0,110)}{story.summary.length>110?"…":""}
          </p>
        )}

        <BiasBar cov={cov} animate={true}/>

        {story.blindspot && (
          <div style={{marginTop:"10px",padding:"8px 11px",background:"#1a1200",border:"1px solid #2e2000",borderRadius:"7px",display:"flex",alignItems:"center",gap:"7px"}}>
            <span style={{fontSize:"11px"}}>⚠️</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#c8960c",letterSpacing:"0.05em"}}>
              ANGLE MORT · {story.blindspot.sides?.join(" & ")||story.blindspot.label}
            </span>
          </div>
        )}

        {srcIds.length>0 && (
          <div style={{display:"flex",gap:"5px",marginTop:"11px",flexWrap:"wrap",alignItems:"center"}}>
            {srcIds.slice(0,4).map(id=><SrcName key={id} id={id} size="sm"/>)}
            {srcIds.length>4 && <div style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",background:"#1f1f1f",borderRadius:"5px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#333"}}>+{srcIds.length-4}</div>}
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#2a2a2a",marginLeft:"auto"}}>{story.coverageCount||story.coverage_count||srcIds.length} sources</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Story Modal ───────────────────────────────────────────────────────────────
function StoryModal({story, onClose}) {
  if (!story) return null;
  const articles = story.articles||[];
  const cov = story.coverageByOrientation||story.coverage_by_orientation||{};
  const articleImg = getStoryImage(story);
  const gradient = getCategoryGradient(story.category);
  const catIcon = CAT_ICONS[story.category]||CAT_ICONS["default"];

  const gauche = articles.filter(a=>(getSource(a.sourceId||a.source_id)?.orientationScore??3)<=1);
  const centre = articles.filter(a=>{const s=getSource(a.sourceId||a.source_id)?.orientationScore??3;return s>1&&s<4;});
  const droite = articles.filter(a=>(getSource(a.sourceId||a.source_id)?.orientationScore??3)>=4);
  const buckets = [{key:"Gauche",color:"#e74c3c",bg:"#1c0808",items:gauche},{key:"Centre",color:"#888",bg:"#111",items:centre},{key:"Droite",color:"#3d7ebf",bg:"#080f1c",items:droite}].filter(b=>b.items.length>0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#141414",maxWidth:"660px",width:"100%",borderRadius:"18px",border:"1px solid #1f1f1f",marginBottom:"20px",overflow:"hidden"}}>

        {/* Full bleed hero image */}
        <div style={{height:"220px",position:"relative",overflow:"hidden",background:gradient}}>
          {articleImg && (
            <img src={articleImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}
              onError={e=>{e.target.style.display="none";}}/>
          )}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.2) 0%,#141414 100%)"}}/>
          <button onClick={onClose} style={{position:"absolute",top:"14px",right:"14px",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.1)",color:"white",width:"32px",height:"32px",borderRadius:"50%",cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{position:"absolute",bottom:"14px",left:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"14px"}}>{catIcon}</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"rgba(255,255,255,0.6)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{story.category}</span>
            <ScorePill score={getScore(cov)}/>
          </div>
        </div>

        <div style={{padding:"20px 20px 16px"}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:"700",color:"#f0ede8",lineHeight:"1.3",marginBottom:"10px"}}>{story.title}</h2>
          {story.summary && <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"14px",color:"#555",lineHeight:"1.6",marginBottom:"16px"}}>{story.summary}</p>}
          <BiasBar cov={cov}/>
        </div>

        {story.blindspot && (
          <div style={{margin:"0 20px 14px",padding:"11px 14px",background:"#1a1200",border:"1px solid #2e2000",borderRadius:"10px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#c8960c",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>⚠ Angle mort</div>
            <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#9a7020",margin:0}}>{story.blindspot.label}</p>
          </div>
        )}

        {buckets.length>0 && (
          <div style={{padding:"0 20px 16px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",color:"#333",marginBottom:"12px"}}>Vue côte à côte</div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${buckets.length},1fr)`,gap:"8px"}}>
              {buckets.map(({key,color,bg,items})=>(
                <div key={key} style={{background:bg,borderRadius:"10px",padding:"12px",border:`1px solid ${color}20`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"10px",paddingBottom:"8px",borderBottom:`1px solid ${color}25`}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:color,display:"inline-block"}}/>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color,letterSpacing:"0.1em",textTransform:"uppercase"}}>{key}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#222",marginLeft:"auto"}}>{items.length}</span>
                  </div>
                  {items.slice(0,3).map((a,i)=>{
                    const src=getSource(a.sourceId||a.source_id);
                    return (
                      <div key={i} style={{marginBottom:i<Math.min(items.length,3)-1?"10px":0}}>
                        <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"}}>
                          <SrcChip id={a.sourceId||a.source_id} size={16}/>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#444"}}>{src.name}</span>
                        </div>
                        <a href={a.url} target="_blank" rel="noopener noreferrer"
                          style={{fontFamily:"'Source Serif 4',serif",fontSize:"12px",color:"#b0a898",textDecoration:"none",lineHeight:"1.4",display:"block"}}
                          onMouseEnter={e=>e.target.style.color=color}
                          onMouseLeave={e=>e.target.style.color="#b0a898"}>
                          {a.title}
                        </a>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {articles.length>0 && (
          <div style={{padding:"0 20px 20px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",color:"#333",marginBottom:"12px"}}>Tous les articles · {articles.length}</div>
            {articles.map((a,i)=>{
              const src=getSource(a.sourceId||a.source_id);
              return (
                <div key={i} style={{display:"flex",gap:"11px",alignItems:"flex-start",paddingBottom:"11px",borderBottom:i<articles.length-1?"1px solid #191919":"none",marginBottom:"11px"}}>
                  <SrcName id={a.sourceId||a.source_id} size="md"/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"4px"}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:ORI_COLOR[src.orientation]||"#444"}}>● {src.orientation}</span>
                    </div>
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#b0a898",textDecoration:"none",lineHeight:"1.4",display:"block"}}
                      onMouseEnter={e=>e.target.style.color="#4a90d9"}
                      onMouseLeave={e=>e.target.style.color="#b0a898"}>
                      {a.title}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Briefing Story Item ───────────────────────────────────────────────────────
function BriefingStoryItem({story, onClick, index, total}) {
  const articleImg = getStoryImage(story);
  const gradient = getCategoryGradient(story.category);
  const cov = story.coverageByOrientation||story.coverage_by_orientation||{};
  const catIcon = CAT_ICONS[story.category]||"📰";
  return (
    <div onClick={()=>onClick(story)} style={{display:"flex",gap:"11px",alignItems:"center",paddingBottom:"10px",borderBottom:index<total-1?"1px solid #1a1a1a":"none",marginBottom:"10px",cursor:"pointer"}}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      <div style={{width:"56px",height:"56px",borderRadius:"8px",overflow:"hidden",flexShrink:0,position:"relative",background:gradient}}>
        {articleImg && <img src={articleImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>}
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.2)"}}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"4px"}}>
          <span style={{fontSize:"10px"}}>{catIcon}</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#333",textTransform:"uppercase",letterSpacing:"0.08em"}}>{story.category||"Actualité"}</span>
          <ScorePill score={getScore(cov)}/>
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"13px",fontWeight:"700",color:"#d0cdc8",lineHeight:"1.3",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{story.title}</div>
      </div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color:"#222",flexShrink:0}}>→</div>
    </div>
  );
}
function DailyBriefing({stories, onStoryClick, isPremium, onPremium}) {
  const today = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const topStories = stories.slice(0,3);
  const biggestBlindspot = stories.find(s=>s.blindspot);

  return (
    <div style={{marginBottom:"18px",background:"#111",border:"1px solid #1f1f1f",borderRadius:"16px",overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"14px 16px 12px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px"}}>
            <span style={{fontSize:"14px"}}>☀️</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#e74c3c",letterSpacing:"0.12em",textTransform:"uppercase"}}>Briefing du jour</span>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#2a2a2a",textTransform:"capitalize"}}>{today}</div>
        </div>
        {!isPremium && (
          <button onClick={onPremium} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",letterSpacing:"0.08em",background:"#e74c3c",color:"white",border:"none",padding:"4px 10px",borderRadius:"4px",cursor:"pointer"}}>Premium</button>
        )}
      </div>

      {/* Top stories */}
      <div style={{padding:"12px 16px"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#2a2a2a",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"10px"}}>À la une aujourd'hui</div>
        {topStories.map((s,i)=>(
          <BriefingStoryItem key={s.id||i} story={s} onClick={onStoryClick} index={i} total={topStories.length}/>
        ))}
      </div>

      {/* Angle mort of the day */}
      {biggestBlindspot && (
        <div style={{margin:"0 12px 12px",padding:"10px 12px",background:"#1a1200",border:"1px solid #2e2000",borderRadius:"10px"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#c8960c",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"5px"}}>⚠ Angle mort du jour</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"13px",color:"#c8960c",lineHeight:"1.35",marginBottom:"4px",cursor:"pointer"}} onClick={()=>onStoryClick(biggestBlindspot)}>
            {biggestBlindspot.title?.slice(0,80)}{biggestBlindspot.title?.length>80?"…":""}
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#664a00"}}>
            Peu couvert par : {biggestBlindspot.blindspot?.sides?.join(" & ")||"certains médias"}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Angle Mort Tab ────────────────────────────────────────────────────────────
function AngleMortTab({isPremium, onPremium}) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(()=>{
    fetch(`${API_URL}/api/stories?limit=100`)
      .then(r=>r.json())
      .then(d=>{setStories((d.stories||[]).filter(s=>s.blindspot));setLoading(false);})
      .catch(()=>setLoading(false));
  },[]);

  const filtered = filter==="all"?stories:stories.filter(s=>s.blindspot?.sides?.includes(filter));
  const counts = stories.reduce((acc,s)=>{(s.blindspot?.sides||[]).forEach(side=>{acc[side]=(acc[side]||0)+1;});return acc;},{});

  const handleClick = async (story) => {
    if (!isPremium){onPremium();return;}
    setSelected(story);
    if (!story.articles&&story.id){try{setSelected(await (await fetch(`${API_URL}/api/stories/${story.id}`)).json());}catch{}}
  };

  return (
    <div style={{paddingBottom:"80px"}}>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:"700",color:"#f0ede8",marginBottom:"4px"}}>Angles morts</h2>
      <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#444",lineHeight:"1.5",marginBottom:"16px"}}>Ce qu'un camp politique choisit de ne pas couvrir.</p>
      {!loading&&stories.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
          {[["gauche","#e74c3c","Ignoré par la gauche"],["centre","#888","Ignoré par le centre"],["droite","#3d7ebf","Ignoré par la droite"]].map(([side,color,label])=>(
            <div key={side} style={{background:"#161616",border:`1px solid ${color}22`,borderRadius:"10px",padding:"12px",textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:"700",color,marginBottom:"4px"}}>{counts[side]||0}</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#333",letterSpacing:"0.06em",lineHeight:"1.3"}}>{label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
        {[["all","Tous","#888"],["gauche","Gauche","#e74c3c"],["centre","Centre","#888"],["droite","Droite","#3d7ebf"]].map(([val,label,color])=>(
          <button key={val} onClick={()=>setFilter(val)} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",padding:"5px 12px",border:`1px solid ${filter===val?color:"#1f1f1f"}`,background:filter===val?`${color}18`:"#161616",color:filter===val?color:"#3a3a3a",cursor:"pointer",borderRadius:"20px",transition:"all 0.15s"}}>
            {label}
          </button>
        ))}
      </div>
      {!isPremium&&(
        <div style={{padding:"14px 16px",background:"#1c0808",border:"1px solid #3d1010",borderRadius:"12px",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#e74c3c",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>Fonctionnalité Premium</div>
            <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#666",margin:0}}>Accédez aux angles morts et à l'analyse complète.</p>
          </div>
          <button onClick={onPremium} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.08em",background:"#e74c3c",color:"white",border:"none",padding:"8px 14px",borderRadius:"6px",cursor:"pointer",whiteSpace:"nowrap"}}>Débloquer</button>
        </div>
      )}
      {loading&&<div style={{width:"22px",height:"22px",border:"2px solid #1f1f1f",borderTopColor:"#e74c3c",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"40px auto"}}/>}
      {!loading&&filtered.length===0&&(
        <div style={{textAlign:"center",padding:"40px 20px",background:"#161616",borderRadius:"12px",border:"1px solid #1f1f1f"}}>
          <div style={{fontSize:"24px",marginBottom:"8px"}}>✅</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",color:"#444"}}>Aucun angle mort détecté</div>
        </div>
      )}
      {!loading&&filtered.map((s,i)=>(
        <div key={s.id||i} style={{animation:`fadeUp 0.3s ease ${i*0.04}s both`}}>
          <StoryCard story={s} onClick={handleClick} locked={false} onLock={()=>{}}/>
        </div>
      ))}
      {selected&&<StoryModal story={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfilTab({isPremium, onPremium}) {
  const [profile] = useState(getProfile());
  const total = profile.gauche+profile.centre+profile.droite;
  const gPct = total>0?Math.round((profile.gauche/total)*100):0;
  const cPct = total>0?Math.round((profile.centre/total)*100):0;
  const dPct = total>0?Math.round((profile.droite/total)*100):0;
  const reads = getReadsToday();

  const dominant = total===0?null
    :gPct>60?{label:"Vous lisez majoritairement à gauche",color:"#e74c3c",missing:"droite et centre"}
    :dPct>60?{label:"Vous lisez majoritairement à droite",color:"#3d7ebf",missing:"gauche et centre"}
    :cPct>60?{label:"Vous lisez majoritairement le centre",color:"#888",missing:"gauche et droite"}
    :{label:"Votre lecture est équilibrée 🎉",color:"#1e8449",missing:null};

  const topSources = Object.entries(profile.sources).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return (
    <div style={{paddingBottom:"80px"}}>
      <div style={{background:"#161616",border:"1px solid #1f1f1f",borderRadius:"14px",padding:"22px",marginBottom:"12px",textAlign:"center"}}>
        <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"#1f1f1f",border:"1px solid #252525",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:"20px"}}>👤</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:"700",color:"#f0ede8",marginBottom:"3px"}}>Mon Profil Médiatique</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:isPremium?"#1e8449":"#333",letterSpacing:"0.1em"}}>{isPremium?"● COMPTE PREMIUM":"Compte gratuit"}</div>
      </div>

      {total===0?(
        <div style={{background:"#161616",border:"1px solid #1f1f1f",borderRadius:"12px",padding:"28px",marginBottom:"12px",textAlign:"center"}}>
          <div style={{fontSize:"28px",marginBottom:"10px"}}>📊</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",color:"#444",marginBottom:"6px"}}>Pas encore de données</div>
          <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#2a2a2a",lineHeight:"1.5"}}>Lisez quelques histoires pour voir votre profil apparaître ici.</p>
        </div>
      ):(
        <div style={{background:"#161616",border:"1px solid #1f1f1f",borderRadius:"12px",padding:"20px",marginBottom:"12px"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#333",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"20px"}}>Votre spectre de lecture</div>
          <DonutChart gauche={profile.gauche} centre={profile.centre} droite={profile.droite}/>
          {dominant&&(
            <div style={{marginTop:"18px",padding:"12px 14px",background:`${dominant.color}12`,border:`1px solid ${dominant.color}30`,borderRadius:"8px"}}>
              <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"14px",color:dominant.color,fontWeight:"600"}}>{dominant.label}</div>
            </div>
          )}
          {dominant?.missing&&isPremium&&(
            <div style={{marginTop:"10px",padding:"12px 14px",background:"#1a1200",border:"1px solid #2e2000",borderRadius:"8px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#c8960c",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>⚠ Votre angle mort personnel</div>
              <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#9a7020",margin:0}}>Vous lisez peu de sources {dominant.missing}. Explorez les médias dans l'onglet Sources.</p>
            </div>
          )}
        </div>
      )}

      {topSources.length>0&&(
        <div style={{background:"#161616",border:"1px solid #1f1f1f",borderRadius:"12px",overflow:"hidden",marginBottom:"12px"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #191919"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#333",letterSpacing:"0.12em",textTransform:"uppercase"}}>Vos sources favorites</div>
          </div>
          {topSources.map(([id,count],i)=>{
            const src=getSource(id);
            return (
              <div key={id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",borderBottom:i<topSources.length-1?"1px solid #191919":"none"}}>
                <SrcChip id={id} size={28}/>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#888"}}>{src.name}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:ORI_COLOR[src.orientation]||"#444"}}>● {src.orientation}</div>
                </div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#2a2a2a"}}>{count} lue{count>1?"s":""}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"12px"}}>
        <div style={{background:"#161616",border:"1px solid #1f1f1f",borderRadius:"10px",padding:"16px",textAlign:"center"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:"700",color:"#e74c3c",marginBottom:"3px"}}>{reads}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#333",letterSpacing:"0.06em"}}>AUJOURD'HUI</div>
        </div>
        <div style={{background:"#161616",border:"1px solid #1f1f1f",borderRadius:"10px",padding:"16px",textAlign:"center"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:"700",color:"#f0ede8",marginBottom:"3px"}}>{profile.total}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#333",letterSpacing:"0.06em"}}>AU TOTAL</div>
        </div>
      </div>

      {!isPremium&&(
        <div style={{background:"#1c0808",border:"1px solid #3d1010",borderRadius:"12px",padding:"16px",textAlign:"center",marginBottom:"12px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:"700",color:"#f0ede8",marginBottom:"5px"}}>Débloquez votre profil complet</div>
          <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#555",lineHeight:"1.5",marginBottom:"12px"}}>Angle mort personnel, historique complet, recommandations.</p>
          <button onClick={onPremium} style={{width:"100%",padding:"12px",background:"#e74c3c",color:"white",border:"none",borderRadius:"8px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer"}}>Passer à Premium</button>
        </div>
      )}

      <div style={{background:"#0a1a0a",border:"1px dashed #1e8449",borderRadius:"12px",padding:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
          <span style={{fontSize:"16px"}}>🏛️</span>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#1e8449",letterSpacing:"0.1em",textTransform:"uppercase"}}>Bientôt · Tracker Politique</div>
        </div>
        <p style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#2a4a2a",lineHeight:"1.5",margin:"0 0 6px"}}>Tweets des politiciens en temps réel. Disponible pour les Sénatoriales 2026.</p>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#1a3a1a"}}>Macron · Le Pen · Mélenchon · Bardella · +50</div>
      </div>
    </div>
  );
}

// ── Sources Tab ───────────────────────────────────────────────────────────────
function SourcesTab() {
  const [filter, setFilter] = useState("all");
  const filtered = filter==="all"?SOURCES:SOURCES.filter(s=>filter==="gauche"?s.orientationScore<=1:filter==="centre"?s.orientationScore>1&&s.orientationScore<4:s.orientationScore>=4);
  return (
    <div style={{paddingBottom:"80px"}}>
      <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
        {["all","gauche","centre","droite"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",padding:"5px 12px",border:"1px solid",borderColor:filter===f?"#e74c3c":"#1f1f1f",background:filter===f?"#1c0808":"#161616",color:filter===f?"#e74c3c":"#3a3a3a",cursor:"pointer",borderRadius:"20px"}}>
            {f==="all"?"Tous":f}
          </button>
        ))}
      </div>
      {filtered.map(src=>(
        <div key={src.id} style={{background:"#161616",border:"1px solid #1f1f1f",borderRadius:"12px",padding:"13px 15px",marginBottom:"7px",display:"flex",gap:"12px"}}>
          <SrcChip id={src.id} size={42}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"5px",flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:"700",color:"#f0ede8"}}>{src.name}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:ORI_COLOR[src.orientation]||"#555"}}>● {src.orientation}</span>
            </div>
            <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#2a2a2a",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px"}}>Fiabilité</div>
                <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"12px",color:src.factuality==="Élevée"?"#1e8449":src.factuality==="Mixte"?"#b7770d":"#c0392b"}}>{src.factuality}</div>
              </div>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#2a2a2a",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px"}}>Propriétaire</div>
                <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"12px",color:"#555"}}>{src.owner}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feed Tab ──────────────────────────────────────────────────────────────────
function FeedTab({isPremium, onPremium}) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [reads, setReads] = useState(getReadsToday);

  useEffect(()=>{
    setLoading(true);
    const cat=category!=="Tout"?`&category=${encodeURIComponent(category)}`:"";
    fetch(`${API_URL}/api/stories?limit=50${cat}`)
      .then(r=>r.json())
      .then(d=>{setStories(d.stories||[]);setLoading(false);})
      .catch(()=>{setError("Impossible de charger. Réessayez.");setLoading(false);});
  },[category]);

  const filtered = stories.filter(s=>!search.trim()||s.title.toLowerCase().includes(search.toLowerCase())||(s.summary||"").toLowerCase().includes(search.toLowerCase()));
  const breaking = filtered.filter(isBreaking);
  const regular = filtered.filter(s=>!isBreaking(s));
  const readsLeft = Math.max(0,FREE_LIMIT-reads);

  const handleClick = async(story)=>{
    if (!isPremium&&reads>=FREE_LIMIT){setShowPaywall(true);return;}
    setSelected(story);
    updateProfile(story.sourceIds||story.source_ids||[]);
    setReads(incrementReads());
    if (!story.articles&&story.id){try{setSelected(await (await fetch(`${API_URL}/api/stories/${story.id}`)).json());}catch{}}
  };

  return (
    <div style={{paddingBottom:"80px"}}>
      {/* Search */}
      <div style={{position:"relative",marginBottom:"11px"}}>
        <span style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"#2a2a2a",fontSize:"14px"}}>🔍</span>
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une histoire…"
          style={{width:"100%",padding:"11px 12px 11px 36px",border:"1px solid #1f1f1f",background:"#161616",fontFamily:"'Source Serif 4',serif",fontSize:"14px",color:"#f0ede8",borderRadius:"10px",outline:"none"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:"11px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#333",fontSize:"18px"}}>×</button>}
      </div>

      {/* Category pills with icons */}
      <div style={{display:"flex",gap:"6px",overflowX:"auto",marginBottom:"12px",paddingBottom:"2px"}}>
        {CATEGORIES.map(cat=>(
          <button key={cat} onClick={()=>setCategory(cat)} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.05em",padding:"5px 10px",border:"1px solid",borderColor:category===cat?"#e74c3c":"#1f1f1f",background:category===cat?"#1c0808":"#161616",color:category===cat?"#e74c3c":"#3a3a3a",cursor:"pointer",borderRadius:"20px",whiteSpace:"nowrap",transition:"all 0.15s",display:"flex",alignItems:"center",gap:"4px"}}>
            <span style={{fontSize:"10px"}}>{CAT_ICONS[cat]||"📰"}</span>{cat}
          </button>
        ))}
      </div>

      {/* Read counter */}
      {!isPremium&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#161616",borderRadius:"8px",marginBottom:"12px",border:"1px solid #1f1f1f"}}>
          <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
            {Array.from({length:FREE_LIMIT}).map((_,i)=>(
              <div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:i<reads?"#e74c3c":"#222",transition:"background 0.3s"}}/>
            ))}
          </div>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:readsLeft>0?"#3a3a3a":"#e74c3c",letterSpacing:"0.04em"}}>
            {readsLeft>0?`${readsLeft} gratuite${readsLeft>1?"s":""} restante${readsLeft>1?"s":""}`:"Limite atteinte"}
          </span>
          <button onClick={onPremium} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.08em",background:"#e74c3c",color:"white",border:"none",padding:"4px 10px",borderRadius:"4px",cursor:"pointer"}}>Premium</button>
        </div>
      )}

      {loading&&<div style={{width:"22px",height:"22px",border:"2px solid #1f1f1f",borderTopColor:"#e74c3c",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"60px auto"}}/>}
      {error&&<div style={{padding:"14px",background:"#1c0808",border:"1px solid #3d1010",borderRadius:"10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color:"#e74c3c"}}>{error}</div>}

      {/* Daily briefing */}
      {!loading&&stories.length>0&&category==="Tout"&&!search&&(
        <DailyBriefing stories={filtered} onStoryClick={handleClick} isPremium={isPremium} onPremium={onPremium}/>
      )}

      {/* Breaking */}
      {!loading&&breaking.length>0&&(
        <div style={{marginBottom:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"10px"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#e74c3c",display:"inline-block"}}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color:"#e74c3c"}}>Breaking News</span>
          </div>
          {breaking.map((s,i)=><StoryCard key={s.id||i} story={s} onClick={handleClick} locked={!isPremium&&reads>=FREE_LIMIT} onLock={()=>setShowPaywall(true)}/>)}
          <div style={{height:"1px",background:"#191919",margin:"14px 0"}}/>
        </div>
      )}

      {!loading&&!error&&regular.map((s,i)=>(
        <div key={s.id||i} style={{animation:`fadeUp 0.3s ease ${Math.min(i,8)*0.035}s both`}}>
          <StoryCard story={s} onClick={handleClick} locked={!isPremium&&reads+i>=FREE_LIMIT} onLock={()=>setShowPaywall(true)}/>
        </div>
      ))}

      {!loading&&filtered.length===0&&search&&(
        <div style={{textAlign:"center",padding:"50px 20px",fontFamily:"'Source Serif 4',serif",fontSize:"15px",color:"#2a2a2a"}}>Aucun résultat pour «{search}»</div>
      )}

      {selected&&<StoryModal story={selected} onClose={()=>setSelected(null)}/>}
      {showPaywall&&<PaywallModal onClose={()=>setShowPaywall(false)} onPremium={()=>{onPremium();setShowPaywall(false);}}/>}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({onAuth, dark}) {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const bg = dark ? "#0f0f0f" : "#f8f6f1";
  const card = dark ? "#161616" : "#ffffff";
  const border = dark ? "#1f1f1f" : "#e8e4dc";
  const text = dark ? "#f0ede8" : "#1a1a1a";
  const muted = dark ? "#444" : "#888";
  const inputBg = dark ? "#0f0f0f" : "#f0ede8";

  const handleSubmit = async () => {
    if (!email || (!password && mode !== "forgot")) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const res = await signIn(email, password);
        if (res.access_token) { storeSession(res); onAuth(res); }
        else setError(res.msg || res.error_description || "Email ou mot de passe incorrect");
      } else if (mode === "signup") {
        const res = await signUp(email, password);
        if (res.id || res.user?.id) setSuccess("Compte créé ! Vérifiez votre email pour confirmer.");
        else setError(res.msg || res.error_description || "Erreur lors de l'inscription");
      } else {
        setSuccess("Si ce compte existe, vous recevrez un email de réinitialisation.");
      }
    } catch { setError("Erreur de connexion. Réessayez."); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{marginBottom:"36px",textAlign:"center"}}>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:"32px",fontWeight:"900",color:text,letterSpacing:"-0.03em"}}>
          Média<span style={{color:"#e74c3c"}}>Vue</span>
        </span>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:muted,letterSpacing:"0.1em",marginTop:"6px"}}>L'INFO VUE DE TOUS LES ANGLES</div>
      </div>

      <div style={{background:card,border:`1px solid ${border}`,borderRadius:"18px",padding:"28px 26px",maxWidth:"380px",width:"100%"}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:"700",color:text,marginBottom:"6px"}}>
          {mode==="login"?"Connexion":mode==="signup"?"Créer un compte":"Mot de passe oublié"}
        </h2>
        <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:muted,marginBottom:"22px"}}>
          {mode==="login"?"Bon retour sur MédiaVue":mode==="signup"?"Rejoignez la communauté":"Entrez votre email pour réinitialiser"}
        </p>

        {/* Google OAuth */}
        {mode !== "forgot" && (
          <button onClick={signInWithGoogle} style={{width:"100%",padding:"12px",background:dark?"#1f1f1f":"#f0ede8",border:`1px solid ${border}`,borderRadius:"10px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",marginBottom:"16px"}}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color:text,letterSpacing:"0.06em"}}>Continuer avec Google</span>
          </button>
        )}

        {mode !== "forgot" && (
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
            <div style={{flex:1,height:"1px",background:border}}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:muted}}>ou</span>
            <div style={{flex:1,height:"1px",background:border}}/>
          </div>
        )}

        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.fr"
          style={{width:"100%",padding:"12px 14px",border:`1px solid ${border}`,background:inputBg,fontFamily:"'Source Serif 4',serif",fontSize:"14px",color:text,borderRadius:"8px",outline:"none",marginBottom:"10px"}}/>

        {mode !== "forgot" && (
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe"
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            style={{width:"100%",padding:"12px 14px",border:`1px solid ${border}`,background:inputBg,fontFamily:"'Source Serif 4',serif",fontSize:"14px",color:text,borderRadius:"8px",outline:"none",marginBottom:"16px"}}/>
        )}

        {error && <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#e74c3c",marginBottom:"12px",padding:"8px 12px",background:"#1c0808",borderRadius:"6px"}}>{error}</div>}
        {success && <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#1e8449",marginBottom:"12px",padding:"8px 12px",background:"#0a1a0a",borderRadius:"6px"}}>{success}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"13px",background:"#e74c3c",color:"white",border:"none",borderRadius:"10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",opacity:loading?0.7:1,marginBottom:"14px"}}>
          {loading?"Chargement...":mode==="login"?"Se connecter":mode==="signup"?"Créer mon compte":"Envoyer le lien"}
        </button>

        <div style={{textAlign:"center"}}>
          {mode==="login" && <>
            <button onClick={()=>{setMode("forgot");setError("");setSuccess("");}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:muted,display:"block",width:"100%",marginBottom:"8px"}}>Mot de passe oublié ?</button>
            <button onClick={()=>{setMode("signup");setError("");setSuccess("");}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#e74c3c"}}>Créer un compte →</button>
          </>}
          {mode==="signup" && <button onClick={()=>{setMode("login");setError("");setSuccess("");}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:muted}}>Déjà un compte ? Se connecter</button>}
          {mode==="forgot" && <button onClick={()=>{setMode("login");setError("");setSuccess("");}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:muted}}>← Retour à la connexion</button>}
        </div>
      </div>

      <button onClick={()=>onAuth(null)} style={{marginTop:"16px",background:"none",border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:muted,letterSpacing:"0.06em"}}>
        Continuer sans compte →
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function MédiaVueApp() {
  const [tab, setTab] = useState("news");
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [dark, setDark] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Load theme + session on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme !== null) setDark(savedTheme === "dark");

    // Check if returning from Google OAuth (session in URL hash)
    const urlSession = parseSessionFromUrl();
    if (urlSession?.access_token) {
      getUser(urlSession.access_token).then(user => {
        const fullSession = { ...urlSession, user };
        storeSession(fullSession);
        setSession(fullSession);
        setShowAuth(false);
        setAuthChecked(true);
      });
      return;
    }

    // Check stored session
    const stored = getStoredSession();
    if (stored?.access_token) {
      setSession(stored);
      setShowAuth(false);
    } else {
      setShowAuth(true);
    }
    setAuthChecked(true);
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.style.background = dark ? "#0f0f0f" : "#f8f6f1";
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const handleAuth = (sess) => {
    if (sess) { setSession(sess); storeSession(sess); }
    setShowAuth(false);
  };

  const handleSignOut = async () => {
    if (session?.access_token) await signOut(session.access_token);
    clearSession(); setSession(null); setShowAuth(true);
  };

  const handlePremium = () => {
    // Stripe checkout — wire in when Stripe key is ready
    setIsPremium(true); setShowPaywall(false);
  };

  // Theme-aware colors
  const bg = dark ? "#0f0f0f" : "#f8f6f1";
  const headerBg = dark ? "#0f0f0f" : "#f8f6f1";
  const headerBorder = dark ? "#161616" : "#e8e4dc";
  const navBg = dark ? "#0a0a0a" : "#ffffff";
  const navBorder = dark ? "#161616" : "#e8e4dc";
  const textPrimary = dark ? "#f0ede8" : "#1a1a1a";
  const textMuted = dark ? "#2a2a2a" : "#aaa";

  const navItems = [
    {id:"news",icon:"📰",label:"Actualités"},
    {id:"blindspot",icon:"⚠️",label:"Angles morts"},
    {id:"sources",icon:"📋",label:"Sources"},
    {id:"profile",icon:"👤",label:"Mon Profil"},
  ];

  if (!authChecked) return null;
  if (showAuth) return <AuthScreen onAuth={handleAuth} dark={dark}/>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:${dark?"#2a2a2a":"#bbb"};}
        ::-webkit-scrollbar{width:3px;height:0;}
        ::-webkit-scrollbar-thumb{background:${dark?"#1f1f1f":"#ddd"};}
      `}</style>
      <div style={{minHeight:"100vh",background:bg,maxWidth:"480px",margin:"0 auto"}}>
        <header style={{background:headerBg,borderBottom:`1px solid ${headerBorder}`,padding:"13px 15px 10px",position:"sticky",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:"900",color:textPrimary,letterSpacing:"-0.03em"}}>
              Média<span style={{color:"#e74c3c"}}>Vue</span>
            </span>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              {/* Dark/Light toggle */}
              <button onClick={()=>setDark(!dark)} style={{background:"none",border:`1px solid ${dark?"#222":"#ddd"}`,borderRadius:"20px",padding:"3px 10px",cursor:"pointer",fontSize:"13px",display:"flex",alignItems:"center",gap:"4px"}}>
                <span>{dark?"☀️":"🌙"}</span>
              </button>

              {/* Auth button */}
              {session
                ? <button onClick={handleSignOut} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.06em",background:"none",color:dark?"#333":"#aaa",border:`1px solid ${dark?"#222":"#ddd"}`,padding:"4px 10px",borderRadius:"4px",cursor:"pointer"}}>Déconnexion</button>
                : <button onClick={()=>setShowAuth(true)} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.06em",background:"none",color:dark?"#555":"#888",border:`1px solid ${dark?"#222":"#ddd"}`,padding:"4px 10px",borderRadius:"4px",cursor:"pointer"}}>Connexion</button>
              }

              {isPremium
                ?<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#1e8449",border:"1px solid #1e8449",padding:"2px 8px",borderRadius:"10px"}}>PREMIUM</span>
                :<button onClick={()=>setShowPaywall(true)} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.08em",background:"#e74c3c",color:"white",border:"none",padding:"4px 10px",borderRadius:"4px",cursor:"pointer"}}>Premium</button>
              }
            </div>
          </div>
        </header>

        <div style={{padding:"13px 13px 0"}}>
          {tab==="news"&&<FeedTab isPremium={isPremium} onPremium={()=>setShowPaywall(true)} dark={dark}/>}
          {tab==="blindspot"&&<AngleMortTab isPremium={isPremium} onPremium={()=>setShowPaywall(true)} dark={dark}/>}
          {tab==="sources"&&<SourcesTab dark={dark}/>}
          {tab==="profile"&&<ProfilTab isPremium={isPremium} onPremium={()=>setShowPaywall(true)} dark={dark} session={session} onSignOut={handleSignOut} onSignIn={()=>setShowAuth(true)}/>}
        </div>

        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"480px",background:navBg,borderTop:`1px solid ${navBorder}`,display:"flex",zIndex:200,paddingBottom:"env(safe-area-inset-bottom,5px)"}}>
          {navItems.map(({id,icon,label})=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",padding:"10px 0 7px",background:"transparent",border:"none",cursor:"pointer"}}>
              <span style={{fontSize:"17px",filter:tab===id?"none":"grayscale(1)",opacity:tab===id?1:0.25,transition:"all 0.15s"}}>{icon}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",letterSpacing:"0.06em",color:tab===id?"#e74c3c":textMuted,textTransform:"uppercase",transition:"color 0.15s"}}>{label}</span>
              {tab===id&&<div style={{width:"14px",height:"2px",background:"#e74c3c",borderRadius:"1px",marginTop:"1px"}}/>}
            </button>
          ))}
        </nav>
      </div>
      {showPaywall&&<PaywallModal onClose={()=>setShowPaywall(false)} onPremium={handlePremium} session={session}/>}
    </>
  );
}

export default dynamic(() => Promise.resolve(MédiaVueApp), { ssr: false });

