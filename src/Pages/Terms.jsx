import React from "react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b1015] min-h-screen text-gray-300 pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-[#121A21] border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative">
        
        {/* Glow effect background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

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
            <span>⏱️ 4 min read</span>
          </div>
        </div>

        {/* Document Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Terms & <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Conditions</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Please read these terms and conditions carefully before using our platform. By accessing aiwritinghumanizer.com, you agree to comply with and be bound by the parameters detailed below.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed select-text">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing and using this web application, you acknowledge that you have read, understood, and agreed to these structural terms. If you do not agree with any part of these protocols, you must cease operations on the website immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">2.</span> Permitted Use & Service Boundaries
            </h2>
            <p>
              Our automated AI Humanizer and Detector configurations are engineered to assist users in polishing, shifting structure, and evaluating text metrics. You agree not to use this system to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Launch high-volume automated scripts or scraping tools to bypass normal input restrictions.</li>
              <li>Exploit backend processing paths via reverse-engineering mechanics.</li>
              <li>Inject malicious file nodes or code strings into the text input boxes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">3.</span> User Accountability & Content Ethics
            </h2>
            <p>
              You maintain full legal ownership and responsibility over the text nodes you process through our scripts. aiwritinghumanizer.com does not claim any rights over your generated outputs, nor do we monitor the contextual nature of your inputs. 
            </p>
            <p className="bg-[#1a2632]/50 p-4 rounded-xl border border-white/5 text-sm text-gray-400 italic">
              Users are solely responsible for ensuring that their final text output usage aligns perfectly with their regional regulations, corporate agreements, or external platform integrity guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">4.</span> Intellectual Property
            </h2>
            <p>
              All core custom design architectures, visual stylesheets, logo assets, brand text layouts, and frontend interface files are the exclusive property of aiwritinghumanizer.com. You are prohibited from duplicating or modifying these elements without formal verification parameters.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-400">5.</span> Service Availability & Modifications
            </h2>
            <p>
              We aim to maintain consistent availability across all translation frameworks. However, server maintenance cycles, cloud platform latency, or algorithm adjustments might cause temporary disruptions. We reserve the right to refine or deprecate any operational parameter without prior notice.
            </p>
          </section>

          <section className="border-t border-white/10 pt-6 mt-10 space-y-2">
            <h3 className="text-lg font-bold text-white">Have Questions About Our Terms?</h3>
            <p className="text-sm text-gray-400">
              For administrative inquiries regarding our terms layout, please reach out to our legal channel:
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
