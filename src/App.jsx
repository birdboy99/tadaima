import { useState } from "react";
import data from "./data/data.json";

const STAGES = [
  { id: "predeparture", label: "Before arrival" },
  { id: "first2weeks", label: "First 2 weeks" },
  { id: "after2weeks", label: "After 2 weeks" },
];

const TIME_GROUPS = [
  { tag: "predeparture", label: "Before you fly" },
  { tag: "day1",         label: "Day 1" },
  { tag: "week1",        label: "First week" },
  { tag: "within14days", label: "Within 14 days" },
  { tag: "later",        label: "After settling in" },
];

const CATEGORY_LABELS = {
  status:         "Visa Status",
  government:     "Government",
  insurance:      "Insurance",
  banking:        "Banking",
  telecom:        "Telecom",
  utilities:      "Utilities",
  housing:        "Housing",
  garbage:        "Garbage & Recycling",
  transportation: "Transportation",
  health:         "Health",
  safety:         "Safety",
  community:      "Community",
  "student-work": "Student & Work",
  "daily-life":   "Daily Life",
};

// ── Design tokens ──────────────────────────────────────────
const D = {
  bg:         "#0c0c13",
  surface:    "rgba(255,255,255,0.05)",
  surfaceHi:  "rgba(255,255,255,0.09)",
  border:     "rgba(255,255,255,0.08)",
  borderHi:   "rgba(255,255,255,0.16)",
  primary:    "#8b5cf6",
  primaryDim: "rgba(139,92,246,0.15)",
  cyan:       "#22d3ee",
  cyanDim:    "rgba(34,211,238,0.1)",
  text:       "#f1f5f9",
  dim:        "#94a3b8",
  muted:      "#475569",
  red:        "#f43f5e",
  redDim:     "rgba(244,63,94,0.12)",
  green:      "#10b981",
  greenDim:   "rgba(16,185,129,0.12)",
  amber:      "#fbbf24",
  amberDim:   "rgba(251,191,36,0.08)",
  font:       "'Inter', system-ui, sans-serif",
};

const GRAD = "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)";

const wrap = {
  maxWidth: 420, margin: "0 auto", padding: "24px 16px",
  fontFamily: D.font, color: D.text, minHeight: "100svh", background: D.bg,
};

function App() {
  const [screen, setScreen] = useState("region");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [stage, setStage] = useState("predeparture");
  const [done, setDone] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("timeline");
  const [mainTab, setMainTab] = useState("checklist");
  const [activeTag, setActiveTag] = useState(null);
  const [localTips, setLocalTips] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTipBody, setNewTipBody] = useState("");
  const [newTipAuthor, setNewTipAuthor] = useState("");
  const [expandedPref, setExpandedPref] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");
  const [geoRegion, setGeoRegion] = useState(null);

  const toggleDone = (id, e) => {
    if (e) e.stopPropagation();
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const openDetail = (item) => { setSelectedItem(item); setScreen("detail"); };

  // ── Region select ──────────────────────────────────────────
  if (screen === "region") {
    const prefMap = {};
    data.regions.forEach((r) => {
      if (!prefMap[r.prefecture]) prefMap[r.prefecture] = { name: r.prefecture, code: r.prefectureCode, cities: [] };
      prefMap[r.prefecture].cities.push(r);
    });
    const prefectures = Object.values(prefMap).sort((a, b) => a.code - b.code);

    const autoExpand = geoRegion?.prefecture ?? data.regions.find((r) => r.id === selectedRegion)?.prefecture ?? null;
    const activeExpanded = expandedPref === "__none__" ? null : (expandedPref ?? autoExpand);
    const togglePref = (name) => setExpandedPref(activeExpanded === name ? "__none__" : name);
    const hasFullData = (id) => data.items.some((i) => i.byRegion?.[id]);

    const detectLocation = () => {
      if (!navigator.geolocation) { setGeoStatus("denied"); return; }
      setGeoStatus("loading");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
              { headers: { "Accept-Language": "en" } }
            );
            const { address } = await res.json();
            const norm = (s) => (s || "").replace(/ Prefecture$/, "").toLowerCase().trim();
            const stateName = norm(address.state);
            const candidates = [address.city, address.town, address.suburb, address.city_district, address.county].filter(Boolean);
            let found = null;
            for (const c of candidates) {
              found = data.regions.find((r) => norm(r.prefecture) === stateName && r.name.toLowerCase() === c.toLowerCase());
              if (found) break;
            }
            if (!found) found = data.regions.find((r) => norm(r.prefecture) === stateName) ?? null;
            if (found) { setGeoRegion(found); setExpandedPref(found.prefecture); setGeoStatus("found"); }
            else setGeoStatus("not-found");
          } catch { setGeoStatus("idle"); }
        },
        () => setGeoStatus("denied")
      );
    };

    const selectedName = data.regions.find((r) => r.id === selectedRegion)?.name;

    return (
      <div style={wrap}>
        {/* Title */}
        <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.5px", background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>
            Tadaima
          </h1>
          <p style={{ color: D.dim, fontSize: 14 }}>Your first weeks in Japan, sorted.</p>
        </div>

        {/* Geo UI */}
        {geoStatus === "idle" && (
          <button onClick={detectLocation} style={{ width: "100%", padding: "11px", marginBottom: 16, borderRadius: 10, border: `1px solid ${D.primary}`, background: D.primaryDim, color: D.primary, fontSize: 13, cursor: "pointer", fontFamily: D.font, fontWeight: 500 }}>
            📍 Use my location
          </button>
        )}
        {geoStatus === "loading" && (
          <p style={{ fontSize: 13, color: D.dim, marginBottom: 16, textAlign: "center" }}>Detecting your location...</p>
        )}
        {geoStatus === "found" && geoRegion && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: D.primaryDim, border: `1px solid rgba(139,92,246,0.35)`, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: D.primary }}>📍 Near <strong>{geoRegion.name}</strong>, {geoRegion.prefecture}</span>
            {selectedRegion !== geoRegion.id
              ? <button onClick={() => setSelectedRegion(geoRegion.id)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "none", background: GRAD, color: "#fff", cursor: "pointer", fontFamily: D.font, fontWeight: 500 }}>Select</button>
              : <span style={{ fontSize: 12, color: D.cyan }}>✓ Selected</span>
            }
          </div>
        )}
        {(geoStatus === "not-found" || geoStatus === "denied") && (
          <p style={{ fontSize: 12, color: D.muted, marginBottom: 12, textAlign: "center" }}>
            {geoStatus === "denied" ? "Location access denied." : "Couldn't match location."} Please select below.
          </p>
        )}

        <p style={{ fontSize: 11, fontWeight: 600, color: D.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Where do you live?
        </p>

        {/* Prefecture accordion */}
        <div style={{ marginBottom: 20 }}>
          {prefectures.map((pref) => {
            const isOpen = activeExpanded === pref.name;
            return (
              <div key={pref.name} style={{ marginBottom: 3 }}>
                <div
                  onClick={() => togglePref(pref.name)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", cursor: "pointer",
                    background: isOpen ? D.surfaceHi : D.surface,
                    borderRadius: isOpen ? "10px 10px 0 0" : 10,
                    border: `1px solid ${isOpen ? D.borderHi : D.border}`,
                    borderBottom: isOpen ? "none" : `1px solid ${D.border}`,
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: 14, color: D.text }}>{pref.name}</span>
                  <span style={{ fontSize: 12, color: D.muted }}>{pref.cities.length} {isOpen ? "▲" : "▼"}</span>
                </div>

                {isOpen && (
                  <div style={{ border: `1px solid ${D.borderHi}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "6px 8px", background: "rgba(0,0,0,0.2)" }}>
                    {pref.cities.map((city) => {
                      const isSel = selectedRegion === city.id;
                      const isSugg = geoRegion?.id === city.id;
                      const isFull = hasFullData(city.id);
                      return (
                        <div
                          key={city.id}
                          onClick={() => setSelectedRegion(city.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
                            background: isSel ? D.primaryDim : isSugg && !isSel ? D.cyanDim : "transparent",
                            border: `1px solid ${isSel ? "rgba(139,92,246,0.4)" : "transparent"}`,
                          }}
                        >
                          <span style={{ flex: 1, fontSize: 14, color: isSel ? D.primary : D.text, fontWeight: isSel ? 600 : 400 }}>
                            {city.name}
                          </span>
                          {isSugg && !isSel && <span style={{ fontSize: 11, color: D.cyan }}>📍</span>}
                          {isFull && (
                            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "rgba(139,92,246,0.12)", color: D.primary, fontWeight: 500 }}>
                              ★ demo
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setScreen("home")}
          disabled={!selectedRegion}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: selectedRegion ? GRAD : D.surface,
            color: selectedRegion ? "#fff" : D.muted,
            fontSize: 15, fontWeight: 600, cursor: selectedRegion ? "pointer" : "not-allowed",
            fontFamily: D.font,
          }}
        >
          {selectedRegion ? `Continue as ${selectedName}` : "Select a region"}
        </button>
      </div>
    );
  }

  // ── Home ───────────────────────────────────────────────────
  if (screen === "home") {
    const region = data.regions.find((r) => r.id === selectedRegion);

    const header = (
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setScreen("region")} style={{ border: "none", background: "none", color: D.primary, cursor: "pointer", padding: 0, fontSize: 13, fontFamily: D.font, fontWeight: 500 }}>
          ← {region.name}
        </button>
      </div>
    );

    const tabBar = (
      <div style={{ display: "flex", background: D.surface, borderRadius: 10, padding: 3, marginBottom: 20, border: `1px solid ${D.border}` }}>
        {[["checklist", "Checklist"], ["tips", "Tips"]].map(([tab, label]) => (
          <button key={tab} onClick={() => setMainTab(tab)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "none", fontSize: 13,
            cursor: "pointer", fontFamily: D.font, fontWeight: mainTab === tab ? 600 : 400,
            background: mainTab === tab ? D.primaryDim : "transparent",
            color: mainTab === tab ? D.primary : D.muted,
          }}>
            {label}
          </button>
        ))}
      </div>
    );

    // ── Checklist tab ──
    if (mainTab === "checklist") {
      const hasRegionData = data.items.some((i) => i.byRegion?.[selectedRegion]);
      const items = data.items.filter((i) => i.stage === stage);
      const doneCount = items.filter((i) => done[i.id]).length;

      let groups;
      if (viewMode === "timeline") {
        groups = TIME_GROUPS
          .map((g) => ({ label: g.label, items: items.filter((i) => i.timeTag === g.tag) }))
          .filter((g) => g.items.length > 0);
      } else {
        const seen = [];
        items.forEach((i) => { if (!seen.includes(i.category)) seen.push(i.category); });
        groups = seen.map((cat) => ({ label: CATEGORY_LABELS[cat] || cat, items: items.filter((i) => i.category === cat) }));
      }
      const showHeaders = groups.length > 1;

      return (
        <div style={wrap}>
          {header}
          {tabBar}

          {!hasRegionData && (
            <div style={{ fontSize: 12, color: D.amber, background: D.amberDim, border: "1px solid rgba(251,191,36,0.15)", borderRadius: 8, padding: "7px 12px", marginBottom: 14 }}>
              ℹ Office info is demo-only (Shibuya & Hachioji). Checklist still works.
            </div>
          )}

          {/* Stage tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {STAGES.map((s) => (
              <button key={s.id} onClick={() => setStage(s.id)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: D.font, fontWeight: 500,
                border: stage === s.id ? "none" : `1px solid ${D.border}`,
                background: stage === s.id ? GRAD : D.surface,
                color: stage === s.id ? "#fff" : D.dim,
              }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div style={{ display: "flex", background: D.surface, borderRadius: 8, padding: 3, marginBottom: 14, border: `1px solid ${D.border}` }}>
            {[["timeline", "Timeline"], ["category", "Category"]].map(([mode, label]) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                flex: 1, padding: "6px 0", borderRadius: 6, border: "none", fontSize: 12,
                cursor: "pointer", fontFamily: D.font, fontWeight: viewMode === mode ? 600 : 400,
                background: viewMode === mode ? D.primaryDim : "transparent",
                color: viewMode === mode ? D.primary : D.muted,
              }}>
                {label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 13, color: D.muted, marginBottom: 16 }}>{doneCount} of {items.length} done</p>

          {groups.map((group) => (
            <div key={group.label}>
              {showHeaders && (
                <div style={{ fontSize: 11, fontWeight: 600, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "20px 0 8px 2px" }}>
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const isDone = !!done[item.id];
                const regionInfo = item.regionScoped ? item.byRegion[selectedRegion] : null;
                return (
                  <div
                    key={item.id}
                    onClick={() => openDetail(item)}
                    style={{
                      background: D.surface,
                      border: `1px solid ${item.deadline ? "rgba(244,63,94,0.25)" : D.border}`,
                      borderLeft: item.deadline ? `3px solid ${D.red}` : `1px solid ${D.border}`,
                      borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer",
                      opacity: isDone ? 0.45 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span onClick={(e) => toggleDone(item.id, e)} style={{ fontSize: 18, lineHeight: 1, userSelect: "none", color: isDone ? D.green : D.primary }}>
                        {isDone ? "☑" : "☐"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 14, color: D.text, textDecoration: isDone ? "line-through" : "none" }}>{item.title_en}</div>
                        <div style={{ fontSize: 12, color: D.muted, marginTop: 1 }}>{item.title_jp}</div>
                      </div>
                      {item.deadline && (
                        <span style={{ fontSize: 11, background: D.redDim, color: D.red, padding: "2px 8px", borderRadius: 10, border: "1px solid rgba(244,63,94,0.25)", whiteSpace: "nowrap" }}>
                          deadline
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: D.dim, margin: "8px 0 0 28px", lineHeight: 1.5 }}>{item.summary}</p>
                    {regionInfo && (
                      <p style={{ fontSize: 12, color: D.cyan, margin: "6px 0 0 28px" }}>📍 {regionInfo.office}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    // ── Tips tab ──
    if (mainTab === "tips") {
      const allTips = [...data.tips, ...localTips].sort((a, b) => b.date.localeCompare(a.date));
      const allTags = [...new Set(allTips.flatMap((t) => t.tags))].sort();
      const filtered = activeTag ? allTips.filter((t) => t.tags.includes(activeTag)) : allTips;

      const submitTip = () => {
        if (!newTipBody.trim()) return;
        setLocalTips((prev) => [{
          id: `local-${Date.now()}`, scope: "global", itemId: null, region: null, tags: [],
          body: newTipBody.trim(), author: newTipAuthor.trim() || "Anonymous",
          date: new Date().toISOString().slice(0, 10),
        }, ...prev]);
        setNewTipBody(""); setNewTipAuthor(""); setShowAddForm(false);
      };

      return (
        <div style={wrap}>
          {header}
          {tabBar}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: D.text }}>Community tips</h2>
            <button onClick={() => setShowAddForm((v) => !v)} style={{
              fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: D.font, fontWeight: 500,
              border: `1px solid ${showAddForm ? D.primary : D.border}`,
              background: showAddForm ? D.primaryDim : D.surface,
              color: showAddForm ? D.primary : D.dim,
            }}>
              {showAddForm ? "Cancel" : "+ Share a tip"}
            </button>
          </div>

          {showAddForm && (
            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <textarea value={newTipBody} onChange={(e) => setNewTipBody(e.target.value)}
                placeholder="Share something useful you've learned..."
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${D.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: D.font, marginBottom: 8, background: "rgba(255,255,255,0.04)", color: D.text, outline: "none" }}
              />
              <input value={newTipAuthor} onChange={(e) => setNewTipAuthor(e.target.value)}
                placeholder="Your name (optional)"
                style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${D.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: D.font, marginBottom: 10, background: "rgba(255,255,255,0.04)", color: D.text, outline: "none" }}
              />
              <button onClick={submitTip} disabled={!newTipBody.trim()} style={{
                width: "100%", padding: "9px", borderRadius: 8, border: "none",
                background: newTipBody.trim() ? GRAD : D.surface,
                color: newTipBody.trim() ? "#fff" : D.muted,
                fontSize: 13, cursor: newTipBody.trim() ? "pointer" : "not-allowed", fontFamily: D.font, fontWeight: 600,
              }}>Post tip</button>
            </div>
          )}

          {/* Tag filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {[["All", null], ...allTags.map((t) => [t, t])].map(([label, val]) => (
              <button key={String(label)} onClick={() => setActiveTag(val)} style={{
                fontSize: 12, padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontFamily: D.font, fontWeight: 500,
                border: activeTag === val ? "none" : `1px solid ${D.border}`,
                background: activeTag === val ? GRAD : D.surface,
                color: activeTag === val ? "#fff" : D.dim,
              }}>
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 && <p style={{ fontSize: 13, color: D.muted, textAlign: "center", marginTop: 40 }}>No tips yet for this tag.</p>}
          {filtered.map((tip) => {
            const relatedItem = tip.itemId ? data.items.find((i) => i.id === tip.itemId) : null;
            return (
              <div key={tip.id} style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                {relatedItem && <div style={{ fontSize: 11, color: D.cyan, marginBottom: 6, fontWeight: 500 }}>re: {relatedItem.title_en}</div>}
                <p style={{ fontSize: 13, color: D.text, margin: "0 0 8px", lineHeight: 1.55 }}>{tip.body}</p>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: D.muted }}>{tip.author}</span>
                  <span style={{ fontSize: 12, color: D.muted }}>·</span>
                  <span style={{ fontSize: 12, color: D.muted }}>{tip.date}</span>
                </div>
                {tip.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                    {tip.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 11, background: "rgba(139,92,246,0.12)", color: D.primary, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  }

  // ── Item detail ────────────────────────────────────────────
  if (screen === "detail" && selectedItem) {
    const item = selectedItem;
    const isDone = !!done[item.id];
    const regionInfo = item.regionScoped ? item.byRegion[selectedRegion] : null;
    const itemTips = data.tips.filter((t) => t.scope === "item" && t.itemId === item.id);

    return (
      <div style={wrap}>
        <button onClick={() => setScreen("home")} style={{ border: "none", background: "none", color: D.primary, cursor: "pointer", padding: 0, marginBottom: 20, fontSize: 13, fontFamily: D.font, fontWeight: 500 }}>
          ← Your checklist
        </button>

        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, flex: 1, color: D.text, letterSpacing: "-0.3px" }}>{item.title_en}</h1>
          {item.deadline && (
            <span style={{ fontSize: 11, background: D.redDim, color: D.red, padding: "3px 10px", borderRadius: 10, marginLeft: 12, whiteSpace: "nowrap", border: "1px solid rgba(244,63,94,0.25)", fontWeight: 500 }}>
              deadline
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: D.muted, marginTop: 4, marginBottom: 20 }}>{item.title_jp}</p>

        {/* Done toggle */}
        <button onClick={() => toggleDone(item.id)} style={{
          width: "100%", padding: "11px", borderRadius: 10, marginBottom: 24, cursor: "pointer", fontFamily: D.font, fontSize: 14, fontWeight: 500,
          border: `1px solid ${isDone ? D.green : D.border}`,
          background: isDone ? D.greenDim : D.surface,
          color: isDone ? D.green : D.dim,
        }}>
          {isDone ? "☑  Marked as done" : "☐  Mark as done"}
        </button>

        <p style={{ fontSize: 14, color: D.dim, lineHeight: 1.65, marginBottom: 24 }}>{item.summary}</p>

        {/* What to bring */}
        {item.bring.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>What to bring</p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {item.bring.map((b, i) => (
                <li key={i} style={{ fontSize: 13, color: D.dim, marginBottom: 6, lineHeight: 1.5 }}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Gotcha */}
        {item.gotcha && (
          <div style={{ background: D.amberDim, border: "1px solid rgba(251,191,36,0.18)", borderRadius: 10, padding: "12px 14px", marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: D.amber, marginBottom: 6 }}>⚠ Watch out</p>
            <p style={{ fontSize: 13, color: D.dim, lineHeight: 1.55 }}>{item.gotcha}</p>
          </div>
        )}

        {/* Region info */}
        {regionInfo && (
          <div style={{ background: D.cyanDim, border: "1px solid rgba(34,211,238,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: D.cyan, marginBottom: 6 }}>📍 Your office</p>
            <p style={{ fontSize: 13, color: D.dim, marginBottom: 4 }}>{regionInfo.office}</p>
            {regionInfo.note && <p style={{ fontSize: 12, color: D.muted }}>{regionInfo.note}</p>}
          </div>
        )}

        {/* Tips */}
        {itemTips.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Tips from others</p>
            {itemTips.map((tip) => (
              <div key={tip.id} style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <p style={{ fontSize: 13, color: D.text, margin: "0 0 8px", lineHeight: 1.55 }}>{tip.body}</p>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: D.muted }}>{tip.author}</span>
                  <span style={{ fontSize: 12, color: D.muted }}>·</span>
                  <span style={{ fontSize: 12, color: D.muted }}>{tip.date}</span>
                </div>
                {tip.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                    {tip.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 11, background: "rgba(139,92,246,0.12)", color: D.primary, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default App;
