import React, { useEffect, useMemo, useState } from "react";
import { Check, Edit3, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { defaultPosts, fetchBlogPosts } from "../data/blogPosts";

const emptyPost = {
  id: "",
  slug: "",
  title: "",
  category: "Writing",
  date: "June 2026",
  readTime: "4 min read",
  excerpt: "",
  content: "",
};

function normalizePostForForm(post) {
  return {
    ...post,
    content: Array.isArray(post.content)
      ? post.content.join("\n\n")
      : post.content || "",
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
    throw new Error(
      "Admin API returned the website page instead of JSON. Please hard-refresh and try again."
    );
  }

  if (!response.ok) {
    throw new Error(data.error || "Admin API request failed.");
  }

  return data;
}

export default function Admin() {
  const [login, setLogin] = useState({ username: "", password: "" });
  const [authenticated, setAuthenticated] = useState(false);
  const [posts, setPosts] = useState(defaultPosts);
  const [selectedPost, setSelectedPost] = useState(emptyPost);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminRequest({ action: "status" })
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .catch(() => setAuthenticated(false));

    fetchBlogPosts().then(setPosts);
  }, []);

  const categories = useMemo(
    () => [...new Set(posts.map((post) => post.category).filter(Boolean))],
    [posts]
  );

  const loadPosts = async () => {
    const nextPosts = await fetchBlogPosts();
    setPosts(nextPosts);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await adminRequest({ action: "login", ...login });

      if (!data.authenticated) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      setAuthenticated(true);
      setLogin({ username: "", password: "" });
      setMessage("Logged in successfully.");
      await loadPosts();
    } catch (error) {
      setMessage(error.message);
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

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await adminRequest({
        action: "save",
        post: {
          ...selectedPost,
          content: String(selectedPost.content || "")
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean),
        },
      });

      setPosts(data.posts);
      setSelectedPost(emptyPost);
      setMessage("Post saved and published to Blog.");
    } catch (error) {
      setMessage(error.message);
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
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4">
        <form
          onSubmit={handleLogin}
          className="max-w-md mx-auto bg-[#121A21] border border-white/10 rounded-2xl p-6 shadow-xl"
        >
          <h1 className="text-white text-3xl font-black mb-2">Admin Login</h1>
          <p className="text-gray-400 text-sm mb-6">Manage blog posts for aiwritinghumanizer.com.</p>

          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Username
          </label>
          <input
            value={login.username}
            onChange={(event) =>
              setLogin((current) => ({ ...current, username: event.target.value }))
            }
            className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 mb-4"
            autoComplete="username"
          />

          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Password
          </label>
          <input
            type="password"
            value={login.password}
            onChange={(event) =>
              setLogin((current) => ({ ...current, password: event.target.value }))
            }
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
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">
              Blog Admin
            </h1>
            <p className="text-gray-400 mt-2">Create, edit, and remove published blog posts.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <section className="bg-[#121A21] border border-white/5 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl">Posts</h2>
              <button
                onClick={() => setSelectedPost(emptyPost)}
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
                  className="border border-white/10 rounded-xl p-4 bg-[#0b1015]/60"
                >
                  <h3 className="text-white font-bold leading-tight mb-1">{post.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{post.category} - /blog/{post.slug}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPost(normalizePostForForm(post))}
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

          <form
            onSubmit={handleSave}
            className="bg-[#121A21] border border-white/5 rounded-2xl p-5 md:p-6 shadow-xl"
          >
            <h2 className="text-white font-black text-xl mb-5">Post Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="md:col-span-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Title
                </span>
                <input
                  value={selectedPost.title}
                  onChange={(event) =>
                    setSelectedPost((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                  className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </label>

              <label>
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Slug
                </span>
                <input
                  value={selectedPost.slug}
                  onChange={(event) =>
                    setSelectedPost((current) => ({ ...current, slug: event.target.value }))
                  }
                  placeholder="Auto-generated if empty"
                  className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </label>

              <label>
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Category
                </span>
                <input
                  value={selectedPost.category}
                  onChange={(event) =>
                    setSelectedPost((current) => ({ ...current, category: event.target.value }))
                  }
                  list="admin-categories"
                  className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
                <datalist id="admin-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>

              <label>
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Date
                </span>
                <input
                  value={selectedPost.date}
                  onChange={(event) =>
                    setSelectedPost((current) => ({ ...current, date: event.target.value }))
                  }
                  className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </label>

              <label>
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Read Time
                </span>
                <input
                  value={selectedPost.readTime}
                  onChange={(event) =>
                    setSelectedPost((current) => ({ ...current, readTime: event.target.value }))
                  }
                  className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </label>

              <label className="md:col-span-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Excerpt
                </span>
                <textarea
                  value={selectedPost.excerpt}
                  onChange={(event) =>
                    setSelectedPost((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  required
                  rows={3}
                  className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                />
              </label>

              <label className="md:col-span-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Content
                </span>
                <textarea
                  value={selectedPost.content}
                  onChange={(event) =>
                    setSelectedPost((current) => ({ ...current, content: event.target.value }))
                  }
                  required
                  rows={10}
                  className="w-full bg-[#0b1015] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl px-5 py-3 transition-colors"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Post"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
