import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Building, Zap, Sparkles, Shield, Megaphone, Package, FileText } from 'lucide-react';
import { ExpenseCategory } from '../types';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddExpense }) => {
  const { selectedPeriod, expenses, deleteExpense } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const periodExpenses = expenses.filter(e => e.periodMonth === selectedPeriod);

  const filteredExpenses = periodExpenses.filter(e => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  const totalPeriodExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);

  const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
    rent: <Building className="h-4 w-4 text-indigo-500" />,
    utilities: <Zap className="h-4 w-4 text-amber-500" />,
    materials: <Package className="h-4 w-4 text-emerald-500" />,
    cleaning: <Sparkles className="h-4 w-4 text-cyan-500" />,
    insurance: <Shield className="h-4 w-4 text-purple-500" />,
    marketing: <Megaphone className="h-4 w-4 text-rose-500" />,
    other: <FileText className="h-4 w-4 text-slate-500" />
  };

  const categoryNames: Record<ExpenseCategory, string> = {
    rent: 'Alquiler del local',
    utilities: 'Luz y suministros',
    materials: 'Material didáctico',
    cleaning: 'Limpieza',
    insurance: 'Seguro RC',
    marketing: 'Publicidad',
    other: 'Otros'
  };

  return (
    <div className="space-y-6">
      {/* Cabecera & Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Control de Costes Operativos ({selectedPeriod})
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Total Gastos: {totalPeriodExpenses.toFixed(2)} €
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gastos estructurales necesarios para el funcionamiento del centro
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nuevo Gasto</span>
        </button>
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-xl px-3 py-1.5 font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
              : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Todas las categorías ({periodExpenses.length})
        </button>
        {Object.entries(categoryNames).map(([key, name]) => {
          const count = periodExpenses.filter(e => e.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                selectedCategory === key
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {name} ({count})
            </button>
          );
        })}
      </div>

      {/* Tabla de Gastos */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Importe</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4">Nº Factura</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No hay gastos anotados en esta categoría para este período.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {e.title}
                      </div>
                      {e.notes && (
                        <div className="text-[10px] text-slate-400">
                          {e.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 font-medium">
                        {categoryIcons[e.category]}
                        <span>{categoryNames[e.category] || e.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {e.amount.toFixed(2)} €
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {e.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {e.invoiceNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar gasto "${e.title}"?`)) {
                            deleteExpense(e.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
