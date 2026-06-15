'use client';

import { useState, useTransition } from 'react';
import { deleteIngredientAction, updateIngredientAction } from '@/actions/ingredient';
import { Ingredient } from '@/models/ingredient.model';

type Props = {
  ingredients: Ingredient[];
  onDelete: (id: number) => void;
  onUpdated: () => void;
};

export function IngredientList({ ingredients, onDelete, onUpdated }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ingredients.length) {
    return <p className="text-gray-400 text-sm py-6">No hay ingredientes registrados.</p>;
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
          <tr className="border-b text-left text-gray-500">
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
                onDone={() => { setEditingId(null); onUpdated(); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <tr key={ing.id} className="border-b hover:bg-gray-50">
                <td className="py-2.5 pr-3 font-mono text-xs text-gray-500">{ing.SKU}</td>
                <td className="py-2.5 pr-3 font-medium">{ing.name}</td>
                <td className="py-2.5 pr-3">{ing.costUnit != null ? `L ${ing.costUnit.toFixed(2)}` : '—'}</td>
                <td className="py-2.5 pr-3">{ing.costPound != null ? `L ${ing.costPound.toFixed(2)}` : '—'}</td>
                <td className="py-2.5 pr-3">{ing.qtyUnit != null ? ing.qtyUnit : '—'}</td>
                <td className="py-2.5 pr-3">{ing.qtyPound != null ? Number(ing.qtyPound).toFixed(3) : '—'}</td>
                <td className="py-2.5 text-right space-x-3">
                  <button onClick={() => setEditingId(ing.id)} className="text-blue-600 hover:underline">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(ing.id)}
                    disabled={pending}
                    className="text-red-500 hover:underline"
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
  onDone,
  onCancel,
}: {
  ingredient: Ingredient;
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
    <tr className="border-b bg-blue-50">
      <td className="py-2 pr-3 font-mono text-xs text-gray-400">{ingredient.SKU}</td>
      <td className="py-2 pr-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="border p-1 w-full text-sm" />
      </td>
      <td className="py-2 pr-3">
        <input type="number" step="0.01" value={costUnit} onChange={(e) => setCostUnit(e.target.value)} className="border p-1 w-20 text-sm" />
      </td>
      <td className="py-2 pr-3">
        <input type="number" step="0.01" value={costPound} onChange={(e) => setCostPound(e.target.value)} className="border p-1 w-20 text-sm" />
      </td>
      <td className="py-2 pr-3">
        <input type="number" value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)} className="border p-1 w-16 text-sm" />
      </td>
      <td className="py-2 pr-3">
        <input type="number" step="0.001" value={qtyPound} onChange={(e) => setQtyPound(e.target.value)} className="border p-1 w-20 text-sm" />
      </td>
      <td className="py-2 text-right space-x-2">
        <button onClick={handleSave} disabled={pending} className="text-green-600 hover:underline text-sm">
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="text-gray-500 hover:underline text-sm">Cancelar</button>
      </td>
    </tr>
  );
}
