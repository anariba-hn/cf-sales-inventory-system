'use client';

import { useState, useEffect, useTransition } from 'react';
import { getRecipeByProductAction, addRecipeItemAction, removeRecipeItemAction } from '@/actions/recipe';
import { getIngredientsAction, createIngredientAction } from '@/actions/ingredient';
import { RecipeItemWithIngredient } from '@/models/recipe.model';
import { Ingredient } from '@/models/ingredient.model';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

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

  // Inline new ingredient fields
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
    const fd = new FormData();
    fd.set('SKU', newSKU);
    fd.set('name', newName);
    if (newCostUnit) fd.set('costUnit', newCostUnit);
    if (newQtyUnit) fd.set('qtyUnit', newQtyUnit);
    if (newCostPound) fd.set('costPound', newCostPound);
    if (newQtyPound) fd.set('qtyPound', newQtyPound);

    startTransition(async () => {
      const created = await createIngredientAction(fd);
      setIngredients((prev) => [...prev, created]);
      setSelectedIngredientId(created.id.toString());
      setShowNewIngredient(false);
      setNewSKU(''); setNewName(''); setNewCostUnit(''); setNewQtyUnit('');
      setNewCostPound(''); setNewQtyPound('');
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Ingredientes para <strong>{productName}</strong>
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-1.5 pr-3 font-medium">Ingrediente</th>
            <th className="py-1.5 pr-3 font-medium">Cantidad</th>
            <th className="py-1.5 font-medium">Unidad</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2 pr-3">{item.ingredientName}</td>
              <td className="py-2 pr-3">{item.qty}</td>
              <td className="py-2 text-gray-500">{item.unit === 'unit' ? 'Unidad' : 'Libra'}</td>
              <td className="py-2 text-right">
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={pending}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-5 text-center text-gray-400 text-sm">
                Sin ingredientes en la receta
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAddRow ? (
        <div className="space-y-3 border-t pt-3">
          <div className="flex gap-2">
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="border p-2 flex-1 text-sm"
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
              className="border p-2 w-20 text-sm"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'unit' | 'pound')}
              className="border p-2 text-sm"
            >
              <option value="unit">Unidad</option>
              <option value="pound">Libra</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              disabled={pending || !selectedIngredientId || !qty}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-40"
            >
              {pending ? 'Guardando...' : 'Agregar'}
            </button>
            <button
              onClick={() => { setShowAddRow(false); setShowNewIngredient(false); }}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancelar
            </button>
            <button
              onClick={() => setShowNewIngredient((v) => !v)}
              className="ml-auto flex items-center gap-1 text-sm text-blue-500 hover:underline"
            >
              {showNewIngredient ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              ¿No encuentras el ingrediente?
            </button>
          </div>

          {showNewIngredient && (
            <div className="border rounded p-3 space-y-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Crear nuevo ingrediente
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="SKU *"
                  value={newSKU}
                  onChange={(e) => setNewSKU(e.target.value)}
                  className="border p-1.5 text-sm"
                />
                <input
                  placeholder="Nombre *"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border p-1.5 text-sm"
                />
                <input
                  placeholder="Costo / unidad"
                  type="number"
                  step="0.01"
                  value={newCostUnit}
                  onChange={(e) => setNewCostUnit(e.target.value)}
                  className="border p-1.5 text-sm"
                />
                <input
                  placeholder="Stock (unidades)"
                  type="number"
                  value={newQtyUnit}
                  onChange={(e) => setNewQtyUnit(e.target.value)}
                  className="border p-1.5 text-sm"
                />
                <input
                  placeholder="Costo / libra"
                  type="number"
                  step="0.01"
                  value={newCostPound}
                  onChange={(e) => setNewCostPound(e.target.value)}
                  className="border p-1.5 text-sm"
                />
                <input
                  placeholder="Stock (libras)"
                  type="number"
                  step="0.001"
                  value={newQtyPound}
                  onChange={(e) => setNewQtyPound(e.target.value)}
                  className="border p-1.5 text-sm"
                />
              </div>
              <button
                onClick={handleCreateIngredient}
                disabled={pending || !newSKU || !newName}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-40"
              >
                {pending ? 'Creando...' : 'Crear y seleccionar'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowAddRow(true)}
          className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
        >
          <Plus size={14} />
          Agregar ingrediente
        </button>
      )}
    </div>
  );
}
