import { useState, useEffect } from "react";

const API_URL = "https://mediavue-backend-production.up.railway.app";
const FREE_LIMIT = 5;
const STORAGE_KEY = "mv_reads";
const RESET_KEY = "mv_reset";

const SOURCES = [
  { id: "lemonde", name: "Le Monde", orientation: "centre-gauche", orientationScore: 2, factuality: "Élevée", owner: "Xavier Niel / Matthieu Pigasse", ownerType: "milliardaires indépendants", logo: "LM", color: "#2471a3" },
  { id: "lefigaro", name: "Le Figaro", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "Famille Dassault", ownerType: "groupe industriel", logo: "LF", color: "#922b21" },
  { id: "liberation", name: "Libération", orientation: "gauche", orientationScore: 1, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "LIB", color: "#c0392b" },
  { id: "mediapart", name: "Médiapart", orientation: "gauche", orientationScore: 0, factuality: "Élevée", owner: "Indépendant", ownerType: "indépendant", logo: "MP", color: "#e74c3c" },
  { id: "bfmtv", name: "BFMTV", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "BFM", color: "#1a6fa8" },
  { id: "lesechos", name: "Les Échos", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LE", color: "#0e6655" },
  { id: "cnews", name: "CNews", orientation: "droite extrême", orientationScore: 5, factuality: "Mixte", owner: "Vincent Bolloré (Vivendi)", ownerType: "milliardaire conservateur", logo: "CN", color: "#4a4a4a" },
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

const OWNER_TYPE_COLOR = {
  "indépendant": "#1e8449",
  "milliardaires indépendants": "#b7770d",
  "milliardaire télécom": "#c0392b",
  "milliardaire conservateur": "#6c3483",
  "milliardaire luxe": "#1a6fa8",
  "groupe industriel": "#616a6b",
  "service public": "#1e8449",
  "milliardaire étranger": "#d35400",
  "groupe de presse": "#616a6b",
  "groupe catholique": "#6c3483",
  "groupe conservateur": "#616a6b",
};

const ORI_COLOR = {
  "gauche": "#e74c3c",
  "centre-gauche": "#e67e22",
  "centre": "#7f8c8d",
  "centre-droite": "#3498db",
  "droite": "#5d6d7e",
  "droite extrême": "#3d3d3d",
};

function getSource(id) {
  return SOURCES.find(s => s.id === id) || {
    logo: (id || "?").slice(0, 2).toUpperCase(),
    color: "#2a2a2a",
    name: id || "Inconnu",
    orientation: "centre",
    orientationScore: 3,
    owner: "Inconnu",
    ownerType: "inconnu",
  };
}

function isBreaking(story) {
  if (!story.published_at) return false;
  const ageHours = (Date.now() - new Date(story.published_at)) / 3600000;
  return ageHours < 2 && (story.coverage_count || 0) >= 3;
}

function getScore(cov) {
  const g = cov?.gauche || 0, c = cov?.centre || 0, d = cov?.droite || 0;
  const total = g + c + d;
  if (total === 0) return 0;
  return Math.round(([g > 0, c > 0, d > 0].filter(Boolean).length / 3) * 100);
}

function getReadsToday() {
  try {
    const today = new Date().toDateString();
    if (localStorage.getItem(RESET_KEY) !== today) {
      localStorage.setItem(RESET_KEY, today);
      localStorage.setItem(STORAGE_KEY, "0");
      return 0;
    }
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0");
  } catch { return 0; }
}

function incrementReads() {
  try {
    const n = getReadsToday() + 1;
    localStorage.setItem(STORAGE_KEY, String(n));
    return n;
  } catch { return 0; }
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="5" fill="#e74c3c" />
        <rect x="4" y="16" width="5" height="8" rx="1.5" fill="white" />
        <rect x="11" y="10" width="5" height="14" rx="1.5" fill="white" opacity="0.85" />
        <rect x="18" y="13" width="5" height="11" rx="1.5" fill="white" opacity="0.5" />
      </svg>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "900", color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>MédiaVue</span>
    </div>
  );
}

function SrcChip({ id, size = 26 }) {
  const s = getSource(id);
  return (
    <div title={s.name} style={{ width: size, height: size, borderRadius: "5px", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(7, size * 0.28), color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", flexShrink: 0, letterSpacing: "-0.02em" }}>
      {s.logo}
    </div>
  );
}

function BiasBar({ cov }) {
  const g = cov?.gauche || 0, c = cov?.centre || 0, d = cov?.droite || 0;
  const total = g + c + d;
  if (total === 0) return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "0.06em" }}>Données de biais non disponibles</div>
  );
  const gPct = Math.round((g / total) * 100);
  const cPct = Math.round((c / total) * 100);
  const dPct = 100 - gPct - cPct;

  return (
    <div>
      <div style={{ display: "flex", height: "5px", borderRadius: "3px", overflow: "hidden", background: "#222", gap: "2px" }}>
        {g > 0 && <div style={{ width: `${gPct}%`, background: "#e74c3c", borderRadius: "3px 0 0 3px" }} />}
        {c > 0 && <div style={{ width: `${cPct}%`, background: "#555" }} />}
        {d > 0 && <div style={{ width: `${dPct}%`, background: "#3d7ebf", borderRadius: "0 3px 3px 0" }} />}
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "5px" }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: g > 0 ? "#e74c3c" : "#333", display: "flex", alignItems: "center", gap: "3px" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: g > 0 ? "#e74c3c" : "#333", display: "inline-block" }} />
          Gauche {g}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: c > 0 ? "#888" : "#333", display: "flex", alignItems: "center", gap: "3px" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: c > 0 ? "#888" : "#333", display: "inline-block" }} />
          Centre {c}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: d > 0 ? "#3d7ebf" : "#333", display: "flex", alignItems: "center", gap: "3px" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: d > 0 ? "#3d7ebf" : "#333", display: "inline-block" }} />
          Droite {d}
        </span>
      </div>
    </div>
  );
}

function ScorePill({ score }) {
  const { color, label } = score >= 80
    ? { color: "#1e8449", label: "Équilibré" }
    : score >= 40
    ? { color: "#b7770d", label: "Partiel" }
    : { color: "#c0392b", label: "Unilatéral" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.06em", color, border: `1px solid ${color}33`, background: `${color}15`, padding: "2px 8px", borderRadius: "10px" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────

function StoryCard({ story, onClick, locked, onLock }) {
  const cov = story.coverage_by_orientation || {};
  const srcIds = story.source_ids || [];
  const score = getScore(cov);
  const breaking = isBreaking(story);
  const img = story.articles?.[0]?.image_url;
  const hasData = (cov.gauche || 0) + (cov.centre || 0) + (cov.droite || 0) > 0;

  return (
    <div onClick={locked ? onLock : () => onClick(story)}
      style={{ background: "#161616", borderRadius: "14px", overflow: "hidden", cursor: "pointer", marginBottom: "10px", border: "1px solid #222", transition: "border-color 0.2s, transform 0.15s", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.transform = "translateY(0)"; }}>

      {locked && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, #0f0f0f 70%)", zIndex: 2, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "20px", borderRadius: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#e74c3c", color: "white", padding: "8px 18px", borderRadius: "20px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.1em" }}>
            🔒 Passer à Premium
          </div>
        </div>
      )}

      {/* Image banner */}
      {img && (
        <div style={{ height: "140px", overflow: "hidden", position: "relative" }}>
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.parentElement.style.display = "none"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #161616)" }} />
          {breaking && (
            <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", alignItems: "center", gap: "5px", background: "#e74c3c", color: "white", padding: "3px 10px", borderRadius: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", fontWeight: "600" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", display: "inline-block", animation: "pulse 1s infinite" }} />
              BREAKING
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
          {!img && breaking && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", background: "#e74c3c", color: "white", padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.1em" }}>● BREAKING</span>
          )}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>{story.category || "Actualité"}</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333" }}>{story.coverage_count || srcIds.length} sources</span>
            <ScorePill score={score} />
          </div>
        </div>

        {/* Headline */}
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.35", margin: "0 0 8px" }}>{story.title}</h3>

        {/* Summary */}
        {story.summary && (
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#666", lineHeight: "1.55", margin: "0 0 12px" }}>
            {story.summary.slice(0, 110)}{story.summary.length > 110 ? "…" : ""}
          </p>
        )}

        {/* Bias bar */}
        <BiasBar cov={cov} />

        {/* Blindspot */}
        {story.blindspot && (
          <div style={{ marginTop: "10px", padding: "8px 12px", background: "#1a1200", border: "1px solid #332800", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px" }}>⚠️</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#c8960c", letterSpacing: "0.06em" }}>
              ANGLE MORT · {story.blindspot.sides?.join(" & ") || story.blindspot.label}
            </span>
          </div>
        )}

        {/* Source logos */}
        {srcIds.length > 0 && (
          <div style={{ display: "flex", gap: "4px", marginTop: "12px", flexWrap: "wrap" }}>
            {srcIds.slice(0, 8).map(id => <SrcChip key={id} id={id} size={24} />)}
            {srcIds.length > 8 && (
              <div style={{ width: 24, height: 24, borderRadius: "5px", background: "#1f1f1f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#444" }}>
                +{srcIds.length - 8}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Story Modal ───────────────────────────────────────────────────────────────

function StoryModal({ story, onClose }) {
  if (!story) return null;
  const articles = story.articles || [];
  const cov = story.coverage_by_orientation || {};
  const score = getScore(cov);

  // Bucket articles by orientation
  const gauche = articles.filter(a => (getSource(a.source_id)?.orientationScore ?? 3) <= 1);
  const centre = articles.filter(a => { const s = getSource(a.source_id)?.orientationScore ?? 3; return s > 1 && s < 4; });
  const droite = articles.filter(a => (getSource(a.source_id)?.orientationScore ?? 3) >= 4);
  const buckets = [
    { key: "Gauche", color: "#e74c3c", bg: "#1f0808", items: gauche },
    { key: "Centre", color: "#888", bg: "#111", items: centre },
    { key: "Droite", color: "#3d7ebf", bg: "#081020", items: droite },
  ].filter(b => b.items.length > 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", overflowY: "auto", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#141414", maxWidth: "680px", width: "100%", borderRadius: "18px", overflow: "hidden", border: "1px solid #222", marginBottom: "20px" }}>

        {/* Header */}
        <div style={{ padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            {isBreaking(story) && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", background: "#e74c3c", color: "white", padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.1em" }}>● BREAKING</span>}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>{story.category}</span>
            <ScorePill score={score} />
            <button onClick={onClose} style={{ marginLeft: "auto", background: "#222", border: "none", color: "#666", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.3", marginBottom: "10px" }}>{story.title}</h2>
          {story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#777", lineHeight: "1.6", marginBottom: "16px" }}>{story.summary}</p>}
          <BiasBar cov={cov} />
        </div>

        {/* Blindspot banner */}
        {story.blindspot && (
          <div style={{ margin: "0 22px 16px", padding: "12px 14px", background: "#1a1200", border: "1px solid #332800", borderRadius: "10px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#c8960c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>⚠ Angle mort détecté</div>
            <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#a07820", margin: 0, lineHeight: "1.5" }}>{story.blindspot.label}</p>
          </div>
        )}

        {/* Side by side */}
        {buckets.length > 0 && (
          <div style={{ padding: "0 22px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: "14px" }}>Vue côte à côte</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${buckets.length}, 1fr)`, gap: "10px" }}>
              {buckets.map(({ key, color, bg, items }) => (
                <div key={key} style={{ background: bg, borderRadius: "10px", padding: "12px", border: `1px solid ${color}22` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", paddingBottom: "8px", borderBottom: `1px solid ${color}33` }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "600" }}>{key}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", marginLeft: "auto" }}>{items.length}</span>
                  </div>
                  {items.slice(0, 3).map((a, i) => {
                    const src = getSource(a.source_id);
                    return (
                      <div key={i} style={{ marginBottom: i < items.length - 1 ? "10px" : 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                          <SrcChip id={a.source_id} size={18} />
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#555" }}>{src.name}</span>
                        </div>
                        <a href={a.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: "#c8c0b4", textDecoration: "none", lineHeight: "1.4", display: "block" }}
                          onMouseEnter={e => e.target.style.color = color}
                          onMouseLeave={e => e.target.style.color = "#c8c0b4"}>
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

        {/* All articles */}
        {articles.length > 0 && (
          <div style={{ padding: "0 22px 22px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: "14px" }}>
              Tous les articles · {articles.length}
            </div>
            {articles.map((a, i) => {
              const src = getSource(a.source_id);
              const oriColor = ORI_COLOR[src.orientation] || "#666";
              return (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: "12px", borderBottom: i < articles.length - 1 ? "1px solid #1a1a1a" : "none", marginBottom: "12px" }}>
                  <SrcChip id={a.source_id} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#777" }}>{src.name}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: oriColor }}>● {src.orientation}</span>
                    </div>
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#c8c0b4", textDecoration: "none", lineHeight: "1.4", display: "block" }}
                      onMouseEnter={e => e.target.style.color = "#4a90d9"}
                      onMouseLeave={e => e.target.style.color = "#c8c0b4"}>
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

// ── Paywall ───────────────────────────────────────────────────────────────────

function PaywallModal({ onClose, onPremium }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#141414", maxWidth: "400px", width: "100%", borderRadius: "20px", overflow: "hidden", border: "1px solid #222" }}>
        <div style={{ padding: "32px 28px 24px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>
          <Logo />
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.15em", color: "#444", marginTop: "20px", marginBottom: "10px", textTransform: "uppercase" }}>Limite quotidienne atteinte</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.25" }}>Vous avez lu vos {FREE_LIMIT} histoires gratuites d'aujourd'hui</h2>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#555", marginTop: "10px" }}>Revenez demain, ou passez à Premium pour un accès illimité.</p>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {[
            { label: "Mensuel", price: "4,99€", sub: "par mois", highlight: false },
            { label: "Annuel", price: "49€", sub: "par an · −18%", highlight: true },
          ].map(({ label, price, sub, highlight }) => (
            <button key={label} onClick={onPremium} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "15px 18px", marginBottom: "8px", border: `1.5px solid ${highlight ? "#e74c3c" : "#222"}`, background: highlight ? "#1f0808" : "transparent", cursor: "pointer", borderRadius: "10px" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8" }}>{label}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: highlight ? "#e74c3c" : "#f0ede8" }}>{price}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#444" }}>{sub}</div>
              </div>
            </button>
          ))}
          <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", color: "#333", marginTop: "4px" }}>
            Revenir demain
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function FeedTab({ isPremium, onPremium }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [reads, setReads] = useState(getReadsToday);

  useEffect(() => {
    setLoading(true);
    const cat = category !== "Tout" ? `&category=${encodeURIComponent(category)}` : "";
    fetch(`${API_URL}/api/stories?limit=50${cat}`)
      .then(r => r.json())
      .then(d => { setStories(d.stories || []); setLoading(false); })
      .catch(() => { setError("Impossible de charger. Réessayez."); setLoading(false); });
  }, [category]);

  const filtered = stories.filter(s =>
    !search.trim() || s.title.toLowerCase().includes(search.toLowerCase()) || (s.summary || "").toLowerCase().includes(search.toLowerCase())
  );

  const breaking = filtered.filter(isBreaking);
  const regular = filtered.filter(s => !isBreaking(s));
  const readsLeft = Math.max(0, FREE_LIMIT - reads);

  const handleClick = async (story) => {
    if (!isPremium && reads >= FREE_LIMIT) { setShowPaywall(true); return; }
    setSelected(story);
    setReads(incrementReads());
    if (!story.articles && story.id) {
      try {
        const res = await fetch(`${API_URL}/api/stories/${story.id}`);
        setSelected(await res.json());
      } catch {}
    }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: "14px" }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une histoire…"
          style={{ width: "100%", padding: "11px 13px 11px 38px", border: "1px solid #222", background: "#161616", fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#f0ede8", borderRadius: "10px", outline: "none" }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#444", fontSize: "18px" }}>×</button>}
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginBottom: "14px", paddingBottom: "2px" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.06em", padding: "5px 12px", border: "1px solid", borderColor: category === cat ? "#e74c3c" : "#222", background: category === cat ? "#1f0808" : "#161616", color: category === cat ? "#e74c3c" : "#444", cursor: "pointer", borderRadius: "20px", whiteSpace: "nowrap", transition: "all 0.15s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Reads counter */}
      {!isPremium && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#161616", borderRadius: "8px", marginBottom: "14px", border: "1px solid #1f1f1f" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: FREE_LIMIT }).map((_, i) => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i < reads ? "#e74c3c" : "#2a2a2a" }} />
            ))}
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: readsLeft > 0 ? "#444" : "#e74c3c", letterSpacing: "0.06em" }}>
            {readsLeft > 0 ? `${readsLeft} lecture${readsLeft > 1 ? "s" : ""} gratuite${readsLeft > 1 ? "s" : ""} restante${readsLeft > 1 ? "s" : ""}` : "Limite atteinte"}
          </span>
          <button onClick={onPremium} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", background: "#e74c3c", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}>Premium</button>
        </div>
      )}

      {loading && <div style={{ width: "22px", height: "22px", border: "2px solid #1f1f1f", borderTopColor: "#e74c3c", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "60px auto" }} />}
      {error && <div style={{ padding: "14px 16px", background: "#1f0808", border: "1px solid #3d1010", borderRadius: "10px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#e74c3c" }}>{error}</div>}

      {/* Breaking */}
      {!loading && breaking.length > 0 && (
        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", display: "inline-block" }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#e74c3c" }}>Breaking News</span>
          </div>
          {breaking.map((s, i) => <StoryCard key={s.id || i} story={s} onClick={handleClick} locked={!isPremium && reads >= FREE_LIMIT} onLock={() => setShowPaywall(true)} />)}
          <div style={{ height: "1px", background: "#1a1a1a", margin: "16px 0" }} />
        </div>
      )}

      {/* Regular */}
      {!loading && !error && regular.map((s, i) => (
        <div key={s.id || i} style={{ animation: `fadeUp 0.3s ease ${Math.min(i, 8) * 0.035}s both` }}>
          <StoryCard story={s} onClick={handleClick} locked={!isPremium && (reads + (breaking.length > 0 ? breaking.length : 0) + i) >= FREE_LIMIT} onLock={() => setShowPaywall(true)} />
        </div>
      ))}

      {!loading && !error && filtered.length === 0 && search && (
        <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "'Source Serif 4', serif", fontSize: "15px", color: "#333" }}>Aucun résultat pour «{search}»</div>
      )}

      {selected && <StoryModal story={selected} onClose={() => setSelected(null)} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onPremium={() => { onPremium(); setShowPaywall(false); }} />}
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
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {["all", "gauche", "centre", "droite"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.06em", padding: "5px 12px", border: "1px solid", borderColor: filter === f ? "#e74c3c" : "#222", background: filter === f ? "#1f0808" : "#161616", color: filter === f ? "#e74c3c" : "#444", cursor: "pointer", borderRadius: "20px" }}>
            {f === "all" ? "Tous" : f}
          </button>
        ))}
      </div>
      {filtered.map(src => (
        <div key={src.id} style={{ background: "#161616", border: "1px solid #222", borderRadius: "12px", padding: "14px 16px", marginBottom: "8px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <SrcChip id={src.id} size={42} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8" }}>{src.name}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: ORI_COLOR[src.orientation] || "#888" }}>● {src.orientation}</span>
            </div>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Fiabilité</div>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: src.factuality === "Élevée" ? "#1e8449" : src.factuality === "Mixte" ? "#b7770d" : "#c0392b" }}>{src.factuality}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Propriétaire</div>
                <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: "#666" }}>{src.owner}</div>
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
      <div style={{ padding: "12px 14px", background: "#1a1200", border: "1px solid #332800", borderRadius: "10px", marginBottom: "14px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#c8960c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Pourquoi c'est important</div>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#8a6820", lineHeight: "1.55", margin: 0 }}>4 milliardaires contrôlent l'essentiel des médias français. Connaître le propriétaire, c'est comprendre les biais.</p>
      </div>
      {groups.map((g, i) => (
        <div key={i} style={{ background: "#161616", border: "1px solid #222", borderRadius: "12px", overflow: "hidden", marginBottom: "8px" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700", color: "#f0ede8", marginBottom: "4px" }}>{g.owner}</div>
              <span style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "white", background: OWNER_TYPE_COLOR[g.type] || "#222", padding: "2px 8px", borderRadius: "3px" }}>{g.type}</span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#333" }}>{g.sources.length} titre{g.sources.length > 1 ? "s" : ""}</span>
          </div>
          <div style={{ padding: "10px 16px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {g.sources.map(src => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 8px", background: "#0f0f0f", borderRadius: "6px", border: "1px solid #1a1a1a" }}>
                <SrcChip id={src.id} size={18} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#666" }}>{src.name}</span>
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
      <div style={{ background: "#161616", border: "1px solid #222", borderRadius: "16px", padding: "24px", marginBottom: "12px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1f1f1f", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "22px" }}>👤</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "#f0ede8", marginBottom: "4px" }}>Visiteur</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: isPremium ? "#1e8449" : "#444", letterSpacing: "0.1em" }}>{isPremium ? "● COMPTE PREMIUM" : "Compte gratuit"}</div>
      </div>

      {!isPremium && (
        <div style={{ background: "#1f0808", border: "1px solid #3d1010", borderRadius: "12px", padding: "18px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#f0ede8", marginBottom: "6px" }}>Passez à Premium</div>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#666", lineHeight: "1.5", marginBottom: "14px" }}>Lectures illimitées, données de propriété, rapport d'angle mort personnel.</p>
          <button onClick={onPremium} style={{ width: "100%", padding: "13px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Essayer Premium</button>
        </div>
      )}

      <div style={{ background: "#161616", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
        {[
          { icon: "📊", label: "Lectures aujourd'hui", value: `${getReadsToday()}/${isPremium ? "∞" : FREE_LIMIT}` },
          { icon: "🎯", label: "Mon angle mort", value: isPremium ? "Voir" : "Premium" },
          { icon: "🔔", label: "Alertes", value: "Bientôt" },
          { icon: "📧", label: "Digest hebdo", value: "Bientôt" },
        ].map(({ icon, label, value }, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < 3 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>{icon}</span>
              <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#777" }}>{label}</span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: value === "Premium" ? "#e74c3c" : "#333" }}>{value}</span>
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
        body { background: #0f0f0f; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder { color: #333; }
        ::-webkit-scrollbar { width: 3px; height: 0; }
        ::-webkit-scrollbar-thumb { background: #222; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0f0f0f", maxWidth: "480px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ background: "#0f0f0f", borderBottom: "1px solid #161616", padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isPremium && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#1e8449", border: "1px solid #1e8449", padding: "2px 8px", borderRadius: "10px", letterSpacing: "0.08em" }}>PREMIUM</span>}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#2a2a2a", letterSpacing: "0.06em" }}>
                {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: "14px 14px 0" }}>
          {tab === "news" && <FeedTab isPremium={isPremium} onPremium={() => setIsPremium(true)} />}
          {tab === "blindspot" && (
            <div style={{ paddingBottom: "80px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#f0ede8", marginBottom: "6px" }}>Angles morts</h2>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#444", marginBottom: "20px" }}>Histoires ignorées par un camp politique</p>
              <div style={{ padding: "36px 20px", textAlign: "center", background: "#161616", borderRadius: "14px", border: "1px solid #222" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>🎯</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#444" }}>Bientôt disponible</div>
                <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: "#2a2a2a", marginTop: "6px" }}>Indexation de plus de sources en cours</p>
              </div>
            </div>
          )}
          {tab === "sources" && <SourcesTab />}
          {tab === "profile" && <ProfileTab isPremium={isPremium} onPremium={() => setIsPremium(true)} />}
        </div>

        {/* Bottom nav */}
        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "480px", background: "#0a0a0a", borderTop: "1px solid #161616", display: "flex", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom, 6px)" }}>
          {navItems.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 0 8px", background: "transparent", border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: "17px", filter: tab === id ? "none" : "grayscale(1)", opacity: tab === id ? 1 : 0.3, transition: "all 0.15s" }}>{icon}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", letterSpacing: "0.08em", color: tab === id ? "#e74c3c" : "#333", textTransform: "uppercase", transition: "color 0.15s" }}>{label}</span>
              {tab === id && <div style={{ width: "14px", height: "2px", background: "#e74c3c", borderRadius: "1px", marginTop: "1px" }} />}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
