import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  Upload,
  FileText,
  AlignLeft,
  Trash2,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Wand2,
  Check,
} from "lucide-react";

export default function AiDetecter() {
  const [text, setText] = useState("");
  const [score, setScore] = useState(0);
  const [label, setLabel] = useState("AI");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [highlights, setHighlights] = useState([]);

  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const navigate = useNavigate();

  const handleCopy = async () => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
    setScore(0);
    setLabel("AI");
    setHighlights([]);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleHumanizeRedirect = () => {
    if (!text.trim()) return;
    navigate("/", { state: { text } });
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;

      if (!rapidApiKey) {
        throw new Error("RapidAPI key is not configured.");
      }

      const res = await fetch(
        "https://ai-content-detector-ai-gpt.p.rapidapi.com/api/detectText/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "ai-content-detector-ai-gpt.p.rapidapi.com",
            "x-rapidapi-key": rapidApiKey,
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.message || "API Error");
      }

      setScore(Number(data.fakePercentage) || 0);
      setLabel(data.isHuman > 50 ? "Human" : "AI");

      const newHighlights = (data.sentences || [])
        .map((sentence, idx) => {
          if (idx === 0) return { type: "high", text: sentence };
          if (idx === 1) return { type: "mixed", text: sentence };
          return null;
        })
        .filter(Boolean);

      setHighlights(newHighlights);
    } catch (error) {
      console.error("Analysis Error:", error);
      alert(`Analysis failed: ${error.message}`);
      setScore(0);
      setLabel("AI");
      setHighlights([]);
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 72;
  const offset = circumference - (circumference * score) / 100;

  const getScoreColor = () => {
    if (score > 60) return "text-red-500 shadow-red-500/20";
    if (score > 35) return "text-amber-500 shadow-amber-500/20";
    return "text-green-500 shadow-green-500/20";
  };

  return (
    // Top Gap fixed: Added pt-36 md:pt-40 for breathing room below fixed navbar
    <div className="min-h-screen bg-[#0b1015] flex flex-col lg:flex-row justify-center gap-8 pt-36 md:pt-40 px-4 sm:px-6 lg:px-12 pb-20 max-w-7xl mx-auto transition-all duration-300">
      
      {/* LEFT PANEL: Workspace input */}
      <div className="flex flex-col gap-6 w-full lg:flex-grow">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl text-white font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AI Detection Analysis
          </h2>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 font-extrabold px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest hidden sm:inline-block">
            v2.0 Active
          </span>
        </div>

        {/* Improved focus-within ring and subtle backdrop styling */}
        <div className="bg-[#121A21]/90 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl flex flex-col justify-between overflow-hidden focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-300 group">
          
          {/* Sub-Header Toolbar Navigation Bar */}
          <div className="flex justify-between items-center px-5 py-4 bg-[#162028] border-b border-white/5 gap-2">
            <div className="flex gap-3 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/5 transition-colors">
                <FileText size={14} className="text-blue-500" />
                <span>{characters.toLocaleString()} <span className="text-gray-500 font-medium">Chars</span></span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/5 transition-colors">
                <AlignLeft size={14} className="text-blue-500" />
                <span>{words.toLocaleString()} <span className="text-gray-500 font-medium">Words</span></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy} 
                disabled={!text.trim()}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5"
                title="Copy Text"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>

              <label className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-all bg-blue-500/10 hover:bg-blue-500/20 px-3.5 py-2 rounded-xl border border-blue-500/10 cursor-pointer">
                <Upload size={14} /> 
                <span>Upload</span>
                <input type="file" accept=".txt" hidden onChange={handleUpload} />
              </label>
            </div>
          </div>

          {/* Large Area Workspace Text Container Field */}
          <div className="p-5 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[280px] md:h-[400px] bg-transparent text-gray-200 text-base md:text-lg outline-none resize-none placeholder:text-gray-600 leading-relaxed scrollbar-thin transition-all"
              placeholder="Start typing or paste your optimized verification content patterns here..."
            />
            
            {/* Smooth Dynamic Loading Glass Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-[#0b1015]/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 transition-all duration-300">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-500/30 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-xs font-black text-blue-400 tracking-widest uppercase animate-pulse">Running linguistic vector check...</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Triggers Footer Execution row panel */}
        <div className="flex justify-between items-center gap-4 mt-1">
          <button
            onClick={handleClear}
            disabled={!text.trim()}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-400 disabled:opacity-20 disabled:pointer-events-none uppercase tracking-wider transition-all bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/5"
          >
            <Trash2 size={14} /> Clear Board
          </button>

          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-8 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all shadow-xl shadow-blue-600/10 hover:shadow-blue-500/20 disabled:opacity-30 disabled:pointer-events-none active:scale-95 flex items-center gap-2 hover:-translate-y-0.5 duration-200"
          >
            <Sparkles size={16} className="animate-pulse" />
            {loading ? "Analyzing Matrix..." : "Analyze Content"}
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Dashboard Blocks */}
      <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-5">
        
        {/* Circle Score Meter Display Block */}
        <div className="bg-[#121A21]/90 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden group hover:border-white/10 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent opacity-40"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">AI Probability Index</p>

          <div className="relative flex justify-center mb-5 select-none transform group-hover:scale-[1.02] transition-transform duration-300">
            <svg className="w-40 h-40 -rotate-90 dropped-shadow-sm">
              <circle cx="80" cy="80" r="72" strokeWidth="10" className="text-gray-800/30" stroke="currentColor" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="72"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${text.trim() === "" ? "text-gray-700" : getScoreColor()}`}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {text.trim() === "" || (score === 0 && label === "AI") ? (
                <>
                  <span className="text-3xl font-black text-gray-600 tracking-tighter">--</span>
                  <span className="text-[9px] font-black uppercase tracking-widest mt-1 text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">Idle</span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-black text-white tracking-tighter">{score}%</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-1 px-2.5 py-0.5 rounded-md bg-white/5 ${getScoreColor()}`}>{label}</span>
                </>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed px-2 transition-all">
            {text.trim() === "" 
              ? "Input custom documentation metrics inside the viewport to fetch detailed probabilistic scores." 
              : score > 50 
                ? "High robotic text structures detected. Optimization advised." 
                : "Looks pristine! Highly structured human signature parameters."}
          </p>
        </div>

        {/* Flagged Elements Panel */}
        <div className="bg-[#121A21]/90 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl hover:border-white/10 transition-all duration-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Linguistic Flags</p>

          <div className="flex flex-col gap-3">
            {text.trim() === "" || highlights.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-xs font-medium border border-dashed border-white/5 rounded-xl select-none bg-white/[0.01]">
                No active signatures flagged yet.
              </div>
            ) : (
              highlights.map((h, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl flex gap-3 border transition-all duration-200 hover:scale-[1.01] ${
                    h.type === "high" 
                      ? "bg-red-500/[0.03] border-red-500/10" 
                      : "bg-amber-500/[0.03] border-amber-500/10"
                  }`}
                >
                  {h.type === "high" ? (
                    <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  ) : (
                    <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                  )}
                  <div>
                    <p className={`font-extrabold text-xs uppercase tracking-wider ${h.type === "high" ? "text-red-400" : "text-amber-400"}`}>
                      {h.type === "high" ? "AI Highlighted Segment" : "Mixed Pattern Sentence"}
                    </p>
                    <p className="text-gray-300 text-xs mt-1.5 leading-relaxed italic select-text bg-[#0b1015]/40 p-2 rounded-lg border border-white/[0.02]">
                      "{h.text}"
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Humanize Now Redirect Widget */}
        <div className="bg-gradient-to-b from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl relative overflow-hidden group border border-blue-400/20">
          <div className="absolute -right-6 -bottom-6 text-white/5 transform rotate-12 transition-transform group-hover:scale-120 duration-500 group-hover:text-white/[0.08]">
            <Wand2 size={130} />
          </div>
          <h3 className="text-white font-black text-lg tracking-tight">Need to Bypass?</h3>
          <p className="text-blue-100 text-xs my-2.5 leading-relaxed opacity-90">
            Convert your flagged structures into natural, organic human flows with our AI-evading core paraphrasing technology.
          </p>
          <button
            onClick={handleHumanizeRedirect}
            disabled={loading || !text.trim()}
            className="bg-white hover:bg-gray-50 text-blue-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 w-full shadow-lg shadow-black/10 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none mt-2"
          >
            <Wand2 size={16} /> Rewrite Now
          </button>
        </div>

      </div>
    </div>
  );
}
