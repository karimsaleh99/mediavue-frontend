// pages/reel.js
// Auto-playing 30-second scripted demo — designed to be screen-recorded on a
// phone and used as a social media reel. Visit /reel, tap PLAY, hit record.
//
// Each "scene" is 3–5 seconds and fades into the next. Total runtime ≈ 30s.
// Uses the same brand fonts/colors as the main app.

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

// ── Scene script ────────────────────────────────────────────────────────────
const SCENES = [
  { id: "hook",      ms: 3000, caption: "Tu vois cette info partout…" },
  { id: "split",     ms: 3000, caption: "…ou tu ne la vois pas du tout." },
  { id: "logo",      ms: 2500, caption: "MédiaVue." },
  { id: "feed",      ms: 4000, caption: "20 médias français en un seul fil." },
  { id: "story",     ms: 4000, caption: "Gauche. Centre. Droite. Côte à côte." },
  { id: "blindspot", ms: 3500, caption: "Et on te dit qui ne couvre pas." },
  { id: "follow",    ms: 4000, caption: "Suis qui tu veux. Un seul tap." },
  { id: "cta",       ms: 3500, caption: "MédiaVue. L'actualité, vue sous tous les angles." },
];
const TOTAL_MS = SCENES.reduce((acc, s) => acc + s.ms, 0);

// ── Fake data (keeps demo self-contained — no API calls) ────────────────────
const DEMO_POLITICIANS = [
  { id: "macron",    name: "Macron",    color: "#ffd700" },
  { id: "lepen",     name: "Le Pen",    color: "#0d1d54" },
  { id: "melenchon", name: "Mélenchon", color: "#cc0000" },
  { id: "bardella",  name: "Bardella",  color: "#0d1d54" },
  { id: "bayrou",    name: "Bayrou",    color: "#ff8c00" },
];

const DEMO_HEADLINES = {
  left:   "Réforme : les syndicats refusent, la rue gronde",
  center: "Réforme des retraites : nouvelle journée de négociation",
  right:  "L'opposition fragilise l'exécutif sur les retraites",
};

// ── Reel component ──────────────────────────────────────────────────────────
function Reel() {
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const [sceneIdx, setSceneIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef([]);
  const progressRaf = useRef(null);

  const start = () => {
    setPhase("playing");
    setSceneIdx(0);
    setElapsed(0);

    let cumulative = 0;
    timers.current = SCENES.map((s, i) => {
      cumulative += s.ms;
      return setTimeout(() => {
        if (i === SCENES.length - 1) setPhase("done");
        else setSceneIdx(i + 1);
      }, cumulative);
    });

    const startTs = Date.now();
    const tick = () => {
      const e = Math.min(Date.now() - startTs, TOTAL_MS);
      setElapsed(e);
      if (e < TOTAL_MS) progressRaf.current = requestAnimationFrame(tick);
    };
    progressRaf.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    if (progressRaf.current) cancelAnimationFrame(progressRaf.current);
    setPhase("idle");
    setSceneIdx(0);
    setElapsed(0);
  };

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    if (progressRaf.current) cancelAnimationFrame(progressRaf.current);
  }, []);

  const current = SCENES[sceneIdx];
  const progressPct = Math.min(100, (elapsed / TOTAL_MS) * 100);

  return (
    <>
      <Head>
        <title>MédiaVue — Reel</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"/>
        <meta name="theme-color" content="#000"/>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;600&family=Source+Serif+4:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#__next{height:100%;background:#000;overflow:hidden;}
        body{font-family:'Source Serif 4',serif;color:#f0ede8;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideLeft{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
        @keyframes scroll-up{from{transform:translateY(100%)}to{transform:translateY(-100%)}}
        .scene{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;animation:fadeIn 0.4s ease;}
        .caption{position:absolute;bottom:120px;left:16px;right:16px;text-align:center;font-family:'Playfair Display',serif;font-size:28px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:white;text-shadow:0 2px 14px rgba(0,0,0,0.9);animation:fadeIn 0.6s ease;}
        .brand{color:#e74c3c;}
      `}</style>

      <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden",background:"#000"}}>
        {/* ── Idle state: instructions + play ─────────────────────────── */}
        {phase === "idle" && (
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"30px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"42px",fontWeight:"900",letterSpacing:"-0.03em",marginBottom:"14px"}}>
              Média<span style={{color:"#e74c3c"}}>Vue</span>
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",color:"#888",marginBottom:"40px"}}>REEL · 30 SEC</div>
            <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"14px",color:"#aaa",maxWidth:"280px",lineHeight:"1.5",marginBottom:"32px"}}>
              Commence ton <b>screen recording</b>, puis appuie sur PLAY. Le reel joue automatiquement pendant 30 secondes.
            </div>
            <button onClick={start} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",letterSpacing:"0.14em",background:"#e74c3c",color:"white",border:"none",padding:"14px 34px",borderRadius:"30px",cursor:"pointer",fontWeight:"600"}}>
              ▶ PLAY
            </button>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.1em",color:"#444",marginTop:"24px"}}>iOS : Control Center → Record · Android : Quick Settings → Screen Recorder</div>
          </div>
        )}

        {/* ── Playing state: scene by scene ───────────────────────────── */}
        {phase === "playing" && current && (
          <>
            {current.id === "hook" && <SceneHook/>}
            {current.id === "split" && <SceneSplit/>}
            {current.id === "logo" && <SceneLogo/>}
            {current.id === "feed" && <SceneFeed/>}
            {current.id === "story" && <SceneStory/>}
            {current.id === "blindspot" && <SceneBlindspot/>}
            {current.id === "follow" && <SceneFollow/>}
            {current.id === "cta" && <SceneCTA/>}

            <div className="caption">{current.caption}</div>

            {/* Progress bar */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"rgba(255,255,255,0.08)"}}>
              <div style={{height:"100%",background:"#e74c3c",width:`${progressPct}%`,transition:"width 0.15s linear"}}/>
            </div>
          </>
        )}

        {/* ── Done state ──────────────────────────────────────────────── */}
        {phase === "done" && (
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"38px",fontWeight:"900",letterSpacing:"-0.03em",marginBottom:"16px"}}>
              Média<span style={{color:"#e74c3c"}}>Vue</span>
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",color:"#888",marginBottom:"30px"}}>FIN · 30 SEC</div>
            <button onClick={reset} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",letterSpacing:"0.14em",background:"transparent",color:"white",border:"1px solid #333",padding:"12px 30px",borderRadius:"30px",cursor:"pointer"}}>↻ REJOUER</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Scene components ────────────────────────────────────────────────────────

function SceneHook() {
  // Scrolling blur of fake news headlines
  const headlines = [
    "Macron annonce une nouvelle réforme",
    "Le Pen réagit aux propos du gouvernement",
    "Bardella déroule sa feuille de route",
    "Mélenchon dénonce l'exécutif",
    "Les syndicats appellent à la grève",
    "L'Assemblée rejette la motion",
  ];
  return (
    <div className="scene" style={{overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",gap:"14px",padding:"40px 16px",opacity:0.55,filter:"blur(0.5px)",animation:"scroll-up 10s linear"}}>
        {[...headlines, ...headlines, ...headlines].map((h,i)=>(
          <div key={i} style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:"700",color:"#888",lineHeight:"1.2"}}>{h}</div>
        ))}
      </div>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 70%)"}}/>
    </div>
  );
}

function SceneSplit() {
  // Same story, left outlet vs right outlet side by side
  return (
    <div className="scene" style={{padding:"0"}}>
      <div style={{display:"flex",width:"100%",height:"100%"}}>
        <div style={{flex:1,background:"#1c0808",padding:"28px 18px",display:"flex",flexDirection:"column",justifyContent:"center",animation:"fadeIn 0.5s ease"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#e74c3c",marginBottom:"12px"}}>● GAUCHE</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"19px",fontWeight:"700",color:"#f0ede8",lineHeight:"1.25"}}>{DEMO_HEADLINES.left}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#888",marginTop:"10px"}}>Libération</div>
        </div>
        <div style={{flex:1,background:"#080f1c",padding:"28px 18px",display:"flex",flexDirection:"column",justifyContent:"center",animation:"fadeIn 0.8s ease"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#3d7ebf",marginBottom:"12px"}}>● DROITE</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"19px",fontWeight:"700",color:"#f0ede8",lineHeight:"1.25"}}>{DEMO_HEADLINES.right}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#888",marginTop:"10px"}}>Le Figaro</div>
        </div>
      </div>
    </div>
  );
}

function SceneLogo() {
  return (
    <div className="scene">
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"64px",fontWeight:"900",letterSpacing:"-0.04em",animation:"pulse 1.5s ease infinite"}}>
        Média<span className="brand">Vue</span>
      </div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"0.18em",color:"#666",marginTop:"14px"}}>L'ACTUALITÉ · SOUS TOUS LES ANGLES</div>
    </div>
  );
}

function SceneFeed() {
  return (
    <div className="scene" style={{padding:"20px 14px",justifyContent:"flex-start",paddingTop:"50px"}}>
      {/* Header mockup */}
      <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",fontWeight:"900"}}>Média<span className="brand">Vue</span></div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",letterSpacing:"0.1em",color:"#555"}}>🔴 LIVE</div>
      </div>
      {/* Category pills */}
      <div style={{display:"flex",gap:"5px",marginBottom:"14px",overflow:"hidden",width:"100%"}}>
        {["Tout","Politique","Sport","Culture","Économie"].map((c,i)=>(
          <div key={c} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",padding:"5px 10px",border:`1px solid ${i===0?"#e74c3c":"#1f1f1f"}`,background:i===0?"#1c0808":"#161616",color:i===0?"#e74c3c":"#3a3a3a",borderRadius:"20px",whiteSpace:"nowrap"}}>{c}</div>
        ))}
      </div>
      {/* Story cards */}
      {["Réforme des retraites : la tension monte","Guerre en Ukraine : nouveau sommet","Climat : la COP s'achève sans accord"].map((t,i)=>(
        <div key={i} style={{width:"100%",background:"#161616",border:"1px solid #1f1f1f",borderRadius:"12px",padding:"14px",marginBottom:"9px",animation:`fadeIn 0.5s ease ${i*0.15}s both`}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",letterSpacing:"0.1em",color:"#555",marginBottom:"6px"}}>🏛️ POLITIQUE · 12 sources</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:"700",color:"#f0ede8",lineHeight:"1.25",marginBottom:"9px"}}>{t}</div>
          {/* Bias bar */}
          <div style={{display:"flex",height:"4px",borderRadius:"2px",overflow:"hidden"}}>
            <div style={{flex:3,background:"#e74c3c"}}/><div style={{flex:5,background:"#888"}}/><div style={{flex:4,background:"#3d7ebf"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function SceneStory() {
  return (
    <div className="scene" style={{padding:"0"}}>
      <div style={{width:"100%",height:"100%",background:"#141414",display:"flex",flexDirection:"column"}}>
        {/* Hero strip */}
        <div style={{height:"120px",background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"36px"}}>🏛️</div>
        {/* Title */}
        <div style={{padding:"16px",borderBottom:"1px solid #1f1f1f"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:"700",color:"#f0ede8",lineHeight:"1.25"}}>Réforme des retraites : la tension monte</div>
        </div>
        {/* 3 columns */}
        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",padding:"14px"}}>
          {[
            {label:"GAUCHE",color:"#e74c3c",bg:"#1c0808",items:["Libé","Mediapart"]},
            {label:"CENTRE",color:"#888",bg:"#111",items:["Le Monde","AFP"]},
            {label:"DROITE",color:"#3d7ebf",bg:"#080f1c",items:["Le Figaro","CNews"]},
          ].map((col,i)=>(
            <div key={col.label} style={{background:col.bg,borderRadius:"8px",padding:"10px",border:`1px solid ${col.color}30`,animation:`slideLeft 0.5s ease ${i*0.2}s both`}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",letterSpacing:"0.1em",color:col.color,marginBottom:"10px"}}>● {col.label}</div>
              {col.items.map((n,j)=>(
                <div key={j} style={{fontFamily:"'Source Serif 4',serif",fontSize:"10px",color:"#b0a898",marginBottom:"6px",lineHeight:"1.25"}}>{n}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneBlindspot() {
  return (
    <div className="scene" style={{padding:"20px"}}>
      <div style={{width:"100%",background:"#141414",border:"1px solid #1f1f1f",borderRadius:"14px",padding:"20px",animation:"fadeIn 0.5s ease"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:"700",color:"#f0ede8",marginBottom:"14px",lineHeight:"1.3"}}>Grève des cheminots : décision attendue</div>
        <div style={{display:"flex",height:"6px",borderRadius:"3px",overflow:"hidden",marginBottom:"18px"}}>
          <div style={{flex:5,background:"#e74c3c"}}/><div style={{flex:4,background:"#888"}}/><div style={{flex:0.5,background:"#3d7ebf"}}/>
        </div>
        <div style={{background:"#1a1200",border:"1px solid #c8960c",borderRadius:"10px",padding:"14px",animation:"shake 0.4s ease 0.6s"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"0.12em",color:"#c8960c",marginBottom:"6px"}}>⚠ ANGLE MORT DÉTECTÉ</div>
          <div style={{fontFamily:"'Source Serif 4',serif",fontSize:"13px",color:"#9a7020",lineHeight:"1.4"}}>Peu couvert par les médias de droite.</div>
        </div>
      </div>
    </div>
  );
}

function SceneFollow() {
  return (
    <div className="scene" style={{padding:"20px"}}>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",color:"#e74c3c",marginBottom:"20px"}}>🔥 TENDANCES</div>
      <div style={{width:"100%",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px"}}>
        {DEMO_POLITICIANS.slice(0,4).map((p,i)=>(
          <div key={p.id} style={{background:"#121212",border:"1px solid #1f1f1f",borderRadius:"12px",padding:"14px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",animation:`fadeIn 0.4s ease ${i*0.2}s both`}}>
            <div style={{width:"48px",height:"48px",borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace",fontSize:"14px",color:"white",fontWeight:"700"}}>
              {p.name.slice(0,2).toUpperCase()}
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#ccc"}}>{p.name}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",letterSpacing:"0.1em",color:i<2?"#e74c3c":"#555",border:`1px solid ${i<2?"#e74c3c":"#333"}`,padding:"4px 10px",borderRadius:"12px"}}>{i<2 ? "✓ SUIVI" : "+ SUIVRE"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneCTA() {
  return (
    <div className="scene">
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"58px",fontWeight:"900",letterSpacing:"-0.04em",lineHeight:"1",textAlign:"center",animation:"fadeIn 0.6s ease"}}>
        Média<span className="brand">Vue</span>
      </div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",letterSpacing:"0.16em",color:"#888",marginTop:"20px",animation:"fadeIn 0.6s ease 0.4s both"}}>MEDIAVUE.FR</div>
      <div style={{display:"flex",gap:"14px",marginTop:"30px",animation:"fadeIn 0.6s ease 0.8s both"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",color:"#555",border:"1px solid #222",padding:"7px 14px",borderRadius:"8px"}}>APP STORE</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",color:"#555",border:"1px solid #222",padding:"7px 14px",borderRadius:"8px"}}>GOOGLE PLAY</div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Reel), { ssr: false });
