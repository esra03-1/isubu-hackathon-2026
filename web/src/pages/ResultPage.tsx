import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Copy, Check, Terminal, Menu, Share2 } from 'lucide-react';
import type { CompiledPlan } from '../api/types';
import { mockData } from '../mockData';

const LAST_PLAN_KEY = 'onenext_last_plan';

const pressureLabels: Record<CompiledPlan['summary']['dominant_pressure'], string> = {
  academic: 'Akademik',
  deadline: 'Teslim tarihi',
  errand: 'Koşturmaca',
  mixed: 'Karışık',
  social: 'Sosyal',
  work: 'İş',
};

const urgencyLabels: Record<CompiledPlan['focus']['urgency'], string> = {
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
};

const severityEmoji: Record<'high' | 'medium' | 'low', string> = {
  high: '🔥',
  medium: '⚠️',
  low: '💡',
};

function compareTimeStrings(left: string, right: string): number {
  return left.localeCompare(right);
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = (() => {
    const fromState = (location.state as { plan?: CompiledPlan } | null)?.plan;
    if (fromState) {
      return fromState;
    }

    const saved = localStorage.getItem(LAST_PLAN_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as CompiledPlan;
      } catch {
        // Ignore malformed local state and fall back to demo data.
      }
    }

    return mockData;
  })();

  const [showAllInsights, setShowAllInsights] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sortedTimeline = [...data.timeline].sort((left, right) =>
    compareTimeStrings(left.time, right.time)
  );
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTimelineEmoji = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('toplantı')) return '⏰';
    if (t.includes('quiz')) return '📖';
    if (t.includes('mail') || t.includes('mesaj')) return '✉️';
    if (t.includes('proje') || t.includes('doküman')) return '📁';
    if (t.includes('kapanış')) return '✅';
    return '📌';
  };

  const visibleInsights = showAllInsights ? data.insights : data.insights.slice(0, 3);
  const visibleReplies = showAllReplies ? data.replies : data.replies.slice(0, 3);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 font-black text-2xl text-slate-800 tracking-tight">
            <span className="text-3xl text-[#cdb4db] drop-shadow-sm">🐾</span> OneNext
          </div>
          <div className="flex items-center gap-2">
            <button
              id="new-input-btn"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#cdb4db]/30 rounded-full font-bold text-sm text-[#cdb4db] shadow-sm hover:bg-[#cdb4db]/10 transition-all"
            >
              <span>Yeni Girdi</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-full font-bold text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
              <Share2 size={16} /> <span className="hidden sm:inline">Paylaş</span>
            </button>
          </div>
        </div>

        {/* 1. Günün Özeti */}
        <div className="bg-[#cdb4db]/15 border border-[#cdb4db]/30 rounded-[2rem] p-6 relative overflow-hidden flex justify-between items-center shadow-sm">
          <div className="z-10 relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📋</span>
              <h2 className="text-xl font-bold text-[#6b5883]">Günün Özeti</h2>
            </div>
            <p className="text-slate-800 font-bold mb-2 max-w-xl">
              {data.summary.headline}
            </p>
            <p className="text-slate-600 font-medium mb-1">
              Bugünün baskısı: {pressureLabels[data.summary.dominant_pressure]}
            </p>
            <p className="text-slate-700 font-medium">
              Tahmini <strong className="font-bold text-slate-900">{data.summary.estimated_saved_minutes} dakika</strong> kazandın.
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-center relative z-10 w-32 h-24">
            <span className="text-[5.5rem] drop-shadow-xl absolute right-2 top-[-10px] transform rotate-3">📋</span>
            <span className="text-[2.5rem] drop-shadow-lg absolute left-0 bottom-[-5px]">⏰</span>
            <span className="text-2xl absolute right-0 top-0 opacity-50">✨</span>
          </div>
        </div>

        {/* 2. Şimdi Odaklanman Gereken (Focus) */}
        <div className="bg-[#ffc8dd]/30 border border-[#ffc8dd] rounded-[2rem] p-6 md:p-8 relative shadow-sm overflow-hidden">
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 opacity-90 pointer-events-none drop-shadow-2xl">
            <span className="text-[10rem]">🎯</span>
          </div>
          <div className="absolute right-32 top-8 opacity-60">
            <span className="text-3xl">✨</span>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-[#d85888]">
              <span className="text-lg">🎯</span>
              <span className="font-bold text-sm tracking-wide">
                Şimdi Odaklanman Gereken{' '}
                <span className="text-slate-500 font-medium">(Next Action)</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
              {data.focus.title}
            </h1>

            <p className="text-slate-700 font-medium text-base mb-6 max-w-[80%] md:max-w-[70%]">
              {data.focus.reason}
            </p>

            <div className="flex flex-wrap gap-4 w-[85%] md:w-[70%]">
              {/* Tahmini Süre */}
              <div className="bg-white border border-white rounded-2xl p-4 flex-1 min-w-[130px] flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1">Tahmini Süre</div>
                  <div className="text-xl font-black text-slate-900">{data.focus.duration}</div>
                </div>
                <div className="bg-[#cdb4db]/20 p-2 rounded-full text-[#a88ebf]">
                  <Clock size={22} strokeWidth={2.5} />
                </div>
              </div>

              {/* Öncelik */}
              <div className="bg-white border border-white rounded-2xl p-4 flex-1 min-w-[130px] flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1">Öncelik</div>
                  <div className="text-xl font-black text-[#ffafcc]">{urgencyLabels[data.focus.urgency]}</div>
                </div>
                <div className="flex gap-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffafcc]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffafcc]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffafcc]/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Zaman Akışı (Timeline) */}
        <div className="bg-[#bde0fe]/15 border border-[#bde0fe]/40 rounded-[2rem] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl drop-shadow-sm">⏳</span>
            <h3 className="text-xl font-bold text-[#5c98d6]">
              Zaman Akışı <span className="text-slate-500 text-sm font-medium">(Timeline)</span>
            </h3>
          </div>

          <div className="relative pl-2 md:pl-4">
            <div className="space-y-6">
              {sortedTimeline.map((item) => (
                <div key={item.id} className="relative flex items-start gap-4 md:gap-6 group">
                  <div className="mt-2.5 w-12 flex-shrink-0 font-black text-slate-800 text-lg">
                    {item.time}
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex items-center justify-center text-3xl drop-shadow-md hover:scale-110 transition-transform cursor-default">
                        {getTimelineEmoji(item.title)}
                      </div>
                      <div className="pt-1">
                        <h4 className="font-bold text-lg text-slate-900">{item.title}</h4>
                      </div>
                    </div>
                    <div className="hidden sm:inline-flex bg-white text-[#a2d2ff] px-4 py-1.5 rounded-full text-xs font-bold border border-[#bde0fe]/50 shadow-sm whitespace-nowrap mt-2 md:mt-0">
                      {item.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. İçgörüler + Yanıt Taslakları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* İçgörüler */}
          <div className="bg-[#cdb4db]/15 border border-[#cdb4db]/30 rounded-[2rem] p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">✨</span>
              <h3 className="font-bold text-[#8E7AB5]">
                İçgörüler <span className="text-slate-500 text-sm font-medium">(Insights)</span>
              </h3>
            </div>
            <div className="flex-1 space-y-4 mb-6">
              {visibleInsights.length > 0 ? (
                visibleInsights.map((insight) => (
                  <div key={insight.id} className="flex gap-3 items-start">
                    <div className="text-lg drop-shadow-sm mt-0.5">{severityEmoji[insight.severity]}</div>
                    <div>
                      <p className="text-sm text-slate-700 font-semibold leading-relaxed">{insight.message}</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mt-1">
                        {insight.type} • {urgencyLabels[insight.severity]}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-slate-500">Şu an ek içgörü görünmüyor.</p>
              )}
            </div>
            <button
              id="toggle-insights-btn"
              onClick={() => setShowAllInsights(!showAllInsights)}
              disabled={data.insights.length <= 3}
              className="w-full py-3 rounded-xl bg-[#cdb4db]/20 text-[#8E7AB5] font-bold text-sm hover:bg-[#cdb4db]/30 transition-colors"
            >
              {showAllInsights ? 'Daha Az Göster' : 'Tümünü Gör'}
            </button>
          </div>

          {/* Yanıt Taslakları */}
          <div className="bg-[#ffafcc]/10 border border-[#ffafcc]/30 rounded-[2rem] p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">📨</span>
              <h3 className="font-bold text-[#d85888]">
                Yanıt Taslakları <span className="text-slate-500 text-sm font-medium">(Reply Drafts)</span>
              </h3>
            </div>
            <div className="flex-1 space-y-3 mb-6">
              {visibleReplies.length > 0 ? (
                visibleReplies.map((reply) => (
                  <div key={reply.id} className="bg-white/80 border border-white rounded-xl p-3 flex justify-between items-center gap-3 shadow-sm">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-wide text-[#d85888] mb-1">
                        {reply.recipient} • {reply.context}
                      </p>
                      <p className="text-sm font-bold text-slate-700">{reply.draft}</p>
                    </div>
                    <button
                      id={`copy-reply-${reply.id}`}
                      onClick={() => handleCopy(reply.id, reply.draft)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ffafcc] transition-colors whitespace-nowrap bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100"
                    >
                      {copiedId === reply.id
                        ? <><Check size={14} className="text-[#ffafcc]" /> Alındı</>
                        : <><Copy size={14} /> Kopyala</>}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-slate-500">Hazırlanan yanıt taslağı yok.</p>
              )}
            </div>
            <button
              id="toggle-replies-btn"
              onClick={() => setShowAllReplies(!showAllReplies)}
              disabled={data.replies.length <= 3}
              className="w-full py-3 rounded-xl bg-[#ffafcc]/20 text-[#d85888] font-bold text-sm hover:bg-[#ffafcc]/30 transition-colors"
            >
              {showAllReplies ? 'Daha Az Göster' : 'Tüm Taslakları Gör'}
            </button>
          </div>
        </div>

        {/* Debug Paneli */}
        <div className="pt-4 text-center pb-8">
          <button
            id="toggle-debug-btn"
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 mx-auto bg-slate-50 px-4 py-2 rounded-full transition-colors"
          >
            <Terminal size={16} /> {showDebug ? 'Debug Panelini Gizle' : 'Debug Panelini Göster'}
          </button>
          {showDebug && (
            <div className="mt-4 text-left bg-slate-900 rounded-[2rem] p-6 text-green-400 font-mono text-sm overflow-x-auto shadow-xl">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
                <span className="text-slate-400 font-bold">Developer Debug Info</span>
                <span className={`px-3 py-1 rounded-full font-bold ${data.debug.fallback_used ? 'bg-[#ffafcc] text-slate-900' : 'bg-[#bde0fe] text-slate-900'}`}>
                  Fallback: {data.debug.fallback_used ? 'True' : 'False'}
                </span>
              </div>
              <p><span className="text-slate-500">Model:</span> {data.debug.model}</p>
              <div className="mt-4 text-[#ffc8dd]">
                <span className="text-slate-500 block mb-2 font-bold">Warnings:</span>
                {data.debug.warnings.length > 0
                  ? data.debug.warnings.map((w, i) => <div key={i}>&gt; {w}</div>)
                  : <div>&gt; warning yok</div>}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
