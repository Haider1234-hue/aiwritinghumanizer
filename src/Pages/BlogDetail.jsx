import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { defaultPosts, fetchBlogPosts, getPostBySlug } from "../data/blogPosts";

export default function BlogDetail() {
  const { slug } = useParams();
  const [posts, setPosts] = useState(defaultPosts);

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

  const post = getPostBySlug(posts, slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto border border-white/10 bg-[#121A21] rounded-2xl p-8 text-center">
          <h1 className="text-white text-3xl font-black mb-3">Article not found</h1>
          <p className="text-gray-400 mb-6">The article may have been removed or renamed.</p>
          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = Array.isArray(post.content)
    ? post.content
    : String(post.content || "")
        .split("\n")
        .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4 sm:px-6">
      <article className="max-w-3xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        <div className="inline-flex bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-5">
          {post.category}
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-semibold mb-10">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={16} />
            {post.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={16} />
            {post.readTime}
          </span>
        </div>

        <div className="bg-[#121A21] border border-white/5 rounded-2xl p-6 md:p-9 shadow-xl">
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            {post.excerpt}
          </p>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            {paragraphs.map((paragraph, index) => (
              <p key={`${post.slug}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
