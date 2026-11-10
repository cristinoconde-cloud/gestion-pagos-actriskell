import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  ArrowRight
} from 'lucide-react';

export const AppReviewBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-emerald-900/10 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Auditoría & Análisis de tu App
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                Triskell · Control de Pagos
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Opinión técnica y de producto sobre tu app de Bolt
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {isOpen ? (
            <>
              <span>Ocultar análisis</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Ver opinión completa</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 space-y-5 border-t border-slate-200/60 dark:border-slate-800/80 pt-5 text-sm">
          {/* Veredicto general */}
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 p-4 border border-emerald-200/50 dark:border-emerald-800/40">
            <p className="font-semibold text-emerald-950 dark:text-emerald-200 mb-1">
              🌟 Veredicto General: La idea y el nicho son excelentes (8.5/10)
            </p>
            <p className="text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed text-xs sm:text-sm">
              La gestión de cobros en academias, asociaciones y estudios de yoga/danza suele ser caótica por culpa de pagos en mano, cuotas variables y honorarios por clase. Tu app original aborda un problema real muy demandado. No obstante, le faltaban mecanismos automáticos de cálculo, emisión de recibos y separación nítida entre lo que el profesor cobra en mano vs lo que el centro le transfiere.
            </p>
          </div>

          {/* Comparativa Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aciertos de tu app original */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Puntos Fuertes de tu App en Bolt</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Identidad clara:</strong> La marca Triskell con tonos verdes encaja perfecto con asociaciones, salud y bienestar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Doble modalidad:</strong> Contemplar cobro mensual y cobro por clase individual.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Concepto "Cobrado por el monitor":</strong> Vital para la realidad de academias donde el alumno le paga directamente al profesor en mano.</span>
                </li>
              </ul>
            </div>

            {/* Oportunidades y mejoras que hemos implementado */}
            <div className="rounded-xl border border-amber-500/20 dark:border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Áreas de Mejora Detectadas & Resueltas Aquí</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Cálculo salarial automático:</strong> Ahora soporta 3 esquemas: Tarifa por clase, Sueldo fijo mensual, o Porcentaje (% recaudación).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Modales 100% optimizados para móvil:</strong> Ventanas emergentes tipo bottom-sheet con cabecera y pie fijos, botones táctiles de 44px e inputs proporcionados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Pago en mano activo por defecto:</strong> Al registrar un pago se activa automáticamente el cobro en mano al profesor para cuadre inmediato.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Compensación en mano vs Liquidación:</strong> Deducción automática de lo que el profesor ya cobró físicamente para no duplicar pagos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Alertas directas de WhatsApp:</strong> Botón para abrir chat preformateado de recordatorio de cuota al alumno.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tabla de funciones añadidas */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">Característica</th>
                  <th className="px-3.5 py-2.5">En Bolt original</th>
                  <th className="px-3.5 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">En esta versión Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="px-3.5 py-2 font-medium text-slate-900 dark:text-white">Modelos salariales de profesores</td>
                  <td className="px-3.5 py-2 text-slate-400">Sólo valor fijo manual</td>
                  <td className="px-3.5 py-2 text-emerald-600 dark:text-emerald-400 font-semibold">3 modelos: Por clase, Fijo mensual, o % de recaudación</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-medium text-slate-900 dark:text-white">Experiencia en pantallas móviles</td>
                  <td className="px-3.5 py-2 text-slate-400">Modales rígidos y desbordados</td>
                  <td className="px-3.5 py-2 text-emerald-600 dark:text-emerald-400 font-semibold">Cabeceras y botones siempre a la vista, scroll interno táctil</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-medium text-slate-900 dark:text-white">Cuadre de pagos en mano</td>
                  <td className="px-3.5 py-2 text-slate-400">Informativo sin cuadre</td>
                  <td className="px-3.5 py-2 text-emerald-600 dark:text-emerald-400 font-semibold">Descuenta automáticamente lo cobrado en mano del saldo</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-medium text-slate-900 dark:text-white">Registro de Asistencias / Clases</td>
                  <td className="px-3.5 py-2 text-slate-400">Días teóricos fijos</td>
                  <td className="px-3.5 py-2 text-emerald-600 dark:text-emerald-400 font-semibold">Bitácora de clases reales con aforo para auditar liquidación</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-medium text-slate-900 dark:text-white">Exportación de datos</td>
                  <td className="px-3.5 py-2 text-slate-400">No visible</td>
                  <td className="px-3.5 py-2 text-emerald-600 dark:text-emerald-400 font-semibold">Descarga inmediata en CSV (Pagos, Alumnos, Gastos, Profesores)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
