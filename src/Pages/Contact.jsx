import { useState, useEffect } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, userAnswer: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Generate random numbers for simple math CAPTCHA
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1: n1, num2: n2, userAnswer: "" });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // CAPTCHA Validation check on frontend
    const correctAnswer = captcha.num1 + captcha.num2;
    if (parseInt(captcha.userAnswer) !== correctAnswer) {
      setStatus({ type: "error", message: "❌ Incorrect CAPTCHA answer. Please try again." });
      return;
    }

    setLoading(true);

    // Abhi backend connected nahi hai, toh hum temporary success response show karwa rahe hain
    setTimeout(() => {
      setStatus({ 
        type: "success", 
        message: "🚀 Frontend Submission Successful! (Note: Backend delivery is currently paused)." 
      });
      setFormData({ name: "", email: "", message: "" });
      generateCaptcha();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-[#0b1015] min-h-screen text-gray-200 pt-28 pb-16 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-[#121A21] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect background blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Get In <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-sm text-gray-400">
            Have questions, custom requirements, or feedback? Send us a message below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              required 
              className="w-full bg-[#1a2632] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Your name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full bg-[#1a2632] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500 transition-colors" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              placeholder="name@example.com"
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Your Message</label>
            <textarea 
              rows="5" 
              required 
              className="w-full bg-[#1a2632] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none" 
              value={formData.message} 
              onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
              placeholder="Type your query here..."
            ></textarea>
          </div>

          {/* Math CAPTCHA Box */}
          <div className="bg-[#1a2632]/50 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm font-medium text-gray-300">
              Spam Protection: <span className="text-blue-400 font-bold bg-[#1a2632] px-2 py-1 rounded border border-white/10 ml-1">{captcha.num1} + {captcha.num2} = ?</span>
            </div>
            <input 
              type="number" 
              required 
              placeholder="Answer" 
              className="w-full sm:w-28 bg-[#1a2632] border border-white/10 rounded-lg p-2 text-white text-sm text-center outline-none focus:border-blue-500"
              value={captcha.userAnswer}
              onChange={(e) => setCaptcha({ ...captcha, userAnswer: e.target.value })}
            />
          </div>

          {/* Status Alert Notification */}
          {status.message && (
            <div className={`p-3 rounded-xl text-center text-xs font-medium ${status.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {status.message}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 text-sm flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Form...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}