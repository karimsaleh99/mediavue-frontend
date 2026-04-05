import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ffkksnejsgxeglqhjujy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZma2tzbmVqc2d4ZWdscWhqdWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMjEzNjEsImV4cCI6MjA5MDg5NzM2MX0.0DoVlYkw12jAW1gbMYv5dMu1QE5U9af47H3PQtySmPc";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_URL = "https://mediavue-backend-production.up.railway.app";
const FREE_LIMIT = 5;
const STORAGE_KEY = "mv_reads";
const RESET_KEY = "mv_reset";
const PROFILE_KEY = "mv_profile";
const FOLLOWS_KEY = "mv_follows";

const SOURCES = [
  { id: "lemonde", name: "Le Monde", orientation: "centre-gauche", orientationScore: 2, factuality: "Élevée", owner: "Xavier Niel / Matthieu Pigasse", structure: "Groupe de presse privé", logo: "LM", color: "#2471a3" },
  { id: "lefigaro", name: "Le Figaro", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "Famille Dassault", structure: "Groupe industriel", logo: "LF", color: "#922b21" },
  { id: "liberation", name: "Libération", orientation: "gauche", orientationScore: 1, factuality: "Élevée", owner: "Altice / Patrick Drahi", structure: "Groupe de presse privé", logo: "LIB", color: "#c0392b" },
  { id: "mediapart", name: "Médiapart", orientation: "gauche", orientationScore: 0, factuality: "Élevée", owner: "Indépendant", structure: "Société de lecteurs", logo: "MP", color: "#e74c3c" },
  { id: "bfmtv", name: "BFMTV", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Altice / Patrick Drahi", structure: "Groupe audiovisuel privé", logo: "BFM", color: "#1a6fa8" },
  { id: "lesechos", name: "Les Échos", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", structure: "Groupe de presse privé", logo: "LE", color: "#0e6655" },
  { id: "cnews", name: "CNews", orientation: "droite extrême", orientationScore: 5, factuality: "Mixte", owner: "Vincent Bolloré (Vivendi)", structure: "Groupe audiovisuel privé", logo: "CN", color: "#555" },
  { id: "franceinfo", name: "France Info", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Télévisions", structure: "Service public", logo: "FI", color: "#d35400" },
  { id: "france24", name: "France 24", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "France Médias Monde", structure: "Service public", logo: "F24", color: "#1e8449" },
  { id: "leparisien", name: "Le Parisien", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Bernard Arnault (LVMH)", structure: "Groupe de presse privé", logo: "LP", color: "#a04000" },
  { id: "blast", name: "Blast", orientation: "gauche", orientationScore: 0, factuality: "Moyenne", owner: "Indépendant", structure: "Association indépendante", logo: "BL", color: "#6c3483" },
  { id: "marianne", name: "Marianne", orientation: "centre-gauche", orientationScore: 2, factuality: "Moyenne", owner: "Czech Media Invest", structure: "Groupe de presse étranger", logo: "MAR", color: "#1a5276" },
  { id: "lepoint", name: "Le Point", orientation: "droite", orientationScore: 4, factuality: "Élevée", owner: "François Pinault", structure: "Groupe de presse privé", logo: "PT", color: "#2e4057" },
  { id: "valeursactuelles", name: "Valeurs Actuelles", orientation: "droite extrême", orientationScore: 5, factuality: "Faible", owner: "Groupe Valmonde", structure: "Presse spécialisée", logo: "VA", color: "#616a6b" },
  { id: "20minutes", name: "20 Minutes", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Rossel", structure: "Groupe de presse belge", logo: "20M", color: "#1e8449" },
  { id: "ouestfrance", name: "Ouest-France", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Association SIPA", structure: "Association loi 1901", logo: "OF", color: "#2e4057" },
  { id: "lobs", name: "L'Obs", orientation: "centre-gauche", orientationScore: 1, factuality: "Élevée", owner: "Groupe Le Monde", structure: "Groupe de presse privé", logo: "OBS", color: "#a04000" },
  { id: "humanite", name: "L'Humanité", orientation: "gauche", orientationScore: 0, factuality: "Moyenne", owner: "Société coopérative", structure: "Coopérative de presse", logo: "HUM", color: "#922b21" },
  { id: "lacroix", name: "La Croix", orientation: "centre", orientationScore: 3, factuality: "Élevée", owner: "Groupe Bayard", structure: "Groupe de presse catholique", logo: "CRX", color: "#6c3483" },
  { id: "lexpress", name: "L'Express", orientation: "centre-droite", orientationScore: 4, factuality: "Élevée", owner: "Alain Weill / Altice", structure: "Groupe de presse privé", logo: "EXP", color: "#922b21" },
];

const POLITICIANS = [
  { id: "macron", name: "Emmanuel Macron", party: "Renaissance", role: "Président de la République", orientation: "centre", orientationScore: 3, color: "#1a6fa8", initials: "EM" },
  { id: "lepen", name: "Marine Le Pen", party: "Rassemblement National", role: "Présidente du groupe RN", orientation: "droite extrême", orientationScore: 5, color: "#1a237e", initials: "MLP" },
  { id: "melenchon", name: "Jean-Luc Mélenchon", party: "La France Insoumise", role: "Fondateur de LFI", orientation: "gauche", orientationScore: 0, color: "#b71c1c", initials: "JLM" },
  { id: "bardella", name: "Jordan Bardella", party: "Rassemblement National", role: "Président du RN", orientation: "droite extrême", orientationScore: 5, color: "#283593", initials: "JB" },
  { id: "weil", name: "François Weil", party: "Indépendant", role: "Premier ministre", orientation: "centre", orientationScore: 3, color: "#37474f", initials: "FW" },
  { id: "glucksmann", name: "Raphaël Glucksmann", party: "Parti Socialiste", role: "Eurodéputé", orientation: "centre-gauche", orientationScore: 1, color: "#c62828", initials: "RG" },
  { id: "ciotti", name: "Éric Ciotti", party: "Les Républicains", role: "Président des LR", orientation: "droite", orientationScore: 4, color: "#1565c0", initials: "EC" },
  { id: "faure", name: "Olivier Faure", party: "Parti Socialiste", role: "Premier secrétaire PS", orientation: "gauche", orientationScore: 1, color: "#e53935", initials: "OF" },
  { id: "bertrand", name: "Xavier Bertrand", party: "Les Républicains", role: "Président des Hauts-de-France", orientation: "droite", orientationScore: 4, color: "#1976d2", initials: "XB" },
  { id: "rima", name: "Rima Hassan", party: "La France Insoumise", role: "Eurodéputée", orientation: "gauche", orientationScore: 0, color: "#d32f2f", initials: "RH" },
  { id: "zemmour", name: "Éric Zemmour", party: "Reconquête", role: "Président de Reconquête", orientation: "droite extrême", orientationScore: 5, color: "#212121", initials: "EZ" },
  { id: "hidalgo", name: "Anne Hidalgo", party: "Parti Socialiste", role: "Maire de Paris", orientation: "gauche", orientationScore: 1, color: "#c62828", initials: "AH" },
];

const CATEGORIES = ["Tout", "Politique", "Économie", "Social", "International", "Justice", "Médias", "Technologie", "Environnement"];
const ORI_COLOR = { "gauche": "#e74c3c", "centre-gauche": "#e67e22", "centre": "#7f8c8d", "centre-droite": "#3498db", "droite": "#5d6d7e", "droite extrême": "#3d3d3d" };

function getSource(id) {
  return SOURCES.find(s => s.id === id) || { logo: (id || "?").slice(0, 2).toUpperCase(), color: "#2a2a2a", name: id || "Inconnu", orientation: "centre", orientationScore: 3 };
}
function isBreaking(story) {
  if (!story.published_at) return false;
  return (Date.now() - new Date(story.published_at)) / 3600000 < 6 && (story.coverageCount || story.coverage_count || 0) >= 3;
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
    if (localStorage.getItem(RESET_KEY) !== today) { localStorage.setItem(RESET_KEY, today); localStorage.setItem(STORAGE_KEY, "0"); return 0; }
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0");
  } catch { return 0; }
}
function incrementReads() {
  try { const n = getReadsToday() + 1; localStorage.setItem(STORAGE_KEY, String(n)); return n; } catch { return 0; }
}
function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"gauche":0,"centre":0,"droite":0,"total":0,"sources":{}}'); }
  catch { return { gauche: 0, centre: 0, droite: 0, total: 0, sources: {} }; }
}
function updateProfile(sourceIds) {
  try {
    const p = getProfile(); p.total += 1;
    (sourceIds || []).forEach(id => { const s = getSource(id); const sc = s.orientationScore; if (sc <= 1) p.gauche++; else if (sc <= 3) p.centre++; else p.droite++; p.sources[id] = (p.sources[id] || 0) + 1; });
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}
function getFollows() {
  try { return JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '{"sources":[],"politicians":[]}'); }
  catch { return { sources: [], politicians: [] }; }
}
function toggleFollow(type, id) {
  try {
    const f = getFollows(); const arr = f[type]; const idx = arr.indexOf(id);
    if (idx > -1) arr.splice(idx, 1); else arr.push(id);
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(f));
    return arr.includes(id);
  } catch { return false; }
}
function isFollowing(type, id) { try { return getFollows()[type].includes(id); } catch { return false; } }

// ── Auth Screen ───────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Vérifiez votre email pour confirmer votre compte.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://mediavue.fr" });
        if (error) throw error;
        setSuccess("Email de réinitialisation envoyé.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://mediavue.fr" }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)", width: "400px", height: "400px", background: "radial-gradient(circle, #e74c3c0a 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: "900", color: "white", letterSpacing: "-0.03em", marginBottom: "8px" }}>
          Média<span style={{ color: "#e74c3c" }}>Vue</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#333", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          L'info vue de tous les angles
        </div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "380px", background: "#141414", borderRadius: "20px", border: "1px solid #1f1f1f", overflow: "hidden" }}>
        {/* Tabs */}
        {mode !== "forgot" && (
          <div style={{ display: "flex", borderBottom: "1px solid #1f1f1f" }}>
            {[["login", "Connexion"], ["signup", "Inscription"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, padding: "16px", background: "transparent", border: "none", color: mode === m ? "white" : "#333", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: mode === m ? "2px solid #e74c3c" : "2px solid transparent", transition: "all 0.15s" }}>{label}</button>
            ))}
          </div>
        )}

        <div style={{ padding: "28px 26px" }}>
          {mode === "forgot" && (
            <div style={{ marginBottom: "20px" }}>
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", padding: 0, marginBottom: "16px" }}>← Retour</button>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "#f0ede8", marginBottom: "6px" }}>Mot de passe oublié</div>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#555" }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>
          )}

          {/* Google button */}
          {mode !== "forgot" && (
            <>
              <button onClick={handleGoogle} disabled={loading} style={{ width: "100%", padding: "13px", background: "#1f1f1f", border: "1px solid #2a2a2a", borderRadius: "10px", color: "#f0ede8", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#252525"}
                onMouseLeave={e => e.currentTarget.style.background = "#1f1f1f"}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continuer avec Google
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#2a2a2a" }}>OU</span>
                <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@email.fr"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid #222", background: "#0f0f0f", fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#f0ede8", borderRadius: "8px", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "#e74c3c"}
              onBlur={e => e.target.style.borderColor = "#222"} />
          </div>

          {/* Password */}
          {mode !== "forgot" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Mot de passe</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #222", background: "#0f0f0f", fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#f0ede8", borderRadius: "8px", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#e74c3c"}
                onBlur={e => e.target.style.borderColor = "#222"}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          )}

          {/* Error / Success */}
          {error && <div style={{ padding: "10px 12px", background: "#1c0808", border: "1px solid #3d1010", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#e74c3c", marginBottom: "14px" }}>{error}</div>}
          {success && <div style={{ padding: "10px 12px", background: "#0a1a0a", border: "1px solid #1e8449", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#1e8449", marginBottom: "14px" }}>{success}</div>}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading || !email} style={{ width: "100%", padding: "13px", background: email ? "#e74c3c" : "#1f1f1f", color: email ? "white" : "#333", border: "none", borderRadius: "10px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: email ? "pointer" : "default", transition: "all 0.15s" }}>
            {loading ? "..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
          </button>

          {/* Forgot password */}
          {mode === "login" && (
            <button onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#2a2a2a", marginTop: "8px" }}>
              Mot de passe oublié ?
            </button>
          )}

          {mode === "signup" && (
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#222", textAlign: "center", marginTop: "12px", lineHeight: "1.6" }}>
              En créant un compte, vous acceptez nos conditions d'utilisation.
            </p>
          )}
        </div>
      </div>

      {/* Skip for now */}
      <button onClick={() => onAuth(null)} style={{ marginTop: "20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#222", letterSpacing: "0.06em" }}>
        Continuer sans compte →
      </button>
    </div>
  );
}

// ── UI Primitives ─────────────────────────────────────────────────────────────

function Logo() {
  return <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "900", color: "white", letterSpacing: "-0.03em" }}>Média<span style={{ color: "#e74c3c" }}>Vue</span></span>;
}
function SrcChip({ id, size = 26 }) {
  const s = getSource(id);
  return <div title={s.name} style={{ width: size, height: size, borderRadius: "5px", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(7, size * 0.28), color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", flexShrink: 0 }}>{s.logo}</div>;
}
function BiasBar({ cov }) {
  const g = cov?.gauche || 0, c = cov?.centre || 0, d = cov?.droite || 0;
  const total = g + c + d;
  if (total === 0) return null;
  return (
    <div>
      <div style={{ display: "flex", height: "5px", borderRadius: "3px", overflow: "hidden", background: "#222", gap: "2px" }}>
        {g > 0 && <div style={{ width: `${Math.round((g/total)*100)}%`, background: "#e74c3c" }} />}
        {c > 0 && <div style={{ width: `${Math.round((c/total)*100)}%`, background: "#555" }} />}
        {d > 0 && <div style={{ width: `${Math.round((d/total)*100)}%`, background: "#3d7ebf" }} />}
      </div>
      <div style={{ display: "flex", gap: "14px", marginTop: "6px" }}>
        {[["Gauche", g, "#e74c3c"], ["Centre", c, "#888"], ["Droite", d, "#3d7ebf"]].map(([label, val, color]) => (
          <span key={label} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: val > 0 ? color : "#2a2a2a", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: val > 0 ? color : "#2a2a2a", display: "inline-block" }} />{label} {val}
          </span>
        ))}
      </div>
    </div>
  );
}
function ScorePill({ score }) {
  const { color, label } = score >= 80 ? { color: "#1e8449", label: "Équilibré" } : score >= 40 ? { color: "#b7770d", label: "Partiel" } : { color: "#c0392b", label: "Unilatéral" };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color, border: `1px solid ${color}44`, background: `${color}18`, padding: "2px 8px", borderRadius: "10px" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />{label}</span>;
}
function FollowBtn({ type, id }) {
  const [following, setFollowing] = useState(() => isFollowing(type, id));
  const toggle = (e) => { e.stopPropagation(); setFollowing(toggleFollow(type, id)); };
  return (
    <button onClick={toggle} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", padding: "5px 12px", border: `1px solid ${following ? "#1e8449" : "#2a2a2a"}`, background: following ? "#0a1a0a" : "transparent", color: following ? "#1e8449" : "#444", cursor: "pointer", borderRadius: "20px", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}>
      {following ? "✓ Suivi" : "+ Suivre"}
    </button>
  );
}

function PaywallModal({ onClose, user }) {
  const [loading, setLoading] = useState(null);
  const [showStudent, setShowStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentDone, setStudentDone] = useState(false);
  const [error, setError] = useState("");

  const checkout = async (plan) => {
    if (!user || user === "guest") {
      setError("Connectez-vous d'abord pour souscrire.");
      return;
    }
    setLoading(plan);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/stripe/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError("Erreur lors de la création du paiement.");
    } catch {
      setError("Erreur de connexion. Réessayez.");
    }
    setLoading(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#141414", maxWidth: "400px", width: "100%", borderRadius: "20px", border: "1px solid #1f1f1f", overflow: "hidden" }}>
        <div style={{ padding: "28px 26px 22px", textAlign: "center", borderBottom: "1px solid #191919" }}>
          <Logo />
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.15em", color: "#333", marginTop: "18px", marginBottom: "8px", textTransform: "uppercase" }}>Limite quotidienne atteinte</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.3" }}>Vous avez lu vos {FREE_LIMIT} histoires gratuites aujourd'hui</h2>
        </div>
        <div style={{ padding: "20px 26px" }}>
          {!showStudent ? (
            <>
              {error && <div style={{ padding: "10px 12px", background: "#1c0808", border: "1px solid #3d1010", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#e74c3c", marginBottom: "14px" }}>{error}</div>}

              {[
                { label: "Mensuel", price: "4,99€", sub: "par mois", hi: false, plan: "monthly" },
                { label: "Annuel", price: "49€", sub: "par an · −18%", hi: true, plan: "annual" }
              ].map(({ label, price, sub, hi, plan }) => (
                <button key={plan} onClick={() => checkout(plan)} disabled={!!loading}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", marginBottom: "8px", border: `1.5px solid ${hi ? "#e74c3c" : "#222"}`, background: hi ? "#1c0808" : "transparent", cursor: "pointer", borderRadius: "10px", opacity: loading ? 0.7 : 1 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8" }}>
                    {loading === plan ? "Chargement..." : label}
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: hi ? "#e74c3c" : "#f0ede8" }}>{price}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#444" }}>{sub}</div>
                  </div>
                </button>
              ))}

              <button onClick={() => setShowStudent(true)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", marginBottom: "12px", border: "1px dashed #1e8449", background: "#0a1a0a", cursor: "pointer", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🎓</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: "700", color: "#f0ede8" }}>Tarif étudiant</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#1e8449" }}>Vérification par email universitaire</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "#1e8449" }}>1,99€<span style={{ fontSize: "11px", color: "#555", fontWeight: "400" }}>/mois</span></div>
              </button>

              <button onClick={onClose} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#2a2a2a" }}>Revenir demain</button>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#1f1f1f", textAlign: "center", marginTop: "8px" }}>Paiement sécurisé par Stripe</p>
            </>
          ) : studentDone ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>📧</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "#f0ede8", marginBottom: "8px" }}>Demande envoyée</div>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#555", lineHeight: "1.5", marginBottom: "16px" }}>Nous vérifierons votre statut étudiant sous 24h.</p>
              <button onClick={onClose} style={{ width: "100%", padding: "12px", background: "#1e8449", color: "white", border: "none", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>OK</button>
            </div>
          ) : (
            <div>
              <button onClick={() => setShowStudent(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", marginBottom: "14px", padding: 0 }}>← Retour</button>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#f0ede8", marginBottom: "6px" }}>Tarif étudiant — 1,99€/mois</div>
              <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#555", lineHeight: "1.5", marginBottom: "16px" }}>Entrez votre email universitaire. Nous activerons votre accès sous 24h.</p>
              <input type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="prenom.nom@univ-paris.fr"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #222", background: "#0f0f0f", fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#f0ede8", borderRadius: "8px", outline: "none", marginBottom: "10px" }} />
              <button onClick={() => studentEmail.includes("@") && setStudentDone(true)}
                style={{ width: "100%", padding: "12px", background: "#1e8449", color: "white", border: "none", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", opacity: studentEmail.includes("@") ? 1 : 0.4 }}>
                Envoyer ma demande
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story, onClick, locked, onLock, compact = false }) {
  const cov = story.coverageByOrientation || story.coverage_by_orientation || {};
  const srcIds = story.sourceIds || story.source_ids || [];
  const img = story.articles?.[0]?.image_url;
  const breaking = isBreaking(story);
  return (
    <div onClick={locked ? onLock : () => onClick(story)}
      style={{ background: "#161616", borderRadius: "14px", overflow: "hidden", cursor: "pointer", marginBottom: "10px", border: "1px solid #222", transition: "border-color 0.2s, transform 0.15s", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.transform = "translateY(0)"; }}>
      {locked && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, #0f0f0f 75%)", zIndex: 2, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "18px", borderRadius: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#e74c3c", color: "white", padding: "8px 18px", borderRadius: "20px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.1em" }}>🔒 Passer à Premium</div>
        </div>
      )}
      {!compact && img && (
        <div style={{ height: "140px", overflow: "hidden", position: "relative" }}>
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #161616)" }} />
          {breaking && <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", alignItems: "center", gap: "5px", background: "#e74c3c", color: "white", padding: "3px 10px", borderRadius: "4px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", display: "inline-block" }} />BREAKING</div>}
        </div>
      )}
      <div style={{ padding: compact ? "12px 14px" : "14px 15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px", flexWrap: "wrap" }}>
          {(compact || !img) && breaking && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", background: "#e74c3c", color: "white", padding: "2px 8px", borderRadius: "4px" }}>● BREAKING</span>}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#3a3a3a", letterSpacing: "0.1em", textTransform: "uppercase" }}>{story.category || "Actualité"}</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#2a2a2a" }}>{story.coverageCount || story.coverage_count || srcIds.length} sources</span>
            <ScorePill score={getScore(cov)} />
          </div>
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: compact ? "15px" : "17px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.35", margin: "0 0 8px" }}>{story.title}</h3>
        {!compact && story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#555", lineHeight: "1.55", margin: "0 0 12px" }}>{story.summary.slice(0, 115)}{story.summary.length > 115 ? "…" : ""}</p>}
        <BiasBar cov={cov} />
        {story.blindspot && (
          <div style={{ marginTop: "10px", padding: "8px 11px", background: "#1a1200", border: "1px solid #2e2000", borderRadius: "7px", display: "flex", alignItems: "center", gap: "7px" }}>
            <span>⚠️</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#c8960c" }}>ANGLE MORT · {story.blindspot.sides?.join(" & ") || story.blindspot.label}</span>
          </div>
        )}
        {srcIds.length > 0 && (
          <div style={{ display: "flex", gap: "4px", marginTop: "11px", flexWrap: "wrap" }}>
            {srcIds.slice(0, 8).map(id => <SrcChip key={id} id={id} size={24} />)}
            {srcIds.length > 8 && <div style={{ width: 24, height: 24, borderRadius: "5px", background: "#1f1f1f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#333" }}>+{srcIds.length - 8}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function StoryModal({ story, onClose }) {
  if (!story) return null;
  const articles = story.articles || [];
  const cov = story.coverageByOrientation || story.coverage_by_orientation || {};
  const g = articles.filter(a => (getSource(a.sourceId || a.source_id)?.orientationScore ?? 3) <= 1);
  const c = articles.filter(a => { const s = getSource(a.sourceId || a.source_id)?.orientationScore ?? 3; return s > 1 && s < 4; });
  const d = articles.filter(a => (getSource(a.sourceId || a.source_id)?.orientationScore ?? 3) >= 4);
  const buckets = [{ key: "Gauche", color: "#e74c3c", bg: "#1c0808", items: g }, { key: "Centre", color: "#888", bg: "#111", items: c }, { key: "Droite", color: "#3d7ebf", bg: "#080f1c", items: d }].filter(b => b.items.length > 0);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#141414", maxWidth: "660px", width: "100%", borderRadius: "18px", border: "1px solid #1f1f1f", marginBottom: "20px" }}>
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            {isBreaking(story) && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", background: "#e74c3c", color: "white", padding: "2px 8px", borderRadius: "4px" }}>● BREAKING</span>}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.1em" }}>{story.category}</span>
            <ScorePill score={getScore(cov)} />
            <button onClick={onClose} style={{ marginLeft: "auto", background: "#1f1f1f", border: "none", color: "#555", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" }}>✕</button>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#f0ede8", lineHeight: "1.3", marginBottom: "10px" }}>{story.title}</h2>
          {story.summary && <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "16px" }}>{story.summary}</p>}
          <BiasBar cov={cov} />
        </div>
        {story.blindspot && <div style={{ margin: "0 20px 14px", padding: "11px 14px", background: "#1a1200", border: "1px solid #2e2000", borderRadius: "10px" }}><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#c8960c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>⚠ Angle mort</div><p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#9a7020", margin: 0 }}>{story.blindspot.label}</p></div>}
        {buckets.length > 0 && (
          <div style={{ padding: "0 20px 16px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", marginBottom: "12px" }}>Vue côte à côte</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${buckets.length}, 1fr)`, gap: "8px" }}>
              {buckets.map(({ key, color, bg, items }) => (
                <div key={key} style={{ background: bg, borderRadius: "10px", padding: "12px", border: `1px solid ${color}20` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px", paddingBottom: "8px", borderBottom: `1px solid ${color}25` }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{key}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#222", marginLeft: "auto" }}>{items.length}</span>
                  </div>
                  {items.slice(0, 3).map((a, i) => {
                    const src = getSource(a.sourceId || a.source_id);
                    return (
                      <div key={i} style={{ marginBottom: i < Math.min(items.length, 3) - 1 ? "10px" : 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}><SrcChip id={a.sourceId || a.source_id} size={16} /><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#444" }}>{src.name}</span></div>
                        <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: "#b0a898", textDecoration: "none", lineHeight: "1.4", display: "block" }} onMouseEnter={e => e.target.style.color = color} onMouseLeave={e => e.target.style.color = "#b0a898"}>{a.title}</a>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        {articles.length > 0 && (
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", marginBottom: "12px" }}>Tous les articles · {articles.length}</div>
            {articles.map((a, i) => {
              const src = getSource(a.sourceId || a.source_id);
              return (
                <div key={i} style={{ display: "flex", gap: "11px", alignItems: "flex-start", paddingBottom: "11px", borderBottom: i < articles.length - 1 ? "1px solid #191919" : "none", marginBottom: "11px" }}>
                  <SrcChip id={a.sourceId || a.source_id} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#666" }}>{src.name}</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: ORI_COLOR[src.orientation] || "#444" }}>● {src.orientation}</span></div>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#b0a898", textDecoration: "none", lineHeight: "1.4", display: "block" }} onMouseEnter={e => e.target.style.color = "#4a90d9"} onMouseLeave={e => e.target.style.color = "#b0a898"}>{a.title}</a>
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

function SourcesTab() {
  const [section, setSection] = useState("sources");
  const [filter, setFilter] = useState("all");
  const filteredSources = filter === "all" ? SOURCES : SOURCES.filter(s => filter === "gauche" ? s.orientationScore <= 1 : filter === "centre" ? s.orientationScore > 1 && s.orientationScore < 4 : s.orientationScore >= 4);
  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ display: "flex", gap: "0", marginBottom: "16px", background: "#161616", borderRadius: "10px", padding: "4px", border: "1px solid #1f1f1f" }}>
        {[["sources", "📰 Sources"], ["politicians", "🏛️ Politiciens"]].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} style={{ flex: 1, padding: "10px", background: section === id ? "#e74c3c" : "transparent", border: "none", color: section === id ? "white" : "#444", cursor: "pointer", borderRadius: "7px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", transition: "all 0.15s" }}>{label}</button>
        ))}
      </div>
      {section === "sources" && (
        <>
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {["all", "gauche", "centre", "droite"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", padding: "5px 12px", border: "1px solid", borderColor: filter === f ? "#e74c3c" : "#1f1f1f", background: filter === f ? "#1c0808" : "#161616", color: filter === f ? "#e74c3c" : "#3a3a3a", cursor: "pointer", borderRadius: "20px" }}>{f === "all" ? "Tous" : f}</button>
            ))}
          </div>
          {filteredSources.map(src => (
            <div key={src.id} style={{ background: "#161616", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "14px 16px", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <SrcChip id={src.id} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8" }}>{src.name}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: ORI_COLOR[src.orientation] || "#555" }}>● {src.orientation}</span>
                  </div>
                  <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Fiabilité</div><div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: src.factuality === "Élevée" ? "#1e8449" : src.factuality === "Mixte" ? "#b7770d" : "#c0392b" }}>{src.factuality}</div></div>
                    <div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Propriétaire</div><div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: "#555" }}>{src.owner}</div></div>
                    <div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Structure</div><div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "12px", color: "#444" }}>{src.structure}</div></div>
                  </div>
                  <FollowBtn type="sources" id={src.id} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
      {section === "politicians" && (
        <>
          <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#444", lineHeight: "1.55", marginBottom: "14px" }}>Suivez les politiciens pour personnaliser votre fil d'actualité.</p>
          {POLITICIANS.map(pol => (
            <div key={pol.id} style={{ background: "#161616", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "14px 16px", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: pol.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700", flexShrink: 0 }}>{pol.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8" }}>{pol.name}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: ORI_COLOR[pol.orientation] || "#555" }}>● {pol.orientation}</span>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#333", marginBottom: "8px" }}>{pol.party} · {pol.role}</div>
                  <FollowBtn type="politicians" id={pol.id} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function AngleMortTab({ isPremium, onPremium }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    fetch(`${API_URL}/api/stories?limit=100`).then(r => r.json()).then(d => { setStories((d.stories || []).filter(s => s.blindspot)); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const filtered = filter === "all" ? stories : stories.filter(s => s.blindspot?.sides?.includes(filter));
  const counts = stories.reduce((acc, s) => { (s.blindspot?.sides || []).forEach(side => { acc[side] = (acc[side] || 0) + 1; }); return acc; }, {});
  const handleClick = async (story) => {
    if (!isPremium) { onPremium(); return; }
    setSelected(story);
    if (!story.articles && story.id) { try { setSelected(await (await fetch(`${API_URL}/api/stories/${story.id}`)).json()); } catch {} }
  };
  return (
    <div style={{ paddingBottom: "80px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "#f0ede8", marginBottom: "4px" }}>Angles morts</h2>
      <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#444", lineHeight: "1.5", marginBottom: "16px" }}>Ce que chaque camp choisit de ne pas couvrir.</p>
      {!loading && stories.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
          {[["gauche", "#e74c3c", "Ignoré par la gauche"], ["centre", "#888", "Ignoré par le centre"], ["droite", "#3d7ebf", "Ignoré par la droite"]].map(([side, color, label]) => (
            <div key={side} style={{ background: "#161616", border: `1px solid ${color}22`, borderRadius: "10px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color, marginBottom: "4px" }}>{counts[side] || 0}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#333", letterSpacing: "0.06em", lineHeight: "1.3" }}>{label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {[["all", "Tous", "#888"], ["gauche", "Gauche", "#e74c3c"], ["centre", "Centre", "#888"], ["droite", "Droite", "#3d7ebf"]].map(([val, label, color]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", padding: "5px 12px", border: `1px solid ${filter === val ? color : "#1f1f1f"}`, background: filter === val ? `${color}18` : "#161616", color: filter === val ? color : "#3a3a3a", cursor: "pointer", borderRadius: "20px", transition: "all 0.15s" }}>{label}</button>
        ))}
      </div>
      {!isPremium && <div style={{ padding: "14px 16px", background: "#1c0808", border: "1px solid #3d1010", borderRadius: "12px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}><div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#e74c3c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Fonctionnalité Premium</div><p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#666", margin: 0 }}>Accédez aux angles morts complets.</p></div><button onClick={onPremium} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", background: "#e74c3c", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}>Débloquer</button></div>}
      {loading && <div style={{ width: "22px", height: "22px", border: "2px solid #1f1f1f", borderTopColor: "#e74c3c", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "40px auto" }} />}
      {!loading && filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", background: "#161616", borderRadius: "12px", border: "1px solid #1f1f1f" }}><div style={{ fontSize: "24px", marginBottom: "8px" }}>✅</div><div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#444" }}>Aucun angle mort détecté</div></div>}
      {!loading && filtered.map((s, i) => <div key={s.id || i} style={{ animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}><StoryCard story={s} onClick={handleClick} locked={false} onLock={() => {}} compact /></div>)}
      {selected && <StoryModal story={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ProfilTab({ isPremium, onPremium, user, onSignOut }) {
  const [profile] = useState(getProfile());
  const follows = getFollows();
  const total = profile.gauche + profile.centre + profile.droite;
  const gPct = total > 0 ? Math.round((profile.gauche / total) * 100) : 0;
  const cPct = total > 0 ? Math.round((profile.centre / total) * 100) : 0;
  const dPct = total > 0 ? Math.round((profile.droite / total) * 100) : 0;
  const reads = getReadsToday();
  const dominant = total === 0 ? null : gPct > 60 ? { label: "Vous lisez majoritairement à gauche", color: "#e74c3c", missing: "droite et centre" } : dPct > 60 ? { label: "Vous lisez majoritairement à droite", color: "#3d7ebf", missing: "gauche et centre" } : cPct > 60 ? { label: "Vous lisez majoritairement le centre", color: "#888", missing: "gauche et droite" } : { label: "Votre lecture est équilibrée 🎉", color: "#1e8449", missing: null };
  const followedSources = SOURCES.filter(s => follows.sources.includes(s.id));
  const followedPols = POLITICIANS.filter(p => follows.politicians.includes(p.id));
  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ background: "#161616", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "22px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#e74c3c22", border: "1px solid #e74c3c33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
            {user ? user.email?.[0]?.toUpperCase() || "👤" : "👤"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "#f0ede8", marginBottom: "3px" }}>
              {user ? user.email : "Visiteur"}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: isPremium ? "#1e8449" : "#333", letterSpacing: "0.1em" }}>{isPremium ? "● COMPTE PREMIUM" : "Compte gratuit"}</div>
          </div>
          {user && (
            <button onClick={onSignOut} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", background: "transparent", border: "1px solid #222", padding: "5px 10px", borderRadius: "6px", cursor: "pointer" }}>Déconnexion</button>
          )}
        </div>
      </div>

      {(followedSources.length > 0 || followedPols.length > 0) && (
        <div style={{ background: "#161616", border: "1px solid #1f1f1f", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #191919" }}><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "0.12em", textTransform: "uppercase" }}>Vous suivez · {followedSources.length + followedPols.length}</div></div>
          <div style={{ padding: "12px 16px" }}>
            {followedSources.length > 0 && <div style={{ marginBottom: followedPols.length > 0 ? "12px" : 0 }}><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Sources</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{followedSources.map(s => <SrcChip key={s.id} id={s.id} size={32} />)}</div></div>}
            {followedPols.length > 0 && <div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Politiciens</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{followedPols.map(p => <div key={p.id} title={p.name} style={{ width: 32, height: 32, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "white", fontFamily: "'IBM Plex Mono', monospace", fontWeight: "700" }}>{p.initials}</div>)}</div></div>}
          </div>
        </div>
      )}

      {total > 0 && (
        <div style={{ background: "#161616", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "18px", marginBottom: "12px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>Votre spectre de lecture</div>
          <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", marginBottom: "10px", gap: "2px" }}>
            {gPct > 0 && <div style={{ width: `${gPct}%`, background: "#e74c3c" }} />}
            {cPct > 0 && <div style={{ width: `${cPct}%`, background: "#555" }} />}
            {dPct > 0 && <div style={{ width: `${dPct}%`, background: "#3d7ebf" }} />}
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            {[["Gauche", gPct, "#e74c3c"], ["Centre", cPct, "#888"], ["Droite", dPct, "#3d7ebf"]].map(([label, pct, color]) => (
              <div key={label} style={{ flex: 1, textAlign: "center", background: "#0f0f0f", borderRadius: "8px", padding: "10px 6px", border: `1px solid ${color}22` }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color, marginBottom: "2px" }}>{pct}%</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#333" }}>{label}</div>
              </div>
            ))}
          </div>
          {dominant && <div style={{ padding: "12px 14px", background: `${dominant.color}12`, border: `1px solid ${dominant.color}30`, borderRadius: "8px" }}><div style={{ fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: dominant.color, fontWeight: "600" }}>{dominant.label}</div></div>}
          {dominant?.missing && isPremium && <div style={{ marginTop: "10px", padding: "12px 14px", background: "#1a1200", border: "1px solid #2e2000", borderRadius: "8px" }}><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#c8960c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>⚠ Votre angle mort personnel</div><p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#9a7020", margin: 0 }}>Vous lisez peu de sources {dominant.missing}.</p></div>}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        <div style={{ background: "#161616", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "14px", textAlign: "center" }}><div style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#e74c3c", marginBottom: "3px" }}>{reads}</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#333", letterSpacing: "0.06em" }}>AUJOURD'HUI</div></div>
        <div style={{ background: "#161616", border: "1px solid #1f1f1f", borderRadius: "10px", padding: "14px", textAlign: "center" }}><div style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "#f0ede8", marginBottom: "3px" }}>{profile.total}</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#333", letterSpacing: "0.06em" }}>AU TOTAL</div></div>
      </div>

      {!isPremium && <div style={{ background: "#1c0808", border: "1px solid #3d1010", borderRadius: "12px", padding: "16px", textAlign: "center", marginBottom: "12px" }}><div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "#f0ede8", marginBottom: "5px" }}>Débloquez votre profil complet</div><p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#555", lineHeight: "1.5", marginBottom: "12px" }}>Angle mort personnel, historique, recommandations.</p><button onClick={onPremium} style={{ width: "100%", padding: "12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Passer à Premium</button></div>}

      <div style={{ background: "#0a1a0a", border: "1px dashed #1e8449", borderRadius: "12px", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><span>🏛️</span><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#1e8449", letterSpacing: "0.1em", textTransform: "uppercase" }}>Bientôt · Tracker Politique</div></div>
        <p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#2a4a2a", lineHeight: "1.5", margin: "0 0 6px" }}>Tweets des politiciens en temps réel. Sénatoriales 2026.</p>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#1a3a1a" }}>Macron · Le Pen · Mélenchon · Bardella · +50</div>
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
  const [selected, setSelected] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [reads, setReads] = useState(getReadsToday);
  const [feedMode, setFeedMode] = useState("all");

  useEffect(() => {
    setLoading(true);
    const cat = category !== "Tout" ? `&category=${encodeURIComponent(category)}` : "";
    fetch(`${API_URL}/api/stories?limit=50${cat}`).then(r => r.json()).then(d => { setStories(d.stories || []); setLoading(false); }).catch(() => { setError("Impossible de charger. Réessayez."); setLoading(false); });
  }, [category]);

  const follows = getFollows();
  const hasFollows = follows.sources.length > 0;
  const filtered = stories.filter(s => (!search.trim() || s.title.toLowerCase().includes(search.toLowerCase()) || (s.summary || "").toLowerCase().includes(search.toLowerCase())) && (feedMode !== "personalized" || !hasFollows || (s.sourceIds || s.source_ids || []).some(id => follows.sources.includes(id))));
  const breaking = filtered.filter(isBreaking);
  const regular = filtered.filter(s => !isBreaking(s));
  const readsLeft = Math.max(0, FREE_LIMIT - reads);

  const handleClick = async (story) => {
    if (!isPremium && reads >= FREE_LIMIT) { setShowPaywall(true); return; }
    setSelected(story); updateProfile(story.sourceIds || story.source_ids || []); setReads(incrementReads());
    if (!story.articles && story.id) { try { setSelected(await (await fetch(`${API_URL}/api/stories/${story.id}`)).json()); } catch {} }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      {hasFollows && (
        <div style={{ display: "flex", gap: "0", marginBottom: "12px", background: "#161616", borderRadius: "10px", padding: "4px", border: "1px solid #1f1f1f" }}>
          {[["all", "🌐 Tout"], ["personalized", "⭐ Mon fil"]].map(([id, label]) => (
            <button key={id} onClick={() => setFeedMode(id)} style={{ flex: 1, padding: "9px", background: feedMode === id ? "#e74c3c" : "transparent", border: "none", color: feedMode === id ? "white" : "#444", cursor: "pointer", borderRadius: "7px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.06em", transition: "all 0.15s" }}>{label}</button>
          ))}
        </div>
      )}
      <div style={{ position: "relative", marginBottom: "11px" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#2a2a2a", fontSize: "14px" }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une histoire…" style={{ width: "100%", padding: "11px 12px 11px 36px", border: "1px solid #1f1f1f", background: "#161616", fontFamily: "'Source Serif 4', serif", fontSize: "14px", color: "#f0ede8", borderRadius: "10px", outline: "none" }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#333", fontSize: "18px" }}>×</button>}
      </div>
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginBottom: "12px", paddingBottom: "2px" }}>
        {CATEGORIES.map(cat => <button key={cat} onClick={() => setCategory(cat)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.05em", padding: "5px 12px", border: "1px solid", borderColor: category === cat ? "#e74c3c" : "#1f1f1f", background: category === cat ? "#1c0808" : "#161616", color: category === cat ? "#e74c3c" : "#3a3a3a", cursor: "pointer", borderRadius: "20px", whiteSpace: "nowrap", transition: "all 0.15s" }}>{cat}</button>)}
      </div>
      {!isPremium && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#161616", borderRadius: "8px", marginBottom: "12px", border: "1px solid #1f1f1f" }}>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>{Array.from({ length: FREE_LIMIT }).map((_, i) => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: i < reads ? "#e74c3c" : "#222", transition: "background 0.3s" }} />)}</div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: readsLeft > 0 ? "#3a3a3a" : "#e74c3c", letterSpacing: "0.04em" }}>{readsLeft > 0 ? `${readsLeft} gratuite${readsLeft > 1 ? "s" : ""} restante${readsLeft > 1 ? "s" : ""}` : "Limite atteinte"}</span>
          <button onClick={onPremium} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", background: "#e74c3c", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}>Premium</button>
        </div>
      )}
      {loading && <div style={{ width: "22px", height: "22px", border: "2px solid #1f1f1f", borderTopColor: "#e74c3c", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "60px auto" }} />}
      {error && <div style={{ padding: "14px", background: "#1c0808", border: "1px solid #3d1010", borderRadius: "10px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#e74c3c" }}>{error}</div>}
      {!loading && feedMode === "personalized" && filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", background: "#161616", borderRadius: "12px", border: "1px solid #1f1f1f" }}><div style={{ fontSize: "24px", marginBottom: "8px" }}>⭐</div><div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#444", marginBottom: "6px" }}>Aucune histoire de vos sources suivies</div><p style={{ fontFamily: "'Source Serif 4', serif", fontSize: "13px", color: "#2a2a2a" }}>Allez dans Sources pour en suivre.</p></div>}
      {!loading && breaking.length > 0 && <div style={{ marginBottom: "16px" }}><div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", display: "inline-block" }} /><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#e74c3c" }}>Breaking News</span></div>{breaking.map((s, i) => <StoryCard key={s.id || i} story={s} onClick={handleClick} locked={!isPremium && reads >= FREE_LIMIT} onLock={() => setShowPaywall(true)} />)}<div style={{ height: "1px", background: "#191919", margin: "14px 0" }} /></div>}
      {!loading && !error && regular.map((s, i) => <div key={s.id || i} style={{ animation: `fadeUp 0.3s ease ${Math.min(i, 8) * 0.035}s both` }}><StoryCard story={s} onClick={handleClick} locked={!isPremium && reads + i >= FREE_LIMIT} onLock={() => setShowPaywall(true)} /></div>)}
      {!loading && filtered.length === 0 && search && <div style={{ textAlign: "center", padding: "50px 20px", fontFamily: "'Source Serif 4', serif", fontSize: "15px", color: "#2a2a2a" }}>Aucun résultat pour «{search}»</div>}
      {selected && <StoryModal story={selected} onClose={() => setSelected(null)} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} user={user} />}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function MédiaVue() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = guest, object = logged in
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [tab, setTab] = useState("news");

  useEffect(() => {
    // Handle payment success redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", "/");
      // Premium will be loaded from Supabase after webhook fires
    }
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadPremiumStatus(session.user.id);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadPremiumStatus(session.user.id);
      else setIsPremium(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadPremiumStatus = async (userId) => {
    try {
      const { data } = await supabase.from("profiles").select("is_premium").eq("id", userId).single();
      if (data?.is_premium) setIsPremium(true);
    } catch {}
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsPremium(false);
  };

  const navItems = [
    { id: "news", icon: "📰", label: "Actualités" },
    { id: "blindspot", icon: "⚠️", label: "Angles morts" },
    { id: "sources", icon: "📋", label: "Sources" },
    { id: "profile", icon: "👤", label: "Mon Profil" },
  ];

  // Loading state
  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: "900", color: "white", letterSpacing: "-0.03em", marginBottom: "24px" }}>Média<span style={{ color: "#e74c3c" }}>Vue</span></div>
          <div style={{ width: "22px", height: "22px", border: "2px solid #1f1f1f", borderTopColor: "#e74c3c", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  // Auth screen — show if no user (but allow guest)
  if (user === null) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#0a0a0a;}@keyframes spin{to{transform:rotate(360deg)}}input::placeholder{color:#2a2a2a;}`}</style>
        <AuthScreen onAuth={(u) => setUser(u || "guest")} />
      </>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#0f0f0f;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}input::placeholder{color:#2a2a2a;}::-webkit-scrollbar{width:3px;height:0;}::-webkit-scrollbar-thumb{background:#1f1f1f;}`}</style>
      <div style={{ minHeight: "100vh", background: "#0f0f0f", maxWidth: "480px", margin: "0 auto" }}>
        <header style={{ background: "#0f0f0f", borderBottom: "1px solid #161616", padding: "13px 15px 10px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isPremium ? <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#1e8449", border: "1px solid #1e8449", padding: "2px 8px", borderRadius: "10px" }}>PREMIUM</span> : <button onClick={() => setShowPaywall(true)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", background: "#e74c3c", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}>Premium</button>}
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#1f1f1f" }}>{new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
            </div>
          </div>
        </header>
        <div style={{ padding: "13px 13px 0" }}>
          {tab === "news" && <FeedTab isPremium={isPremium} onPremium={() => setShowPaywall(true)} />}
          {tab === "blindspot" && <AngleMortTab isPremium={isPremium} onPremium={() => setShowPaywall(true)} />}
          {tab === "sources" && <SourcesTab />}
          {tab === "profile" && <ProfilTab isPremium={isPremium} onPremium={() => setShowPaywall(true)} user={user === "guest" ? null : user} onSignOut={handleSignOut} />}
        </div>
        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "480px", background: "#0a0a0a", borderTop: "1px solid #161616", display: "flex", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom, 5px)" }}>
          {navItems.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 0 7px", background: "transparent", border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: "17px", filter: tab === id ? "none" : "grayscale(1)", opacity: tab === id ? 1 : 0.25, transition: "all 0.15s" }}>{icon}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", letterSpacing: "0.08em", color: tab === id ? "#e74c3c" : "#2a2a2a", textTransform: "uppercase", transition: "color 0.15s" }}>{label}</span>
              {tab === id && <div style={{ width: "14px", height: "2px", background: "#e74c3c", borderRadius: "1px", marginTop: "1px" }} />}
            </button>
          ))}
        </nav>
      </div>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} user={user === "guest" ? null : user} />}
    </>
  );
}
