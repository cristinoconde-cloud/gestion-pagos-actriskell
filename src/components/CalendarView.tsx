import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, NewsNote, CalendarEventItem } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Sparkles,
  ChevronRight,
  Pin,
  Trash2,
  Newspaper,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface CalendarViewProps {
  onOpenAddSession?: () => void;
  onNavigateToActivities?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenAddSession,
  onNavigateToActivities
}) => {
  const {
    appConfigs,
    activities,
    teachers,
    sessions,
    newsNotes,
    addNewsNote,
    deleteNewsNote,
    currentRole
  } = useApp();

  // Verificar si el calendario está activo en app_config
  const calendarConfig = appConfigs.find(c => c.config_key === 'google_calendar');
  const isCalendarActive = calendarConfig ? calendarConfig.is_active : true;

  // Estado del día seleccionado (0 = ayer, 1 = hoy, 2..6 = próximos 5 días)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1); // Hoy por defecto

  // Estado para modal de nueva nota
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'aviso' | 'taller' | 'noticia' | 'general'>('aviso');
  const [notePinned, setNotePinned] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');

  // Generar la tira de 7 días: [Ayer, Hoy, +1, +2, +3, +4, +5]
  const sevenDays = useMemo(() => {
    const today = new Date();
    const days = [];

    const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Desde -1 (Ayer) hasta +5 días
    for (let offset = -1; offset <= 5; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);

      const dayOfWeekNum = d.getDay();
      const dayOfMonth = d.getDate();
      const monthNum = d.getMonth();
      const isoDate = d.toISOString().split('T')[0];

      let label = dayNamesShort[dayOfWeekNum];
      let sublabel = `${dayOfMonth} ${monthNamesShort[monthNum]}`;
      let tag = '';

      if (offset === -1) {
        tag = 'Ayer';
      } else if (offset === 0) {
        tag = 'HOY';
      }

      days.push({
        index: offset + 1, // 0..6
        offset,
        dateObj: d,
        isoDate,
        dayOfWeekNum,
        dayName: label,
        sublabel,
        tag,
        isToday: offset === 0
      });
    }

    return days;
  }, []);

  const selectedDay = sevenDays[selectedDayIndex] || sevenDays[1];

  // Mapear eventos / clases para el día seleccionado
  const eventsForSelectedDay = useMemo(() => {
    const dayOfWeek = selectedDay.dayOfWeekNum; // 0 = Domingo, 1 = Lunes, etc.
    const dayNamesSpanish = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const targetDayName = dayNamesSpanish[dayOfWeek];

    const result: CalendarEventItem[] = [];

    // 1. Actividades regulares que coincidan con el día de la semana
    activities.forEach(act => {
      if (!act.active) return;
      const teacher = teachers.find(t => t.id === act.teacherId);

      // Comprobar si el horario menciona este día
      const matchesSchedule = act.schedule.some(s => {
        const sLower = s.toLowerCase();
        if (targetDayName === 'miércoles') {
          return sLower.includes('miercoles') || sLower.includes('miércoles');
        }
        if (targetDayName === 'sábado') {
          return sLower.includes('sabado') || sLower.includes('sábado');
        }
        return sLower.includes(targetDayName);
      });

      if (matchesSchedule || activities.length <= 4) {
        // Extraer hora si es posible o asignar hora estándar
        let startTime = '18:00';
        let endTime = '19:30';

        const scheduleStr = act.schedule[0] || '';
        const timeMatch = scheduleStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (timeMatch) {
          startTime = timeMatch[1];
          endTime = timeMatch[2];
        }

        result.push({
          id: `act-${act.id}-${selectedDay.isoDate}`,
          title: act.name,
          startTime,
          endTime,
          date: selectedDay.isoDate,
          teacherName: teacher?.name || 'Monitor Triskell',
          room: act.room,
          activityName: act.name,
          category: act.category,
          billingMode: act.billingMode,
          price: act.billingMode === 'per_class' ? act.defaultPricePerClass : act.defaultPriceMonthly,
          description: act.description
        });
      }
    });

    // 2. Sesiones ya registradas para esta fecha exacta
    sessions
      .filter(s => s.date === selectedDay.isoDate)
      .forEach(sess => {
        const act = activities.find(a => a.id === sess.activityId);
        const teacher = teachers.find(t => t.id === sess.teacherId);
        if (!result.some(r => r.id === `sess-${sess.id}`)) {
          result.push({
            id: `sess-${sess.id}`,
            title: sess.topic || act?.name || 'Sesión de Clase',
            startTime: '19:00',
            endTime: '20:15',
            date: sess.date,
            teacherName: teacher?.name || 'Monitor',
            room: act?.room || 'Sala Principal',
            category: act?.category || 'Clase',
            description: `Sesión de ${sess.durationMinutes} min con ${sess.attendeesCount} alumnos asistentes.`
          });
        }
      });

    // Ordenar por hora de inicio
    return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [activities, teachers, sessions, selectedDay]);

  // Filtrado de noticias
  const filteredNotes = useMemo(() => {
    if (selectedCategoryFilter === 'todos') return newsNotes;
    return newsNotes.filter(n => n.category === selectedCategoryFilter);
  }, [newsNotes, selectedCategoryFilter]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    await addNewsNote({
      title: noteTitle.trim(),
      content: noteContent.trim(),
      date: new Date().toISOString().split('T')[0],
      category: noteCategory,
      author: currentRole === 'admin' ? 'Coordinación Triskell' : 'Equipo Docente',
      pinned: notePinned
    });

    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('aviso');
    setNotePinned(false);
    setIsAddNoteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SECCIÓN SUPERIOR: TIRA DE 7 DÍAS (AYER, HOY, +5 DÍAS FUTUROS)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Calendario de Actividades & Horarios</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona cualquier día de la tira para consultar las clases y talleres programados
            </p>
          </div>

          {!isCalendarActive && (
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4" />
              <span>Google Calendar Inactivo en app_config</span>
            </div>
          )}
        </div>

        {/* LA TIRA DE 7 DÍAS (1: Ayer, 2: Hoy, 3..7: +5 Días) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
          {sevenDays.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;

            return (
              <button
                key={day.isoDate}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl transition-all active:scale-95 text-center min-h-[74px] sm:min-h-[88px] ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                    : day.isToday
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-500/40 hover:bg-emerald-100/60'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {/* Etiqueta Superior (AYER, HOY) */}
                {day.tag && (
                  <span
                    className={`absolute -top-2 rounded-full px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${
                      isSelected
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : day.isToday
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {day.tag}
                  </span>
                )}

                {/* Día de la semana */}
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {day.dayName}
                </span>

                {/* Número del día */}
                <span className="text-base sm:text-2xl font-black mt-0.5 leading-none">
                  {day.dateObj.getDate()}
                </span>

                {/* Mes corto */}
                <span className={`text-[9px] sm:text-[10px] font-medium mt-1 truncate ${
                  isSelected ? 'text-emerald-100' : 'text-slate-400'
                }`}>
                  {day.sublabel.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECCIÓN CENTRAL: DAY VIEW (VISTA DIARIA PARA EL DÍA SELECCIONADO)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Horario & Clases para:
              </span>
              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-800 dark:text-emerald-300 capitalize">
                {selectedDay.dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {eventsForSelectedDay.length} actividades disponibles en este día
            </p>
          </div>

          {/* Botón rápido para coordinadores / monitores */}
          {onOpenAddSession && (currentRole === 'admin' || currentRole === 'teacher') && (
            <button
              type="button"
              onClick={onOpenAddSession}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition shrink-0 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Clase Impartida</span>
            </button>
          )}
        </div>

        {eventsForSelectedDay.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Info className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">
              No hay actividades programadas para este día
            </p>
            <p>Puedes seleccionar otro día de la barra superior de 7 días o consultar el catálogo general.</p>
            {onNavigateToActivities && (
              <button
                type="button"
                onClick={onNavigateToActivities}
                className="mt-3 inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                Ver Todas las Actividades
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {eventsForSelectedDay.map(event => (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  {/* Encabezado: Hora y Categoría */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-black shadow-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </span>

                    {event.category && (
                      <span className="rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 border border-indigo-500/20 uppercase tracking-wide">
                        {event.category}
                      </span>
                    )}
                  </div>

                  {/* Título de la actividad */}
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    {event.title}
                  </h4>

                  {event.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Pie: Monitor, Sala y Precio */}
                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="font-semibold">{event.teacherName}</span>
                    </div>
                    {event.room && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{event.room}</span>
                      </div>
                    )}
                  </div>

                  {event.price !== undefined && (
                    <span className="rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-black px-2 py-0.5 border border-emerald-500/20">
                      {event.price} € {event.billingMode === 'per_class' ? '/ clase' : '/ mes'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECCIÓN INFERIOR: ÚLTIMAS NOTAS (NEWS SECTION)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Newspaper className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Últimas notas & Comunicados de la Asociación
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informaciones de interés, cambios de horario, talleres especiales y avisos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Publicar Nota (Coordinador) */}
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={() => setIsAddNoteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>+ Publicar Nota</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtros de Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['todos', 'aviso', 'taller', 'noticia', 'general'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition capitalize shrink-0 ${
                selectedCategoryFilter === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'todos' ? 'Todas las notas' : cat}
            </button>
          ))}
        </div>

        {/* Lista de Notas */}
        {filteredNotes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No hay notas publicadas en esta categoría actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredNotes.map(note => {
              const categoryColors: Record<string, string> = {
                aviso: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
                taller: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
                noticia: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
                general: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
              };

              return (
                <div
                  key={note.id}
                  className={`rounded-2xl border p-4 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between gap-3 transition hover:shadow-xs ${
                    note.pinned
                      ? 'border-indigo-500/30 dark:border-indigo-500/40 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {note.pinned && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <Pin className="h-3 w-3" />
                            <span>Fijada</span>
                          </span>
                        )}
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                            categoryColors[note.category] || categoryColors.general
                          }`}
                        >
                          {note.category}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {note.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {note.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{note.author || 'Asociación Triskell'}</span>
                    {currentRole === 'admin' && (
                      <button
                        type="button"
                        onClick={() => deleteNewsNote(note.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Eliminar nota"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Publicar Nueva Nota */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Publicar Nueva Nota o Comunicado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Esta nota se mostrará en el tablón de 'Últimas notas' para todos los miembros.
            </p>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título de la Nota *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Confirmación del taller de meditación"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                  >
                    <option value="aviso">Aviso</option>
                    <option value="taller">Taller</option>
                    <option value="noticia">Noticia</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={notePinned}
                      onChange={e => setNotePinned(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 h-4 w-4"
                    />
                    <span className="font-semibold">Fijar al principio</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contenido del Comunicado *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe aquí el texto que verán los alumnos y monitores..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
                >
                  Publicar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
