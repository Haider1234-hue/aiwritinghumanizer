import React from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#121A21] border-t border-white/10 text-gray-400 pt-16 pb-8 transition-all duration-300">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Column 1: Short Description & Socials */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img
              src="/aiwritinghumanizer-logo.webp"
              alt="Logo"
              className="w-8 h-8"
            />
            <span className="text-white text-xl font-bold hover:text-blue-400 transition-colors">
              Humanize AI Write
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Convert your AI-generated text into flawless, human-like writing. Effortlessly bypass AI detectors with our state-of-the-art optimization engine.
          </p>
          {/* Social Media Icons */}
          <div className="flex items-center gap-4 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-white font-semibold text-base mb-4 tracking-wide">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button onClick={() => navigate("/humanizer")} className="hover:text-blue-400 hover:underline decoration-white/20 transition-colors duration-200">
                Humanizer
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/ai-detecter")} className="hover:text-blue-400 hover:underline decoration-white/20 transition-colors duration-200">
                Detector
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/blog")} className="hover:text-blue-400 hover:underline decoration-white/20 transition-colors duration-200">
                Blog Section
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/contact")} className="hover:text-blue-400 hover:underline decoration-white/20 transition-colors duration-200">
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal Links */}
        <div>
          <h3 className="text-white font-semibold text-base mb-4 tracking-wide">Legal Information</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button onClick={() => navigate("/privacy-policy")} className="hover:text-blue-400 hover:underline decoration-white/20 transition-colors duration-200">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/terms")} className="hover:text-blue-400 hover:underline decoration-white/20 transition-colors duration-200">
                Terms & Conditions
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/disclaimer")} className="hover:text-blue-400 hover:underline decoration-white/20 transition-colors duration-200">
                Disclaimer
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Support */}
        <div>
          <h3 className="text-white font-semibold text-base mb-4 tracking-wide">Support</h3>
          <p className="text-sm text-gray-400 mb-3">Have questions or feedback? Reach out to us anytime.</p>
          <a 
            href="mailto:nextsalution@gmail.com" 
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8m-2 11H4a2 2 0 01-2-2V8a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2z" />
            </svg>
            nextsalution@gmail.com
          </a>
        </div>

      </div>

      {/* Bottom Copyright Area */}
      <div className="container mx-auto px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div>
          &copy; {new Date().getFullYear()} aiwritinghumanizer.com. All rights reserved.
        </div>
        <div className="flex gap-4">
          <span className="text-gray-600">Built for seamless text transformations.</span>
        </div>
      </div>
    </footer>
  );
}
