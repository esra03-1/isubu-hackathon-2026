import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, User, Clock, Target, Heart, Zap, FileText, Lock } from 'lucide-react';
import { getSavedPlan, listPlans } from '../api/client';
import type { PlanCustomization } from '../api/types';

const LAST_INPUT_KEY = 'onenext_last_input';

const emptyCustomization: PlanCustomization = {
  name: '',
  age: '',
  role_or_school: '',
  sleep_window: '',
  school_hours: '',
  work_hours: '',
  productive_hours: '',
  focus_duration: '',
  daily_work_goal: '',
  priorities: '',
  focus_helpers: '',
  challenges: '',
  additional_notes: '',
};

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

function FormInput({ label, placeholder, value, onChange, maxLength = 100 }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e4c1f9] focus:border-[#e4c1f9] transition-all"
      />
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLines?: number;
  maxLength?: number;
  description?: string;
}

function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  maxLines = 3,
  maxLength = 300,
  description,
}: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5 h-full">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      {description && <p className="text-[11px] text-slate-500 mb-1">{description}</p>}
      <div className="relative flex-grow">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={maxLines}
          className="w-full h-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e4c1f9] focus:border-[#e4c1f9] transition-all resize-none"
        />
        <div className="absolute bottom-2 right-3 text-[10px] font-semibold text-slate-400">
          {value.length} / {maxLength}
        </div>
      </div>
    </div>
  );
}

export default function CustomizePage() {
  const navigate = useNavigate();
  const rawInput = localStorage.getItem(LAST_INPUT_KEY) ?? '';
  const hasInput = rawInput.trim().length > 0;
  const dirtyRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customization, setCustomization] = useState<PlanCustomization>(emptyCustomization);

  const updateCustomization = (field: keyof PlanCustomization, value: string) => {
    dirtyRef.current = true;
    setCustomization((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateLatestCustomization = async () => {
      try {
        const plans = await listPlans();
        if (plans.length === 0) return;

        const latestPlan = await getSavedPlan(plans[0].id);
        if (cancelled || dirtyRef.current) return;

        setCustomization({
          ...emptyCustomization,
          ...latestPlan.customization,
        });
      } catch {
        // Existing customization is optional; leave the form empty if backend history is unavailable.
      }
    };

    void hydrateLatestCustomization();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlan = () => {
    if (!hasInput) {
      handleBack();
      return;
    }

    setErrorMessage(null);
    localStorage.setItem(LAST_INPUT_KEY, rawInput);
    navigate('/loading', { state: { request: { raw_input: rawInput, customization } } });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 p-4 md:p-8">
      
      {/* Üst Bar / Geri Dön */}
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 shadow-sm w-fit"
      >
        <ArrowLeft size={16} /> Ana sayfaya dön
      </button>

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 bg-[#e4c1f9]/30 rounded-3xl flex items-center justify-center text-purple-600 mb-2 mx-auto shadow-sm">
            <User size={32} />
          </div>
          <Sparkles className="absolute -top-2 -right-4 text-[#f694c1] animate-pulse" size={20} />
        </div>
        <h2 className="text-3xl md:text-[2.5rem] font-extrabold tracking-tight text-[#1e293b] mb-3">Gününü Kişiselleştir</h2>
        <p className="text-slate-500 font-medium">
          Planını senin hayatına göre daha iyi oluşturabilmemiz için<br className="hidden md:block" />
          isteğe bağlı bilgilerini paylaşabilirsin. 🐾
        </p>
      </div>

      {/* Bento Form Alanları */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}
        
        {/* 1. Hakkında */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#e4c1f9]/20 rounded-xl text-purple-600">
              <User size={18} fill="currentColor" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Hakkında</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput label="Adın (isteğe bağlı)" placeholder="Örn. Ayşe" value={customization.name} onChange={(value) => updateCustomization('name', value)} />
            <FormInput label="Yaşın (isteğe bağlı)" placeholder="Örn. 22" value={customization.age} onChange={(value) => updateCustomization('age', value)} />
            <FormInput label="Mesleğin / Okulun (isteğe bağlı)" placeholder="Örn. Yazılımcı / Üniversite Öğrencisi" value={customization.role_or_school} onChange={(value) => updateCustomization('role_or_school', value)} />
          </div>
        </div>

        {/* 2. Rutinin & Zaman Blokları */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#f694c1]/20 rounded-xl text-[#f694c1]">
              <Clock size={18} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Rutinin & Zaman Blokları</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormInput label="Uyku saat aralığın (isteğe bağlı)" placeholder="Örn. 23:30 - 07:30" value={customization.sleep_window} onChange={(value) => updateCustomization('sleep_window', value)} />
            <FormInput label="Okul saatlerin (isteğe bağlı)" placeholder="Örn. 09:00 - 15:00" value={customization.school_hours} onChange={(value) => updateCustomization('school_hours', value)} />
            <FormInput label="İş / Mesai saatlerin (isteğe bağlı)" placeholder="Örn. 09:00 - 18:00" value={customization.work_hours} onChange={(value) => updateCustomization('work_hours', value)} />
            <FormInput label="En verimli olduğun saatler (isteğe bağlı)" placeholder="Örn. 10:00 - 13:00" value={customization.productive_hours} onChange={(value) => updateCustomization('productive_hours', value)} />
            <FormInput label="Tek seferlik odaklanma süren (isteğe bağlı)" placeholder="Örn. 45 dk veya 1.5 saat" value={customization.focus_duration} onChange={(value) => updateCustomization('focus_duration', value)} />
            <FormInput label="Günlük toplam çalışma hedefin (isteğe bağlı)" placeholder="Örn. 4 saat" value={customization.daily_work_goal} onChange={(value) => updateCustomization('daily_work_goal', value)} />
          </div>
        </div>

        {/* 3. Önceliklerin & Detaylar Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-8">
          
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
              value={customization.priorities}
              onChange={(value) => updateCustomization('priorities', value)}
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
                value={customization.focus_helpers}
                onChange={(value) => updateCustomization('focus_helpers', value)}
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
                value={customization.challenges}
                onChange={(value) => updateCustomization('challenges', value)}
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
              value={customization.additional_notes}
              onChange={(value) => updateCustomization('additional_notes', value)}
              maxLength={300}
            />
          </div>

        </div>

        {/* Footer / Kaydet Alanı */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-3 bg-[#a9def9]/10 p-4 rounded-2xl border border-[#a9def9]/30 flex-1 w-full">
            <Lock size={20} className="text-[#a9def9] flex-shrink-0 mt-0.5 md:mt-0" />
            <p className="text-sm font-medium text-slate-600 leading-snug">
              <strong className="text-slate-800">Bu bilgiler sadece senin planını iyileştirmek için kullanılır.</strong><br/>
              Plan kaydınla birlikte saklanır; başka biriyle paylaşılmaz.
            </p>
          </div>
          
          <button 
            onClick={hasInput ? handlePlan : handleBack}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#f694c1] to-[#e4c1f9] hover:opacity-90 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {hasInput ? "Gününü Planla" : "Kaydet ve Dön"} <Sparkles size={16} fill="currentColor" />
          </button>
        </div>

      </div>
    </div>
  );
}
