import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, User, Clock, Target, Heart, Zap, FileText, Lock } from 'lucide-react';
import { submitPlan } from '../api/client';
import { mockData } from '../mockData';

const LAST_INPUT_KEY = 'onenext_last_input';
const LAST_PLAN_KEY = 'onenext_last_plan';
const LAST_TS_KEY = 'onenext_last_ts';

export default function CustomizePage() {
  const navigate = useNavigate();
  const rawInput = localStorage.getItem(LAST_INPUT_KEY) ?? '';
  const hasInput = rawInput.trim().length > 0;
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlan = async () => {
    if (!hasInput) {
      handleBack();
      return;
    }
    
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

  const [planMode, setPlanMode] = useState<'day' | 'week' | 'month'>('day');
  const [weeklyInput, setWeeklyInput] = useState('');
  const [monthlyInput, setMonthlyInput] = useState('');

  const FormInput = ({ label, placeholder }: { label: string, placeholder: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e4c1f9] focus:border-[#e4c1f9] transition-all"
      />
    </div>
  );

  const FormTextarea = ({ label, placeholder, maxLines = 3, maxLength = 300, description, value, onChange }: { label: string, placeholder: string, maxLines?: number, maxLength?: number, description?: string, value?: string, onChange?: any }) => (
    <div className="flex flex-col gap-1.5 h-full">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      {description && <p className="text-[11px] text-slate-500 mb-1">{description}</p>}
      <div className="relative flex-grow">
        <textarea 
          placeholder={placeholder}
          rows={maxLines}
          value={value}
          onChange={onChange}
          className="w-full h-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e4c1f9] focus:border-[#e4c1f9] transition-all resize-none"
        />
        <div className="absolute bottom-2 right-3 text-[10px] font-semibold text-slate-400">
          {(value || '').length} / {maxLength}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 p-4 md:p-8">
      
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} /> Ana sayfaya dön
        </button>
        
        <div className="flex items-center gap-3 w-full sm:w-auto p-1 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
          <button 
            onClick={() => setPlanMode('day')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${planMode === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Günlük
          </button>
          <button 
            onClick={() => setPlanMode('week')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${planMode === 'week' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-purple-600'}`}
          >
            Haftalık
          </button>
          <button 
            onClick={() => setPlanMode('month')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${planMode === 'month' ? 'bg-white text-[#f694c1] shadow-sm' : 'text-slate-500 hover:text-[#f694c1]'}`}
          >
            Aylık
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 bg-[#e4c1f9]/30 rounded-3xl flex items-center justify-center text-purple-600 mb-2 mx-auto shadow-sm">
            <User size={32} />
          </div>
          <Sparkles className="absolute -top-2 -right-4 text-[#f694c1] animate-pulse" size={20} />
        </div>
        <h2 className="text-3xl md:text-[2.5rem] font-extrabold tracking-tight text-[#1e293b] mb-3">
          {planMode === 'day' ? 'Gününü Kişiselleştir' : planMode === 'week' ? 'Haftanı Planla' : 'Ayını Planla'}
        </h2>
        <p className="text-slate-500 font-medium">
          {planMode === 'day' 
            ? 'Planını senin hayatına göre daha iyi oluşturabilmemiz için isteğe bağlı bilgilerini paylaşabilirsin. 🐾'
            : `Bu ${planMode === 'week' ? 'hafta' : 'ay'} neler yapman gerektiğini yaz, senin için takvime dökelim. 🐾`
          }
        </p>
      </div>

      {/* Forms */}
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {planMode === 'day' && (
          <>
            {/* 1. Hakkında */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#e4c1f9]/20 rounded-xl text-purple-600">
                  <User size={18} fill="currentColor" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">Hakkında</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormInput label="Adın (isteğe bağlı)" placeholder="Örn. Ayşe" />
                <FormInput label="Yaşın (isteğe bağlı)" placeholder="Örn. 22" />
                <FormInput label="Mesleğin / Okulun (isteğe bağlı)" placeholder="Örn. Yazılımcı / Üniversite Öğrencisi" />
              </div>
            </div>

            {/* 2. Rutinin & Zaman Blokları */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in fade-in duration-500 delay-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#f694c1]/20 rounded-xl text-[#f694c1]">
                  <Clock size={18} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">Rutinin & Zaman Blokları</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormInput label="Uyku saat aralığın (isteğe bağlı)" placeholder="Örn. 23:30 - 07:30" />
                <FormInput label="Okul saatlerin (isteğe bağlı)" placeholder="Örn. 09:00 - 15:00" />
                <FormInput label="İş / Mesai saatlerin (isteğe bağlı)" placeholder="Örn. 09:00 - 18:00" />
                <FormInput label="En verimli olduğun saatler (isteğe bağlı)" placeholder="Örn. 10:00 - 13:00" />
                <FormInput label="Tek seferlik odaklanma süren (isteğe bağlı)" placeholder="Örn. 45 dk veya 1.5 saat" />
                <FormInput label="Günlük toplam çalışma hedefin (isteğe bağlı)" placeholder="Örn. 4 saat" />
              </div>
            </div>

            {/* 3. Önceliklerin & Detaylar Container */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-8 animate-in fade-in duration-500 delay-200">
              {/* Önceliklerin */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#f694c1]/10 rounded-xl text-[#f694c1]">
                    <Target size={18} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Önceliklerin</h3>
                </div>
                <FormTextarea 
                  label="Sana en önemli olan şeyler neler? (isteğe bağlı)"
                  placeholder="Örn. Sağlık, dersler, kariyer, kişisel gelişim..."
                  maxLength={300}
                />
              </div>

              {/* Odaklanma & Zorlayanlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-50 rounded-xl text-red-400">
                      <Heart size={18} fill="currentColor" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Odaklanmana Yardımcı Olanlar</h3>
                  </div>
                  <FormTextarea 
                    label=""
                    description="Seni motive eden veya odaklanmanı kolaylaştıran alışkanlıklar, ortamlar, yöntemler..."
                    placeholder="Örn. Müzik, sessiz ortam, pomodoro tekniği..."
                    maxLength={200}
                    maxLines={4}
                  />
                </div>
                
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#ede7b1]/40 rounded-xl text-yellow-600">
                      <Zap size={18} fill="currentColor" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Zorlayan Durumlar</h3>
                  </div>
                  <FormTextarea 
                    label=""
                    description="Dikkatini dağıtan veya ertelemene neden olan durumlar..."
                    placeholder="Örn. Sosyal medya, dağınık masa, belirsizlik..."
                    maxLength={200}
                    maxLines={4}
                  />
                </div>
              </div>

              {/* Ek Notlar */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#d3f8e2]/50 rounded-xl text-green-600">
                    <FileText size={18} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Ek Notlar</h3>
                </div>
                <FormTextarea 
                  label="Planında dikkate almamızı istediğin başka bir şey var mı?"
                  placeholder="Örn. Önemli bir sınav, seyahat, sağlık durumu..."
                  maxLength={300}
                />
              </div>
            </div>
          </>
        )}

        {(planMode === 'week' || planMode === 'month') && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#bde0fe]/20 rounded-xl text-[#5c98d6]">
                <FileText size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                {planMode === 'week' ? 'Haftalık Yapılacaklar' : 'Aylık Hedefler'}
              </h3>
            </div>
            <FormTextarea 
              label={`Bu ${planMode === 'week' ? 'hafta' : 'ay'} neler yapmayı planlıyorsun?`}
              description={`Yazdığın her şeyi takvim üzerinde senin için organize edeceğiz.`}
              placeholder={`Örn. Çarşamba günü sunum hazırlanacak. Hafta sonu aile ziyareti. Salı ve Perşembe akşamı spor...`}
              maxLength={1000}
              maxLines={8}
              value={planMode === 'week' ? weeklyInput : monthlyInput}
              onChange={(e: any) => planMode === 'week' ? setWeeklyInput(e.target.value) : setMonthlyInput(e.target.value)}
            />
          </div>
        )}

        {/* Footer / Kaydet Alanı */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-3 bg-[#a9def9]/10 p-4 rounded-2xl border border-[#a9def9]/30 flex-1 w-full">
            <Lock size={20} className="text-[#a9def9] flex-shrink-0 mt-0.5 md:mt-0" />
            <p className="text-sm font-medium text-slate-600 leading-snug">
              <strong className="text-slate-800">Bu bilgiler sadece senin planını iyileştirmek için kullanılır.</strong><br/>
              Hiçbir bilgi saklanmaz veya paylaşılmaz.
            </p>
          </div>
          
          {planMode === 'day' ? (
            <button 
              onClick={hasInput ? handlePlan : handleBack}
              disabled={isLoading}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#f694c1] to-[#e4c1f9] hover:opacity-90 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
            >
              {hasInput ? "Gününü Planla" : "Kaydet ve Dön"} <Sparkles size={16} fill="currentColor" />
            </button>
          ) : (
            <button 
              onClick={() => navigate(`/calendar?view=${planMode}`)}
              disabled={planMode === 'week' ? !weeklyInput.trim() : !monthlyInput.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#bde0fe] to-[#a2d2ff] hover:opacity-90 text-slate-800 font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
            >
              {planMode === 'week' ? 'Haftayı Planla' : 'Ayı Planla'} <Sparkles size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
