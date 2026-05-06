import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eraser, User, Lightbulb } from 'lucide-react';
import { submitPlan } from '../api/client';
import { mockData } from '../mockData';

const LAST_INPUT_KEY = 'onenext_last_input';
const LAST_PLAN_KEY = 'onenext_last_plan';
const LAST_TS_KEY = 'onenext_last_ts';

const MAX_LENGTH = 4000;

export default function InputPage() {
  const navigate = useNavigate();
  const [rawInput, setRawInput] = useState(
    () => localStorage.getItem(LAST_INPUT_KEY) ?? ''
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleClear = () => setRawInput('');

  const handleCompile = async () => {
    if (!rawInput.trim()) return;
    setIsLoading(true);
    let plan = mockData;
    try {
      plan = await submitPlan({ raw_input: rawInput });
    } catch {
      // Backend erişilemiyorsa mock data ile devam et
    } finally {
      localStorage.setItem(LAST_INPUT_KEY, rawInput);
      localStorage.setItem(LAST_PLAN_KEY, JSON.stringify(plan));
      localStorage.setItem(LAST_TS_KEY, new Date().toISOString());
      navigate('/loading', { state: { plan } });
    }
  };

  const handleCustomize = () => {
    // TODO: Kişiselleştirme ekranı henüz tanımlanmadı
    alert('Kişiselleştirme yakında geliyor! 🐾');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-2">
      {/* Hero Başlık */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#f694c1]/20 shadow-sm text-xs font-bold text-[#f694c1] mb-6">
          <Sparkles size={14} /> AI destekli günlük planlayıcı
        </span>
        <h2 className="text-4xl md:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] mb-5 text-[#1e293b]">
          Dağınık gününü <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f694c1] to-[#e4c1f9]">
            sıradaki adıma dönüştür.
          </span>
        </h2>
        <p className="text-slate-500 text-lg font-medium">
          Mesajlarını, notlarını, hatırlatmalarını veya aklındaki karışıklığı yaz.
          <br className="hidden md:block" />
          Biz senin için derleyelim. 🐾
        </p>
      </div>

      {/* Girdi Kartı */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-4xl mx-auto transition-all focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.08)] focus-within:border-[#e4c1f9]/50">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          Bugün aklında ne var?
        </h3>

        <textarea
          id="daily-input"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          maxLength={MAX_LENGTH}
          disabled={isLoading}
          placeholder="Bugün yapmam gerekenleri, mesajları, hatırlatmaları veya aklındaki karışıklığı buraya yapıştır..."
          className="w-full h-40 md:h-48 resize-none outline-none text-base md:text-lg bg-transparent font-medium text-slate-600 placeholder-slate-300 leading-relaxed"
        />

        {/* Alt Kısım: Sayaç ve Butonlar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 border-t border-slate-100 mt-2">
          <div className="text-xs font-semibold text-slate-400 w-full md:w-auto text-left">
            {rawInput.length} / {MAX_LENGTH}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              id="clear-btn"
              onClick={handleClear}
              disabled={!rawInput || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eraser size={16} /> Temizle
            </button>

            <button
              id="compile-btn"
              onClick={handleCompile}
              disabled={!rawInput.trim() || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#f694c1] to-[#e4c1f9] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Sparkles size={16} fill="currentColor" /> Günü Derle
            </button>

            <button
              id="customize-btn"
              onClick={handleCustomize}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ede7b1] to-[#d3f8e2] hover:opacity-90 text-slate-700 text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <User size={16} /> Gününü Kişiselleştir
            </button>
          </div>
        </div>
      </div>

      {/* İpucu Kutusu */}
      <div className="bg-[#a9def9]/15 border border-[#a9def9]/30 rounded-2xl p-4 max-w-3xl mx-auto flex items-center justify-center gap-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm mt-8">
        <Lightbulb size={20} className="text-yellow-500 fill-yellow-500" />
        <p>
          <strong>İpucu:</strong> Kişiselleştirirsen, planın senin rutinine ve önceliklerine göre daha isabetli olur.
        </p>
      </div>
    </div>
  );
}