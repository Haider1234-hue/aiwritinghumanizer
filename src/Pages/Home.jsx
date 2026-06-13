import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Clipboard, Copy, Download, Wand2, Zap, 
  BarChart3, Layout, Users, Save, Trash2, Check
} from 'lucide-react';
import mammoth from 'mammoth';
import { useLocation } from 'react-router-dom';

// --- SUB-COMPONENTS ---

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-[#1A242D] border border-white/5 p-6 md:p-8 rounded-2xl 
    hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(19,_83,_254,_0.15)] hover:border-blue-500/30 transition-all duration-300 group text-left">
    <div className="bg-blue-600/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
      <Icon className="text-blue-500 transition-transform group-hover:scale-110" size={22} />
    </div>
    <h3 className="text-white text-lg font-bold mb-2.5">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-xs md:text-sm">{description}</p>
  </div>
);

const WorkCard = ({ icon: Icon, title, description }) => (
  <div className="bg-[#1A242D]/60 border border-white/5 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center group">
    <div className="bg-blue-600/10 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-blue-500/10">
      <Icon className="text-blue-400" size={22} />
    </div>
    <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-xs md:text-sm max-w-[240px]">{description}</p>
  </div>
);

const TextConverter = () => {
  const location = useLocation();
  const initialText = location.state?.text || "";
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const characterLimit = 5000;

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error("Paste error:", err);
      alert("Please allow clipboard permissions.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => setInputText(e.target.result);
      reader.readAsText(file);
    } else if (fileType === 'docx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          setInputText(result.value);
        } catch (err) {
          console.error("Docx parsing error:", err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a .txt or .docx file.");
    }
    e.target.value = null;
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutputText('');

    try {
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!groqApiKey) {
        throw new Error("Groq API key is not configured.");
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `You are a human writer. Rewrite the text in natural, simple English so it looks like a real person wrote it, not AI. Rules: - Use everyday words, not advanced or academic terms. - Keep sentences short and mixed (some short, some long). - Avoid perfect grammar — allow light imperfections. - Keep the meaning the same but make it sound casual and human. - Do NOT add any explanations or commentary. - Output only the rewritten text. Text to rewrite: ${inputText}`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Groq API error");
      }

      const data = await response.json();
      const humanizedText = data.choices?.[0]?.message?.content ?? inputText;
      setOutputText(humanizedText);
    } catch (error) {
      console.error("Groq API error:", error);
      alert("Humanize failed. Check API key and network.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "humanized-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="bg-[#0b1015] py-4 md:py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Input Section */}
        <div className="bg-[#121A21] border border-white/5 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between focus-within:border-blue-500/20 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 gap-2">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Input AI Text</span>
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.docx" className="hidden" />
                
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/5"
                >
                  <FileText size={14} /> 
                  <span className="hidden sm:inline">Upload</span>
                </button>
                
                <button 
                  onClick={handlePaste} 
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/10"
                >
                  <Clipboard size={14} /> Paste
                </button>

                {inputText && (
                  <button 
                    onClick={clearAll}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg bg-white/5 border border-white/5"
                    title="Clear Text"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <textarea
              className="w-full h-[280px] md:h-[400px] bg-transparent text-gray-200 outline-none resize-none placeholder:text-gray-600 text-base md:text-lg leading-relaxed scrollbar-thin"
              placeholder="Paste your AI-generated content here (Articles, Essays, Reports)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={characterLimit}
            />
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex gap-4">
              <span>Words: <strong className="text-gray-300">{wordCount}</strong></span>
              <span>Characters: <strong className="text-gray-300">{inputText.length}</strong></span>
            </div>
            <span className={inputText.length >= characterLimit ? "text-red-400" : ""}>
              {inputText.length.toLocaleString()} / {characterLimit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-[#121A21]/60 border border-white/5 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Humanized Result</span>
              {outputText && !loading && (
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard} 
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10 transition-all"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button 
                    onClick={handleDownload} 
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-all"
                    title="Download TXT"
                  >
                    <Download size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="w-full h-[280px] md:h-[400px] overflow-y-auto text-gray-200 text-base md:text-lg leading-relaxed select-text scrollbar-thin">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase animate-pulse mt-2">
                    Rewriting text patterns...
                  </p>
                </div>
              ) : outputText ? (
                <p className="whitespace-pre-wrap text-left align-top">{outputText}</p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 opacity-40 select-none">
                  <Wand2 className="text-gray-500 mb-3" size={36} />
                  <p className="text-sm text-gray-400 max-w-[260px]">Your optimized human-like output will appear here dashboard.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Invisible padding anchor node to keep row block proportions safe */}
          <div className="h-4 invisible hidden md:block"></div>
        </div>

      </div>

      {/* Main Process Trigger Action Button */}
      <div className="flex justify-center mt-8 px-4">
        <button
          onClick={handleHumanize}
          disabled={loading || !inputText.trim()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-30 disabled:pointer-events-none text-white font-bold py-4 px-14 rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-95 text-sm md:text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Wand2 size={18} />
          )}
          {loading ? "Processing Text..." : "Humanize Text"}
        </button>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    { title: "AI to natural", description: "Algorithms that rewrite content to mimic human rhythm.", icon: Wand2 },
    { title: "One-tap experience", description: "Streamlined process that transforms text with a single click.", icon: Zap },
    { title: "AI detection insight", description: "Receive insights into how AI detectors perceive your content.", icon: BarChart3 },
    { title: "Clean interface", description: "Distraction-free environment optimized for performance.", icon: Layout },
    { title: "Local storage", description: "Your data stays on your device for maximum privacy.", icon: Users },
    { title: "Professional grade", description: "Tailored for writers requiring high-quality results.", icon: Users }
  ];

  return (
    <section className="py-16 md:py-24 text-center border-t border-white/5 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Key Features</h2>
        <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base mb-12 md:mb-16">Everything you need to write naturally without worrying about restrictive algorithm flags.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </div>
    </section>
  );
};

const WorksSection = () => {
  const steps = [
    { title: "1. Paste", description: "Paste your AI draft into our secure local editor.", icon: Clipboard },
    { title: "2. Humanize", description: "Our algorithms rewrite text to match natural human patterns.", icon: Wand2 },
    { title: "3. Store", description: "Your content is saved locally for 100% privacy.", icon: Save }
  ];

  return (
    <section className="py-16 md:py-24 text-center bg-[#121A21]/30 border-t border-white/5 rounded-3xl px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-12 tracking-tight">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => <WorkCard key={i} {...s} />)}
        </div>
      </div>
    </section>
  );
};

function Home() {
  return (
    <div className="min-h-screen bg-[#0b1015] font-sans pt-12">
      <main className="pt-12 md:pt-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 md:mb-24 mt-4">
          <div className="relative z-20 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
            <div className="inline-block bg-green-500/10 text-green-400 font-bold tracking-widest text-[10px] md:text-xs py-2 mb-5 px-5 rounded-xl border border-green-500/10">
              🛡️ NATURAL & SECURE PROCESSING
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-2 text-white leading-none">
              Humanize AI Write
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-blue-500">
              With Confidence
            </h1>
            <p className="text-base md:text-lg text-gray-400 mb-2 max-w-lg leading-relaxed">
              Transform AI-generated writing into natural, clear content stored locally on your device for absolute privacy boundaries.
            </p>
          </div>  

          {/* Download App Badges Block */}
          <div className="flex flex-col items-center gap-5 shrink-0 bg-[#121A21] border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl w-full sm:w-auto">
            <div className="text-blue-400 font-bold tracking-widest text-[10px] uppercase">
              📱 Available On Mobile
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => window.open("https://apps.apple.com/pk/app/humanize-ai-write/id6757109160", "_blank")}
                className="flex flex-col items-center justify-center border border-white/10 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all duration-300 min-w-[170px] bg-white/5 text-white"
              >
                <span className="text-[9px] font-medium opacity-50 uppercase tracking-wider">Download on the</span>
                <span className="text-base font-bold">App Store</span>
              </button>

              <button
                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.blessup.humanizer.ai.text", "_blank")}
                className="flex flex-col items-center justify-center border border-white/10 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all duration-300 min-w-[170px] bg-white/5 text-white"
              >
                <span className="text-[9px] font-medium opacity-50 uppercase tracking-wider">Get it on</span>
                <span className="text-base font-bold">Google Play</span>
              </button>
            </div>
          </div>  
        </div>

        {/* Modular Workflow Sections */}
        <TextConverter />
        <FeaturesSection />
        <WorksSection />
      </main>
    </div>
  );
}

export default Home;
