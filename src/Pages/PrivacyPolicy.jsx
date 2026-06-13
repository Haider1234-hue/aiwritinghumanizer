import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b1015] min-h-screen text-gray-300 pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-[#121A21] border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative">
        
        {/* Glow effect background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Breadcrumb & Reading Time */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 text-sm text-gray-400">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <div className="flex items-center gap-4">
            <span>📅 Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span>⏱️ 3 min read</span>
          </div>
        </div>

        {/* Document Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Privacy <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            At aiwritinghumanizer.com, we are committed to protecting your privacy. This policy explains how we process data when you interact with our platform.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed select-text">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">1.</span> Text Content Processing (Zero Data Retention)
            </h2>
            <p>
              Your trust is our highest priority. Unlike other platforms, <strong>we do not save, store, or retain any text content</strong> you input into our Humanizer or Detector tools. 
            </p>
            <p className="bg-[#1a2632]/50 p-4 rounded-xl border border-white/5 text-sm text-gray-400 italic">
              All text conversions are executed dynamically in real-time via secure, encrypted system configurations and are permanently cleared from system memory immediately after the process finishes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">2.</span> Information We Collect Automatically
            </h2>
            <p>
              When you browse our website, we may automatically collect standard non-personally identifiable metrics through basic analytics trackers. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Device configuration metadata (browser type, operating system language).</li>
              <li>Anonymized interactions (timestamp logs, system processing latency).</li>
              <li>General geographic regions (country level data only).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">3.</span> Cookies and Tracking Signatures
            </h2>
            <p>
              We utilize minor functional cookies to remember your workspace settings (such as text box adjustments or light/dark mode states). You can choose to disable cookies through your browser control panels, though some functional scaling properties may require cookie parameters to work accurately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">4.</span> Third-Party Architecture Links
            </h2>
            <p>
              Our platform connects securely with external processing gateways to run linguistic optimization scripts. These integrations do not receive access parameters to any sensitive custom fields or personal identifier footprints.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">5.</span> Changes to This Policy
            </h2>
            <p>
              We reserve the right to modify this privacy structure whenever structural system adjustments take place. We recommend checking this page periodically to remain informed about how we maintain zero data trace boundaries.
            </p>
          </section>

          <section className="border-t border-white/10 pt-6 mt-10 space-y-2">
            <h3 className="text-lg font-bold text-white">Contact Our Privacy Team</h3>
            <p className="text-sm text-gray-400">
              If you have any questions regarding your data safety boundaries, reach us directly via email:
            </p>
            <a 
              href="mailto:nextsalution@gmail.com" 
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              nextsalution@gmail.com
            </a>
          </section>

        </div>

      </div>
    </div>
  );
}
