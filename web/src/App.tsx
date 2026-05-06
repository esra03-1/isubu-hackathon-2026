import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InputPage from './pages/InputPage';
import LoadingPage from './pages/LoadingPage';
import ResultPage from './pages/ResultPage';
import CustomizePage from './pages/CustomizePage';
import CalendarPage from './pages/CalendarPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
