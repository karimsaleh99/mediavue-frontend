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
const THEME_KEY = "mv_theme";

// ── Theme System ──────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#1a1a1a",
    bgCard: "#242424",
    bgHeader: "#1a1a1a",
    bgInput: "#2a2a2a",
    bgNav: "#1a1a1a",
    bgActive: "#2e2e2e",
    border: "#333333",
    borderLight: "#2a2a2a",
    text: "#f0ede8",
    textSub: "#a0a0a0",
    textMuted: "#666666",
    textFaint: "#444444",
    accent: "#e74c3c",
    accentBg: "rgba(231,76,60,0.15)",
    accentBorder: "rgba(231,76,60,0.3)",
    gold: "#c8a96e",
    goldBg: "rgba(200,169,110,0.12)",
    green: "#4caf50",
    greenBg: "rgba(76,175,80,0.12)",
    amber: "#f5a623",
    amberBg: "rgba(245,166,35,0.12)",
    blue: "#5b9bd5",
    shadow: "0 2px 12px rgba(0,0,0,0.4)",
  },
  light: {
    bg: "#f5f3ef",
    bgCard: "#ffffff",
    bgHeader: "#ffffff",
    bgInput: "#f0ede8",
    bgNav: "#ffffff",
    bgActive: "#f0ede8",
    border: "#e8e4de",
    borderLight: "#ede9e3",
    text: "#1a1a1a",
    textSub: "#555555",
    textMuted: "#888888",
    textFaint: "#bbbbbb",
    accent: "#e74c3c",
    accentBg: "rgba(231,76,60,0.08)",
    accentBorder: "rgba(231,76,60,0.25)",
    gold: "#9a7a3a",
    goldBg: "rgba(154,122,58,0.1)",
    green: "#2e7d32",
    greenBg: "rgba(46,125,50,0.1)",
    amber: "#e65100",
    amberBg: "rgba(230,81,0,0.1)",
    blue: "#1565c0",
    shadow: "0 2px 12px rgba(0,0,0,0.08)",
  }
};

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

function getSource(id) {
  return SOURCES.find(s => s.id === id) || { logo: (id || "?").slice(0, 2).toUpperCase(), color: "#666", name: id || "Inconnu", orientation: "centre", orientationScore: 3 };
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
function getSavedTheme() { try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; } }

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, t }) {
  const [mode, setMode] = useState("login");
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Vérifiez votre email pour confirmer votre compte.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://mediavue.fr" });
        if (error) throw error;
        setSuccess("Email de réinitialisation envoyé.");
      }
    } catch (err) { setError(err.message || "Une erreur est survenue."); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "https://mediavue.fr" } });
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ marginBottom: "36px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", fontWeight: "800", color: t.text, letterSpacing: "-0.5px", marginBottom: "6px" }}>
          Média<span style={{ color: t.accent }}>Vue</span>
        </div>
        <div style={{ fontSize: "13px", color: t.textMuted, fontWeight: "500" }}>L'info vue de tous les angles</div>
      </div>

      <div style={{ width: "100%", maxWidth: "380px", background: t.bgCard, borderRadius: "16px", border: `1px solid ${t.border}`, overflow: "hidden", boxShadow: t.shadow }}>
        {mode !== "forgot" && (
          <div style={{ display: "flex", borderBottom: `1px solid ${t.border}` }}>
            {[["login", "Connexion"], ["signup", "Inscription"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                style={{ flex: 1, padding: "15px", background: mode === m ? t.accentBg : "transparent", border: "none", borderBottom: mode === m ? `2px solid ${t.accent}` : "2px solid transparent", color: mode === m ? t.accent : t.textMuted, cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.15s" }}>{label}</button>
            ))}
          </div>
        )}
        <div style={{ padding: "24px" }}>
          {mode === "forgot" && (
            <div style={{ marginBottom: "20px" }}>
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "12px" }}>← Retour</button>
              <div style={{ fontSize: "17px", fontWeight: "700", color: t.text, marginBottom: "6px" }}>Mot de passe oublié</div>
            </div>
          )}
          {mode !== "forgot" && (
            <>
              <button onClick={handleGoogle} style={{ width: "100%", padding: "12px", background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: "10px", color: t.text, cursor: "pointer", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continuer avec Google
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: t.border }} />
                <span style={{ fontSize: "12px", color: t.textFaint }}>ou</span>
                <div style={{ flex: 1, height: "1px", background: t.border }} />
              </div>
            </>
          )}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@email.fr"
              style={{ width: "100%", padding: "11px 13px", border: `1px solid ${t.border}`, background: t.bgInput, fontSize: "15px", color: t.text, borderRadius: "9px", outline: "none" }} />
          </div>
          {mode !== "forgot" && (
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: t.textMuted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mot de passe</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: "100%", padding: "11px 13px", border: `1px solid ${t.border}`, background: t.bgInput, fontSize: "15px", color: t.text, borderRadius: "9px", outline: "none" }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          )}
          {error && <div style={{ padding: "10px 12px", background: t.accentBg, border: `1px solid ${t.accentBorder}`, borderRadius: "8px", fontSize: "13px", color: t.accent, marginBottom: "12px" }}>{error}</div>}
          {success && <div style={{ padding: "10px 12px", background: t.greenBg, border: `1px solid ${t.green}44`, borderRadius: "8px", fontSize: "13px", color: t.green, marginBottom: "12px" }}>{success}</div>}
          <button onClick={handleSubmit} disabled={loading || !email}
            style={{ width: "100%", padding: "12px", background: email ? t.accent : t.border, color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: email ? "pointer" : "default", transition: "all 0.15s" }}>
            {loading ? "..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
          </button>
          {mode === "login" && <button onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: t.textMuted, marginTop: "6px" }}>Mot de passe oublié ?</button>}
        </div>
      </div>
      <button onClick={() => onAuth(null)} style={{ marginTop: "18px", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: t.textFaint }}>Continuer sans compte →</button>
    </div>
  );
}

// ── UI Primitives ─────────────────────────────────────────────────────────────
function Logo({ t }) {
  return <span style={{ fontSize: "20px", fontWeight: "800", color: t.text, letterSpacing: "-0.5px" }}>Média<span style={{ color: t.accent }}>Vue</span></span>;
}

function SrcChip({ id, size = 26 }) {
  const s = getSource(id);
  return <div title={s.name} style={{ width: size, height: size, borderRadius: "6px", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(7, size * 0.27), color: "white", fontWeight: "700", flexShrink: 0 }}>{s.logo}</div>;
}

function BiasBar({ cov, t }) {
  const g = cov?.gauche || 0, c = cov?.centre || 0, d = cov?.droite || 0;
  const total = g + c + d;
  if (total === 0) return null;
  return (
    <div>
      <div style={{ display: "flex", height: "4px", borderRadius: "2px", overflow: "hidden", gap: "2px", marginBottom: "7px" }}>
        {g > 0 && <div style={{ width: `${Math.round((g/total)*100)}%`, background: "#e74c3c", borderRadius: "2px" }} />}
        {c > 0 && <div style={{ width: `${Math.round((c/total)*100)}%`, background: "#888", borderRadius: "2px" }} />}
        {d > 0 && <div style={{ width: `${Math.round((d/total)*100)}%`, background: "#5b9bd5", borderRadius: "2px" }} />}
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        {[["G", g, "#e74c3c"], ["C", c, "#888"], ["D", d, "#5b9bd5"]].map(([label, val, color]) => (
          <span key={label} style={{ fontSize: "11px", color: val > 0 ? color : t.textFaint, display: "flex", alignItems: "center", gap: "3px", fontWeight: "500" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: val > 0 ? color : t.textFaint, display: "inline-block" }} />{label} {val}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScorePill({ score, t }) {
  const { color, label } = score >= 80 ? { color: "#4caf50", label: "Équilibré" } : score >= 40 ? { color: "#f5a623", label: "Partiel" } : { color: "#e74c3c", label: "Unilatéral" };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color, border: `1px solid ${color}44`, background: `${color}15`, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />{label}</span>;
}

function FollowBtn({ type, id, t }) {
  const [following, setFollowing] = useState(() => isFollowing(type, id));
  const toggle = (e) => { e.stopPropagation(); setFollowing(toggleFollow(type, id)); };
  return (
    <button onClick={toggle} style={{ fontSize: "12px", fontWeight: "600", padding: "5px 14px", border: `1.5px solid ${following ? t.green : t.border}`, background: following ? t.greenBg : "transparent", color: following ? t.green : t.textMuted, cursor: "pointer", borderRadius: "20px", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}>
      {following ? "✓ Suivi" : "+ Suivre"}
    </button>
  );
}

function ThemeToggle({ theme, onToggle, t }) {
  return (
    <button onClick={onToggle} style={{ width: "36px", height: "20px", borderRadius: "10px", background: theme === "dark" ? t.accent : t.border, border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: "2px", left: theme === "dark" ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "left 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );
}

// ── Paywall ───────────────────────────────────────────────────────────────────
function PaywallModal({ onClose, user, t }) {
  const [loading, setLoading] = useState(null);
  const [showStudent, setShowStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentDone, setStudentDone] = useState(false);
  const [error, setError] = useState("");

  const checkout = async (plan) => {
    if (!user || user === "guest") { setError("Connectez-vous d'abord pour souscrire."); return; }
    setLoading(plan); setError("");
    try {
      const res = await fetch(`${API_URL}/api/stripe/create-checkout`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError("Erreur lors de la création du paiement.");
    } catch { setError("Erreur de connexion. Réessayez."); }
    setLoading(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.bgCard, width: "100%", maxWidth: "480px", borderRadius: "20px 20px 0 0", border: `1px solid ${t.border}`, overflow: "hidden", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
        <div style={{ width: "36px", height: "4px", background: t.border, borderRadius: "2px", margin: "12px auto 0" }} />
        <div style={{ padding: "20px 24px 8px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Limite atteinte</div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: t.text, lineHeight: "1.2", marginBottom: "4px" }}>Passez à Premium</div>
          <div style={{ fontSize: "14px", color: t.textMuted }}>Lectures illimitées · Angles morts · Profil complet</div>
        </div>
        <div style={{ padding: "16px 24px 20px" }}>
          {error && <div style={{ padding: "10px 12px", background: t.accentBg, border: `1px solid ${t.accentBorder}`, borderRadius: "8px", fontSize: "13px", color: t.accent, marginBottom: "12px" }}>{error}</div>}
          {!showStudent ? (
            <>
              {[
                { label: "Mensuel", price: "4,99€", sub: "/mois", hi: false, plan: "monthly" },
                { label: "Annuel", price: "49€", sub: "/an · économisez 18%", hi: true, plan: "annual" }
              ].map(({ label, price, sub, hi, plan }) => (
                <button key={plan} onClick={() => checkout(plan)} disabled={!!loading}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", marginBottom: "10px", border: `2px solid ${hi ? t.accent : t.border}`, background: hi ? t.accentBg : t.bgInput, cursor: "pointer", borderRadius: "12px", opacity: loading ? 0.7 : 1, transition: "all 0.15s" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: t.text }}>{loading === plan ? "Chargement..." : label}</span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: hi ? t.accent : t.text }}>{price}</span>
                    <span style={{ fontSize: "12px", color: t.textMuted }}>{sub}</span>
                  </div>
                </button>
              ))}
              <button onClick={() => setShowStudent(true)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", marginBottom: "12px", border: `1.5px dashed ${t.green}`, background: t.greenBg, cursor: "pointer", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🎓</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: t.text }}>Tarif étudiant</div>
                    <div style={{ fontSize: "11px", color: t.green }}>Vérification email universitaire</div>
                  </div>
                </div>
                <div><span style={{ fontSize: "18px", fontWeight: "800", color: t.green }}>1,99€</span><span style={{ fontSize: "12px", color: t.textMuted }}>/mois</span></div>
              </button>
              <button onClick={onClose} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", color: t.textFaint }}>Pas maintenant</button>
            </>
          ) : studentDone ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>📧</div>
              <div style={{ fontSize: "17px", fontWeight: "700", color: t.text, marginBottom: "6px" }}>Demande envoyée</div>
              <p style={{ fontSize: "14px", color: t.textMuted, marginBottom: "16px" }}>Nous activerons votre accès sous 24h.</p>
              <button onClick={onClose} style={{ padding: "12px 32px", background: t.green, color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>OK</button>
            </div>
          ) : (
            <div>
              <button onClick={() => setShowStudent(false)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "14px" }}>← Retour</button>
              <div style={{ fontSize: "16px", fontWeight: "700", color: t.text, marginBottom: "12px" }}>Tarif étudiant — 1,99€/mois</div>
              <input type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="prenom.nom@univ-paris.fr"
                style={{ width: "100%", padding: "12px 14px", border: `1px solid ${t.border}`, background: t.bgInput, fontSize: "15px", color: t.text, borderRadius: "9px", outline: "none", marginBottom: "10px" }} />
              <button onClick={() => studentEmail.includes("@") && setStudentDone(true)}
                style={{ width: "100%", padding: "12px", background: studentEmail.includes("@") ? t.green : t.border, color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
                Envoyer ma demande
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────
function StoryCard({ story, onClick, locked, onLock, compact = false, t }) {
  const cov = story.coverageByOrientation || story.coverage_by_orientation || {};
  const srcIds = story.sourceIds || story.source_ids || [];
  const img = story.articles?.[0]?.image_url;
  const breaking = isBreaking(story);
  const score = getScore(cov);

  return (
    <div onClick={locked ? onLock : () => onClick(story)}
      style={{ background: t.bgCard, borderRadius: "14px", overflow: "hidden", cursor: "pointer", marginBottom: "10px", border: `1px solid ${t.border}`, boxShadow: t.shadow, transition: "transform 0.15s, box-shadow 0.15s", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = t.shadow.replace("0.4", "0.6"); }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = t.shadow; }}>

      {locked && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 80%)", zIndex: 2, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "16px", borderRadius: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: t.accent, color: "white", padding: "8px 20px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>🔒 Passer à Premium</div>
        </div>
      )}

      {!compact && img && (
        <div style={{ height: "160px", overflow: "hidden", position: "relative" }}>
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))" }} />
          {breaking && (
            <div style={{ position: "absolute", top: "10px", left: "10px", background: t.accent, color: "white", padding: "3px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em" }}>● BREAKING</div>
          )}
          <div style={{ position: "absolute", bottom: "10px", right: "10px" }}><ScorePill score={score} t={t} /></div>
        </div>
      )}

      <div style={{ padding: compact ? "12px 14px" : "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          {(compact || !img) && breaking && <span style={{ background: t.accent, color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>● BREAKING</span>}
          <span style={{ fontSize: "11px", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{story.category || "Actualité"}</span>
          <span style={{ fontSize: "11px", color: t.textFaint }}>·</span>
          <span style={{ fontSize: "11px", color: t.textFaint }}>{story.coverageCount || story.coverage_count || srcIds.length} sources</span>
          {(!img || compact) && <div style={{ marginLeft: "auto" }}><ScorePill score={score} t={t} /></div>}
        </div>

        <h3 style={{ fontSize: compact ? "15px" : "17px", fontWeight: "700", color: t.text, lineHeight: "1.35", margin: "0 0 8px", letterSpacing: "-0.2px" }}>{story.title}</h3>

        {!compact && story.summary && (
          <p style={{ fontSize: "14px", color: t.textSub, lineHeight: "1.55", margin: "0 0 12px" }}>
            {story.summary.slice(0, 120)}{story.summary.length > 120 ? "…" : ""}
          </p>
        )}

        <BiasBar cov={cov} t={t} />

        {story.blindspot && (
          <div style={{ marginTop: "10px", padding: "8px 12px", background: t.amberBg, border: `1px solid ${t.amber}33`, borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ fontSize: "13px" }}>⚠️</span>
            <span style={{ fontSize: "12px", color: t.amber, fontWeight: "600" }}>Angle mort · {story.blindspot.sides?.join(" & ") || story.blindspot.label}</span>
          </div>
        )}

        {srcIds.length > 0 && (
          <div style={{ display: "flex", gap: "5px", marginTop: "12px", flexWrap: "wrap" }}>
            {srcIds.slice(0, 8).map(id => <SrcChip key={id} id={id} size={24} />)}
            {srcIds.length > 8 && <div style={{ width: 24, height: 24, borderRadius: "6px", background: t.bgInput, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: t.textMuted }}>+{srcIds.length - 8}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Story Modal ───────────────────────────────────────────────────────────────
function StoryModal({ story, onClose, t }) {
  if (!story) return null;
  const articles = story.articles || [];
  const cov = story.coverageByOrientation || story.coverage_by_orientation || {};
  const g = articles.filter(a => (getSource(a.sourceId || a.source_id)?.orientationScore ?? 3) <= 1);
  const c = articles.filter(a => { const s = getSource(a.sourceId || a.source_id)?.orientationScore ?? 3; return s > 1 && s < 4; });
  const d = articles.filter(a => (getSource(a.sourceId || a.source_id)?.orientationScore ?? 3) >= 4);
  const buckets = [{ key: "Gauche", color: "#e74c3c", items: g }, { key: "Centre", color: "#888", items: c }, { key: "Droite", color: "#5b9bd5", items: d }].filter(b => b.items.length > 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.bgCard, maxWidth: "600px", width: "100%", borderRadius: "16px", border: `1px solid ${t.border}`, marginBottom: "20px", boxShadow: t.shadow }}>
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{story.category}</span>
            <ScorePill score={getScore(cov)} t={t} />
            <button onClick={onClose} style={{ marginLeft: "auto", background: t.bgInput, border: "none", color: t.textMuted, width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "16px" }}>×</button>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: t.text, lineHeight: "1.3", marginBottom: "10px", letterSpacing: "-0.3px" }}>{story.title}</h2>
          {story.summary && <p style={{ fontSize: "15px", color: t.textSub, lineHeight: "1.6", marginBottom: "16px" }}>{story.summary}</p>}
          <BiasBar cov={cov} t={t} />
        </div>

        {story.blindspot && (
          <div style={{ margin: "0 20px 14px", padding: "12px 14px", background: t.amberBg, border: `1px solid ${t.amber}33`, borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: t.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>⚠ Angle mort</div>
            <p style={{ fontSize: "14px", color: t.amber, margin: 0, opacity: 0.8 }}>{story.blindspot.label}</p>
          </div>
        )}

        {buckets.length > 0 && (
          <div style={{ padding: "0 20px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Vue côte à côte</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${buckets.length}, 1fr)`, gap: "8px" }}>
              {buckets.map(({ key, color, items }) => (
                <div key={key} style={{ background: t.bgInput, borderRadius: "10px", padding: "12px", border: `1px solid ${t.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px", paddingBottom: "8px", borderBottom: `2px solid ${color}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color, textTransform: "uppercase" }}>{key}</span>
                    <span style={{ fontSize: "11px", color: t.textFaint, marginLeft: "auto" }}>{items.length}</span>
                  </div>
                  {items.slice(0, 3).map((a, i) => {
                    const src = getSource(a.sourceId || a.source_id);
                    return (
                      <div key={i} style={{ marginBottom: i < Math.min(items.length, 3) - 1 ? "10px" : 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                          <SrcChip id={a.sourceId || a.source_id} size={16} />
                          <span style={{ fontSize: "11px", color: t.textMuted, fontWeight: "500" }}>{src.name}</span>
                        </div>
                        <a href={a.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: "13px", color: t.textSub, textDecoration: "none", lineHeight: "1.4", display: "block" }}
                          onMouseEnter={e => e.target.style.color = color} onMouseLeave={e => e.target.style.color = t.textSub}>
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

        {articles.length > 0 && (
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Tous les articles · {articles.length}</div>
            {articles.map((a, i) => {
              const src = getSource(a.sourceId || a.source_id);
              return (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: "12px", borderBottom: i < articles.length - 1 ? `1px solid ${t.border}` : "none", marginBottom: "12px" }}>
                  <SrcChip id={a.sourceId || a.source_id} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: t.textMuted, marginBottom: "3px" }}>{src.name} · <span style={{ color: src.orientationScore <= 1 ? "#e74c3c" : src.orientationScore >= 4 ? "#5b9bd5" : "#888" }}>{src.orientation}</span></div>
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "14px", color: t.textSub, textDecoration: "none", lineHeight: "1.4", display: "block" }}
                      onMouseEnter={e => e.target.style.color = t.accent} onMouseLeave={e => e.target.style.color = t.textSub}>
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

// ── Feed Tab ──────────────────────────────────────────────────────────────────
function FeedTab({ isPremium, onPremium, t }) {
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
        <div style={{ display: "flex", gap: "0", marginBottom: "12px", background: t.bgInput, borderRadius: "10px", padding: "3px", border: `1px solid ${t.border}` }}>
          {[["all", "🌐 Tout"], ["personalized", "⭐ Mon fil"]].map(([id, label]) => (
            <button key={id} onClick={() => setFeedMode(id)} style={{ flex: 1, padding: "8px", background: feedMode === id ? t.accent : "transparent", border: "none", color: feedMode === id ? "white" : t.textMuted, cursor: "pointer", borderRadius: "8px", fontSize: "13px", fontWeight: "600", transition: "all 0.15s" }}>{label}</button>
          ))}
        </div>
      )}

      <div style={{ position: "relative", marginBottom: "12px" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textFaint, fontSize: "15px" }}>🔍</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
          style={{ width: "100%", padding: "11px 12px 11px 36px", border: `1px solid ${t.border}`, background: t.bgInput, fontSize: "15px", color: t.text, borderRadius: "10px", outline: "none" }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "18px" }}>×</button>}
      </div>

      <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginBottom: "14px", paddingBottom: "2px" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{ fontSize: "12px", fontWeight: "600", padding: "6px 14px", border: `1.5px solid ${category === cat ? t.accent : t.border}`, background: category === cat ? t.accentBg : t.bgCard, color: category === cat ? t.accent : t.textMuted, cursor: "pointer", borderRadius: "20px", whiteSpace: "nowrap", transition: "all 0.15s" }}>
            {cat}
          </button>
        ))}
      </div>

      {!isPremium && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: t.goldBg, borderRadius: "10px", marginBottom: "14px", border: `1px solid ${t.gold}33` }}>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {Array.from({ length: FREE_LIMIT }).map((_, i) => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: i < reads ? t.accent : t.border, transition: "background 0.3s" }} />)}
          </div>
          <span style={{ fontSize: "12px", color: readsLeft > 0 ? t.textMuted : t.accent, fontWeight: "500" }}>
            {readsLeft > 0 ? `${readsLeft} gratuite${readsLeft > 1 ? "s" : ""} restante${readsLeft > 1 ? "s" : ""}` : "Limite atteinte"}
          </span>
          <button onClick={onPremium} style={{ fontSize: "12px", fontWeight: "700", background: t.accent, color: "white", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer" }}>Premium</button>
        </div>
      )}

      {loading && <div style={{ width: "24px", height: "24px", border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "60px auto" }} />}
      {error && <div style={{ padding: "14px", background: t.accentBg, border: `1px solid ${t.accentBorder}`, borderRadius: "10px", fontSize: "14px", color: t.accent }}>{error}</div>}

      {!loading && breaking.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.accent, display: "inline-block" }} />
            <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: t.accent }}>Breaking News</span>
          </div>
          {breaking.map((s, i) => <StoryCard key={s.id || i} story={s} onClick={handleClick} locked={!isPremium && reads >= FREE_LIMIT} onLock={() => setShowPaywall(true)} t={t} />)}
          <div style={{ height: "1px", background: t.border, margin: "14px 0" }} />
        </div>
      )}

      {!loading && !error && regular.map((s, i) => (
        <div key={s.id || i} style={{ animation: `fadeUp 0.3s ease ${Math.min(i, 8) * 0.04}s both` }}>
          <StoryCard story={s} onClick={handleClick} locked={!isPremium && reads + i >= FREE_LIMIT} onLock={() => setShowPaywall(true)} t={t} />
        </div>
      ))}

      {!loading && filtered.length === 0 && search && <div style={{ textAlign: "center", padding: "50px 20px", fontSize: "15px", color: t.textMuted }}>Aucun résultat pour «{search}»</div>}
      {selected && <StoryModal story={selected} onClose={() => setSelected(null)} t={t} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} user={null} t={t} />}
    </div>
  );
}

// ── Angle Mort Tab ────────────────────────────────────────────────────────────
function AngleMortTab({ isPremium, onPremium, t }) {
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
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: t.text, marginBottom: "4px", letterSpacing: "-0.3px" }}>Angles morts</h2>
      <p style={{ fontSize: "14px", color: t.textMuted, marginBottom: "16px" }}>Ce que chaque camp choisit de ne pas couvrir.</p>

      {!loading && stories.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
          {[["gauche", "#e74c3c", "Ignoré · Gauche"], ["centre", "#888", "Ignoré · Centre"], ["droite", "#5b9bd5", "Ignoré · Droite"]].map(([side, color, label]) => (
            <div key={side} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "12px", textAlign: "center", boxShadow: t.shadow }}>
              <div style={{ fontSize: "24px", fontWeight: "800", color, marginBottom: "4px" }}>{counts[side] || 0}</div>
              <div style={{ fontSize: "10px", fontWeight: "600", color: t.textMuted, letterSpacing: "0.05em" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {[["all", "Tous", t.textMuted], ["gauche", "Gauche", "#e74c3c"], ["centre", "Centre", "#888"], ["droite", "Droite", "#5b9bd5"]].map(([val, label, color]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ fontSize: "12px", fontWeight: "600", padding: "6px 14px", border: `1.5px solid ${filter === val ? color : t.border}`, background: filter === val ? `${color}15` : t.bgCard, color: filter === val ? color : t.textMuted, cursor: "pointer", borderRadius: "20px", transition: "all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {!isPremium && (
        <div style={{ padding: "14px 16px", background: t.accentBg, border: `1px solid ${t.accentBorder}`, borderRadius: "12px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: t.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Fonctionnalité Premium</div>
            <p style={{ fontSize: "13px", color: t.textMuted, margin: 0 }}>Accédez aux angles morts complets.</p>
          </div>
          <button onClick={onPremium} style={{ fontSize: "13px", fontWeight: "700", background: t.accent, color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}>Débloquer</button>
        </div>
      )}

      {loading && <div style={{ width: "24px", height: "24px", border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "40px auto" }} />}
      {!loading && filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", background: t.bgCard, borderRadius: "12px", border: `1px solid ${t.border}` }}><div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div><div style={{ fontSize: "16px", fontWeight: "600", color: t.textMuted }}>Aucun angle mort détecté</div></div>}
      {!loading && filtered.map((s, i) => <div key={s.id || i} style={{ animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}><StoryCard story={s} onClick={handleClick} locked={false} onLock={() => {}} compact t={t} /></div>)}
      {selected && <StoryModal story={selected} onClose={() => setSelected(null)} t={t} />}
    </div>
  );
}

// ── Sources Tab ───────────────────────────────────────────────────────────────
function SourcesTab({ t }) {
  const [section, setSection] = useState("sources");
  const [filter, setFilter] = useState("all");
  const filteredSources = filter === "all" ? SOURCES : SOURCES.filter(s => filter === "gauche" ? s.orientationScore <= 1 : filter === "centre" ? s.orientationScore > 1 && s.orientationScore < 4 : s.orientationScore >= 4);

  return (
    <div style={{ paddingBottom: "80px" }}>
      <div style={{ display: "flex", gap: "0", marginBottom: "16px", background: t.bgInput, borderRadius: "10px", padding: "3px", border: `1px solid ${t.border}` }}>
        {[["sources", "📰 Sources"], ["politicians", "🏛️ Politiciens"]].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} style={{ flex: 1, padding: "10px", background: section === id ? t.accent : "transparent", border: "none", color: section === id ? "white" : t.textMuted, cursor: "pointer", borderRadius: "8px", fontSize: "13px", fontWeight: "600", transition: "all 0.15s" }}>{label}</button>
        ))}
      </div>

      {section === "sources" && (
        <>
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {["all", "gauche", "centre", "droite"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ fontSize: "12px", fontWeight: "600", padding: "5px 14px", border: `1.5px solid ${filter === f ? t.accent : t.border}`, background: filter === f ? t.accentBg : t.bgCard, color: filter === f ? t.accent : t.textMuted, cursor: "pointer", borderRadius: "20px" }}>
                {f === "all" ? "Tous" : f}
              </button>
            ))}
          </div>
          {filteredSources.map(src => (
            <div key={src.id} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "14px 16px", marginBottom: "8px", boxShadow: t.shadow }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <SrcChip id={src.id} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: t.text }}>{src.name}</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: src.orientationScore <= 1 ? "#e74c3c" : src.orientationScore >= 4 ? "#5b9bd5" : "#888" }}>● {src.orientation}</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <div><div style={{ fontSize: "10px", fontWeight: "700", color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Fiabilité</div><div style={{ fontSize: "13px", fontWeight: "600", color: src.factuality === "Élevée" ? "#4caf50" : src.factuality === "Mixte" ? "#f5a623" : "#e74c3c" }}>{src.factuality}</div></div>
                    <div><div style={{ fontSize: "10px", fontWeight: "700", color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Propriétaire</div><div style={{ fontSize: "13px", color: t.textSub }}>{src.owner}</div></div>
                    <div><div style={{ fontSize: "10px", fontWeight: "700", color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Structure</div><div style={{ fontSize: "13px", color: t.textSub }}>{src.structure}</div></div>
                  </div>
                  <FollowBtn type="sources" id={src.id} t={t} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {section === "politicians" && (
        <>
          <p style={{ fontSize: "14px", color: t.textMuted, marginBottom: "14px" }}>Suivez les politiciens pour personnaliser votre fil.</p>
          {POLITICIANS.map(pol => (
            <div key={pol.id} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "14px 16px", marginBottom: "8px", boxShadow: t.shadow }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: pol.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "white", fontWeight: "700", flexShrink: 0 }}>{pol.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: t.text }}>{pol.name}</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: pol.orientationScore <= 1 ? "#e74c3c" : pol.orientationScore >= 4 ? "#5b9bd5" : "#888" }}>● {pol.orientation}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "8px" }}>{pol.party} · {pol.role}</div>
                  <FollowBtn type="politicians" id={pol.id} t={t} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── Profil Tab ────────────────────────────────────────────────────────────────
function ProfilTab({ isPremium, onPremium, user, onSignOut, t }) {
  const [profile] = useState(getProfile());
  const follows = getFollows();
  const total = profile.gauche + profile.centre + profile.droite;
  const gPct = total > 0 ? Math.round((profile.gauche / total) * 100) : 0;
  const cPct = total > 0 ? Math.round((profile.centre / total) * 100) : 0;
  const dPct = total > 0 ? Math.round((profile.droite / total) * 100) : 0;
  const reads = getReadsToday();
  const dominant = total === 0 ? null : gPct > 60 ? { label: "Vous lisez majoritairement à gauche", color: "#e74c3c", missing: "droite et centre" } : dPct > 60 ? { label: "Vous lisez majoritairement à droite", color: "#5b9bd5", missing: "gauche et centre" } : cPct > 60 ? { label: "Vous lisez majoritairement le centre", color: "#888", missing: "gauche et droite" } : { label: "Votre lecture est équilibrée 🎉", color: "#4caf50", missing: null };
  const followedSources = SOURCES.filter(s => follows.sources.includes(s.id));
  const followedPols = POLITICIANS.filter(p => follows.politicians.includes(p.id));

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* User card */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "18px", marginBottom: "12px", boxShadow: t.shadow }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: t.accentBg, border: `2px solid ${t.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", color: t.accent, flexShrink: 0 }}>
            {user?.email?.[0]?.toUpperCase() || "👤"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: t.text, marginBottom: "3px" }}>{user?.email || "Visiteur"}</div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: isPremium ? "#4caf50" : t.textMuted }}>{isPremium ? "● PREMIUM" : "Compte gratuit"}</div>
          </div>
          {user && <button onClick={onSignOut} style={{ fontSize: "12px", fontWeight: "600", color: t.textMuted, background: t.bgInput, border: `1px solid ${t.border}`, padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>Déconnexion</button>}
        </div>
      </div>

      {/* Follows */}
      {(followedSources.length > 0 || followedPols.length > 0) && (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden", marginBottom: "12px", boxShadow: t.shadow }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Vous suivez · {followedSources.length + followedPols.length}</div>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {followedSources.length > 0 && <div style={{ marginBottom: followedPols.length > 0 ? "10px" : 0 }}><div style={{ fontSize: "11px", fontWeight: "600", color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Sources</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{followedSources.map(s => <SrcChip key={s.id} id={s.id} size={32} />)}</div></div>}
            {followedPols.length > 0 && <div><div style={{ fontSize: "11px", fontWeight: "600", color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Politiciens</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{followedPols.map(p => <div key={p.id} title={p.name} style={{ width: 32, height: 32, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "white", fontWeight: "700" }}>{p.initials}</div>)}</div></div>}
          </div>
        </div>
      )}

      {/* Bias profile */}
      {total > 0 && (
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "18px", marginBottom: "12px", boxShadow: t.shadow }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Votre spectre de lecture</div>
          <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", marginBottom: "12px", gap: "2px" }}>
            {gPct > 0 && <div style={{ width: `${gPct}%`, background: "#e74c3c", transition: "width 0.8s ease" }} />}
            {cPct > 0 && <div style={{ width: `${cPct}%`, background: "#888", transition: "width 0.8s ease" }} />}
            {dPct > 0 && <div style={{ width: `${dPct}%`, background: "#5b9bd5", transition: "width 0.8s ease" }} />}
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            {[["Gauche", gPct, "#e74c3c"], ["Centre", cPct, "#888"], ["Droite", dPct, "#5b9bd5"]].map(([label, pct, color]) => (
              <div key={label} style={{ flex: 1, textAlign: "center", background: t.bgInput, borderRadius: "10px", padding: "10px 6px", border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color, marginBottom: "2px" }}>{pct}%</div>
                <div style={{ fontSize: "11px", fontWeight: "600", color: t.textMuted }}>{label}</div>
              </div>
            ))}
          </div>
          {dominant && <div style={{ padding: "12px 14px", background: `${dominant.color}15`, border: `1px solid ${dominant.color}33`, borderRadius: "10px" }}><div style={{ fontSize: "14px", fontWeight: "600", color: dominant.color }}>{dominant.label}</div></div>}
          {dominant?.missing && isPremium && <div style={{ marginTop: "10px", padding: "12px 14px", background: t.amberBg, border: `1px solid ${t.amber}33`, borderRadius: "10px" }}><div style={{ fontSize: "11px", fontWeight: "700", color: t.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>⚠ Votre angle mort</div><p style={{ fontSize: "13px", color: t.amber, margin: 0, opacity: 0.8 }}>Vous lisez peu de sources {dominant.missing}.</p></div>}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "14px", textAlign: "center", boxShadow: t.shadow }}>
          <div style={{ fontSize: "26px", fontWeight: "800", color: t.accent, marginBottom: "3px" }}>{reads}</div>
          <div style={{ fontSize: "11px", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Aujourd'hui</div>
        </div>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "14px", textAlign: "center", boxShadow: t.shadow }}>
          <div style={{ fontSize: "26px", fontWeight: "800", color: t.text, marginBottom: "3px" }}>{profile.total}</div>
          <div style={{ fontSize: "11px", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Au total</div>
        </div>
      </div>

      {!isPremium && (
        <div style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, borderRadius: "14px", padding: "18px", textAlign: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "17px", fontWeight: "800", color: t.text, marginBottom: "6px" }}>Débloquez votre profil complet</div>
          <p style={{ fontSize: "14px", color: t.textMuted, lineHeight: "1.5", marginBottom: "14px" }}>Angle mort personnel, historique, recommandations.</p>
          <button onClick={onPremium} style={{ width: "100%", padding: "13px", background: t.accent, color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>Passer à Premium</button>
        </div>
      )}

      {/* Tracker teaser */}
      <div style={{ background: t.greenBg, border: `1.5px dashed ${t.green}66`, borderRadius: "14px", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "16px" }}>🏛️</span>
          <div style={{ fontSize: "11px", fontWeight: "700", color: t.green, textTransform: "uppercase", letterSpacing: "0.08em" }}>Bientôt · Tracker Politique</div>
        </div>
        <p style={{ fontSize: "13px", color: t.green, opacity: 0.7, lineHeight: "1.5", margin: "0 0 6px" }}>Tweets des politiciens en temps réel. Sénatoriales 2026.</p>
        <div style={{ fontSize: "12px", color: t.green, opacity: 0.5 }}>Macron · Le Pen · Mélenchon · Bardella · +50</div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function MédiaVue() {
  const [user, setUser] = useState(undefined);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [tab, setTab] = useState("news");
  const [theme, setTheme] = useState(getSavedTheme);
  const t = THEMES[theme];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") window.history.replaceState({}, "", "/");
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) loadPremiumStatus(session.user.id);
    });
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

  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null); setIsPremium(false); };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  };

  const navItems = [
    { id: "news", label: "Actualités", icon: (active, t) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? t.accent : t.textFaint} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
    )},
    { id: "blindspot", label: "Angles morts", icon: (active, t) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? t.accent : t.textFaint} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    )},
    { id: "sources", label: "Sources", icon: (active, t) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? t.accent : t.textFaint} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    )},
    { id: "profile", label: "Profil", icon: (active, t) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? t.accent : t.textFaint} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    )},
  ];

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "30px", fontWeight: "800", color: t.text, marginBottom: "20px" }}>Média<span style={{ color: t.accent }}>Vue</span></div>
          <div style={{ width: "24px", height: "24px", border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap');*{box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',sans-serif;}body{background:${t.bg};}@keyframes spin{to{transform:rotate(360deg)}}input::placeholder{color:${t.textFaint};}`}</style>
        <AuthScreen onAuth={(u) => setUser(u || "guest")} t={t} />
      </>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap');*{box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',sans-serif;}body{background:${t.bg};}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}input::placeholder{color:${t.textFaint};}::-webkit-scrollbar{width:3px;height:0;}::-webkit-scrollbar-thumb{background:${t.border};}`}</style>
      <div style={{ minHeight: "100vh", background: t.bg, maxWidth: "480px", margin: "0 auto" }}>
        <header style={{ background: t.bgHeader, borderBottom: `1px solid ${t.border}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 100, boxShadow: t.shadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Logo t={t} />
              <div style={{ fontSize: "11px", color: t.textFaint, marginTop: "1px" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: t.textFaint }}>{theme === "dark" ? "🌙" : "☀️"}</span>
                <ThemeToggle theme={theme} onToggle={toggleTheme} t={t} />
              </div>
              {isPremium
                ? <span style={{ fontSize: "11px", fontWeight: "700", color: "#4caf50", border: `1.5px solid #4caf5066`, padding: "3px 10px", borderRadius: "20px" }}>PREMIUM</span>
                : <button onClick={() => setShowPaywall(true)} style={{ fontSize: "12px", fontWeight: "700", background: t.accent, color: "white", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer" }}>Premium</button>
              }
            </div>
          </div>
        </header>

        <div style={{ padding: "14px 14px 0" }}>
          {tab === "news" && <FeedTab isPremium={isPremium} onPremium={() => setShowPaywall(true)} t={t} />}
          {tab === "blindspot" && <AngleMortTab isPremium={isPremium} onPremium={() => setShowPaywall(true)} t={t} />}
          {tab === "sources" && <SourcesTab t={t} />}
          {tab === "profile" && <ProfilTab isPremium={isPremium} onPremium={() => setShowPaywall(true)} user={user === "guest" ? null : user} onSignOut={handleSignOut} t={t} />}
        </div>

        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "480px", background: t.bgNav, borderTop: `1px solid ${t.border}`, display: "flex", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom, 6px)", boxShadow: `0 -2px 10px rgba(0,0,0,0.1)` }}>
          {navItems.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 0 6px", background: "transparent", border: "none", cursor: "pointer" }}>
              {icon(tab === id, t)}
              <span style={{ fontSize: "10px", fontWeight: tab === id ? "700" : "500", color: tab === id ? t.accent : t.textFaint, transition: "color 0.15s" }}>{label}</span>
              {tab === id && <div style={{ width: "18px", height: "2.5px", background: t.accent, borderRadius: "2px" }} />}
            </button>
          ))}
        </nav>
      </div>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} user={user === "guest" ? null : user} t={t} />}
    </>
  );
}
