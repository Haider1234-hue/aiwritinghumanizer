import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { defaultPosts, fetchBlogPosts, getPostBySlug } from "../data/blogPosts";

// Renders content that is either:
//   - An HTML string (from TipTap rich editor)
//   - A legacy array of plain-text paragraphs
function PostContent({ content }) {
  if (Array.isArray(content)) {
    return (
      <div className="prose-blog space-y-6 text-gray-300 leading-relaxed">
        {content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    );
  }

  const html = String(content || "").trim();

  // If it looks like rich HTML (TipTap output), render it
  if (html.startsWith("<")) {
    return (
      <div
        className="prose-blog"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Fallback: plain text split by blank lines
  return (
    <div className="prose-blog space-y-6 text-gray-300 leading-relaxed">
      {html.split(/\n{2,}/).filter(Boolean).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [posts, setPosts] = useState(defaultPosts);

  useEffect(() => {
    let mounted = true;
    fetchBlogPosts().then((nextPosts) => {
      if (mounted) setPosts(nextPosts);
    });
    return () => { mounted = false; };
  }, []);

  const post = getPostBySlug(posts, slug);

  // Related posts: same category, excluding current
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts
      .filter((p) => p.slug !== post.slug && p.category === post.category)
      .slice(0, 3);
  }, [post, posts]);

  // ── Not found ───────────────────────────────────────────────────────────────
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

  const canonicalUrl = `https://aiwritinghumanizer.com/blog/${post.slug}`;
  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || post.excerpt;
  const ogImage = post.featuredImage || "https://aiwritinghumanizer.com/og-default.jpg";

  // ── Article ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── SEO meta tags ── */}
      <Helmet>
        <title>{metaTitle} | AIWritingHumanizer</title>
        <meta name="description" content={metaDescription} />
        {post.focusKeyword && <meta name="keywords" content={post.focusKeyword} />}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        {post.featuredImageAlt && <meta property="og:image:alt" content={post.featuredImageAlt} />}

        {/* Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "image": ogImage,
          "datePublished": post.date,
          "author": { "@type": "Organization", "name": "AIWritingHumanizer" },
          "publisher": {
            "@type": "Organization",
            "name": "AIWritingHumanizer",
            "url": "https://aiwritinghumanizer.com"
          },
          "url": canonicalUrl,
          "keywords": (post.tags || []).join(", "),
          "articleSection": post.category,
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-[#0b1015] text-gray-300 pt-32 md:pt-40 pb-20 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto">

          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {/* Category */}
          <div className="inline-flex bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-lg px-3 py-1 text-[11px] font-black uppercase tracking-wider mb-5">
            {post.category}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-semibold mb-6">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={16} />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={16} />
              {post.readTime}
            </span>
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:text-blue-300 hover:border-blue-500/30 transition-colors"
                >
                  <Tag size={11} />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Featured image */}
          {post.featuredImage && (
            <div className="rounded-2xl overflow-hidden mb-8 border border-white/5">
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          )}

          {/* Article body */}
          <div className="bg-[#121A21] border border-white/5 rounded-2xl p-6 md:p-9 shadow-xl">
            <p className="text-lg text-gray-300 leading-relaxed mb-8 font-medium">
              {post.excerpt}
            </p>
            <PostContent content={post.content} />
          </div>

          {/* Tags footer */}
          {post.tags?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">Tags:</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-bold px-3 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:text-blue-300 hover:border-blue-500/30 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-3xl mx-auto mt-16">
            <h2 className="text-white font-black text-2xl mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  className="group bg-[#121A21] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  {related.featuredImage && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={related.featuredImage}
                        alt={related.featuredImageAlt || related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-white font-bold text-sm leading-tight mb-2 line-clamp-2">
                      {related.title}
                    </p>
                    <p className="text-xs text-gray-500">{related.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Rich content prose styles */}
      <style>{`
        .prose-blog { color: #D1D5DB; line-height: 1.8; }
        .prose-blog h1 { font-size: 2rem; font-weight: 800; color: #fff; margin: 2rem 0 0.75rem; }
        .prose-blog h2 { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 1.75rem 0 0.6rem; }
        .prose-blog h3 { font-size: 1.2rem; font-weight: 700; color: #F3F4F6; margin: 1.5rem 0 0.5rem; }
        .prose-blog p { margin: 0.75rem 0; }
        .prose-blog ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
        .prose-blog ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
        .prose-blog li { margin: 0.3rem 0; }
        .prose-blog blockquote {
          border-left: 3px solid #3B82F6;
          margin: 1.5rem 0;
          padding: 0.5rem 1rem;
          color: #9CA3AF;
          font-style: italic;
          background: rgba(59,130,246,0.05);
          border-radius: 0 8px 8px 0;
        }
        .prose-blog code {
          background: #1f2937;
          color: #60A5FA;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: ui-monospace, monospace;
        }
        .prose-blog pre {
          background: #0b1015;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 1.25rem;
          overflow-x: auto;
          margin: 1.25rem 0;
        }
        .prose-blog pre code { background: none; padding: 0; color: #93C5FD; }
        .prose-blog hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 2rem 0; }
        .prose-blog img {
          max-width: 100%;
          border-radius: 10px;
          margin: 1.5rem 0;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .prose-blog a { color: #60A5FA; text-decoration: underline; }
        .prose-blog a:hover { color: #93C5FD; }
        .prose-blog strong { color: #F9FAFB; font-weight: 700; }
        .prose-blog em { color: #E5E7EB; }
        .prose-blog table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          overflow-x: auto;
          display: block;
        }
        .prose-blog table td, .prose-blog table th {
          border: 1px solid rgba(255,255,255,0.12);
          padding: 0.6rem 0.9rem;
          text-align: left;
          vertical-align: top;
        }
        .prose-blog table th {
          background: rgba(255,255,255,0.05);
          color: #F3F4F6;
          font-weight: 700;
        }
        .prose-blog table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
      `}</style>
    </>
  );
}