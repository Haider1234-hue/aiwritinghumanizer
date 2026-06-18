/**
 * Admin.jsx — Upgraded blog admin for aiwritinghumanizer.com
 *
 * NEW FEATURES vs original:
 *  - TipTap rich text editor (bold, italic, underline, headings H1-H3,
 *    bullet list, ordered list, blockquote, horizontal rule, undo/redo)
 *  - Inline image insertion with alt text dialog
 *  - Featured image upload with alt text field
 *  - Tags input (comma-separated, displayed as removable chips)
 *  - SEO panel: focus keyword, meta title (60 char), meta description (160 char)
 *  - Slug auto-generation from title
 *  - Character counters on meta fields
 *
 * INSTALL (run once in your project):
 *   npm install @tiptap/react @tiptap/pm @tiptap/starter-kit \
 *     @tiptap/extension-underline @tiptap/extension-image \
 *     @tiptap/extension-placeholder
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Check, Edit3, LogOut, Plus, Save, Trash2, X, Image as ImageIcon } from "lucide-react";
import { defaultPosts, fetchBlogPosts } from "../data/blogPosts";

// ─── helpers ────────────────────────────────────────────────────────────────

const emptyPost = {
  id: "",
  slug: "",
  title: "",
  category: "Writing",
  date: "June 2026",
  readTime: "4 min read",
  excerpt: "",
  content: "",           // HTML string for TipTap
  tags: [],              // string[]
  featuredImage: "",     // URL or base64
  featuredImageAlt: "",
  focusKeyword: "",
  metaTitle: "",
  metaDescription: "",
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizePostForForm(post) {
  return {
    ...emptyPost,
    ...post,
    // legacy: if content is paragraphs array, join to HTML <p> tags
    content: Array.isArray(post.content)
      ? post.content.map((p) => `<p>${p}</p>`).join("")
      : post.content || "",
    tags: Array.isArray(post.tags) ? post.tags : [],
  };
}

async function adminRequest(payload) {
  const response = await fetch(`/api/blog.php?ts=${Date.now()}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Admin API returned the website page instead of JSON. Please hard-refresh and try again.");
  }
  if (!response.ok) throw new Error(data.error || "Admin API request failed.");
  return data;
}

// ─── Toolbar button ──────────────────────────────────────────────────────────

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm font-bold transition-colors select-none ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Rich text toolbar ───────────────────────────────────────────────────────

function EditorToolbar({ editor, onInsertImage }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-white/10 bg-[#0b1015]/60 rounded-t-xl">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">B</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><em>I</em></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><u>U</u></ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><s>S</s></ToolbarBtn>
      <span className="w-px bg-white/10 mx-1" />
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarBtn>
      <span className="w-px bg-white/10 mx-1" />
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1. List</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">❝</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">{"`code`"}</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">—</ToolbarBtn>
      <span className="w-px bg-white/10 mx-1" />
      <ToolbarBtn onClick={onInsertImage} title="Insert image">
        <span className="flex items-center gap-1"><ImageIcon size={13} /> Image</span>
      </ToolbarBtn>
      <span className="w-px bg-white/10 mx-1" />
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolbarBtn>
    </div>
  );
}

// ─── Image insertion dialog ──────────────────────────────────────────────────

function ImageDialog({ onInsert, onClose }) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#121A21] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Insert Image</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Upload file</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="w-full text-gray-300 text-sm mb-4" />

        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Or image URL</label>
        <input
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="https://..."
          className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 mb-4"
        />

        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Alt text <span className="text-red-400">*</span>
        </label>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Describe the image for SEO & accessibility"
          className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 mb-5"
        />

        {src && (
          <img src={src} alt={alt} className="w-full max-h-40 object-contain rounded-xl mb-4 border border-white/10" />
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { if (src) { onInsert(src, alt); onClose(); } }}
            disabled={!src}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl px-4 py-2 transition-colors"
          >
            Insert
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl px-4 py-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tags input ──────────────────────────────────────────────────────────────

function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center focus-within:border-blue-500">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 bg-blue-600/20 text-blue-200 text-xs font-bold px-2 py-1 rounded-lg">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={11} /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
          if (e.key === "Backspace" && !input && tags.length) removeTag(tags[tags.length - 1]);
        }}
        placeholder={tags.length === 0 ? "Type tag and press Enter" : "Add another…"}
        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600 min-w-[120px]"
      />
    </div>
  );
}

// ─── Character counter ────────────────────────────────────────────────────────

function CharCounter({ value, max, label }) {
  const len = value.length;
  const color = len > max ? "text-red-400" : len > max * 0.85 ? "text-yellow-400" : "text-gray-500";
  return (
    <span className={`text-xs ${color}`}>{len}/{max} {label}</span>
  );
}

// ─── SEO preview ─────────────────────────────────────────────────────────────

function SerpPreview({ metaTitle, metaDescription, slug }) {
  const url = `aiwritinghumanizer.com/blog/${slug || "your-post-slug"}`;
  return (
    <div className="bg-white rounded-xl p-4 mt-3">
      <p className="text-xs text-green-700 mb-0.5 font-mono">{url}</p>
      <p className="text-blue-700 font-semibold text-base leading-tight mb-1 line-clamp-1">
        {metaTitle || "Your SEO title will appear here"}
      </p>
      <p className="text-gray-600 text-sm leading-snug line-clamp-2">
        {metaDescription || "Your meta description will appear here — keep it compelling and under 160 characters."}
      </p>
    </div>
  );
}

// ─── Featured image upload ────────────────────────────────────────────────────

function FeaturedImageUpload({ src, alt, onSrcChange, onAltChange }) {
  const fileRef = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSrcChange(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-3">
      {src ? (
        <div className="relative">
          <img src={src} alt={alt} className="w-full max-h-48 object-cover rounded-xl border border-white/10" />
          <button
            type="button"
            onClick={() => { onSrcChange(""); onAltChange(""); }}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className="w-full border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl py-6 text-gray-500 hover:text-blue-300 text-sm font-bold transition-colors flex flex-col items-center gap-2"
        >
          <ImageIcon size={24} />
          Click to upload featured image
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {src && (
        <>
          <input
            value={alt}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Featured image alt text (for SEO)"
            className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
          />
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="text-xs text-gray-500 hover:text-blue-300 underline"
          >
            Replace image
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main Admin component ────────────────────────────────────────────────────

export default function Admin() {
  const [login, setLogin] = useState({ username: "", password: "" });
  const [authenticated, setAuthenticated] = useState(false);
  const [posts, setPosts] = useState(defaultPosts);
  const [selectedPost, setSelectedPost] = useState(emptyPost);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); // "content" | "seo"

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))],
    [posts]
  );

  // ── TipTap editor ──────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Write your blog post here…" }),
    ],
    content: selectedPost.content || "",
    onUpdate: ({ editor }) => {
      setSelectedPost((cur) => ({ ...cur, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] px-4 py-4 text-gray-200 focus:outline-none",
      },
    },
  });

  // Sync editor when selectedPost changes (e.g. loading an existing post)
  const lastLoadedId = useRef(null);
  useEffect(() => {
    if (!editor) return;
    const id = selectedPost.id || "__new__";
    if (lastLoadedId.current !== id) {
      lastLoadedId.current = id;
      editor.commands.setContent(selectedPost.content || "");
    }
  }, [editor, selectedPost.id]);

  useEffect(() => {
    adminRequest({ action: "status" })
      .then((d) => setAuthenticated(Boolean(d.authenticated)))
      .catch(() => setAuthenticated(false));
    fetchBlogPosts().then(setPosts);
  }, []);

  const loadPosts = async () => setPosts(await fetchBlogPosts());

  // Auto-generate slug from title (only when slug is empty)
  const handleTitleChange = (value) => {
    setSelectedPost((cur) => ({
      ...cur,
      title: value,
      slug: cur.slug ? cur.slug : slugify(value),
      metaTitle: cur.metaTitle ? cur.metaTitle : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await adminRequest({ action: "login", ...login });
      if (!data.authenticated) throw new Error(data.error || "Invalid credentials.");
      setAuthenticated(true);
      setLogin({ username: "", password: "" });
      setMessage("Logged in.");
      await loadPosts();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminRequest({ action: "logout" }).catch(() => {});
    setAuthenticated(false);
    setSelectedPost(emptyPost);
    setMessage("Logged out.");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await adminRequest({
        action: "save",
        post: {
          ...selectedPost,
          content: editor ? editor.getHTML() : selectedPost.content,
        },
      });
      setPosts(data.posts);
      setSelectedPost(emptyPost);
      editor?.commands.setContent("");
      lastLoadedId.current = null;
      setMessage("Post saved and published.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post) => {
    setLoading(true);
    setMessage("");
    try {
      const data = await adminRequest({ action: "delete", id: post.id });
      setPosts(data.posts);
      setSelectedPost(emptyPost);
      setMessage("Post deleted.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertImage = useCallback(
    (src, alt) => {
      editor?.chain().focus().setImage({ src, alt }).run();
    },
    [editor]
  );

  const selectPost = (post) => {
    const normalized = normalizePostForForm(post);
    setSelectedPost(normalized);
    setActiveTab("content");
  };

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4">
        <form
          onSubmit={handleLogin}
          className="max-w-md mx-auto bg-[#121A21] border border-white/10 rounded-2xl p-6 shadow-xl"
        >
          <h1 className="text-white text-3xl font-black mb-2">Admin Login</h1>
          <p className="text-gray-400 text-sm mb-6">Manage blog posts for aiwritinghumanizer.com.</p>

          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Username</label>
          <input
            value={login.username}
            onChange={(e) => setLogin((c) => ({ ...c, username: e.target.value }))}
            className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 mb-4"
            autoComplete="username"
          />

          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
          <input
            type="password"
            value={login.password}
            onChange={(e) => setLogin((c) => ({ ...c, password: e.target.value }))}
            className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 mb-5"
            autoComplete="current-password"
          />

          {message && <p className="text-sm text-blue-300 mb-4">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl px-5 py-3 transition-colors"
          >
            <Check size={16} />
            {loading ? "Checking…" : "Login"}
          </button>
        </form>
      </main>
    );
  }

  // ── Admin dashboard ─────────────────────────────────────────────────────────
  return (
    <>
      {showImageDialog && (
        <ImageDialog onInsert={handleInsertImage} onClose={() => setShowImageDialog(false)} />
      )}

      <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">Blog Admin</h1>
              <p className="text-gray-400 mt-2">Create, edit, and publish blog posts.</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl px-5 py-3 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </section>

          {message && (
            <div className="mb-6 border border-blue-500/20 bg-blue-500/10 text-blue-200 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

            {/* ── Post list ── */}
            <section className="bg-[#121A21] border border-white/5 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-xl">Posts</h2>
                <button
                  onClick={() => {
                    setSelectedPost(emptyPost);
                    editor?.commands.setContent("");
                    lastLoadedId.current = null;
                    setActiveTab("content");
                  }}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl px-4 py-2 transition-colors"
                >
                  <Plus size={16} />
                  New
                </button>
              </div>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id || post.slug}
                    className={`border rounded-xl p-4 transition-colors ${
                      selectedPost.id === post.id
                        ? "border-blue-500/40 bg-blue-500/5"
                        : "border-white/10 bg-[#0b1015]/60"
                    }`}
                  >
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt={post.featuredImageAlt || post.title}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className="text-white font-bold leading-tight mb-1 line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{post.category} · /blog/{post.slug}</p>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-md">{t}</span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-600">+{post.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => selectPost(post)}
                        className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold rounded-lg px-3 py-2"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-bold rounded-lg px-3 py-2 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Post editor ── */}
            <form onSubmit={handleSave} className="bg-[#121A21] border border-white/5 rounded-2xl shadow-xl overflow-hidden">

              {/* Tab bar */}
              <div className="flex border-b border-white/10">
                {["content", "seo"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-bold capitalize transition-colors ${
                      activeTab === tab
                        ? "text-white border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab === "seo" ? "SEO & Meta" : "Content"}
                  </button>
                ))}
              </div>

              <div className="p-5 md:p-6">

                {/* ══ CONTENT TAB ══════════════════════════════════════════ */}
                {activeTab === "content" && (
                  <div className="space-y-5">

                    {/* Title + Slug row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="md:col-span-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title</span>
                        <input
                          value={selectedPost.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          required
                          className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-lg font-semibold"
                          placeholder="Post title"
                        />
                      </label>

                      <label>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Slug</span>
                        <input
                          value={selectedPost.slug}
                          onChange={(e) => setSelectedPost((c) => ({ ...c, slug: e.target.value }))}
                          placeholder="auto-generated-from-title"
                          className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-sm"
                        />
                      </label>

                      <label>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</span>
                        <input
                          value={selectedPost.category}
                          onChange={(e) => setSelectedPost((c) => ({ ...c, category: e.target.value }))}
                          list="admin-categories"
                          className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                        <datalist id="admin-categories">
                          {categories.map((cat) => <option key={cat} value={cat} />)}
                        </datalist>
                      </label>

                      <label>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Date</span>
                        <input
                          value={selectedPost.date}
                          onChange={(e) => setSelectedPost((c) => ({ ...c, date: e.target.value }))}
                          className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                      </label>

                      <label>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Read Time</span>
                        <input
                          value={selectedPost.readTime}
                          onChange={(e) => setSelectedPost((c) => ({ ...c, readTime: e.target.value }))}
                          className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                      </label>
                    </div>

                    {/* Tags */}
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tags</span>
                      <TagsInput
                        tags={selectedPost.tags}
                        onChange={(tags) => setSelectedPost((c) => ({ ...c, tags }))}
                      />
                    </div>

                    {/* Excerpt */}
                    <label>
                      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Excerpt</span>
                      <textarea
                        value={selectedPost.excerpt}
                        onChange={(e) => setSelectedPost((c) => ({ ...c, excerpt: e.target.value }))}
                        required
                        rows={3}
                        className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                        placeholder="Short summary shown in blog listings"
                      />
                    </label>

                    {/* Rich text editor */}
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Content</span>
                      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0b1015]">
                        <EditorToolbar editor={editor} onInsertImage={() => setShowImageDialog(true)} />
                        <EditorContent editor={editor} />
                      </div>
                    </div>

                    {/* Featured image */}
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Featured Image</span>
                      <FeaturedImageUpload
                        src={selectedPost.featuredImage}
                        alt={selectedPost.featuredImageAlt}
                        onSrcChange={(v) => setSelectedPost((c) => ({ ...c, featuredImage: v }))}
                        onAltChange={(v) => setSelectedPost((c) => ({ ...c, featuredImageAlt: v }))}
                      />
                    </div>
                  </div>
                )}

                {/* ══ SEO TAB ══════════════════════════════════════════════ */}
                {activeTab === "seo" && (
                  <div className="space-y-5">

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-blue-200 text-sm">
                      Fill in the SEO fields below. They control how your post appears in Google search results.
                    </div>

                    {/* Focus keyword */}
                    <label>
                      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Focus Keyword</span>
                      <input
                        value={selectedPost.focusKeyword}
                        onChange={(e) => setSelectedPost((c) => ({ ...c, focusKeyword: e.target.value }))}
                        placeholder="e.g. humanize AI writing"
                        className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">The main keyword you want this page to rank for.</p>
                    </label>

                    {/* Meta title */}
                    <label>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">SEO Title</span>
                        <CharCounter value={selectedPost.metaTitle} max={60} label="chars" />
                      </div>
                      <input
                        value={selectedPost.metaTitle}
                        onChange={(e) => setSelectedPost((c) => ({ ...c, metaTitle: e.target.value }))}
                        placeholder="Post title for Google (≤ 60 chars)"
                        className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                      />
                    </label>

                    {/* Meta description */}
                    <label>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Meta Description</span>
                        <CharCounter value={selectedPost.metaDescription} max={160} label="chars" />
                      </div>
                      <textarea
                        value={selectedPost.metaDescription}
                        onChange={(e) => setSelectedPost((c) => ({ ...c, metaDescription: e.target.value }))}
                        rows={3}
                        placeholder="Describe the post for search engines (≤ 160 chars)"
                        className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </label>

                    {/* SERP preview */}
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Google Preview</span>
                      <SerpPreview
                        metaTitle={selectedPost.metaTitle}
                        metaDescription={selectedPost.metaDescription}
                        slug={selectedPost.slug}
                      />
                    </div>

                    {/* OG image note */}
                    <div className="bg-[#0b1015]/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-gray-500">
                      <strong className="text-gray-400">Open Graph / Social sharing</strong> — your featured image (set in the Content tab) is automatically used as the OG image for Facebook and Twitter cards. Make sure you have <code className="text-blue-300">react-helmet-async</code> rendering these tags on the public blog post page.
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="mt-6 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl px-6 py-3 transition-colors"
                  >
                    <Save size={16} />
                    {loading ? "Saving…" : selectedPost.id ? "Update Post" : "Publish Post"}
                  </button>
                  {selectedPost.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPost(emptyPost);
                        editor?.commands.setContent("");
                        lastLoadedId.current = null;
                      }}
                      className="text-sm text-gray-500 hover:text-gray-300 underline"
                    >
                      Cancel / new post
                    </button>
                  )}
                </div>
              </div>
            </form>

          </div>
        </div>
      </main>

      {/* TipTap prose styles injected globally */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #4B5563;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 { font-size: 1.75rem; font-weight: 800; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.4rem; font-weight: 700; margin: 0.9rem 0 0.4rem; }
        .ProseMirror h3 { font-size: 1.15rem; font-weight: 700; margin: 0.8rem 0 0.3rem; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; }
        .ProseMirror li { margin: 0.2rem 0; }
        .ProseMirror blockquote { border-left: 3px solid #3B82F6; margin: 1rem 0; padding-left: 1rem; color: #9CA3AF; font-style: italic; }
        .ProseMirror code { background: #1f2937; color: #60A5FA; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
        .ProseMirror hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0; }
        .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 1rem 0; border: 1px solid rgba(255,255,255,0.1); }
        .ProseMirror img.ProseMirror-selectednode { outline: 2px solid #3B82F6; }
        .ProseMirror a { color: #60A5FA; text-decoration: underline; }
        .ProseMirror p { margin: 0.6rem 0; line-height: 1.7; }
      `}</style>
    </>
  );
}