import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Nav links styling utility function
  const navLinkStyle = (path) => `
    text-sm font-medium transition-colors duration-200 py-2 px-1 relative
    ${location.pathname === path ? "text-blue-400" : "text-gray-300 hover:text-white"}
  `;

  // Existing gradient subscription button design preserve rakha hai
  const buttonBase = `
    relative overflow-hidden
    bg-gradient-to-r from-blue-600 to-indigo-600
    text-white font-semibold
    px-5 py-2
    rounded-full
    border border-white/20
    shadow-lg shadow-blue-500/30
    transition-all duration-300 ease-out
    hover:scale-105
    hover:shadow-2xl hover:shadow-blue-500/50
    hover:from-indigo-600 hover:to-blue-600
    active:scale-95
  `;

  return (
    <nav className="
      fixed top-0 left-0 w-full z-50
      bg-[#121A21]/80 backdrop-blur-md
      border-b border-white/10
      py-4
    ">
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => { navigate("/"); setMenuOpen(false); }}
        >
          <img
            src="/aiwritinghumanizer-logo.webp"
            alt="Logo"
            className="w-12 h-12 group-hover:rotate-6 transition-transform duration-300"
          />
          <h1 className="
            text-white text-2xl font-bold
            group-hover:text-blue-400 transition-colors
          ">
            Humanize AI Write
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate("/humanizer")} className={navLinkStyle("/humanizer")}>
            Humanizer
            {location.pathname === "/humanizer" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded" />}
          </button>
          
          <button onClick={() => navigate("/ai-detecter")} className={navLinkStyle("/ai-detecter")}>
            Detector
            {location.pathname === "/ai-detecter" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded" />}
          </button>

          {/* Tools Dropdown Menu (Fixed Gap Hover) */}
          <div 
            className="relative py-2"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1">
              Tools 
              <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Card */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 w-48 bg-[#1a2632] border border-white/10 rounded-xl shadow-xl py-2 z-50 animate-fadeIn transform -translate-y-1">
                <button 
                  onClick={() => { navigate("/humanizer"); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                >
                  📝 AI Humanizer
                </button>
                <button 
                  onClick={() => { navigate("/ai-detecter"); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                >
                  ✨ AI Detector
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Subscription Button */}
        <div className="hidden md:flex items-center">
          <button className={buttonBase}>
            <span className="relative z-10">💎 Subscription</span>
            <span className="
              absolute inset-0 bg-white/20
              translate-x-[-100%]
              hover:translate-x-[100%]
              transition-transform duration-700
            " />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 group"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

      </div>

      {/* Mobile Responsive Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 pt-4 flex flex-col gap-4 border-t border-white/10 mt-4 bg-[#121A21] w-full">
          <button
            onClick={() => { navigate("/humanizer"); setMenuOpen(false); }}
            className="text-left text-gray-300 hover:text-white font-medium py-1 text-base"
          >
            Humanizer
          </button>
          
          <button
            onClick={() => { navigate("/ai-detecter"); setMenuOpen(false); }}
            className="text-left text-gray-300 hover:text-white font-medium py-1 text-base"
          >
            Detector
          </button>

          {/* Mobile Tools List Breakdown */}
          <div className="border-l-2 border-white/10 pl-3 flex flex-col gap-2 my-1">
            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">More Tools</span>
            <button onClick={() => { navigate("/humanizer"); setMenuOpen(false); }} className="text-left text-sm text-gray-400 hover:text-white">📝 AI Humanizer</button>
            <button onClick={() => { navigate("/ai-detecter"); setMenuOpen(false); }} className="text-left text-sm text-gray-400 hover:text-white">✨ AI Detector</button>
          </div>

          <button className={buttonBase + " w-full text-center mt-2"}>
            <span className="relative z-10">💎 Subscription</span>
            <span className="
              absolute inset-0 bg-white/20
              translate-x-[-100%]
              hover:translate-x-[100%]
              transition-transform duration-700
            " />
          </button>
        </div>
      )}
    </nav>
  );
}
