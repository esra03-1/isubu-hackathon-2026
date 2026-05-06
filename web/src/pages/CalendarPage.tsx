import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ArrowLeft } from 'lucide-react';

const mockEvents = [
  { id: '1', title: 'Architecture Review', start: new Date().toISOString().split('T')[0] + 'T09:30:00', end: new Date().toISOString().split('T')[0] + 'T11:00:00', backgroundColor: '#fed7aa', borderColor: '#fdba74', textColor: '#9a3412' },
  { id: '2', title: 'Team Standup', start: new Date().toISOString().split('T')[0] + 'T14:15:00', end: new Date().toISOString().split('T')[0] + 'T14:45:00', backgroundColor: '#fef08a', borderColor: '#fde047', textColor: '#854d0e' },
  { id: '3', title: 'Deployment Meeting', start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T19:15:00', backgroundColor: '#bfdbfe', borderColor: '#93c5fd', textColor: '#1e3a8a' },
  { id: '4', title: 'Code Review', start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0] + 'T14:45:00', backgroundColor: '#fbcfe8', borderColor: '#f9a8d4', textColor: '#831843' },
  { id: '5', title: 'Design Workshop', start: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] + 'T19:30:00', backgroundColor: '#fef08a', borderColor: '#fde047', textColor: '#854d0e' },
];

export default function CalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (viewParam === 'week') {
        api.changeView('timeGridWeek');
      } else {
        api.changeView('dayGridMonth');
      }
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} /> Geri Dön
        </button>
        <div className="flex items-center gap-2 font-black text-2xl text-slate-800 tracking-tight">
          <span className="text-3xl text-[#cdb4db] drop-shadow-sm">🐾</span> OneNext
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 overflow-hidden h-[80vh]">
        <style>{`
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: #f1f5f9;
          }
          .fc-col-header-cell {
            padding: 12px 0;
            background-color: #f8fafc;
            color: #64748b;
            font-weight: 600;
          }
          .fc-daygrid-day-number {
            color: #334155;
            font-weight: 500;
            padding: 8px !important;
            text-decoration: none !important;
          }
          .fc-event {
            border-radius: 6px;
            padding: 2px 4px;
            font-weight: 600;
            font-size: 0.75rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: transform 0.2s;
            cursor: pointer;
            border: 1px solid;
          }
          .fc-event:hover {
            transform: scale(1.02);
          }
          .fc-button-primary {
            background-color: white !important;
            color: #475569 !important;
            border: 1px solid #e2e8f0 !important;
            font-weight: 600 !important;
            text-transform: capitalize !important;
            border-radius: 8px !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
          .fc-button-primary:hover {
            background-color: #f8fafc !important;
          }
          .fc-button-active {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
          }
          .fc-toolbar-title {
            font-weight: 800 !important;
            color: #1e293b;
            font-size: 1.5rem !important;
          }
        `}</style>
        
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          buttonText={{
            today: 'Bugün',
            month: 'Aylık',
            week: 'Haftalık'
          }}
          events={mockEvents}
          height="100%"
          firstDay={1}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="23:00:00"
          expandRows={true}
        />
      </div>
    </div>
  );
}
