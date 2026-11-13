import React from 'react';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (path: string) => void;
  onSignIn: () => void;
}

const LegalLayout: React.FC<{
  title: string;
  subtitle: string;
  updatedAt: string;
  icon: React.ReactNode;
  onNavigate: (path: string) => void;
  onSignIn: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, updatedAt, icon, onNavigate, onSignIn, children }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar (3-zone contract) */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-2.5 text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 overflow-hidden p-1 shrink-0">
              <img
                src="/logo.png"
                alt="App Actriskell"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </span>
            <span>App Actriskell</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Inicio
            </a>
            <a
              href="/privacidad"
              onClick={(e) => handleLinkClick(e, '/privacidad')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Política de Privacidad
            </a>
            <a
              href="/condiciones"
              onClick={(e) => handleLinkClick(e, '/condiciones')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Condiciones del Servicio
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mb-6">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline underline-offset-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la página principal</span>
          </a>
        </div>

        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 mb-3">
              {icon}
              <span className="text-xs font-semibold">Documentación Legal · App Actriskell</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Última actualización: {updatedAt}
            </p>
          </div>

          <div className="space-y-7 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">App Actriskell</span>
            <span aria-hidden="true">·</span>
            <span>A.C. Triskell</span>
            <span aria-hidden="true">·</span>
            <span>cristino.conde@actriskell.org</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4 transition-colors"
            >
              Inicio
            </a>
            <a
              href="/privacidad"
              onClick={(e) => handleLinkClick(e, '/privacidad')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4 transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="/condiciones"
              onClick={(e) => handleLinkClick(e, '/condiciones')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4 transition-colors"
            >
              Condiciones del Servicio
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ onNavigate, onSignIn }) => {
  return (
    <LegalLayout
      title="Política de Privacidad"
      subtitle="Información detallada sobre el tratamiento de datos personales y el uso de Google OAuth en App Actriskell."
      updatedAt="13 de noviembre de 2026"
      icon={<ShieldCheck className="h-5 w-5" />}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
    >
      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          1. Responsable del tratamiento
        </h2>
        <p>
          La plataforma <strong>App Actriskell</strong> es gestionada por la <strong>Asociación Cultural y Deportiva Triskell (A.C. Triskell)</strong>. Para cualquier consulta relacionada con la privacidad o el tratamiento de tus datos personales puedes contactar con el responsable administrativo a través del correo electrónico:{' '}
          <a href="mailto:cristino.conde@actriskell.org" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 font-medium">
            cristino.conde@actriskell.org
          </a>.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          2. Datos personales que recopilamos mediante Google OAuth
        </h2>
        <p>
          Para acceder a App Actriskell mediante el inicio de sesión con Google (Google OAuth 2.0), solicitamos exclusivamente los permisos básicos de identidad necesarios para verificar tu cuenta:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Nombre y apellidos:</strong> utilizados para mostrarte dentro de tu perfil interno de socio, alumno o monitor.</li>
          <li><strong>Dirección de correo electrónico:</strong> utilizada como identificador único para comprobar que has sido autorizado previamente por la administración de la asociación y asignarte tu rol correspondiente (Administrador, Monitor o Alumno).</li>
          <li><strong>Imagen de perfil (opcional):</strong> si tu cuenta de Google proporciona una imagen de avatar pública, puede mostrarse en tu ficha interna de usuario o monitor.</li>
        </ul>
        <p>
          No solicitamos acceso a tu Google Drive, Gmail, Google Calendar, contactos ni a ningún otro dato privado de tu cuenta de Google.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          3. Finalidad exclusiva del tratamiento de datos
        </h2>
        <p>
          Tu nombre y correo electrónico obtenidos a través de Google OAuth se utilizan <strong>única y exclusivamente</strong> para:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Autenticación interna en la plataforma:</strong> validar tu identidad y permitir el acceso seguro a tu portal privado dentro de App Actriskell.</li>
          <li><strong>Gestión de miembros y actividades de la asociación:</strong> vincular tu cuenta con tus inscripciones a talleres, horarios de clases, registro de asistencias, recibos de cuotas y liquidaciones como monitor, en caso de corresponder.</li>
          <li><strong>Comunicaciones internas operativas:</strong> mostrar avisos y notas internas de la asociación dentro de la aplicación.</li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          4. Compromiso de no cesión a terceros
        </h2>
        <p>
          App Actriskell <strong>no vende, alquila, cede ni comparte tus datos personales ni la información obtenida mediante Google OAuth con terceros</strong>, empresas externas, redes publicitarias o intermediarios de datos. Tus datos tampoco se utilizan con fines comerciales, de perfilado ni de publicidad personalizada.
        </p>
        <p>
          El almacenamiento técnico de la aplicación opera sobre infraestructura segura en la nube (Supabase / PostgreSQL) bajo estricto control de acceso por filas (Row Level Security), de modo que cada usuario únicamente accede a la información permitida según su rol autorizado dentro de A.C. Triskell.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          5. Seguridad, caché local y biometría opcional
        </h2>
        <p>
          Todas las comunicaciones entre tu navegador y nuestros servidores viajan cifradas mediante protocolo HTTPS/TLS. De forma opcional, el usuario puede activar el desbloqueo biométrico del propio dispositivo (WebAuthn / Passkeys) para evitar reintroducir credenciales; los datos biométricos nunca abandonan tu dispositivo ni se envían a nuestros servidores.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          6. Conservación y derechos del usuario
        </h2>
        <p>
          Conservaremos tus datos únicamente mientras mantengas tu relación como socio, alumno, monitor o administrador de la asociación. En cualquier momento puedes ejercer tus derechos de acceso, rectificación, supresión, limitación u oposición, así como revocar el acceso vinculado a tu cuenta de Google desde la configuración de seguridad de Google o escribiendo a{' '}
          <a href="mailto:cristino.conde@actriskell.org" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 font-medium">
            cristino.conde@actriskell.org
          </a>.
        </p>
      </section>
    </LegalLayout>
  );
};

export const TermsOfServicePage: React.FC<LegalPageProps> = ({ onNavigate, onSignIn }) => {
  return (
    <LegalLayout
      title="Condiciones del Servicio"
      subtitle="Normas de acceso y uso responsable de la plataforma de gestión de la asociación App Actriskell."
      updatedAt="13 de noviembre de 2026"
      icon={<FileText className="h-5 w-5" />}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
    >
      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          1. Objeto y ámbito de aplicación
        </h2>
        <p>
          Las presentes Condiciones del Servicio regulan el acceso y uso de la aplicación web <strong>App Actriskell</strong>, desarrollada para la gestión administrativa, docente y de socios de la <strong>Asociación Cultural y Deportiva Triskell (A.C. Triskell)</strong>. El acceso o utilización de la plataforma implica la aceptación de estas condiciones.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          2. Acceso autorizado y cuentas de usuario
        </h2>
        <p>
          App Actriskell es una herramienta privada de gestión interna. No existe autoregistro libre para el público general: únicamente pueden iniciar sesión las personas cuyo correo electrónico haya sido previamente autorizado por la Administración de la asociación (ya sea mediante acceso con Google OAuth o mediante credenciales asignadas).
        </p>
        <p>
          Cada usuario es responsable de mantener la confidencialidad de su sesión y de utilizar la aplicación exclusivamente conforme al rol que tenga asignado (Administrador, Monitor o Alumno/Socio).
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          3. Uso permitido de la plataforma
        </h2>
        <p>El usuario se compromete a hacer un uso diligente y lícito de la plataforma, absteniéndose de:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Intentar acceder a datos, talleres o registros económicos correspondientes a otros socios o monitores sin autorización.</li>
          <li>Alterar, suprimir o manipular registros de asistencia, pagos o configuraciones globales sin disponer de permisos de administración o monitoría sobre dichos registros.</li>
          <li>Introducir código malicioso, realizar pruebas de sobrecarga no autorizadas o interferir con el normal funcionamiento del servicio.</li>
        </ul>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          4. Registro de cuotas, asistencias y avisos
        </h2>
        <p>
          La información sobre horarios, cuotas de actividades, asistencias registradas, datos de Bizum de monitores y recibos mostrados en la aplicación tiene carácter informativo y de control administrativo interno para la asociación. En caso de discrepancia en un recibo o liquidación, prevalecerán los comprobantes bancarios o acuerdos formalizados con la Administración de A.C. Triskell.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          5. Privacidad y protección de datos
        </h2>
        <p>
          El tratamiento de los datos de autenticación recopilados mediante Google OAuth (nombre y correo electrónico) y del resto de información de miembro se rige íntegramente por nuestra{' '}
          <a
            href="/privacidad"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/privacidad');
            }}
            className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 font-medium"
          >
            Política de Privacidad
          </a>.
        </p>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          6. Disponibilidad, modificaciones y contacto
        </h2>
        <p>
          A.C. Triskell podrá actualizar funcionalidades o modificar estas Condiciones del Servicio cuando sea necesario para mejorar la plataforma o cumplir requisitos técnicos y legales. Ante cualquier incidencia técnica o consulta sobre estas condiciones, contacta con{' '}
          <a href="mailto:cristino.conde@actriskell.org" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2 font-medium">
            cristino.conde@actriskell.org
          </a>.
        </p>
      </section>
    </LegalLayout>
  );
};
