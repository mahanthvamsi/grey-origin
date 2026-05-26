import { useState, useEffect, useCallback } from "react";
import { signOut } from "firebase/auth";
import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, serverTimestamp,
  query, orderBy, setDoc, getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

// ── Cloudinary ────────────────────────────────────────────────
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: form });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Cloudinary upload failed");
  return data.secure_url;
}

function extractYouTubeId(embed) {
  const m = embed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const emptyForm = {
  title: "", category: "", year: new Date().getFullYear().toString(),
  description: "", youtubeEmbed: "", gif: "",
  portrait: false, featureImage: "", featured: false,
};

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh", background: "#080808",
    color: "#f5f5f0", fontFamily: "'DM Sans', sans-serif",
    padding: "clamp(24px,4vw,48px)",
  },
  label: {
    display: "block", fontSize: "10px", letterSpacing: "3px",
    textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
    marginBottom: "10px",
  },
  input: {
    width: "100%", background: "transparent",
    border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)",
    padding: "12px 0", color: "#f5f5f0", fontSize: "14px",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.3s",
  },
  textarea: {
    width: "100%", background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "12px", color: "#f5f5f0", fontSize: "13px",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
    resize: "vertical", minHeight: "90px",
    transition: "border-color 0.3s",
  },
  btn: (variant = "default") => ({
    background: variant === "danger" ? "rgba(230,60,60,0.1)"
              : variant === "accent" ? "rgba(200,169,110,0.1)"
              : "transparent",
    border: `1px solid ${
      variant === "danger" ? "rgba(230,60,60,0.35)"
    : variant === "accent" ? "rgba(200,169,110,0.45)"
    : "rgba(255,255,255,0.2)"}`,
    color: variant === "danger" ? "#e63c3c"
         : variant === "accent" ? "#c8a96e"
         : "#f5f5f0",
    padding: "10px 20px", fontSize: "11px", letterSpacing: "2px",
    textTransform: "uppercase", cursor: "none",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s",
    whiteSpace: "nowrap",
  }),
  card: {
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "20px 24px", marginBottom: "8px",
    background: "rgba(255,255,255,0.02)",
  },
};

export default function AdminDashboard() {
  const [projects,      setProjects]      = useState([]);
  const [featuredOrder, setFeaturedOrder] = useState([]); // ordered array of project IDs
  const [form,          setForm]          = useState(emptyForm);
  const [editId,        setEditId]        = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [view,          setView]          = useState("list"); // "list" | "form" | "featured"
  const [msg,           setMsg]           = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  // ── Load projects + featured order ──────────────────────────
  const loadAll = useCallback(async () => {
    const [snap, orderSnap] = await Promise.all([
      getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc"))),
      getDoc(doc(db, "settings", "featured")),
    ]);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProjects(all);

    // Restore order from settings, filter out deleted projects
    const savedOrder = orderSnap.exists() ? (orderSnap.data().order || []) : [];
    const featuredIds = all.filter((p) => p.featured).map((p) => p.id);
    // Merge: keep saved order for existing featured, append any new featured not yet in order
    const merged = [
      ...savedOrder.filter((id) => featuredIds.includes(id)),
      ...featuredIds.filter((id) => !savedOrder.includes(id)),
    ].slice(0, 4);
    setFeaturedOrder(merged);
    setDataLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Save featured order to Firestore ────────────────────────
  const saveFeaturedOrder = async (newOrder) => {
    await setDoc(doc(db, "settings", "featured"), { order: newOrder });
    setFeaturedOrder(newOrder);
  };

  // ── Toggle featured ─────────────────────────────────────────
  const handleToggleFeatured = async (project) => {
    if (!project.featured && featuredOrder.length >= 4) {
      showMsg("Max 4 featured. Unfeature one first.", true);
      return;
    }
    const nowFeatured = !project.featured;
    await updateDoc(doc(db, "projects", project.id), { featured: nowFeatured });

    let newOrder = [...featuredOrder];
    if (nowFeatured) {
      if (!newOrder.includes(project.id)) newOrder.push(project.id);
    } else {
      newOrder = newOrder.filter((id) => id !== project.id);
    }
    await saveFeaturedOrder(newOrder);
    await loadAll();
  };

  // ── Reorder featured slots ───────────────────────────────────
  const moveSlot = async (index, direction) => {
    const newOrder = [...featuredOrder];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    await saveFeaturedOrder(newOrder);
  };

  // ── Upload helper ────────────────────────────────────────────
  const uploadFile = async (file, field) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, [field]: url }));
    } catch {
      showMsg("Upload failed. Check Cloudinary preset.", true);
    } finally {
      setUploading(false);
    }
  };

  // ── Save project ─────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (form.featured && !editId && featuredOrder.length >= 4) {
      showMsg("Max 4 featured. Unfeature one first.", true);
      return;
    }

    setSaving(true);
    const payload = {
      title:        form.title.trim(),
      category:     form.category.trim(),
      year:         form.year.trim(),
      description:  form.description.trim(),
      youtubeId:    extractYouTubeId(form.youtubeEmbed),
      youtubeEmbed: form.youtubeEmbed.trim(),
      slug:         slugify(form.title),
      gif:          form.gif,
      thumbnail:    form.gif,
      portrait:     form.portrait,
      featureImage: form.featureImage,
      featured:     form.featured,
    };

    try {
      let projectId = editId;
      if (editId) {
        await updateDoc(doc(db, "projects", editId), payload);
      } else {
        const ref = await addDoc(collection(db, "projects"), { ...payload, createdAt: serverTimestamp() });
        projectId = ref.id;
      }

      // Update featured order if needed
      let newOrder = [...featuredOrder];
      if (form.featured && !newOrder.includes(projectId)) {
        newOrder.push(projectId);
      } else if (!form.featured) {
        newOrder = newOrder.filter((id) => id !== projectId);
      }
      await saveFeaturedOrder(newOrder);

      // Bust cache so homepage/work page reflects changes immediately
      localStorage.removeItem("go_featured");
      localStorage.removeItem("go_all_projects");
      showMsg(editId ? "Project updated." : "Project added.");
      setForm(emptyForm);
      setEditId(null);
      setView("list");
      await loadAll();
    } catch (err) {
      showMsg("Save failed: " + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await deleteDoc(doc(db, "projects", id));
    const newOrder = featuredOrder.filter((oid) => oid !== id);
    await saveFeaturedOrder(newOrder);
    localStorage.removeItem("go_featured");
    localStorage.removeItem("go_all_projects");
    await loadAll();
    showMsg("Deleted.");
  };

  // ── Edit ──────────────────────────────────────────────────────
  const handleEdit = (project) => {
    setForm({
      title:        project.title        || "",
      category:     project.category     || "",
      year:         project.year         || "",
      description:  project.description  || "",
      youtubeEmbed: project.youtubeEmbed || "",
      gif:          project.gif          || "",
      portrait:     project.portrait     || false,
      featureImage: project.featureImage || "",
      featured:     project.featured     || false,
    });
    setEditId(project.id);
    setView("form");
    setMsg("");
  };

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg(""), 3000);
  };

  // Ordered featured project objects
  const featuredProjects = featuredOrder
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "24px" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "3px", color: "#f5f5f0" }}>
            Grey Origin
          </div>
          <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>
            Admin Dashboard
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {view === "list" && (<>
            <button style={S.btn()} onClick={() => { setForm(emptyForm); setEditId(null); setView("form"); setMsg(""); }}>+ New Project</button>
            <button style={S.btn("accent")} onClick={() => setView("featured")}>★ Manage Featured</button>
          </>)}
          {view !== "list" && (
            <button style={S.btn()} onClick={() => { setView("list"); setMsg(""); }}>← Back</button>
          )}
          <button style={S.btn("danger")} onClick={() => signOut(auth).then(() => window.location.href = "/")}>Sign Out</button>
        </div>
      </div>

      {/* ── Status message ── */}
      {msg && (
        <div style={{ fontSize: "12px", letterSpacing: "1px", marginBottom: "20px", padding: "12px 16px", background: msg.isError ? "rgba(230,60,60,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${msg.isError ? "rgba(230,60,60,0.2)" : "rgba(255,255,255,0.08)"}`, color: msg.isError ? "#e63c3c" : "rgba(255,255,255,0.5)" }}>
          {msg.text}
        </div>
      )}

      {/* ════════════════════════════════════
          PROJECT LIST
      ════════════════════════════════════ */}
      {view === "list" && (
        <div>
          {/* Stats row */}
          <div style={{ display: "flex", gap: "24px", marginBottom: "28px", flexWrap: "wrap" }}>
            {[
              { label: "Total Projects", value: projects.length },
              { label: "Featured", value: `${featuredProjects.length}/4` },
              { label: "Portrait", value: projects.filter(p => p.portrait).length },
              { label: "Landscape", value: projects.filter(p => !p.portrait).length },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: "14px 20px", border: "1px solid rgba(255,255,255,0.07)", minWidth: "100px" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "1px", color: "#f5f5f0", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {dataLoading ? (
                <div style={{ padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "40px" }}>
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} style={{
                        width: "4px", borderRadius: "2px",
                        background: "rgba(255,255,255,0.6)",
                        animation: `adminBar 1.1s ease-in-out ${i * 0.12}s infinite alternate`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", letterSpacing: "4px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                    Loading Projects
                  </span>
                  <style>{`
                    @keyframes adminBar {
                      from { height: 6px;  opacity: 0.2; }
                      to   { height: 24px; opacity: 0.6; }
                    }
                  `}</style>
                </div>
              ) : projects.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", padding: "40px 0" }}>No projects yet. Add your first one.</p>
              ) : null
            }

          {/* Project rows */}
          {projects.map((project) => (
            <div key={project.id} style={S.card}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>

                {/* Thumbnail */}
                <div style={{ flexShrink: 0, width: "72px", height: "54px", overflow: "hidden", background: "#111" }}>
                  {(project.featureImage || project.thumbnail) && (
                    <img src={project.featureImage || project.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "1px" }}>{project.title}</span>
                    {project.featured && <span style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "#c8a96e", border: "1px solid rgba(200,169,110,0.35)", padding: "2px 7px" }}>Featured</span>}
                    {project.portrait && <span style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 7px" }}>Portrait</span>}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>
                    {project.category}{project.year ? ` · ${project.year}` : ""}
                    {project.youtubeId ? " · YT ✓" : " · No video"}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                  <button style={S.btn(project.featured ? "accent" : "default")} onClick={() => handleToggleFeatured(project)}>
                    {project.featured ? "★ Featured" : "☆ Feature"}
                  </button>
                  <button style={{ ...S.btn(), padding: "8px 14px", fontSize: "10px" }} onClick={() => handleEdit(project)}>Edit</button>
                  <button style={{ ...S.btn("danger"), padding: "8px 14px", fontSize: "10px" }} onClick={() => handleDelete(project.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════
          MANAGE FEATURED ORDER
      ════════════════════════════════════ */}
      {view === "featured" && (
        <div style={{ maxWidth: "600px" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "2px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
            Featured Order
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px", marginBottom: "28px", lineHeight: 1.6 }}>
            These 4 projects appear on the homepage in this order. Use the arrows to reorder.
            To add or remove, use the ☆ Feature button on the project list.
          </p>

          {featuredProjects.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No featured projects yet. Feature some from the project list.</p>
          )}

          {featuredProjects.map((project, i) => (
            <div key={project.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Slot number */}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: "rgba(255,255,255,0.15)", letterSpacing: "1px", flexShrink: 0, width: "36px", textAlign: "center" }}>
                {i + 1}
              </div>

              {/* Thumbnail */}
              <div style={{ width: "72px", height: "54px", overflow: "hidden", background: "#111", flexShrink: 0 }}>
                {(project.featureImage || project.thumbnail) && (
                  <img src={project.featureImage || project.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "1px", marginBottom: "3px" }}>{project.title}</div>
                <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                  {project.category}{project.year ? ` · ${project.year}` : ""}
                  {project.portrait ? " · Portrait" : " · Landscape"}
                </div>
              </div>

              {/* Up / Down arrows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                <button
                  onClick={() => moveSlot(i, -1)}
                  disabled={i === 0}
                  style={{ ...S.btn(), padding: "6px 12px", opacity: i === 0 ? 0.3 : 1, fontSize: "14px" }}
                >▲</button>
                <button
                  onClick={() => moveSlot(i, 1)}
                  disabled={i === featuredProjects.length - 1}
                  style={{ ...S.btn(), padding: "6px 12px", opacity: i === featuredProjects.length - 1 ? 0.3 : 1, fontSize: "14px" }}
                >▼</button>
              </div>

              {/* Remove from featured */}
              <button
                onClick={() => handleToggleFeatured(project)}
                style={{ ...S.btn("danger"), padding: "8px 12px", fontSize: "10px", flexShrink: 0 }}
              >✕</button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 4 - featuredProjects.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{ ...S.card, display: "flex", alignItems: "center", gap: "16px", opacity: 0.4 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: "rgba(255,255,255,0.15)", width: "36px", textAlign: "center" }}>
                {featuredProjects.length + i + 1}
              </div>
              <div style={{ width: "72px", height: "54px", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.2)" }}>+</span>
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "2px", textTransform: "uppercase" }}>Empty Slot</div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════
          ADD / EDIT FORM
      ════════════════════════════════════ */}
      {view === "form" && (
        <form onSubmit={handleSave} style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "2px", color: "rgba(255,255,255,0.6)" }}>
            {editId ? "Edit Project" : "New Project"}
          </div>

          {/* Title */}
          <div>
            <label style={S.label}>Title *</label>
            <input required style={S.input} placeholder="Dubai Aerial Showreel"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              onFocus={(e) => { e.target.style.borderBottomColor = "rgba(255,255,255,0.5)"; }}
              onBlur={(e)  => { e.target.style.borderBottomColor = "rgba(255,255,255,0.15)"; }}
            />
          </div>

          {/* Category + Year */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={S.label}>Category</label>
              <input style={S.input} placeholder="Commercial"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                onFocus={(e) => { e.target.style.borderBottomColor = "rgba(255,255,255,0.5)"; }}
                onBlur={(e)  => { e.target.style.borderBottomColor = "rgba(255,255,255,0.15)"; }}
              />
            </div>
            <div>
              <label style={S.label}>Year</label>
              <input style={S.input} placeholder="2024"
                value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                onFocus={(e) => { e.target.style.borderBottomColor = "rgba(255,255,255,0.5)"; }}
                onBlur={(e)  => { e.target.style.borderBottomColor = "rgba(255,255,255,0.15)"; }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={S.label}>Description</label>
            <textarea style={S.textarea} placeholder="Short description of the project..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.35)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>

          {/* YouTube embed */}
          <div>
            <label style={S.label}>YouTube Embed Code</label>
            <textarea
              style={{ ...S.textarea, minHeight: "70px", fontSize: "11px", fontFamily: "monospace" }}
              placeholder={'<iframe src="https://www.youtube.com/embed/VIDEO_ID" ...></iframe>'}
              value={form.youtubeEmbed} onChange={(e) => setForm({ ...form, youtubeEmbed: e.target.value })}
              onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.35)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            {form.youtubeEmbed && !extractYouTubeId(form.youtubeEmbed) && (
              <p style={{ fontSize: "11px", color: "#e63c3c", marginTop: "6px" }}>
                Couldn't find a YouTube video ID — double check the embed code.
              </p>
            )}
            {form.youtubeEmbed && extractYouTubeId(form.youtubeEmbed) && (
              <p style={{ fontSize: "11px", color: "#c8a96e", marginTop: "6px" }}>
                ✓ Video ID: {extractYouTubeId(form.youtubeEmbed)}
              </p>
            )}
          </div>

          {/* GIF + Feature Image side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* GIF */}
            <div>
              <label style={S.label}>GIF / Thumbnail</label>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginBottom: "10px", lineHeight: 1.5 }}>
                Shown on hover in the work list
              </p>
              {form.gif ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={form.gif} alt="" style={{ width: "100%", maxWidth: "180px", height: "120px", objectFit: "cover", display: "block" }} />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, gif: "" }))}
                    style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.8)", border: "none", color: "#f5f5f0", fontSize: "11px", padding: "2px 7px", cursor: "none" }}>
                    ✕
                  </button>
                </div>
              ) : (
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "180px", height: "120px", border: "1px dashed rgba(255,255,255,0.12)", fontSize: "10px", letterSpacing: "2px", color: uploading ? "#c8a96e" : "rgba(255,255,255,0.2)", textTransform: "uppercase", cursor: "none" }}>
                  {uploading ? "..." : "+ GIF"}
                  <input type="file" accept="image/gif,image/webp" style={{ display: "none" }} disabled={uploading}
                    onChange={(e) => uploadFile(e.target.files[0], "gif")} />
                </label>
              )}
            </div>

            {/* Feature Image */}
            <div>
              <label style={S.label}>Feature Image</label>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginBottom: "10px", lineHeight: 1.5 }}>
                Static image for the homepage work section
              </p>
              {form.featureImage ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={form.featureImage} alt="" style={{ width: "100%", maxWidth: "180px", height: "120px", objectFit: "cover", display: "block" }} />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, featureImage: "" }))}
                    style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.8)", border: "none", color: "#f5f5f0", fontSize: "11px", padding: "2px 7px", cursor: "none" }}>
                    ✕
                  </button>
                </div>
              ) : (
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "180px", height: "120px", border: "1px dashed rgba(255,255,255,0.12)", fontSize: "10px", letterSpacing: "2px", color: uploading ? "#c8a96e" : "rgba(255,255,255,0.2)", textTransform: "uppercase", cursor: "none" }}>
                  {uploading ? "..." : "+ Image"}
                  <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading}
                    onChange={(e) => uploadFile(e.target.files[0], "featureImage")} />
                </label>
              )}
            </div>
          </div>

          {/* Orientation + Featured toggles */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button"
              onClick={() => setForm((f) => ({ ...f, portrait: !f.portrait }))}
              style={{ ...S.btn(), color: form.portrait ? "#c8a96e" : "rgba(255,255,255,0.5)", borderColor: form.portrait ? "rgba(200,169,110,0.4)" : "rgba(255,255,255,0.15)", background: form.portrait ? "rgba(200,169,110,0.07)" : "transparent" }}
            >
              {form.portrait ? "↕ Portrait (9:16)" : "↔ Landscape (4:3)"}
            </button>
            <button type="button"
              onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
              style={{ ...S.btn(), color: form.featured ? "#c8a96e" : "rgba(255,255,255,0.5)", borderColor: form.featured ? "rgba(200,169,110,0.4)" : "rgba(255,255,255,0.15)", background: form.featured ? "rgba(200,169,110,0.07)" : "transparent" }}
            >
              {form.featured ? "★ Featured" : "☆ Feature on Homepage"}
            </button>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button type="submit" disabled={saving || uploading}
              style={{ ...S.btn(), padding: "14px 36px", opacity: saving || uploading ? 0.5 : 1 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            >
              {saving ? "Saving..." : editId ? "Update Project" : "Add Project"}
            </button>
            {uploading && <span style={{ fontSize: "11px", color: "#c8a96e", letterSpacing: "2px" }}>Uploading...</span>}
          </div>
        </form>
      )}
    </div>
  );
}