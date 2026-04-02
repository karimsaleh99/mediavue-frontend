import { useState, useEffect, useRef } from "react";

const API_URL = "https://mediavue-backend-production.up.railway.app";
const FREE_LIMIT = 5;
const STORAGE_KEY = "mv_reads";
const RESET_KEY = "mv_reset";

const SOURCES = [
  { id: "lemonde", name: "Le Monde", orientation: "centre-gauche", orientationScore: 2, factuality: "Élevée", owner: "Xavier Niel / Matthieu Pigasse", ownerType: "milliardaires indépendants", logo: "LM", color: "#4a90d9" },
  { id: "lefigaro", name: "Le Figaro", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "Famille Dassault", ownerType: "groupe industriel", logo: "LF", color: "#c0392b" },
  { id: "liberation", name: "Libération", orientation: "gauche", orientationScore: 1, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "LIB", color: "#e74c3c" },
  { id: "mediapart", name: "Médiapart", orientation: "gauche", orientationScore: 0, factuality: "Élevée", owner: "Indépendant", ownerType: "indépendant", logo: "MP", color: "#e74c3c" },
  { id: "bfmtv", name: "BFMTV", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "BFM", color: "#3498db" },
  { id: "lesechos", name: "Les Échos", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LE", color: "#1abc9c" },
  { id: "cnews", name: "CNews", orientation: "droite extrême", orientationScore: 5, factuality: "Mixte", owner: "Vincent Bolloré (Vivendi)", ownerType: "milliardaire conservateur", logo: "CN", color: "#7f8c8d" },
  { id: "franceinfo", name: "France Info", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Télévisions", ownerType: "service public", logo: "FI", color: "#e67e22" },
  { id: "france24", name: "France 24", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Médias Monde", ownerType: "service public", logo: "F24", color: "#27ae60" },
  { id: "leparisien", name: "Le Parisien", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LP", color: "#d35400" },
  { id: "blast", name: "Blast", orientation: "gauche", orientationScore: 0, factuality: "Moyenne", owner: "Indépendant", ownerType: "indépendant", logo: "BL", color: "#8e44ad" },
  { id: "marianne", name: "Marianne", orientation: "centre-gauche", orientationScore: 2, factuality: "Moyenne", owner: "Czech Media Invest", ownerType: "milliardaire étranger", logo: "MAR", color: "#2980b9" },
  { id: "lepoint", name: "Le Point", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "François Pinault", ownerType: "milliardaire luxe", logo: "PT", color: "#2c3e50" },
  { id: "valeursactuelles", name: "Valeurs Actuelles", orientation: "droite extrême", orientationScore: 5, factuality: "Faible", owner: "Groupe Valmonde", ownerType: "groupe conservateur", logo: "VA", color: "#95a5a6" },
  { id: "20minutes", name: "20 Minutes", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Rossel", ownerType: "groupe de presse", logo: "20M", color: "#27ae60" },
  { id: "ouestfrance", name: "Ouest-France", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Association SIPA", ownerType: "indépendant", logo: "OF", color: "#34495e" },
  { id: "lobs", name: "L'Obs", orientation: "centre-gauche", orientationScore: 1, factuality: "Élevée", owner: "Groupe Le Monde", ownerType: "milliardaires indépendants", logo: "OBS", color: "#d35400" },
  { id: "humanite", name: "L'Humanité", orientation: "gauche", orientationScore: 0, factuality: "Moyenne", owner: "Société coopérative", ownerType: "indépendant", logo: "HUM", color: "#c0392b" },
  { id: "lacroix", name: "La Croix", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Groupe Bayard", ownerType: "groupe catholique", logo: "CRX", color: "#8e44ad" },
  { id: "lexpress", name: "L'Express", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Alain Weill / Altice", ownerType: "milliardaire télécom", logo: "EXP", color: "#c0392b" },
];

const CATEGORIES = ["Tout", "Politique", "Économie", "Social", "International", "Justice", "Médias", "Technologie", "Environnement"];

const OWNER_TYPE_COLOR = {
  "indépendant": "#27ae60",
  "milliardaires indépendants": "#f39c12",
  "milliardaire télécom": "#e74c3c",
  "milliardaire conservateur": "#8e44ad",
  "milliardaire luxe": "#3498db",
  "groupe industriel": "#7f8c8d",
  "service public": "#27ae60",
  "milliardaire étranger": "#e67e22",
  "groupe de presse": "#95a5a6",
  "groupe catholique": "#8e44ad",
  "groupe conservateur": "#7f8c8d",
};

const ORI_COLOR = {
  "gauche": "#e74c3c",
  "centre-gauche": "#e67e22",
  "centre": "#95a5a6",
  "centre-droite": "#3498db",
  "droite": "#7f8c8d",
  "droite extrême": "#4a4a4a",
};

function getSource(id) {
  return SOURCES.find(s => s.id === id) || { logo: (id || "??").slice(0, 2).toUpperCase(), color: "#555", name: id, orientation: "centre", orientationScore: 3, owner: "Inconnu", ownerType: "inconnu" };
}

function isBreaking(story) {
  if (!story.published_at) return false;
  const age = (Date.now() - new Date(story.published_at)) / 1000 / 60 / 60;
  return age < 2 && (story.coverage_count || 0) >= 3;
}

function getCoverageScore(cov) {
  const g = cov?.gauche || 0, c = cov?.centre || 0, d = cov?.droite || 0;
  const total = g + c + d;
  if (total === 0) return 0;
  const sides = [g > 0, c > 0, d > 0].filter(Boolean).length;
  return Math.round((sides / 3) * 100);
}

function getReadsToday() {
  try {
    const reset = localStorage.getItem(RESET_KEY);
    const today = new Date().toDateString();
    if (reset !== today) {
      localStorage.setItem(RESET_KEY, today);
      localStorage.setItem(STORAGE_KEY, "0");
      return 0;
    }
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0");
  } catch { return 0; }
}

function incrementReads() {
  try {
    const reads = getReadsToday();
    localStorage.setItem(STORAGE_KEY, String(reads + 1));
    return reads + 1;
  } catch { return 0; }
}

// ── Components ────────────────────────────────────────────────────────────────

function Logo({ size = 22 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="5" fill="#e74c3c" />
        <rect x="4" y="16" width="5" height="8" rx="1" fill="white" />
        <rect x="11" y="10" width="5" height="14" rx="1" fill="white" opacity="0.8" />
        <rect x="18" y="13" width="5" height="11" rx="1" fill="white" opacity="0.55" />
      </svg>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: size * 1.15, fontWeight: "900", color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>MédiaVue</span>
    </div>
  );
}

function BiasBar({ cov }) {
  const g = cov?.gauche || 0, c = cov?.centre || 0, d = cov?.droite || 0;
  const total = g + c + d;
  if (total === 0) return null;
  return (
    <div>
      <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", gap: "1px", background: "#2a2a2a" }}>
        <div style={{ width: `${(g / total) * 100}%`, background: "#e74c3c" }} />
        <div style={{ width: `${(c / total) * 100}%`, background: "#555" }} />
        <div style={{ width: `${(d / total) * 100}%`, background: "#4a90d9" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#666" }}>
        <span style={{ color: "#e74c3c" }}>G {g}</span>
        <span>C {c}</span>
        <span style={{ color: "#4a90d9" }}>D {d}</span>
      </div>
    </div>
  );
}

function ScorePill({ score }) {
  const color = score >= 80 ? "#27ae60" : score >= 50 ? "#f39c12" : "#e74c3c";
  const label = score >= 80 ? "Équilibré" : score >= 50 ? "Partiel" : "Unilatéral";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.06em", color, border: `1px solid ${color}`, padding: "2px 7px", borderRadius: "10px" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function SrcChip({ id, size = 26 }) {
  const s = getSource(id);
  return (
    <div title={s.name} style={{ width: size, height: size, borderRadius: "4px", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.27, color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", flexShrink: 0, opacity: 0.9 }}>
      {s.logo}
    </div>
  );
}

function StoryCard({ story, onClick, locked, onLock }) {
  const cov = story.coverage_by_orientation || {};
  const srcIds = story.source_ids || [];
  const score = getCoverageScore(cov);
  const breaking = isBreaking(story);
  const img = story.articles?.[0]?.image_url;

  const handle = () => locked ? onLock() : onClick(story);

  return (
    <div onClick={handle} style={{ background: "#1a1a1a", borderRadius: "12px", overflow: "hidden", cursor: "pointer", marginBottom: "12px", border: "1px solid #2a2a2a", transition: "border-color 0.2s", position: "relative" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#3a3a3a"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}>

      {locked && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#e74c3c", color: "white", padding: "8px 18px", borderRadius: "20px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.08em" }}>
            🔒 Premium requis
          </div>
        </div>
      )}

      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          {breaking && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#e74c3c", color: "white", padding: "2px 8px", borderRadius: "3px", fontWeight: "600" }}>● Breaking</span>
          )}
          {story.blindspot && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", background: "#2d1f0e", color: "#f39c12", padding: "2px 8px", borderRadius: "3px", border: "1px solid #3d2f1e" }}>
              ⚠ Angle mort · {story.blindspot.sides?.join(", ")}
            </span>
          )}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#555", letterSpacing: "0.06em", marginLeft: "auto" }}>{story.coverage_count || srcIds.length} sources</span>
          <ScorePill score={score} />
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>{story.category || "Actualité"}</span>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.3", margin: "4px 0 8px" }}>{story.title}</h3>
            {story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#888", lineHeight: "1.5", margin: "0 0 10px" }}>{story.summary.slice(0, 120)}…</p>}
          </div>
          {img && (
            <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 16px 12px" }}>
        <BiasBar cov={cov} />
        <div style={{ display: "flex", gap: "4px", marginTop: "10px", flexWrap: "wrap" }}>
          {srcIds.slice(0, 8).map(id => <SrcChip key={id} id={id} />)}
          {srcIds.length > 8 && <div style={{ width: 26, height: 26, borderRadius: "4px", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#555" }}>+{srcIds.length - 8}</div>}
        </div>
      </div>
    </div>
  );
}

function SideBySide({ articles }) {
  const buckets = {
    gauche: articles.filter(a => (getSource(a.source_id)?.orientationScore ?? 3) <= 1),
    centre: articles.filter(a => { const s = getSource(a.source_id)?.orientationScore ?? 3; return s > 1 && s < 4; }),
    droite: articles.filter(a => (getSource(a.source_id)?.orientationScore ?? 3) >= 4),
  };
  const cols = Object.entries(buckets).filter(([, v]) => v.length > 0);
  if (cols.length === 0) return null;
  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: "14px" }}>Vue côte à côte</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: "12px" }}>
        {cols.map(([key, items]) => {
          const color = key === "gauche" ? "#e74c3c" : key === "centre" ? "#888" : "#4a90d9";
          return (
            <div key={key}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", textTransform: "uppercase", color, borderBottom: `2px solid ${color}`, paddingBottom: "5px", marginBottom: "10px", letterSpacing: "0.08em" }}>{key}</div>
              {items.map((a, i) => {
                const src = getSource(a.source_id);
                return (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <SrcChip id={a.source_id} size={18} />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#555" }}>{src.name}</span>
                    </div>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#c8c0b4", textDecoration: "none", lineHeight: "1.4", display: "block" }}
                      onMouseEnter={e => e.target.style.color = "#4a90d9"}
                      onMouseLeave={e => e.target.style.color = "#c8c0b4"}>
                      {a.title}
                    </a>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoryModal({ story, onClose }) {
  if (!story) return null;
  const articles = story.articles || [];
  const cov = story.coverage_by_orientation || {};
  const score = getCoverageScore(cov);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", overflowY: "auto", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#141414", maxWidth: "700px", width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid #2a2a2a" }}>

        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
            {isBreaking(story) && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", background: "#e74c3c", color: "white", padding: "2px 8px", borderRadius: "3px" }}>● Breaking</span>}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{story.category}</span>
            <ScorePill score={score} />
            <button onClick={onClose} style={{ marginLeft: "auto", background: "#2a2a2a", border: "none", color: "#888", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" }}>✕</button>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.3", marginBottom: "12px" }}>{story.title}</h2>
          {story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#888", lineHeight: "1.6", marginBottom: "16px" }}>{story.summary}</p>}
          <BiasBar cov={cov} />
        </div>

        {story.blindspot && (
          <div style={{ margin: "16px 24px 0", padding: "12px 16px", background: "#1f1508", border: "1px solid #3d2f1e", borderRadius: "8px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#f39c12", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>⚠ Angle mort détecté</div>
            <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#c8a96e", margin: 0 }}>{story.blindspot.label} — cette histoire est ignorée par certains camps.</p>
          </div>
        )}

        {articles.length > 0 && (
          <div style={{ padding: "0 24px 24px" }}>
            <SideBySide articles={articles} />
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: "14px" }}>Tous les articles ({articles.length})</div>
              {articles.map((a, i) => {
                const src = getSource(a.source_id);
                return (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: "14px", borderBottom: i < articles.length - 1 ? "1px solid #1f1f1f" : "none", marginBottom: "14px" }}>
                    <SrcChip id={a.source_id} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#888", fontWeight: "600" }}>{src.name}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: ORI_COLOR[src.orientation] || "#888" }}>● {src.orientation}</span>
                      </div>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#c8c0b4", textDecoration: "none", lineHeight: "1.4" }}
                        onMouseEnter={e => e.target.style.color = "#4a90d9"}
                        onMouseLeave={e => e.target.style.color = "#c8c0b4"}>
                        {a.title}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaywallModal({ readsLeft, onClose, onPremium }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#141414", maxWidth: "420px", width: "100%", borderRadius: "20px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
        <div style={{ background: "#0f0f0f", padding: "32px 28px", textAlign: "center", borderBottom: "1px solid #1f1f1f" }}>
          <Logo size={28} />
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginTop: "20px", marginBottom: "10px" }}>Limite atteinte</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.2" }}>Vous avez lu vos {FREE_LIMIT} histoires gratuites du jour</h2>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#666", marginTop: "10px", lineHeight: "1.5" }}>Revenez demain, ou passez à Premium pour un accès illimité.</p>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {[
            { label: "Mensuel", price: "4,99€", sub: "/mois", highlight: false },
            { label: "Annuel", price: "49€", sub: "/an · économisez 18%", highlight: true },
          ].map(({ label, price, sub, highlight }) => (
            <button key={label} onClick={onPremium} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 18px", marginBottom: "10px", border: highlight ? "1.5px solid #e74c3c" : "1px solid #2a2a2a", background: highlight ? "#1f0808" : "transparent", cursor: "pointer", borderRadius: "10px", fontFamily: "'Source Serif 4', serif" }}>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#f0ede8" }}>{label}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "17px", fontWeight: "700", color: highlight ? "#e74c3c" : "#f0ede8" }}>{price}</div>
                <div style={{ fontSize: "10px", color: "#555", fontFamily: "'IBM Plex Mono', monospace" }}>{sub}</div>
              </div>
            </button>
          ))}
          <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", color: "#444", marginTop: "4px" }}>
            Revenir demain
          </button>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", textAlign: "center", marginTop: "12px", letterSpacing: "0.06em" }}>AUCUNE PUBLICITÉ · AUCUN ACTIONNAIRE · 100% INDÉPENDANT</p>
        </div>
      </div>
    </div>
  );
}

function FeedTab({ isPremium, onPremium }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [readsToday, setReadsToday] = useState(getReadsToday);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const cat = category !== "Tout" ? `&category=${category}` : "";
    fetch(`${API_URL}/api/stories?limit=50${cat}`)
      .then(r => r.json())
      .then(d => { setStories(d.stories || []); setLoading(false); })
      .catch(() => { setError("Impossible de charger. Réessayez."); setLoading(false); });
  }, [category]);

  const filtered = stories.filter(s =>
    !search.trim() || s.title.toLowerCase().includes(search.toLowerCase())
  );

  const breaking = filtered.filter(isBreaking);
  const regular = filtered.filter(s => !isBreaking(s));

  const handleClick = async (story) => {
    if (!isPremium && readsToday >= FREE_LIMIT) { setShowPaywall(true); return; }
    setSelectedStory(story);
    const newCount = incrementReads();
    setReadsToday(newCount);
    if (!story.articles && story.id) {
      try {
        const res = await fetch(`${API_URL}/api/stories/${story.id}`);
        const full = await res.json();
        setSelectedStory(full);
      } catch {}
    }
  };

  const readsLeft = Math.max(0, FREE_LIMIT - readsToday);

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: "14px" }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1px solid #2a2a2a", background: "#1a1a1a", fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#f0ede8", borderRadius: "10px", outline: "none" }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: "18px" }}>×</button>}
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginBottom: "16px", paddingBottom: "4px" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.06em", padding: "6px 14px", border: "1px solid", borderColor: category === cat ? "#e74c3c" : "#2a2a2a", background: category === cat ? "#1f0808" : "transparent", color: category === cat ? "#e74c3c" : "#555", cursor: "pointer", borderRadius: "20px", whiteSpace: "nowrap", transition: "all 0.15s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Free reads counter */}
      {!isPremium && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#1a1a1a", borderRadius: "8px", marginBottom: "16px", border: "1px solid #2a2a2a" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#555", letterSpacing: "0.06em" }}>
            {readsLeft > 0 ? `${readsLeft} lecture${readsLeft > 1 ? "s" : ""} gratuite${readsLeft > 1 ? "s" : ""} aujourd'hui` : "Limite atteinte aujourd'hui"}
          </span>
          <button onClick={onPremium} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", background: "#e74c3c", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}>Premium</button>
        </div>
      )}

      {loading && <div style={{ width: "24px", height: "24px", border: "2px solid #2a2a2a", borderTopColor: "#e74c3c", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "60px auto" }} />}
      {error && <div style={{ padding: "16px", background: "#1f0808", border: "1px solid #3d1010", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#e74c3c" }}>{error}</div>}

      {/* Breaking news */}
      {!loading && breaking.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e74c3c", display: "inline-block" }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#e74c3c" }}>Breaking News</span>
          </div>
          {breaking.map((s, i) => <StoryCard key={s.id || i} story={s} onClick={handleClick} locked={!isPremium && readsToday >= FREE_LIMIT} onLock={() => setShowPaywall(true)} />)}
        </div>
      )}

      {/* Regular stories */}
      {!loading && !error && (
        <div>
          {breaking.length > 0 && regular.length > 0 && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: "12px" }}>Toutes les histoires · {filtered.length}</div>
          )}
          {regular.map((s, i) => (
            <div key={s.id || i} style={{ animation: `fadeUp 0.3s ease ${Math.min(i, 8) * 0.04}s both` }}>
              <StoryCard story={s} onClick={handleClick} locked={!isPremium && readsToday + i >= FREE_LIMIT} onLock={() => setShowPaywall(true)} />
            </div>
          ))}
          {filtered.length === 0 && search && (
            <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "'Source Serif 4', serif", color: "#444" }}>Aucun résultat pour «{search}»</div>
          )}
        </div>
      )}

      {selectedStory && <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />}
      {showPaywall && <PaywallModal readsLeft={readsLeft} onClose={() => setShowPaywall(false)} onPremium={() => { onPremium(); setShowPaywall(false); }} />}
    </div>
  );
}

function SourcesTab() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? SOURCES : SOURCES.filter(s => {
    if (filter === "gauche") return s.orientationScore <= 1;
    if (filter === "centre") return s.orientationScore > 1 && s.orientationScore < 4;
    if (filter === "droite") return s.orientationScore >= 4;
    return true;
  });

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {["all", "gauche", "centre", "droite"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.06em", padding: "6px 14px", border: "1px solid", borderColor: filter === f ? "#e74c3c" : "#2a2a2a", background: filter === f ? "#1f0808" : "transparent", color: filter === f ? "#e74c3c" : "#555", cursor: "pointer", borderRadius: "20px" }}>
            {f === "all" ? "Tous" : f}
          </button>
        ))}
      </div>
      {filtered.map(src => (
        <div key={src.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "16px", marginBottom: "10px", display: "flex", gap: "14px" }}>
          <SrcChip id={src.id} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8" }}>{src.name}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: ORI_COLOR[src.orientation] || "#888" }}>● {src.orientation}</span>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Fiabilité</div>
                <div style={{ fontSize: "12px", color: src.factuality === "Élevée" ? "#27ae60" : src.factuality === "Mixte" ? "#f39c12" : "#e74c3c" }}>{src.factuality}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Propriétaire</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{src.owner}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Type</div>
                <span style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "white", background: OWNER_TYPE_COLOR[src.ownerType] || "#333", padding: "2px 7px", borderRadius: "3px" }}>{src.ownerType}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OwnershipTab() {
  const groups = Object.values(SOURCES.reduce((acc, src) => {
    if (!acc[src.owner]) acc[src.owner] = { owner: src.owner, type: src.ownerType, sources: [] };
    acc[src.owner].sources.push(src);
    return acc;
  }, {}));

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ padding: "14px 16px", background: "#1f1508", border: "1px solid #3d2f1e", borderRadius: "10px", marginBottom: "16px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#f39c12", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Pourquoi c'est important</div>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#c8a96e", lineHeight: "1.55", margin: 0 }}>En France, 4 milliardaires contrôlent l'essentiel des médias d'information. Connaître le propriétaire, c'est comprendre les biais.</p>
      </div>
      {groups.map((g, i) => (
        <div key={i} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", overflow: "hidden", marginBottom: "10px" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1f1f1f", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8", marginBottom: "4px" }}>{g.owner}</div>
              <span style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "white", background: OWNER_TYPE_COLOR[g.type] || "#333", padding: "2px 8px", borderRadius: "3px" }}>{g.type}</span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#444" }}>{g.sources.length} titre{g.sources.length > 1 ? "s" : ""}</span>
          </div>
          <div style={{ padding: "12px 16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {g.sources.map(src => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "#0f0f0f", borderRadius: "6px", border: "1px solid #1f1f1f" }}>
                <SrcChip id={src.id} size={20} />
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#888" }}>{src.name}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: ORI_COLOR[src.orientation] || "#555" }}>● {src.orientation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ isPremium, onPremium }) {
  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "24px", marginBottom: "16px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "24px" }}>👤</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "#f0ede8", marginBottom: "4px" }}>Visiteur</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#555", letterSpacing: "0.08em" }}>{isPremium ? "● PREMIUM" : "Compte gratuit"}</div>
      </div>

      {!isPremium && (
        <div style={{ background: "#1f0808", border: "1px solid #3d1010", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "#f0ede8", marginBottom: "8px" }}>Passez à Premium</div>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#888", lineHeight: "1.5", marginBottom: "16px" }}>Lectures illimitées, données de propriété, rapport d'angle mort personnel.</p>
          <button onClick={onPremium} style={{ width: "100%", padding: "14px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Essayer Premium
          </button>
        </div>
      )}

      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", overflow: "hidden" }}>
        {[
          { icon: "📊", label: "Lectures aujourd'hui", value: `${getReadsToday()}/${isPremium ? "∞" : FREE_LIMIT}` },
          { icon: "🎯", label: "Mon angle mort", value: isPremium ? "Voir le rapport" : "Premium" },
          { icon: "🔔", label: "Alertes", value: "Bientôt" },
          { icon: "📧", label: "Digest hebdo", value: "Bientôt" },
        ].map(({ icon, label, value }, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: i < 3 ? "1px solid #1f1f1f" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>{icon}</span>
              <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#888" }}>{label}</span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: value === "Premium" ? "#e74c3c" : "#555" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function MédiaVue() {
  const [tab, setTab] = useState("news");
  const [isPremium, setIsPremium] = useState(false);

  const navItems = [
    { id: "news", icon: "📰", label: "Actualités" },
    { id: "blindspot", icon: "🎯", label: "Angles morts" },
    { id: "sources", icon: "📋", label: "Sources" },
    { id: "profile", icon: "👤", label: "Profil" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f0f; color: #f0ede8; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #444; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f0f0f; } ::-webkit-scrollbar-thumb { background: #2a2a2a; }
        ::-webkit-scrollbar-horizontal { height: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0f0f0f", maxWidth: "480px", margin: "0 auto", position: "relative" }}>

        {/* Header */}
        <header style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a", padding: "16px 20px 12px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo size={20} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isPremium && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", color: "#27ae60", border: "1px solid #27ae60", padding: "2px 8px", borderRadius: "10px" }}>PREMIUM</span>}
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "0.06em" }}>
                {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: "16px 16px 0" }}>
          {tab === "news" && <FeedTab isPremium={isPremium} onPremium={() => setIsPremium(true)} />}
          {tab === "blindspot" && (
            <div style={{ paddingBottom: "80px" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#f0ede8", marginBottom: "6px" }}>Angles morts</div>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#555", marginBottom: "20px" }}>Histoires ignorées par un camp politique</p>
              <div style={{ padding: "40px", textAlign: "center", background: "#1a1a1a", borderRadius: "12px", border: "1px solid #2a2a2a" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎯</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#888" }}>Bientôt disponible</div>
                <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#444", marginTop: "8px" }}>Les angles morts apparaîtront ici avec Plus de sources indexées</p>
              </div>
            </div>
          )}
          {tab === "sources" && <SourcesTab />}
          {tab === "profile" && <ProfileTab isPremium={isPremium} onPremium={() => setIsPremium(true)} />}
        </div>

        {/* Bottom nav */}
        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "480px", background: "#0f0f0f", borderTop: "1px solid #1a1a1a", display: "flex", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
          {navItems.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", transition: "opacity 0.15s" }}>
              <span style={{ fontSize: "18px", filter: tab === id ? "none" : "grayscale(1)", opacity: tab === id ? 1 : 0.4 }}>{icon}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.06em", color: tab === id ? "#e74c3c" : "#444", textTransform: "uppercase" }}>{label}</span>
              {tab === id && <div style={{ width: "16px", height: "2px", background: "#e74c3c", borderRadius: "1px" }} />}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
