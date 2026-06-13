import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Search, Tag } from "lucide-react";
import { fetchBlogPosts, getPostCategories, defaultPosts } from "../data/blogPosts";

export default function Blog() {
  const [posts, setPosts] = useState(defaultPosts);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    fetchBlogPosts().then((nextPosts) => {
      if (mounted) {
        setPosts(nextPosts);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => getPostCategories(posts), [posts]);

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery) ||
        post.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, posts, query]);

  return (
    <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
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

        <section className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
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
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles"
              className="w-full bg-[#121A21] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500/60"
            />
          </label>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {visiblePosts.map((post) => (
            <Link
              key={post.id || post.slug}
              to={`/blog/${post.slug}`}
              className="bg-[#121A21] border border-white/5 rounded-2xl p-6 shadow-xl hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="inline-flex bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-5">
                {post.category}
              </span>
              <h2 className="text-white text-xl font-black leading-tight mb-4">
                {post.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} />
                  {post.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </section>

        {visiblePosts.length === 0 && (
          <div className="border border-white/10 bg-[#121A21] rounded-2xl px-6 py-12 text-center text-gray-400">
            No articles found.
          </div>
        )}
      </div>
    </main>
  );
}
