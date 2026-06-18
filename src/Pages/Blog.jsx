import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Search, Tag } from "lucide-react";
import { fetchBlogPosts, getPostCategories, defaultPosts } from "../data/blogPosts";

export default function Blog() {
  const [posts, setPosts] = useState(defaultPosts);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchBlogPosts().then((nextPosts) => {
      if (mounted) setPosts(nextPosts);
    });
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => getPostCategories(posts), [posts]);

  // Collect all unique tags across posts
  const allTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [posts]);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesTag = !activeTag || (post.tags || []).includes(activeTag);
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        (post.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesTag && matchesQuery;
    });
  }, [activeCategory, activeTag, posts, query]);

  const clearFilters = () => {
    setActiveCategory("All");
    setActiveTag("");
    setQuery("");
  };

  const hasActiveFilter = activeCategory !== "All" || activeTag || query;

  return (
    <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <section className="mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-black tracking-widest uppercase mb-5">
            <Tag size={14} />
            Blog
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-5">
            Writing Insights
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl">
            Clear guides for humanizing AI drafts, improving readability, and preparing polished content for publishing.
          </p>
        </section>

        {/* Filters */}
        <section className="mb-8 space-y-4">
          {/* Category + Search row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => { setActiveCategory(category); setActiveTag(""); }}
                  className={`px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${
                    activeCategory === category
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="relative block w-full lg:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles or tags"
                className="w-full bg-[#121A21] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500/60"
              />
            </label>
          </div>

          {/* Tag filter row — only shown when tags exist */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-600 font-bold uppercase tracking-wider mr-1">Tags:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTag === tag
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-gray-500 border border-white/5 hover:text-gray-300 hover:bg-white/10"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Active filter summary + clear */}
          {hasActiveFilter && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>
                {visiblePosts.length} article{visiblePosts.length !== 1 ? "s" : ""} found
                {activeCategory !== "All" && <> in <strong className="text-gray-300">{activeCategory}</strong></>}
                {activeTag && <> tagged <strong className="text-blue-300">#{activeTag}</strong></>}
                {query && <> matching <strong className="text-gray-300">"{query}"</strong></>}
              </span>
              <button onClick={clearFilters} className="text-gray-600 hover:text-gray-300 underline">
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Post grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {visiblePosts.map((post) => (
            <Link
              key={post.id || post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-[#121A21] border border-white/5 rounded-2xl shadow-xl hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Featured image */}
              {post.featuredImage ? (
                <div className="w-full h-44 overflow-hidden flex-shrink-0">
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* Placeholder gradient when no image */
                <div className="w-full h-2 bg-gradient-to-r from-blue-600/40 via-blue-400/20 to-transparent flex-shrink-0" />
              )}

              <div className="p-6 flex flex-col flex-1">
                <span className="inline-flex bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-4 self-start">
                  {post.category}
                </span>
                <h2 className="text-white text-xl font-black leading-tight mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTag(activeTag === tag ? "" : tag);
                        }}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          activeTag === tag
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-[11px] text-gray-600">+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} />
                    {post.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {visiblePosts.length === 0 && (
          <div className="border border-white/10 bg-[#121A21] rounded-2xl px-6 py-12 text-center">
            <p className="text-gray-400 mb-3">No articles found.</p>
            {hasActiveFilter && (
              <button onClick={clearFilters} className="text-blue-400 text-sm font-bold hover:text-blue-300 underline">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}