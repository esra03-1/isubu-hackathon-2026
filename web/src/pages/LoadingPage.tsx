import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Menu, CircleDashed, CheckCircle2 } from 'lucide-react';
import type { CompiledPlan } from '../api/types';
import { mockData } from '../mockData';

const steps = [
  { id: 1, title: 'Girdin analiz ediliyor', desc: 'Notların okunuyor ve anlaşılmaya çalışılıyor...', icon: '📝', colorClass: 'bg-[#cdb4db]', textClass: 'text-[#8E7AB5]' },
  { id: 2, title: 'Öncelikler çıkarılıyor', desc: 'En önemli görevler belirleniyor...', icon: '🎯', colorClass: 'bg-[#ffc8dd]', textClass: 'text-[#d85888]' },
  { id: 3, title: 'Zaman akışı oluşturuluyor', desc: 'Görevler uygun zamanlara yerleştiriliyor...', icon: '⏳', colorClass: 'bg-[#bde0fe]', textClass: 'text-[#5c98d6]' },
  { id: 4, title: 'İçgörüler hazırlanıyor', desc: 'Riskler ve öneriler çıkarılıyor...', icon: '✨', colorClass: 'bg-[#d8f3dc]', textClass: 'text-[#52b788]' },
  { id: 5, title: 'Yanıt taslakları hazırlanıyor', desc: 'Mesaj taslakları oluşturuluyor...', icon: '📨', colorClass: 'bg-[#fff2cc]', textClass: 'text-[#d4a373]' },
  { id: 6, title: 'Planın tamamlanıyor', desc: 'Son kontroller yapılıyor...', icon: '✅', colorClass: 'bg-[#ffafcc]', textClass: 'text-[#d85888]' },
];

const TOTAL_DURATION = 4500;

export default function LoadingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Plan verisi: InputPage'den navigation state ile gelir
  const plan: CompiledPlan =
    (location.state as { plan?: CompiledPlan } | null)?.plan ?? mockData;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = TOTAL_DURATION / steps.length;

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, stepDuration);

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(100, Math.floor((elapsed / TOTAL_DURATION) * 100));
      setProgress(current);

      if (current >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => navigate('/result', { state: { plan } }), 500);
      }
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 font-black text-2xl text-slate-800 tracking-tight">
            <span className="text-3xl text-[#cdb4db] drop-shadow-sm">🐾</span> OneNext
          </div>
          <div className="w-10 h-10 bg-[#ffc8dd] rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
            <span className="text-xl">🐶</span>
          </div>
        </div>

        {/* Center Illustration */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-40 bg-[#fff8fa] rounded-full flex flex-col items-center justify-end overflow-hidden border-4 border-white shadow-sm mb-6">
            <span className="text-6xl mb-4 z-10 drop-shadow-md">🐶</span>
            <div className="absolute bottom-[-10px] w-24 h-16 bg-[#cdb4db] rounded-t-xl flex justify-center pt-2 border-2 border-white shadow-inner">
              <span className="text-white text-xs font-black">🐾</span>
            </div>
            <Sparkles className="absolute top-6 left-6 text-[#ffafcc]" size={20} />
            <Sparkles className="absolute top-10 right-8 text-[#bde0fe]" size={24} />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Günün analiz ediliyor...
          </h2>
          <p className="text-slate-500 font-medium text-center">
            Dağınık bilgini anlamlandırıp,<br />en iyi planı oluşturuyoruz.
          </p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4 mb-12 flex-1">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={step.id}
                className={`relative flex items-center p-4 rounded-3xl transition-all duration-500 ${
                  isActive
                    ? `${step.colorClass}/30 scale-[1.02] shadow-sm`
                    : isCompleted
                    ? `${step.colorClass}/10 opacity-70`
                    : `${step.colorClass}/10 opacity-40 grayscale-[50%]`
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center text-2xl drop-shadow-sm transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}>
                  {step.icon}
                </div>
                <div className="flex-1 px-4">
                  <h4 className={`font-bold text-lg ${step.textClass}`}>{step.title}</h4>
                  <p className="text-xs font-semibold text-slate-500/80">{step.desc}</p>
                </div>
                <div className="w-10 flex justify-end pr-2">
                  {isCompleted && <CheckCircle2 className={step.textClass} fill="currentColor" size={24} strokeWidth={1} stroke="white" />}
                  {isActive && <Loader2 className={`animate-spin ${step.textClass}`} size={24} />}
                  {isPending && <CircleDashed className="text-slate-300" size={24} strokeWidth={2} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-auto pt-6 pb-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3 relative shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#cdb4db] to-[#ffafcc] rounded-full transition-all duration-[50ms] ease-linear"
              style={{ width: `${progress}%` }}
            >
              <div
                className="w-full h-full opacity-20"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)' }}
              />
            </div>
          </div>
          <div className="text-center text-sm font-bold text-slate-500">
            % {progress} tamamlandı
          </div>
        </div>

      </div>
    </div>
  );
}
