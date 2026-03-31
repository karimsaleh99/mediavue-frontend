import { useState, useEffect } from "react";

const API_URL = "https://mediavue-backend-production.up.railway.app";

const SOURCES = [
  { id: "lemonde", name: "Le Monde", orientation: "centre-gauche", orientationScore: 2, factuality: "Élevée", owner: "Xavier Niel / Matthieu Pigasse", ownerType: "milliardaires indépendants", logo: "LM", color: "#1a1a2e" },
  { id: "lefigaro", name: "Le Figaro", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "Famille Dassault (SOCPRESSE)", ownerType: "groupe industriel", logo: "LF", color: "#8b1a1a" },
  { id: "liberation", name: "Libération", orientation: "gauche", orientationScore: 1, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "LIB", color: "#c0392b" },
  { id: "mediapart", name: "Médiapart", orientation: "gauche", orientationScore: 0, factuality: "Élevée", owner: "Indépendant (société de lecteurs)", ownerType: "indépendant", logo: "MP", color: "#e74c3c" },
  { id: "bfmtv", name: "BFMTV", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Altice / Patrick Drahi", ownerType: "milliardaire télécom", logo: "BFM", color: "#2980b9" },
  { id: "lesechos", name: "Les Échos", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", ownerType: "milliardaire luxe", logo: "LE", color: "#16a085" },
];

const OWNER_TYPE_COLOR = {
  "indépendant": "#27ae60",
  "milliardaires indépendants": "#f39c12",
  "milliardaire télécom": "#e74c3c",
  "milliardaire conservateur": "#8e44ad",
  "milliardaire luxe": "#2980b9",
  "groupe industriel": "#7f8c8d",
};

const ORIENTATION_CONFIG = {
  "gauche": { color: "#e74c3c" },
  "centre-gauche": { color: "#e67e22" },
  "centre": { color: "#95a5a6" },
  "centre-droite": { color: "#3498db" },
  "droite": { color: "#2c3e50" },
  "droite extrême": { color: "#1a252f" },
};

function getSourceMeta(id) {
  return SOURCES.find((s) => s.id === id) || { logo: id?.slice(0, 2).toUpperCase(), color: "#888", name: id };
}

function BiasBar({ coverage }) {
  const g = coverage?.gauche || 0;
  const c = coverage?.centre || 0;
  const d = coverage?.droite || 0;
  const total = g + c + d;
  if (total === 0) return null;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", borderRadius: "4px", overflow: "hidden", height: "8px", gap: "1px", background: "#f0ede8" }}>
        <div style={{ width: `${(g / total) * 100}%`, background: "#e74c3c", transition: "width 0.6s ease" }} />
        <div style={{ width: `${(c / total) * 100}%`, background: "#bdc3c7", transition: "width 0.6s ease" }} />
        <div style={{ width: `${(d / total) * 100}%`, background: "#2c3e50", transition: "width 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#888" }}>
        <span style={{ color: "#e74c3c" }}>GAUCHE {g}</span>
        <span>CENTRE {c}</span>
        <span style={{ color: "#2c3e50" }}>DROITE {d}</span>
      </div>
    </div>
  );
}

function OrientationDot({ orientation }) {
  const config = ORIENTATION_CONFIG[orientation] || { color: "#999" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: config.color, textTransform: "uppercase" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.color, display: "inline-block" }} />
      {orientation}
    </span>
  );
}

function SourceLogo({ id }) {
  const src = getSourceMeta(id);
  return (
    <div style={{ width: "28px", height: "28px", borderRadius: "3px", background: src.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700" }}>
      {src.logo}
    </div>
  );
}

function StoryCard({ story, onClick }) {
  const coverage = story.coverage_by_orientation || story.coverageByOrientation || {};
  const sourceIds = story.source_ids || story.sourceIds || [];
  const blindspot = story.blindspot;

  return (
    <article onClick={() => onClick(story)} style={{ borderBottom: "1px solid #e8e4dc", padding: "24px 0", cursor: "pointer", transition: "padding-left 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.paddingLeft = "8px"}
      onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", background: "#f5f1eb", padding: "2px 8px", borderRadius: "2px" }}>{story.category || "Actualité"}</span>
        <span style={{ fontSize: "10px", color: "#b0a898", fontFamily: "'IBM Plex Mono', monospace", marginLeft: "auto" }}>{story.coverage_count || story.coverageCount || sourceIds.length} sources</span>
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "19px", fontWeight: "700", color: "#1a1714", lineHeight: "1.35", margin: "0 0 12px 0" }}>{story.title}</h2>
      {story.summary && <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "14px", color: "#5a5248", lineHeight: "1.6", margin: "0 0 14px 0" }}>{story.summary.slice(0, 180)}{story.summary.length > 180 ? "…" : ""}</p>}
      <BiasBar coverage={coverage} />
      {blindspot && (
        <div style={{ marginTop: "12px", padding: "8px 12px", background: "#fef9ec", border: "1px solid #f0e4b0", borderRadius: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px" }}>⚠️</span>
          <span style={{ fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace", color: "#8a6d1a", letterSpacing: "0.04em" }}>{blindspot.label || "ANGLE MORT DÉTECTÉ"}</span>
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
        {sourceIds.slice(0, 6).map(id => <SourceLogo key={id} id={id} />)}
        {sourceIds.length > 6 && <div style={{ width: "28px", height: "28px", borderRadius: "3px", background: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#888" }}>+{sourceIds.length - 6}</div>}
      </div>
    </article>
  );
}

function StoryModal({ story, onClose }) {
  if (!story) return null;
  const articles = story.articles || [];
  const coverage = story.coverage_by_orientation || story.coverageByOrientation || {};
  const blindspot = story.blindspot;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.7)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fdfaf6", maxWidth: "680px", width: "100%", borderRadius: "4px", overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ borderBottom: "3px solid #1a1714", padding: "28px 32px" }}>
          <span style={{ fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a" }}>{story.category || "Actualité"}</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714", lineHeight: "1.3", margin: "10px 0 16px" }}>{story.title}</h2>
          {story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "15px", color: "#5a5248", lineHeight: "1.65", margin: "0 0 20px" }}>{story.summary}</p>}
          <BiasBar coverage={coverage} />
        </div>

        {blindspot && (
          <div style={{ padding: "16px 32px", background: "#fef9ec", borderBottom: "1px solid #f0e4b0" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", color: "#8a6d1a", textTransform: "uppercase", marginBottom: "3px" }}>Angle mort détecté</div>
            <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#6b5a1e" }}>{blindspot.label}</div>
          </div>
        )}

        {articles.length > 0 && (
          <div style={{ padding: "24px 32px", borderBottom: "1px solid #e8e4dc" }}>
            <h3 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b8f7a", margin: "0 0 16px" }}>Articles par source</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {articles.map((article, i) => {
                const src = getSourceMeta(article.source_id || article.sourceId);
                return (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "3px", background: src.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", flexShrink: 0 }}>{src.logo}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#1a1714", fontWeight: "600" }}>{src.name}</span>
                        <OrientationDot orientation={article.orientation} />
                      </div>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#3d6b9e", textDecoration: "none", lineHeight: "1.4" }}>{article.title}</a>
                    </div>
                  </div>
                );
              })}
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

function SourcesView() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? SOURCES : SOURCES.filter(s => s.orientation === filter);
  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["all", "gauche", "centre", "droite"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 14px", border: "1px solid", borderColor: filter === f ? "#1a1714" : "#d0c9bf", background: filter === f ? "#1a1714" : "transparent", color: filter === f ? "white" : "#666", cursor: "pointer", borderRadius: "2px" }}>
            {f === "all" ? "Tous" : f}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gap: "16px" }}>
        {filtered.map(src => (
          <div key={src.id} style={{ background: "white", border: "1px solid #e8e4dc", borderRadius: "4px", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "4px", background: src.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", flexShrink: 0 }}>{src.logo}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#1a1714" }}>{src.name}</span>
                <OrientationDot orientation={src.orientation} />
              </div>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#9b8f7a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Fiabilité</div>
                  <div style={{ fontSize: "13px", color: src.factuality === "Élevée" ? "#27ae60" : "#f39c12" }}>{src.factuality}</div>
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
  );
}

function OwnershipView() {
  const ownerGroups = {};
  SOURCES.forEach(src => {
    if (!ownerGroups[src.owner]) ownerGroups[src.owner] = { owner: src.owner, type: src.ownerType, sources: [] };
    ownerGroups[src.owner].sources.push(src);
  });
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={{ background: "#fef9ec", border: "1px solid #f0e4b0", borderRadius: "4px", padding: "16px 20px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a6d1a", marginBottom: "6px" }}>Pourquoi c'est important</div>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#5a4a1e", lineHeight: "1.6", margin: 0 }}>En France, une poignée de milliardaires contrôlent l'essentiel des médias d'information.</p>
      </div>
      {Object.values(ownerGroups).map((group, i) => (
        <div key={i} style={{ background: "white", border: "1px solid #e8e4dc", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e4dc", background: "#fdfaf6", display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#1a1714", marginBottom: "3px" }}>{group.owner}</div>
              <span style={{ fontSize: "10px", fontFamily: "'IBM Plex Mono', monospace", color: "white", background: OWNER_TYPE_COLOR[group.type] || "#999", padding: "2px 8px", borderRadius: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{group.type}</span>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#9b8f7a" }}>{group.sources.length} titre{group.sources.length > 1 ? "s" : ""}</div>
          </div>
          <div style={{ padding: "12px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {group.sources.map(src => (
              <div key={src.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", border: "1px solid #e8e4dc", borderRadius: "3px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "2px", background: src.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700" }}>{src.logo}</div>
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
  );
}

export default function MédiaVue() {
  const [activeTab, setActiveTab] = useState("feed");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    if (activeTab !== "feed") return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/stories?limit=30`)
      .then(r => r.json())
      .then(data => {
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Impossible de charger les articles. Réessayez.");
        setLoading(false);
      });
  }, [activeTab]);

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

  const tabs = [
    { id: "feed", label: "À la une" },
    { id: "sources", label: "Sources" },
    { id: "ownership", label: "Propriétaires" },
  ];

  const blindspotStory = stories.find(s => s.blindspot);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .story-animate { animation: fadeIn 0.4s ease both; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 24px; height: 24px; border: 2px solid #e8e4dc; border-top-color: #1a1714; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 60px auto; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f1eb", fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {/* Header */}
        <header style={{ borderBottom: "3px solid #1a1714", background: "#fdfaf6", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 12px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "900", color: "#1a1714", letterSpacing: "-0.03em" }}>MédiaVue</h1>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9b8f7a", letterSpacing: "0.08em", textTransform: "uppercase" }}>bêta</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9b8f7a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Voir l'info autrement</div>
            </div>
            <nav style={{ display: "flex" }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? "2px solid #1a1714" : "2px solid transparent", color: activeTab === tab.id ? "#1a1714" : "#9b8f7a", cursor: "pointer", marginBottom: "-1px" }}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main */}
        <main style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px" }}>
          {activeTab === "feed" && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "28px", paddingBottom: "16px", borderBottom: "1px solid #e8e4dc" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714" }}>À la une</h2>
                {!loading && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9b8f7a", letterSpacing: "0.08em" }}>{stories.length} HISTOIRES · EN DIRECT</span>}
              </div>

              {loading && <div className="spinner" />}

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", padding: "16px 20px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#c0392b" }}>{error}</div>
              )}

              {!loading && !error && blindspotStory && (
                <div style={{ background: "white", border: "1px solid #e8e4dc", borderLeft: "3px solid #e74c3c", borderRadius: "3px", padding: "16px 20px", marginBottom: "24px" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c0392b", marginBottom: "6px" }}>⚠ Angle mort du jour</div>
                  <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#3a342c", lineHeight: "1.55" }}>
                    <strong>«{blindspotStory.title.slice(0, 60)}»</strong> — {blindspotStory.blindspot?.label}
                  </p>
                </div>
              )}

              {!loading && !error && stories.map((story, i) => (
                <div key={story.id || i} className="story-animate" style={{ animationDelay: `${i * 0.03}s` }}>
                  <StoryCard story={story} onClick={handleStoryClick} />
                </div>
              ))}
            </div>
          )}

          {activeTab === "sources" && (
            <div>
              <div style={{ marginBottom: "28px", paddingBottom: "16px", borderBottom: "1px solid #e8e4dc" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714", marginBottom: "6px" }}>Sources référencées</h2>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#9b8f7a", letterSpacing: "0.06em" }}>{SOURCES.length} MÉDIAS · ÉVALUÉS PAR NOTRE MÉTHODOLOGIE</p>
              </div>
              <SourcesView />
            </div>
          )}

          {activeTab === "ownership" && (
            <div>
              <div style={{ marginBottom: "28px", paddingBottom: "16px", borderBottom: "1px solid #e8e4dc" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#1a1714", marginBottom: "6px" }}>Qui possède quoi ?</h2>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#9b8f7a", letterSpacing: "0.06em" }}>TRANSPARENCE SUR LA PROPRIÉTÉ DES MÉDIAS FRANÇAIS</p>
              </div>
              <OwnershipView />
            </div>
          )}
        </main>

        <footer style={{ borderTop: "1px solid #e8e4dc", padding: "24px 20px", textAlign: "center", background: "#fdfaf6" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#1a1714", marginBottom: "4px" }}>MédiaVue</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#9b8f7a", letterSpacing: "0.08em", textTransform: "uppercase" }}>Aucune publicité · Aucun actionnaire · 100% indépendant</div>
        </footer>
      </div>

      {selectedStory && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.7)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto", backdropFilter: "blur(3px)" }} onClick={() => setSelectedStory(null)}>
          <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
        </div>
      )}
    </>
  );
}
