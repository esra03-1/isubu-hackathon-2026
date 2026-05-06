import { useState } from 'react';
import { compileDay } from './api/client';

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCompile = async () => {
    setLoading(true);
    try {
      const result = await compileDay({ raw_input: input });
      console.log("Derlenen Plan:", result);
      alert("Derleme tamamlandı! Konsolu kontrol et.");
      // TODO: Navigate to result screen or show result state
    } catch (err) {
      console.error(err);
      alert("Derleme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-600">OneNext</h1>
          <p className="text-lg text-gray-600 font-medium">Dağınık gününü sıradaki adıma dönüştür.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <textarea
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none outline-none transition-all"
            placeholder="Bugün yapmam gerekenleri, mesajları, hatırlatmaları veya aklındaki karışıklığı buraya yapıştır..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <div className="flex gap-3 justify-end">
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setInput("çarşamba hackathon fikrini netleştirmem lazım. melda hocaya cevap anahtarını güncellemem gerekiyor. eksik sayfaları taramam lazım. saat 16:00'da toplantı var. Ali'ye biraz gecikeceğimi yazmam lazım. marketten süt al. yarın quiz var ama daha bakmadım. context lingo işini de unutma.")}
            >
              Örnek Girdi Yükle
            </button>
            <button 
              className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              onClick={handleCompile}
              disabled={loading || input.trim() === ""}
            >
              {loading ? "Derleniyor..." : "Günü Derle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
