import React from "react";
import { useNavigate } from "react-router-dom";

export default function Disclaimer() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b1015] min-h-screen text-gray-300 pt-36 md:pt-40 pb-16 px-6 transition-all duration-300">
      <div className="max-w-4xl mx-auto bg-[#121A21] border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        
        {/* Glow effect background blur transformed to match your premium blue theme */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Breadcrumb & Reading Time */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 text-sm text-gray-400">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors font-semibold text-xs uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span>📅 Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span className="hidden sm:inline text-gray-800">|</span>
            <span>⏱️ 2 min read</span>
          </div>
        </div>

        {/* Document Header with Premium Silver-to-White Text Gradient */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Legal <span className="bg-indigo-500 bg-clip-text text-transparent">Disclaimer</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
            The informational and conversion metrics provided by aiwritinghumanizer.com are designed exclusively for structural optimization purposes. Please read this operational disclaimer carefully.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed select-text">
          
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-black">1.</span> AI Detection & Bypass Accuracy Exclusion
            </h2>
            <p className="text-gray-400">
              Our system runs advanced linguistic algorithms to shift patterns and structural signatures of text nodes. While our main objective is to maximize readability and lower tracking tags, <strong>we cannot and do not guarantee a constant 100% bypass success score</strong> across all third-party AI detection models (such as Turnitin, GPTZero, Winston AI, or Copyleaks).
            </p>
            {/* Shifted Box Style from Amber Alert to Safe Blue Overlay */}
            <div className="bg-blue-500/[0.03] p-4 rounded-xl border border-blue-500/10 text-xs md:text-sm text-gray-400 leading-relaxed">
              <span className="text-blue-400 font-extrabold mr-1 uppercase tracking-wider">Operational Note:</span> Third-party verification platforms constantly patch and update their scoring matrices. Consequently, text that passes detection parameters today might score differently following an external algorithm update.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-black">2.</span> No Professional Advice or Responsibility
            </h2>
            <p className="text-gray-400">
              The structural shifts performed by our tools do not constitute academic, legal, or professional writing counseling. All outputs are generated on an "as-is" and "as-available" baseline without warranties of any category regarding ultimate platform validation scores.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-black">3.</span> Ethical Usage & User Accountability
            </h2>
            <p className="text-gray-400">
              aiwritinghumanizer.com does not support, endorse, or take liability for any pattern of academic malpractice, plagiarism, or violations of external digital platforms' Terms of Service. It is the sole responsibility of the user to evaluate and confirm that their final text output meets the strict guidelines of their respective educational or workplace environments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400 font-black">4.</span> Limitation of Liability
            </h2>
            <p className="text-gray-400">
              Under no circumstances shall aiwritinghumanizer.com, its developers, or partners be liable for any direct, indirect, incidental, or consequential losses, penalties, or academic/corporate disciplinary actions arising from the usage or execution errors of this website.
            </p>
          </section>

          <section className="border-t border-white/5 pt-6 mt-10 space-y-2">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Legal Queries</h3>
            <p className="text-xs md:text-sm text-gray-500">
              For complete tracking definitions or clarification parameters regarding this disclaimer documentation:
            </p>
            <a 
              href="mailto:nextsalution@gmail.com" 
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-bold transition-all hover:translate-x-0.5"
            >
              nextsalution@gmail.com
            </a>
          </section>

        </div>

      </div>
    </div>
  );
}
