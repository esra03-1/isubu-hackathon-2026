import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { X, Plus, Trash2 } from 'lucide-react';

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

  const [events, setEvents] = useState(mockEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    setSelectedDate(arg.event.startStr.split('T')[0]);
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedDate) return;
    const newEvent = {
      id: Date.now().toString(),
      title: newTaskTitle,
      start: `${selectedDate}T09:00:00`,
      backgroundColor: '#bfdbfe',
      borderColor: '#93c5fd',
      textColor: '#1e3a8a'
    };
    setEvents([...events, newEvent]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const selectedEvents = events.filter(e => e.start.startsWith(selectedDate || ''));

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
    <div className="min-h-screen bg-white flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col h-screen overflow-y-auto hidden md:flex shrink-0">
        {/* Create button */}
        <button 
          onClick={() => navigate('/input')}
          className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-full px-4 py-3 w-max hover:bg-slate-50 transition-all font-semibold text-slate-700 mb-6"
        >
          <Plus size={20} className="text-[#cdb4db]" />
          <span>Oluştur</span>
        </button>

        {/* Mini Calendar placeholder */}
        <div className="mb-6">
          <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center h-48">
            Mini Takvim
          </div>
        </div>

        {/* Search */}
        <input 
          type="text" 
          placeholder="Kişileri ara"
          className="w-full bg-slate-100 rounded-lg px-3 py-2 text-sm mb-6 outline-none focus:ring-2 focus:ring-[#cdb4db]/50"
        />

        {/* Calendars List */}
        <div>
          <h3 className="font-semibold text-sm text-slate-800 mb-3">Takvimlerim</h3>
          <div className="space-y-2">
            {[
              { id: '1', name: 'OneNext', color: '#cdb4db', checked: true },
              { id: '2', name: 'Kişisel', color: '#ffafcc', checked: true },
              { id: '3', name: 'İş', color: '#bde0fe', checked: false },
            ].map(cal => (
              <label key={cal.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked={cal.checked}
                  className="w-4 h-4 rounded border-slate-300 focus:ring-[#cdb4db]"
                  style={{ accentColor: cal.color }}
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{cal.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-black text-2xl text-slate-800 tracking-tight">
              <span className="text-3xl text-[#cdb4db] drop-shadow-sm">🐾</span> OneNext
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#cdb4db] text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer hover:bg-[#b895c8] transition-colors">
              ON
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="flex-1 p-4 bg-white overflow-hidden relative">
          <style>{`
            .fc-theme-standard td, .fc-theme-standard th {
              border-color: #e2e8f0 !important;
            }
            .fc-scrollgrid {
              border-top: none !important;
              border-left: none !important;
              border-right: none !important;
            }
            .fc-col-header-cell {
              padding: 8px 0;
              background-color: white;
              color: #64748b;
              font-weight: 500;
              font-size: 0.875rem;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0 !important;
              border-right: none !important;
              border-left: none !important;
              border-top: none !important;
            }
            .fc-daygrid-day-number {
              color: #334155;
              font-weight: 500;
              padding: 8px !important;
              text-decoration: none !important;
            }
            .fc-timegrid-slot {
              height: 48px !important;
            }
            .fc-event {
              border-radius: 4px;
              padding: 2px 4px;
              font-weight: 500;
              font-size: 0.75rem;
              border: none !important;
              box-shadow: none;
            }
            .fc-v-event {
              border: none !important;
              border-left: 3px solid rgba(0,0,0,0.2) !important;
            }
            .fc-toolbar-title {
              font-weight: 400 !important;
              color: #1e293b;
              font-size: 1.25rem !important;
            }
            .fc-button-primary {
              background-color: white !important;
              color: #475569 !important;
              border: 1px solid #e2e8f0 !important;
              font-weight: 500 !important;
              border-radius: 4px !important;
              text-transform: capitalize !important;
              box-shadow: none !important;
              padding: 6px 12px !important;
            }
            .fc-button-primary:hover {
              background-color: #f8fafc !important;
            }
            .fc-button-active {
              background-color: #e2e8f0 !important;
              color: #0f172a !important;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.06) !important;
            }
            .fc-today-button {
              margin-right: 16px !important;
            }
            .fc-header-toolbar {
              margin-bottom: 1rem !important;
            }
          `}</style>
          
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'today prev,next title',
              center: '',
              right: 'dayGridMonth,timeGridWeek'
            }}
            buttonText={{
              today: 'Bugün',
              month: 'Aylık',
              week: 'Haftalık'
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="100%"
            firstDay={1}
            allDaySlot={false}
            slotMinTime="07:00:00"
            slotMaxTime="23:00:00"
            expandRows={true}
            nowIndicator={true}
          />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} Yapılacaklar
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 max-h-[50vh] overflow-y-auto space-y-2">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Bu gün için planlanmış görev yok.</p>
              ) : (
                selectedEvents.map(event => (
                  <div key={event.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white shadow-sm group">
                    <span className="text-sm font-medium text-slate-700">{event.title}</span>
                    <button onClick={() => handleDeleteTask(event.id)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Yeni görev ekle..."
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#cdb4db] focus:ring-2 focus:ring-[#cdb4db]/20 transition-all"
                />
                <button 
                  onClick={handleAddTask}
                  className="bg-[#cdb4db] hover:bg-[#b895c8] text-white p-2 rounded-xl transition-colors shadow-sm"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
