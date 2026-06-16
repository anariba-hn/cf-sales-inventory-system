'use client';

import { useState, useTransition } from 'react';
import { createIngredientAction } from '@/actions/ingredient';
import { Ingredient } from '@/models/ingredient.model';

const fieldClass = `
  w-full rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
  px-3 py-2 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
  disabled:cursor-not-allowed disabled:opacity-50
`.trim();

const labelClass = 'text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1';
const sectionClass = 'text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2';

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
  const [error, setError] = useState('');

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await createIngredientAction(formData);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      onCreate(result);
      setSKU(''); setName(''); setCostUnit(''); setQtyUnit('');
      setCostPound(''); setQtyPound(''); setOutDate('');
    });
  };

  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>SKU *</label>
            <input
              name="SKU"
              value={SKU}
              onChange={(e) => setSKU(e.target.value)}
              className={fieldClass}
              required
              disabled={pending}
            />
          </div>
          <div>
            <label className={labelClass}>Nombre *</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              required
              disabled={pending}
            />
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
          <p className={sectionClass}>Por unidad</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Costo / unidad</label>
              <input
                name="costUnit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={costUnit}
                onChange={(e) => setCostUnit(e.target.value)}
                className={fieldClass}
                disabled={pending}
              />
            </div>
            <div>
              <label className={labelClass}>Stock (unidades)</label>
              <input
                name="qtyUnit"
                type="number"
                placeholder="0"
                value={qtyUnit}
                onChange={(e) => setQtyUnit(e.target.value)}
                className={fieldClass}
                disabled={pending}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
          <p className={sectionClass}>Por peso / libras</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Costo / libra</label>
              <input
                name="costPound"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={costPound}
                onChange={(e) => setCostPound(e.target.value)}
                className={fieldClass}
                disabled={pending}
              />
            </div>
            <div>
              <label className={labelClass}>Stock (libras)</label>
              <input
                name="qtyPound"
                type="number"
                step="0.001"
                placeholder="0.000"
                value={qtyPound}
                onChange={(e) => setQtyPound(e.target.value)}
                className={fieldClass}
                disabled={pending}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
          <label className={labelClass}>Fecha de vencimiento (opcional)</label>
          <input
            name="outDate"
            type="date"
            value={outDate}
            onChange={(e) => setOutDate(e.target.value)}
            className={fieldClass}
            disabled={pending}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                     text-white font-medium py-2 rounded-lg text-sm transition-colors
                     disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {pending ? 'Creando...' : 'Crear ingrediente'}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
