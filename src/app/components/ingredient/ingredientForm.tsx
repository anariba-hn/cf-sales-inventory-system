'use client';

import { useState, useTransition } from 'react';
import { createIngredientAction } from '@/actions/ingredient';
import { Ingredient } from '@/models/ingredient.model';

type Props = {
  onCreate: (ingredient: Ingredient) => void;
};

export function IngredientForm({ onCreate }: Props) {
  const [pending, startTransition] = useTransition();
  const [SKU, setSKU] = useState('');
  const [name, setName] = useState('');
  const [costUnit, setCostUnit] = useState('');
  const [qtyUnit, setQtyUnit] = useState('');
  const [costPound, setCostPound] = useState('');
  const [qtyPound, setQtyPound] = useState('');
  const [outDate, setOutDate] = useState('');

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createIngredientAction(formData);
      if (result) {
        onCreate(result);
        setSKU(''); setName(''); setCostUnit(''); setQtyUnit('');
        setCostPound(''); setQtyPound(''); setOutDate('');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">SKU *</label>
          <input
            name="SKU"
            value={SKU}
            onChange={(e) => setSKU(e.target.value)}
            className="border p-2 w-full text-sm"
            required
            disabled={pending}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Nombre *</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full text-sm"
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Por unidad</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Costo / unidad</label>
            <input
              name="costUnit"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={costUnit}
              onChange={(e) => setCostUnit(e.target.value)}
              className="border p-2 w-full text-sm"
              disabled={pending}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Stock (unidades)</label>
            <input
              name="qtyUnit"
              type="number"
              placeholder="0"
              value={qtyUnit}
              onChange={(e) => setQtyUnit(e.target.value)}
              className="border p-2 w-full text-sm"
              disabled={pending}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Por peso / libras</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Costo / libra</label>
            <input
              name="costPound"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={costPound}
              onChange={(e) => setCostPound(e.target.value)}
              className="border p-2 w-full text-sm"
              disabled={pending}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Stock (libras)</label>
            <input
              name="qtyPound"
              type="number"
              step="0.001"
              placeholder="0.000"
              value={qtyPound}
              onChange={(e) => setQtyPound(e.target.value)}
              className="border p-2 w-full text-sm"
              disabled={pending}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-3">
        <label className="text-xs text-gray-500 block mb-1">Fecha de vencimiento (opcional)</label>
        <input
          name="outDate"
          type="date"
          value={outDate}
          onChange={(e) => setOutDate(e.target.value)}
          className="border p-2 w-full text-sm"
          disabled={pending}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded w-full text-sm"
        disabled={pending}
      >
        {pending ? 'Creando...' : 'Crear ingrediente'}
      </button>
    </form>
  );
}
