import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, AuthUser } from '../types';
import {
  X,
  Check,
  UserPlus,
  ShieldCheck,
  Search,
  Key,
  Copy,
  Trash2,
  Mail,
  UserCheck,
  Building,
  GraduationCap,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    profiles,
    createUserByCoordinator,
    updateUserRole,
    deleteUserAccess,
    teachers,
    students,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Formulario de Alta
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('Triskell2026!');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [createTeacherRecord, setCreateTeacherRecord] = useState(true);
  const [createStudentRecord, setCreateStudentRecord] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    pass: string;
    role: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFeedbackError('Indica el nombre y correo electrónico del usuario.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const res = await createUserByCoordinator({
        email: email.trim(),
        fullName: name.trim(),
        role,
        password: password.trim() || undefined,
        teacherId: (role === 'teacher' || role === 'teacher_student') ? selectedTeacherId || undefined : undefined,
        studentId: (role === 'student' || role === 'teacher_student') ? selectedStudentId || undefined : undefined,
        createTeacherProfile: (role === 'teacher' || role === 'teacher_student') && createTeacherRecord && !selectedTeacherId,
        createStudentProfile: (role === 'student' || role === 'teacher_student') && createStudentRecord && !selectedStudentId
      });

      if (!res.success) {
        setFeedbackError(res.error || 'No se pudo crear el usuario.');
      } else {
        const passUsed = res.tempPassword || password;
        setCreatedCredentials({
          email: email.trim(),
          pass: passUsed,
          role: role === 'admin' ? 'Coordinador' : role === 'teacher' ? 'Monitor' : role === 'student' ? 'Alumno' : 'Monitor-Alumno'
        });
        setFeedbackSuccess(`¡Usuario "${name}" dado de alta con éxito en auth.users y tabla profiles!`);
        setName('');
        setEmail('');
        setPassword(`Triskell${Math.floor(1000 + Math.random() * 9000)}!`);
        setIsAddingUser(false);
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'Error al registrar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Acceso a TRISKELL Asociación:\n- URL: ${window.location.origin}\n- Correo: ${createdCredentials.email}\n- Contraseña: ${createdCredentials.pass}\n- Rol: ${createdCredentials.role}\n(También puedes entrar directamente pulsando "Continuar con Google" con este mismo correo)`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.role.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Fija */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gestión de Accesos & Usuarios
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Autoregistro Libre Desactivado
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Solo el Coordinador puede autorizar correos y asignar roles para entrar a la plataforma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">

          {/* Banner de credenciales recién creadas para copiar */}
          {createdCredentials && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Credenciales de Acceso Generadas
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? '¡Copiado!' : 'Copiar para Enviar al Usuario'}</span>
                </button>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-800 p-2.5 font-mono text-[11px] border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 space-y-1">
                <div>Correo: <strong>{createdCredentials.email}</strong></div>
                <div>Contraseña: <strong>{createdCredentials.pass}</strong></div>
                <div>Rol: <strong>{createdCredentials.role}</strong></div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                El usuario ya puede iniciar sesión con este correo y contraseña, o directamente pulsando "Continuar con Cuenta de Google" si su cuenta de Google tiene el mismo correo.
              </p>
            </div>
          )}

          {feedbackSuccess && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 p-3 text-emerald-700 dark:text-emerald-300 font-semibold">
              {feedbackSuccess}
            </div>
          )}

          {feedbackError && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 p-3 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{feedbackError}</span>
            </div>
          )}

          {/* Botón "+ Dar de Alta Nuevo Acceso" vs Lista */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o rol..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAddingUser(!isAddingUser);
                setFeedbackError(null);
                setFeedbackSuccess(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 font-bold text-white hover:bg-emerald-700 transition shadow-xs shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isAddingUser ? 'Ver Listado' : '+ Dar de Alta Nuevo Usuario'}</span>
            </button>
          </div>

          {/* Formulario de Alta por el Coordinador */}
          {isAddingUser ? (
            <form onSubmit={handleCreateSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  Alta de Usuario con Registro en Auth & Profiles
                </h4>
                <span className="text-[10px] text-slate-400">Control de Coordinación</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Sánchez"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico Autorizado *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="roberto@asociacion.es"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rol en TRISKELL *
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="student">🎒 Alumno / Socio</option>
                    <option value="teacher">🎓 Monitor de Talleres</option>
                    <option value="teacher_student">⭐ Monitor-Alumno (Híbrido)</option>
                    <option value="admin">👑 Coordinador (Administrador Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contraseña Inicial (Email/Password)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setPassword(`Triskell${Math.floor(1000 + Math.random() * 9000)}!`)}
                      title="Generar nueva contraseña"
                      className="rounded-xl border border-slate-300 dark:border-slate-700 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      🎲
                    </button>
                  </div>
                </div>
              </div>

              {/* Vinculación opcional con Monitor o Alumno existente */}
              {(role === 'teacher' || role === 'teacher_student') && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block text-[11px]">
                    Ficha de Monitor
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <select
                      value={selectedTeacherId}
                      onChange={e => setSelectedTeacherId(e.target.value)}
                      className="w-full sm:w-auto flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Vincular a Monitor existente --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>

                    {!selectedTeacherId && (
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createTeacherRecord}
                          onChange={e => setCreateTeacherRecord(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span>Crear automáticamente su ficha de Monitor</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {(role === 'student' || role === 'teacher_student') && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 block text-[11px]">
                    Ficha de Alumno / Socio
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <select
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                      className="w-full sm:w-auto flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Vincular a Alumno existente --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.email || 'Sin email'})
                        </option>
                      ))}
                    </select>

                    {!selectedStudentId && (
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createStudentRecord}
                          onChange={e => setCreateStudentRecord(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span>Crear automáticamente su ficha de Alumno</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  <Check className="h-4 w-4" />
                  <span>{isSubmitting ? 'Guardando en Supabase...' : 'Confirmar Alta y Activar Acceso'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Lista de Usuarios Autorizados en Profiles */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                <span>{filteredProfiles.length} usuarios autorizados</span>
                <span>Rol en PostgreSQL</span>
              </div>

              {filteredProfiles.length === 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
                  No se encontraron usuarios que coincidan con la búsqueda.
                </div>
              ) : (
                filteredProfiles.map(p => {
                  const isCurrent = currentUser?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {p.photoURL ? (
                          <img
                            src={p.photoURL}
                            alt={p.name}
                            className="h-10 w-10 rounded-full object-cover border border-emerald-500"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm">
                            {p.name.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {p.name}
                            </span>
                            {isCurrent && (
                              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600">
                                Tu Usuario
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                            {p.email}
                          </span>
                        </div>
                      </div>

                      {/* Selector de Rol y Acciones */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <select
                          value={p.role}
                          onChange={e => updateUserRole(p.id, e.target.value as UserRole)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition ${
                            p.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : p.role === 'teacher'
                              ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                              : p.role === 'student'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                          }`}
                        >
                          <option value="student">🎒 Alumno</option>
                          <option value="teacher">🎓 Monitor</option>
                          <option value="teacher_student">⭐ Monitor-Alumno</option>
                          <option value="admin">👑 Coordinador</option>
                        </select>

                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Revocar el acceso del usuario ${p.name} (${p.email})?`)) {
                                deleteUserAccess(p.id);
                              }
                            }}
                            title="Revocar acceso"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Barra Inferior Fija */}
        <div className="sticky bottom-0 z-10 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <span className="text-[11px] text-slate-400">
            TRISKELL · Seguridad y Control de Usuarios
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
