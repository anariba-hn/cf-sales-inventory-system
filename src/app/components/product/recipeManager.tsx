'use client';

import { useState, useEffect, useTransition } from 'react';
import { getRecipeByProductAction, addRecipeItemAction, removeRecipeItemAction } from '@/actions/recipe';
import { getIngredientsAction, createIngredientAction } from '@/actions/ingredient';
import { RecipeItemWithIngredient } from '@/models/recipe.model';
import { Ingredient } from '@/models/ingredient.model';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const fieldClass = `
  rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
  px-2 py-1.5 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
`.trim();

type Props = {
  productId: number;
  productName: string;
};

export function RecipeManager({ productId, productName }: Props) {
  const [items, setItems] = useState<RecipeItemWithIngredient[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showAddRow, setShowAddRow] = useState(false);
  const [showNewIngredient, setShowNewIngredient] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<'unit' | 'pound'>('unit');
  const [pending, startTransition] = useTransition();
  const [createError, setCreateError] = useState('');

  const [newSKU, setNewSKU] = useState('');
  const [newName, setNewName] = useState('');
  const [newCostUnit, setNewCostUnit] = useState('');
  const [newQtyUnit, setNewQtyUnit] = useState('');
  const [newCostPound, setNewCostPound] = useState('');
  const [newQtyPound, setNewQtyPound] = useState('');

  const refresh = async () => {
    const [recipeData, ingredientData] = await Promise.all([
      getRecipeByProductAction(productId),
      getIngredientsAction(),
    ]);
    setItems(recipeData);
    setIngredients(ingredientData);
  };

  // refresh is stable (defined outside the effect) — intentionally omitted from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, [productId]);

  const handleAdd = () => {
    if (!selectedIngredientId || !qty) return;
    startTransition(async () => {
      await addRecipeItemAction({ productId, ingredientId: Number(selectedIngredientId), qty, unit });
      setShowAddRow(false);
      setSelectedIngredientId('');
      setQty('');
      await refresh();
    });
  };

  const handleRemove = (id: number) => {
    startTransition(async () => {
      await removeRecipeItemAction(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  };

  const handleCreateIngredient = () => {
    if (!newSKU || !newName) return;
    setCreateError('');
    const fd = new FormData();
    fd.set('SKU', newSKU);
    fd.set('name', newName);
    if (newCostUnit) fd.set('costUnit', newCostUnit);
    if (newQtyUnit) fd.set('qtyUnit', newQtyUnit);
    if (newCostPound) fd.set('costPound', newCostPound);
    if (newQtyPound) fd.set('qtyPound', newQtyPound);

    startTransition(async () => {
      const result = await createIngredientAction(fd);
      if ('error' in result) {
        setCreateError(result.error);
        return;
      }
      setIngredients((prev) => [...prev, result]);
      setSelectedIngredientId(result.id.toString());
      setShowNewIngredient(false);
      setNewSKU(''); setNewName(''); setNewCostUnit(''); setNewQtyUnit('');
      setNewCostPound(''); setNewQtyPound('');
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Ingredientes para <strong className="text-zinc-900 dark:text-zinc-50">{productName}</strong>
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
            <th className="py-1.5 pr-3 font-medium">Ingrediente</th>
            <th className="py-1.5 pr-3 font-medium">Cantidad</th>
            <th className="py-1.5 font-medium">Unidad</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2 pr-3 text-zinc-900 dark:text-zinc-50">{item.ingredientName}</td>
              <td className="py-2 pr-3 text-zinc-700 dark:text-zinc-300">{item.qty}</td>
              <td className="py-2 text-zinc-500 dark:text-zinc-400">{item.unit === 'unit' ? 'Unidad' : 'Libra'}</td>
              <td className="py-2 text-right">
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={pending}
                  aria-label={`Eliminar ${item.ingredientName} de la receta`}
                  className="size-8 flex items-center justify-center ml-auto rounded-md
                             text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition-colors
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-5 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                Sin ingredientes en la receta
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAddRow ? (
        <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-700 pt-3">
          <div className="flex gap-2">
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className={`${fieldClass} flex-1`}
            >
              <option value="">Seleccionar ingrediente</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.SKU})
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.001"
              placeholder="Qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={`${fieldClass} w-20`}
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'unit' | 'pound')}
              className={fieldClass}
            >
              <option value="unit">Unidad</option>
              <option value="pound">Libra</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              disabled={pending || !selectedIngredientId || !qty}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                         text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {pending ? 'Guardando...' : 'Agregar'}
            </button>
            <button
              onClick={() => { setShowAddRow(false); setShowNewIngredient(false); }}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={() => setShowNewIngredient((v) => !v)}
              className="ml-auto flex items-center gap-1 text-sm text-indigo-500 dark:text-indigo-400 hover:underline
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              {showNewIngredient ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              ¿No encuentras el ingrediente?
            </button>
          </div>

          {showNewIngredient && (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 space-y-3 bg-zinc-50 dark:bg-zinc-800">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Crear nuevo ingrediente
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="SKU *"
                  value={newSKU}
                  onChange={(e) => setNewSKU(e.target.value)}
                  className={`${fieldClass} w-full`}
                />
                <input
                  placeholder="Nombre *"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`${fieldClass} w-full`}
                />
                <input
                  placeholder="Costo / unidad"
                  type="number"
                  step="0.01"
                  value={newCostUnit}
                  onChange={(e) => setNewCostUnit(e.target.value)}
                  className={`${fieldClass} w-full`}
                />
                <input
                  placeholder="Stock (unidades)"
                  type="number"
                  value={newQtyUnit}
                  onChange={(e) => setNewQtyUnit(e.target.value)}
                  className={`${fieldClass} w-full`}
                />
                <input
                  placeholder="Costo / libra"
                  type="number"
                  step="0.01"
                  value={newCostPound}
                  onChange={(e) => setNewCostPound(e.target.value)}
                  className={`${fieldClass} w-full`}
                />
                <input
                  placeholder="Stock (libras)"
                  type="number"
                  step="0.001"
                  value={newQtyPound}
                  onChange={(e) => setNewQtyPound(e.target.value)}
                  className={`${fieldClass} w-full`}
                />
              </div>
              {createError && (
                <p role="alert" className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1.5">
                  {createError}
                </p>
              )}
              <button
                onClick={handleCreateIngredient}
                disabled={pending || !newSKU || !newName}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600
                           text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {pending ? 'Creando...' : 'Crear y seleccionar'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowAddRow(true)}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm hover:underline
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          <Plus size={14} />
          Agregar ingrediente
        </button>
      )}
    </div>
  );
}
