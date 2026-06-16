'use client';

import { useState, useTransition } from 'react';
import { deleteIngredientAction, updateIngredientAction } from '@/actions/ingredient';
import { Ingredient } from '@/models/ingredient.model';

const editInputClass = `
  rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  px-2 py-1 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
`.trim();

type Props = {
  ingredients: Ingredient[];
  onDelete: (id: number) => void;
  onUpdated: () => void;
};

export function IngredientList({ ingredients, onDelete, onUpdated }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ingredients.length) {
    return <p className="text-zinc-400 dark:text-zinc-500 text-sm py-6">No hay ingredientes registrados.</p>;
  }

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteIngredientAction(id);
      onDelete(id);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
            <th className="py-2 pr-3 font-medium">SKU</th>
            <th className="py-2 pr-3 font-medium">Nombre</th>
            <th className="py-2 pr-3 font-medium">Costo/U</th>
            <th className="py-2 pr-3 font-medium">Costo/Lb</th>
            <th className="py-2 pr-3 font-medium">Stock U</th>
            <th className="py-2 pr-3 font-medium">Stock Lb</th>
            <th className="py-2 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) =>
            editingId === ing.id ? (
              <IngredientEditRow
                key={ing.id}
                ingredient={ing}
                editInputClass={editInputClass}
                onDone={() => { setEditingId(null); onUpdated(); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <tr key={ing.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-2.5 pr-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">{ing.SKU}</td>
                <td className="py-2.5 pr-3 font-medium text-zinc-900 dark:text-zinc-50">{ing.name}</td>
                <td className="py-2.5 pr-3 text-zinc-700 dark:text-zinc-300">{ing.costUnit != null ? `L ${ing.costUnit.toFixed(2)}` : '—'}</td>
                <td className="py-2.5 pr-3 text-zinc-700 dark:text-zinc-300">{ing.costPound != null ? `L ${ing.costPound.toFixed(2)}` : '—'}</td>
                <td className="py-2.5 pr-3 text-zinc-700 dark:text-zinc-300">{ing.qtyUnit != null ? ing.qtyUnit : '—'}</td>
                <td className="py-2.5 pr-3 text-zinc-700 dark:text-zinc-300">{ing.qtyPound != null ? Number(ing.qtyPound).toFixed(3) : '—'}</td>
                <td className="py-2.5 text-right space-x-3">
                  <button
                    onClick={() => setEditingId(ing.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(ing.id)}
                    disabled={pending}
                    className="text-red-500 dark:text-red-400 hover:underline disabled:opacity-40 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function IngredientEditRow({
  ingredient,
  editInputClass,
  onDone,
  onCancel,
}: {
  ingredient: Ingredient;
  editInputClass: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(ingredient.name);
  const [costUnit, setCostUnit] = useState(ingredient.costUnit?.toString() ?? '');
  const [costPound, setCostPound] = useState(ingredient.costPound?.toString() ?? '');
  const [qtyUnit, setQtyUnit] = useState(ingredient.qtyUnit?.toString() ?? '');
  const [qtyPound, setQtyPound] = useState(ingredient.qtyPound?.toString() ?? '');

  const handleSave = () => {
    startTransition(async () => {
      await updateIngredientAction(ingredient.id, {
        name: name || undefined,
        costUnit: costUnit || undefined,
        costPound: costPound || undefined,
        qtyUnit: qtyUnit ? parseInt(qtyUnit) : undefined,
        qtyPound: qtyPound || undefined,
      });
      onDone();
    });
  };

  return (
    <tr className="border-b bg-indigo-50 dark:bg-indigo-900/20">
      <td className="py-2 pr-3 font-mono text-xs text-zinc-400 dark:text-zinc-500">{ingredient.SKU}</td>
      <td className="py-2 pr-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${editInputClass} w-full`} />
      </td>
      <td className="py-2 pr-3">
        <input type="number" step="0.01" value={costUnit} onChange={(e) => setCostUnit(e.target.value)} className={`${editInputClass} w-20`} />
      </td>
      <td className="py-2 pr-3">
        <input type="number" step="0.01" value={costPound} onChange={(e) => setCostPound(e.target.value)} className={`${editInputClass} w-20`} />
      </td>
      <td className="py-2 pr-3">
        <input type="number" value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)} className={`${editInputClass} w-16`} />
      </td>
      <td className="py-2 pr-3">
        <input type="number" step="0.001" value={qtyPound} onChange={(e) => setQtyPound(e.target.value)} className={`${editInputClass} w-20`} />
      </td>
      <td className="py-2 text-right space-x-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm disabled:opacity-40
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={onCancel}
          className="text-zinc-500 dark:text-zinc-400 hover:underline text-sm
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          Cancelar
        </button>
      </td>
    </tr>
  );
}
