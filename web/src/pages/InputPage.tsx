import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { compileDay } from '../api/client';
import { mockData, SAMPLE_INPUT } from '../mockData';

const LAST_INPUT_KEY = 'onenext_last_input';
const LAST_PLAN_KEY = 'onenext_last_plan';
const LAST_TS_KEY = 'onenext_last_ts';

export default function InputPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState(
    () => localStorage.getItem(LAST_INPUT_KEY) ?? ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompile = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await compileDay({ raw_input: inputText });
      localStorage.setItem(LAST_INPUT_KEY, inputText);
      localStorage.setItem(LAST_PLAN_KEY, JSON.stringify(result));
      localStorage.setItem(LAST_TS_KEY, new Date().toISOString());
      navigate('/result', { state: { plan: result } });
    } catch {
      // Backend erişilemiyorsa mock data ile devam et
      localStorage.setItem(LAST_INPUT_KEY, inputText);
      localStorage.setItem(LAST_PLAN_KEY, JSON.stringify(mockData));
      localStorage.setItem(LAST_TS_KEY, new Date().toISOString());
      navigate('/result', { state: { plan: mockData } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8fa] flex flex-col items-center justify-center p-6 font-sans text-slate-900">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border-4 border-white">

        {/* Header */}
        <div className="text-center pt-14 pb-6 px-8 relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-[#bde0fe]/30 rounded-b-[4rem] -z-10" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-[#cdb4db]/20 text-slate-900 shadow-xl mb-6 transform rotate-3 border border-[#cdb4db]/30">
            <span className="text-4xl drop-shadow-sm">🐾</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            OneNext
          </h1>
          <p className="text-xl text-slate-600 font-bold bg-[#ffc8dd]/50 inline-block px-4 py-1.5 rounded-full">
            Dağınık gününü sıradaki adıma dönüştür 🪄
          </p>
        </div>

        {/* Input Area */}
        <div className="px-8 pb-14">
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#cdb4db] via-[#ffafcc] to-[#a2d2ff] rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <textarea
              id="daily-input"
              className="relative w-full h-56 p-6 bg-[#f8faff] border-2 border-[#bde0fe] rounded-[2.2rem] focus:border-[#a2d2ff] focus:ring-4 focus:ring-[#a2d2ff]/30 transition-all resize-none text-slate-800 text-xl font-medium placeholder:text-slate-400 outline-none leading-relaxed"
              placeholder="Bugün aklını kurcalayan her şeyi buraya dök..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium mb-4 text-center">{error}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              id="load-sample-btn"
              onClick={() => setInputText(SAMPLE_INPUT)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#ffc8dd] text-slate-900 font-extrabold text-lg hover:scale-[1.02] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={24} />
              Örnek Girdi
            </button>
            <button
              id="compile-btn"
              onClick={handleCompile}
              disabled={isLoading || !inputText.trim()}
              className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[#a2d2ff] text-slate-900 font-extrabold text-lg shadow-lg hover:scale-[1.02] hover:shadow-xl hover:bg-[#8ec4f5] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={24} /> Derleniyor...</>
              ) : (
                <><Sparkles size={24} /> Günü Derle</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
