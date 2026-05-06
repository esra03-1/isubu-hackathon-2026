import type { CompiledPlan } from './api/types';

export const mockData: CompiledPlan = {
  summary: {
    headline: 'Yoğun bir gün, akademik teslimler öncelikli.',
    estimated_saved_minutes: 45,
    dominant_pressure: 'mixed',
  },
  focus: {
    id: 'f1',
    title: 'Quiz için 2. konu çalışmasına başla',
    reason: 'Quiz Cuma günü. Erken başlamak stresi azaltır ve hatırlamayı güçlendirir.',
    duration: '45 dk',
    urgency: 'high',
  },
  timeline: [
    { id: 't1', time: '10:00', title: 'Toplantı hazırlığı', type: 'work', duration: '45 dk' },
    { id: 't2', time: '11:00', title: 'Quiz çalış', type: 'academic', duration: '45 dk' },
    { id: 't3', time: '14:00', title: "Ali'ye mail yanıtla", type: 'meeting', duration: '20 dk' },
    { id: 't4', time: '15:00', title: 'Proje dokümantasyonu', type: 'work', duration: '60 dk' },
    { id: 't5', time: '17:00', title: 'Günün kapanışı', type: 'errand', duration: '20 dk' },
  ],
  calendar_events: [],
  replies: [
    { id: 'r1', recipient: 'Ali', context: 'Gecikme', draft: "Ali'ye gecikeceğini bildir." },
    { id: 'r2', recipient: 'Melda Hoca', context: 'Dönüş', draft: 'Hocaya kısa dönüş hazırla.' },
    { id: 'r3', recipient: 'Ekip', context: 'Onay', draft: 'Toplantı katılımını onayla.' },
  ],
  insights: [
    { id: 'i1', type: 'risk', message: 'Quiz için çalışma süresi görünmüyor.', severity: 'high' },
    { id: 'i2', type: 'prep', message: 'Toplantı öncesi dosya eksik olabilir.', severity: 'medium' },
    { id: 'i3', type: 'prep', message: 'Öğleden sonra yoğunluk artıyor.', severity: 'medium' },
  ],
  debug: {
    model: 'llama-3.1-8b-instant',
    raw_model_output: '{\n  "summary": {...}\n}',
    fallback_used: false,
    warnings: ["'Context lingo işi' için süre belirtilmedi."],
  },
};

export const SAMPLE_INPUT =
  "çarşamba hackathon fikrini netleştirmem lazım. melda hocaya cevap anahtarını güncellemem gerekiyor. eksik sayfaları taramam lazım. saat 16:00'da toplantı var. Ali'ye biraz gecikeceğimi yazmam lazım. marketten süt al. yarın quiz var ama daha bakmadım. context lingo işini de unutma.";
