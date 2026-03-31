import { useState, useEffect, useRef } from "react";

const API_URL = "https://mediavue-backend-production.up.railway.app";

const FREE_STORY_LIMIT = 5;

const SOURCES = [
  { id: "lemonde", name: "Le Monde", orientation: "centre-gauche", orientationScore: 2, factuality: "Élevée", owner: "Xavier Niel / Matthieu Pigasse", ownerType: "milliardaires indépendants", logo: "LM", color: "#1a1a2e" },
  { id: "lefigaro", name: "Le Figaro", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "Famille Dassault", ownerType: "groupe industriel", logo: "LF", color: "#8b1a1a" },
  { id: "liberation", name: "Libération", orientation: "gauche", orientationScore: 1, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "LIB", color: "#c0392b" },
  { id: "mediapart", name: "Médiapart", orientation: "gauche", orientationScore: 0, factuality: "Élevée", owner: "Indépendant", ownerType: "indépendant", logo: "MP", color: "#e74c3c" },
  { id: "bfmtv", name: "BFMTV", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "BFM", color: "#2980b9" },
  { id: "lesechos", name: "Les Échos", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LE", color: "#16a085" },
  { id: "cnews", name: "CNews", orientation: "droite extrême", orientationScore: 5, factuality: "Mixte", owner: "Vincent Bolloré (Vivendi)", ownerType: "milliardaire conservateur", logo: "CN", color: "#2c3e50" },
  { id: "franceinfo", name: "France Info", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Télévisions (public)", ownerType: "service public", logo: "FI", color: "#e67e22" },
  { id: "france24", name: "France 24", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Médias Monde (public)", ownerType: "service public", logo: "F24", color: "#16a085" },
  { id: "leparisien", name: "Le Parisien", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LP", color: "#d35400" },
  { id: "blast", name: "Blast", orientation: "gauche", orientationScore: 0, factuality: "Moyenne", owner: "Indépendant", ownerType: "indépendant", logo: "BL", color: "#8e44ad" },
  { id: "marianne", name: "Marianne", orientation: "centre-gauche", orientationScore: 2, factuality: "Moyenne", owner: "Czech Media Invest", ownerType: "milliardaire étranger", logo: "MAR", color: "#2980b9" },
  { id: "lepoint", name: "Le Point", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "François Pinault", ownerType: "milliardaire luxe", logo: "PT", color: "#2c3e50" },
  { id: "valeursactuelles", name: "Valeurs Actuelles", orientation: "droite extrême", orientationScore: 5, factuality: "Faible", owner: "Groupe Valmonde", ownerType: "groupe conservateur", logo: "VA", color: "#7f8c8d" },
  { id: "20minutes", name: "20 Minutes", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Rossel", ownerType: "groupe de presse", logo: "20M", color: "#27ae60" },
  { id: "ouestfrance", name: "Ouest-France", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Association SIPA", ownerType: "indépendant", logo: "OF", color: "#2c3e50" },
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
  "milliardaire luxe": "#2980b9",
  "groupe industriel": "#7f8c8d",
  "service public": "#27ae60",
  "milliardaire étranger": "#e67e22",
  "groupe de presse": "#95a5a6",
  "groupe catholique": "#8e44ad",
  "groupe conservateur": "#7f8c8d",
};

const ORIENTATION_COLOR = {
  "gauche": "#e74c3c",
  "centre-gauche": "#e67e22",
  "centre": "#95a5a6",
  "centre-droite": "#3498db",
  "droite": "#2c3e50",
  "droite extrême": "#1a252f",
};

function getSourceMeta(id) {
  return SOURCES.find(s => s.id === id) || { logo: id?.slice(0, 2).toUpperCase(), color: "#888", name: id, orientation: "centre", orientationScore: 3 };
}

function getCoverageScore(coverage) {
  const g = coverage?.gauche || 0;
  const c = coverage?.centre || 0;
  const d = coverage?.droite || 0;
  const total = g + c + d;
  if (total === 0) return 0;
  const sides = [g > 0, c > 0, d > 0].filter(Boolean).length;
  return Math.round((sides / 3) * 100);
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? "#27ae60" : score >= 50 ? "#f39c12" : "#e74c3c";
  const label = score >= 80 ? "Équilibré" : score >= 50 ? "Partiel" : "Biaisé";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", fontWeight: "600", color }}>
        {score}
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function BiasBar({ coverage, size = "normal" }) {
  const g = coverage?.gauche || 0;
  const c = coverage?.centre || 0;
  const d = coverage?.droite || 0;
  const total = g + c + d;
  if (total === 0) return null;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", borderRadius: "4px", overflow: "hidden", height: size === "small" ? "6px" : "8px", gap: "1px", background: "#f0ede8" }}>
        <div style={{ width: `${(g / total) * 100}%`, background: "#e74c3c", transition: "width 0.6s ease" }} />
        <div style={{ width: `${(c / total) * 100}%`, background: "#bdc3c7", transition: "width 0.6s ease" }} />
        <div style={{ width: `${(d / total) * 100}%`, background: "#2c3e50", transition: "width 0.6s ease" }} />
      </div>
      {size !== "small" && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#888" }}>
          <span style={{ color: "#e74c3c" }}>GAUCHE {g}</span>
          <span>CENTRE {c}</span>
          <span style={{ color: "#2c3e50" }}>DROITE {d}</span>
        </div>
      )}
    </div>
  );
}

function OrientationDot({ orientation }) {
  const color = ORIENTATION_COLOR[orientation] || "#999";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color, textTransform: "uppercase" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {orientation}
    </span>
  );
}

function SourceLogo({ id, size = 28 }) {
  const src = getSourceMeta(id);
  return (
    <div title={src.name} style={{ width: size, height: size, borderRadius: "3px", background: src.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", flexShrink: 0 }}>
      {src.logo}
    </div>
  );
}

function PaywallModal({ onClose, onSubscribe }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fdfaf6", maxWidth: "480px", width: "100%", borderRadius: "4px", overflow: "hidden", boxShadow: "0 30px 100px rgba(0,0,0,0.4)" }}>
        <div style={{ background: "#1a1714", padding: "32px", textAlign: "center" }}>
          <div style={{ marginBottom: "16px" }}>
            <MédiaVueLogo dark />
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", marginBottom: "8px" }}>Accès limité</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#fdfaf6", lineHeight: "1.2" }}>Vous avez lu 5 histoires gratuites</h2>
        </div>
        <div style={{ padding: "32px" }}>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "15px", color: "#5a5248", lineHeight: "1.6", marginBottom: "24px" }}>
            MédiaVue Premium vous donne accès illimité aux histoires, aux données de propriété, et à votre rapport d'angle mort personnel.
          </p>
          <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
            {[
              { plan: "Mensuel", price: "4,99€", period: "/mois" },
              { plan: "Annuel", price: "49€", period: "/an", badge: "−18%" },
            ].map(({ plan, price, period, badge }) => (
              <button key={plan} onClick={onSubscribe} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: "1.5px solid #1a1714", background: "transparent", cursor: "pointer", borderRadius: "3px", fontFamily: "'Source Serif 4', serif" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600", color: "#1a1714" }}>{plan}</span>
                  {badge && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "#27ae60", color: "white", padding: "2px 8px", borderRadius: "2px" }}>{badge}</span>}
                </div>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#1a1714" }}>{price}<span style={{ fontSize: "12px", fontWeight: "400", color: "#888" }}>{period}</span></span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", border: "1px solid #d0c9bf", background: "transparent", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", borderRadius: "3px" }}>Continuer gratuitement</button>
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#b0a898", textAlign: "center", marginTop: "16px", letterSpacing: "0.04em" }}>Aucune publicité · Aucun actionnaire · 100% indépendant</p>
        </div>
      </div>
    </div>
  );
}

function MédiaVueLogo({ dark = false, size = "normal" }) {
  const textColor = dark ? "#fdfaf6" : "#1a1714";
  const accentColor = "#e74c3c";
  const fs = size === "large" ? 32 : 24;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <svg width={fs} height={fs} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="4" fill={dark ? "#fdfaf6" : "#1a1714"} />
        <rect x="6" y="14" width="6" height="12" rx="1" fill={accentColor} />
        <rect x="13" y="8" width="6" height="18" rx="1" fill={dark ? "#1a1714" : "#fdfaf6"} opacity="0.7" />
        <rect x="20" y="11" width="6" height="15" rx="1" fill={accentColor} opacity="0.5" />
      </svg>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: fs * 1.1, fontWeight: "900", color: textColor, letterSpacing: "-0.03em", lineHeight: 1 }}>MédiaVue</span>
    </div>
  );
}

function SideBySideView({ articles }) {
  const gauche = articles.filter(a => (a.orientationScore || getSourceMeta(a.source_id)?.orientationScore || 3) <= 1);
  const centre = articles.filter(a => { const s = a.orientationScore || getSourceMeta(a.source_id)?.orientationScore || 3; return s > 1 && s < 4; });
  const droite = articles.filter(a => (a.orientationScore || getSourceMeta(a.source_id)?.orientationScore || 3) >= 4);

  const cols = [
    { label: "Gauche", color: "#e74c3c", items: gauche },
    { label: "Centre", color: "#95a5a6", items: centre },
    { label: "Droite", color: "#2c3e50", items: droite },
  ].filter(c => c.items.length > 0);

  if (cols.length === 0) return null;

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", marginBottom: "16px" }}>Vue côte à côte</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: "12px" }}>
        {cols.map(col => (
          <div key={col.label}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: col.color, borderBottom: `2px solid ${col.color}`, paddingBottom: "6px", marginBottom: "12px" }}>{col.label}</div>
            {col.items.map((a, i) => {
              const src = getSourceMeta(a.source_id || a.sourceId);
              return (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <SourceLogo id={a.source_id || a.sourceId} size={20} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#888" }}>{src.name}</span>
                  </div>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#1a1714", textDecoration: "none", lineHeight: "1.4", display: "block" }}
                    onMouseEnter={e => e.target.style.color = "#3d6b9e"}
                    onMouseLeave={e => e.target.style.color = "#1a1714"}>
                    {a.title}
                  </a>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryModal({ story, onClose, isPremium }) {
  if (!story) return null;
  const articles = story.articles || [];
  const coverage = story.coverage_by_orientation || story.coverageByOrientation || {};
  const blindspot = story.blindspot;
  const score = getCoverageScore(coverage);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.75)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 20px", overflowY: "auto", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fdfaf6", maxWidth: "720px", width: "100%", borderRadius: "4px", overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ borderBottom: "3px solid #1a1714", padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", background: "#f5f1eb", padding: "2px 8px" }}>{story.category || "Actualité"}</span>
            <ScoreBadge score={score} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714", lineHeight: "1.3", margin: "0 0 16px" }}>{story.title}</h2>
          {story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "15px", color: "#5a5248", lineHeight: "1.65", margin: "0 0 20px" }}>{story.summary}</p>}
          <BiasBar coverage={coverage} />
        </div>

        {/* Blindspot */}
        {blindspot && (
          <div style={{ padding: "20px 32px", background: "#fef9ec", borderBottom: "1px solid #f0e4b0" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", color: "#8a6d1a", textTransform: "uppercase", marginBottom: "6px" }}>⚠ Angle mort détecté</div>
            <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#6b5a1e", lineHeight: "1.55", margin: 0 }}>{blindspot.label} — certains camps ignorent cette histoire.</p>
          </div>
        )}

        {/* Side by side */}
        {articles.length > 0 && (
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #e8e4dc" }}>
            <SideBySideView articles={articles} />
          </div>
        )}

        {/* All articles */}
        {articles.length > 0 && (
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #e8e4dc" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", marginBottom: "16px" }}>Tous les articles</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {articles.map((article, i) => {
                const src = getSourceMeta(article.source_id || article.sourceId);
                return (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: "14px", borderBottom: i < articles.length - 1 ? "1px solid #f0ede8" : "none" }}>
                    <SourceLogo id={article.source_id || article.sourceId} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#1a1714", fontWeight: "600" }}>{src.name}</span>
                        <OrientationDot orientation={src.orientation} />
                      </div>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#3d6b9e", textDecoration: "none", lineHeight: "1.4" }}>{article.title}</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ownership section (premium) */}
        {isPremium && (
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #e8e4dc", background: "#fdfaf6" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", marginBottom: "14px" }}>Qui possède ces sources ?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[...new Map((story.source_ids || story.sourceIds || []).map(id => { const s = getSourceMeta(id); return [s.owner, s]; })).values()].map((src, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <SourceLogo id={src.id} size={24} />
                  <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#3a342c" }}>{src.name}</span>
                  <span style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "white", background: OWNER_TYPE_COLOR[src.ownerType] || "#999", padding: "2px 8px", borderRadius: "2px", marginLeft: "auto" }}>{src.owner}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "20px 32px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#1a1714", color: "white", border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: "2px" }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story, onClick, index, isPremium, onPaywall }) {
  const coverage = story.coverage_by_orientation || story.coverageByOrientation || {};
  const sourceIds = story.source_ids || story.sourceIds || [];
  const blindspot = story.blindspot;
  const score = getCoverageScore(coverage);
  const isLocked = !isPremium && index >= FREE_STORY_LIMIT;

  const handleClick = () => {
    if (isLocked) { onPaywall(); return; }
    onClick(story);
  };

  return (
    <article onClick={handleClick} style={{ borderBottom: "1px solid #e8e4dc", padding: "24px 0", cursor: "pointer", transition: "padding-left 0.2s", position: "relative", opacity: isLocked ? 0.6 : 1 }}
      onMouseEnter={e => !isLocked && (e.currentTarget.style.paddingLeft = "8px")}
      onMouseLeave={e => (e.currentTarget.style.paddingLeft = "0")}>

      {isLocked && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, background: "linear-gradient(to bottom, transparent, #f5f1eb)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#1a1714", color: "#fdfaf6", padding: "8px 16px", borderRadius: "20px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.08em" }}>
            🔒 Premium
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", background: "#f5f1eb", padding: "2px 8px", borderRadius: "2px" }}>{story.category || "Actualité"}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
          <ScoreBadge score={score} />
          <span style={{ fontSize: "10px", color: "#b0a898", fontFamily: "'IBM Plex Mono', monospace" }}>{story.coverage_count || sourceIds.length} sources</span>
        </div>
      </div>

      {/* Image */}
      {story.articles?.[0]?.image_url && (
        <div style={{ marginBottom: "12px", borderRadius: "3px", overflow: "hidden", height: "160px" }}>
          <img src={story.articles[0].image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
        </div>
      )}

      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "19px", fontWeight: "700", color: "#1a1714", lineHeight: "1.35", margin: "0 0 10px" }}>{story.title}</h2>
      {story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#5a5248", lineHeight: "1.6", margin: "0 0 14px" }}>{story.summary.slice(0, 160)}{story.summary.length > 160 ? "…" : ""}</p>}

      <BiasBar coverage={coverage} />

      {blindspot && (
        <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef9ec", border: "1px solid #f0e4b0", borderRadius: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⚠️</span>
          <span style={{ fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace", color: "#8a6d1a", letterSpacing: "0.04em" }}>{blindspot.label}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: "5px", marginTop: "12px", flexWrap: "wrap" }}>
        {sourceIds.slice(0, 7).map(id => <SourceLogo key={id} id={id} />)}
        {sourceIds.length > 7 && <div style={{ width: "28px", height: "28px", borderRadius: "3px", background: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#888" }}>+{sourceIds.length - 7}</div>}
      </div>
    </article>
  );
}

export default function MédiaVue() {
  const [activeTab, setActiveTab] = useState("feed");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (activeTab !== "feed") return;
    setLoading(true);
    setError(null);
    const cat = category !== "Tout" ? `&category=${category}` : "";
    fetch(`${API_URL}/api/stories?limit=50${cat}`)
      .then(r => r.json())
      .then(data => { setStories(data.stories || []); setLoading(false); })
      .catch(() => { setError("Impossible de charger les articles. Réessayez."); setLoading(false); });
  }, [activeTab, category]);

  const filteredStories = stories.filter(s =>
    search.trim() === "" || s.title.toLowerCase().includes(search.toLowerCase()) || (s.summary || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleStoryClick = async (story) => {
    setSelectedStory(story);
    if (!story.articles && story.id) {
      try {
        const res = await fetch(`${API_URL}/api/stories/${story.id}`);
        const full = await res.json();
        setSelectedStory(full);
      } catch {}
    }
  };

  const blindspotStory = stories.find(s => s.blindspot);

  const tabs = [
    { id: "feed", label: "À la une" },
    { id: "sources", label: "Sources" },
    { id: "ownership", label: "Propriétaires" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .story-in { animation: fadeUp 0.4s ease both; }
        .spinner { width: 24px; height: 24px; border: 2px solid #e8e4dc; border-top-color: #1a1714; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 60px auto; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f5f1eb; } ::-webkit-scrollbar-thumb { background: #d0c9bf; border-radius: 3px; }
        @media (max-width: 600px) { .story-grid { padding: 0 16px !important; } .modal-inner { padding: 20px !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f1eb", fontFamily: "'Source Serif 4', Georgia, serif" }}>

        {/* Header */}
        <header style={{ borderBottom: "3px solid #1a1714", background: "#fdfaf6", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
              <MédiaVueLogo />
              <button onClick={() => isPremium ? setIsPremium(false) : setShowPaywall(true)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", background: isPremium ? "#27ae60" : "#1a1714", color: "white", border: "none", padding: "8px 16px", cursor: "pointer", borderRadius: "2px" }}>
                {isPremium ? "✓ Premium" : "Devenir Premium"}
              </button>
            </div>
            <nav style={{ display: "flex" }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 18px", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? "2px solid #1a1714" : "2px solid transparent", color: activeTab === tab.id ? "#1a1714" : "#9b8f7a", cursor: "pointer", marginBottom: "-1px" }}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 20px" }} className="story-grid">

          {activeTab === "feed" && (
            <div>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9b8f7a", fontSize: "14px" }}>🔍</span>
                <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une histoire…" style={{ width: "100%", padding: "12px 14px 12px 40px", border: "1px solid #d0c9bf", background: "#fdfaf6", fontFamily: "'Source Serif 4', serif", fontSize: "15px", color: "#1a1714", borderRadius: "3px" }} />
                {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9b8f7a", fontSize: "16px" }}>×</button>}
              </div>

              {/* Category filters */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px", border: "1px solid", borderColor: category === cat ? "#1a1714" : "#d0c9bf", background: category === cat ? "#1a1714" : "transparent", color: category === cat ? "white" : "#666", cursor: "pointer", borderRadius: "20px", transition: "all 0.15s" }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Feed header */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #e8e4dc" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714" }}>À la une</h2>
                {!loading && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9b8f7a", letterSpacing: "0.08em" }}>{filteredStories.length} HISTOIRES · EN DIRECT</span>}
                {!isPremium && <span style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9b8f7a" }}>{Math.max(0, FREE_STORY_LIMIT - Math.min(filteredStories.length, FREE_STORY_LIMIT))} gratuites restantes</span>}
              </div>

              {loading && <div className="spinner" />}
              {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", padding: "16px 20px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#c0392b" }}>{error}</div>}

              {/* Blindspot alert */}
              {!loading && !error && blindspotStory && (
                <div style={{ background: "white", border: "1px solid #e8e4dc", borderLeft: "3px solid #e74c3c", padding: "16px 20px", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c0392b", marginBottom: "6px" }}>⚠ Angle mort du jour</div>
                  <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#3a342c", lineHeight: "1.55" }}>
                    <strong>«{blindspotStory.title.slice(0, 70)}»</strong> — {blindspotStory.blindspot?.label}
                  </p>
                </div>
              )}

              {/* Stories */}
              {!loading && !error && filteredStories.map((story, i) => (
                <div key={story.id || i} className="story-in" style={{ animationDelay: `${Math.min(i, 10) * 0.04}s` }}>
                  <StoryCard story={story} onClick={handleStoryClick} index={i} isPremium={isPremium} onPaywall={() => setShowPaywall(true)} />
                </div>
              ))}

              {!loading && !error && filteredStories.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "'Source Serif 4', serif", color: "#9b8f7a" }}>Aucune histoire trouvée pour «{search}»</div>
              )}
            </div>
          )}

          {activeTab === "sources" && (
            <div>
              <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e8e4dc" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714", marginBottom: "6px" }}>Sources référencées</h2>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#9b8f7a", letterSpacing: "0.06em" }}>{SOURCES.length} MÉDIAS · ÉVALUÉS PAR NOTRE MÉTHODOLOGIE</p>
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                {SOURCES.map(src => (
                  <div key={src.id} style={{ background: "white", border: "1px solid #e8e4dc", borderRadius: "4px", padding: "18px 20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <SourceLogo id={src.id} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#1a1714" }}>{src.name}</span>
                        <OrientationDot orientation={src.orientation} />
                      </div>
                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#9b8f7a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Fiabilité</div>
                          <div style={{ fontSize: "13px", color: src.factuality === "Élevée" ? "#27ae60" : src.factuality === "Mixte" ? "#f39c12" : "#e74c3c" }}>{src.factuality}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#9b8f7a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Propriétaire</div>
                          <div style={{ fontSize: "13px", color: "#3a342c" }}>{src.owner}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#9b8f7a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Type</div>
                          <span style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "white", background: OWNER_TYPE_COLOR[src.ownerType] || "#999", padding: "2px 8px", borderRadius: "2px" }}>{src.ownerType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ownership" && (
            <div>
              <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e8e4dc" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714", marginBottom: "6px" }}>Qui possède quoi ?</h2>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#9b8f7a", letterSpacing: "0.06em" }}>TRANSPARENCE SUR LA PROPRIÉTÉ DES MÉDIAS FRANÇAIS</p>
              </div>
              <div style={{ background: "#fef9ec", border: "1px solid #f0e4b0", borderRadius: "4px", padding: "16px 20px", marginBottom: "20px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a6d1a", marginBottom: "6px" }}>Pourquoi c'est important</div>
                <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#5a4a1e", lineHeight: "1.6", margin: 0 }}>En France, une poignée de milliardaires contrôlent l'essentiel des médias d'information. Connaître le propriétaire d'un titre, c'est mieux comprendre ses lignes éditoriales.</p>
              </div>
              {Object.values(SOURCES.reduce((acc, src) => {
                if (!acc[src.owner]) acc[src.owner] = { owner: src.owner, type: src.ownerType, sources: [] };
                acc[src.owner].sources.push(src);
                return acc;
              }, {})).map((group, i) => (
                <div key={i} style={{ background: "white", border: "1px solid #e8e4dc", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e4dc", background: "#fdfaf6", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#1a1714", marginBottom: "4px" }}>{group.owner}</div>
                      <span style={{ fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", color: "white", background: OWNER_TYPE_COLOR[group.type] || "#999", padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase" }}>{group.type}</span>
                    </div>
                    <div style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#9b8f7a" }}>{group.sources.length} titre{group.sources.length > 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ padding: "12px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {group.sources.map(src => (
                      <div key={src.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", border: "1px solid #e8e4dc", borderRadius: "3px" }}>
                        <SourceLogo id={src.id} size={24} />
                        <div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#1a1714", fontWeight: "600" }}>{src.name}</div>
                          <OrientationDot orientation={src.orientation} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer style={{ borderTop: "1px solid #e8e4dc", padding: "24px 20px", textAlign: "center", background: "#fdfaf6" }}>
          <div style={{ marginBottom: "6px" }}><MédiaVueLogo /></div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9b8f7a", letterSpacing: "0.08em", textTransform: "uppercase" }}>Aucune publicité · Aucun actionnaire · 100% indépendant</div>
        </footer>
      </div>

      {selectedStory && <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} isPremium={isPremium} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} onSubscribe={() => { setIsPremium(true); setShowPaywall(false); }} />}
    </>
  );
}
