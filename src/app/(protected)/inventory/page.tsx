'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/modal';
import { IngredientForm } from '@/app/components/ingredient/ingredientForm';
import { IngredientList } from '@/app/components/ingredient/ingredientList';
import { getIngredientsAction } from '@/actions/ingredient';
import { Ingredient } from '@/models/ingredient.model';

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const data = await getIngredientsAction();
    setIngredients(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          + Nuevo ingrediente
        </button>
      </div>

      <IngredientList
        ingredients={ingredients}
        onDelete={(id) => setIngredients((prev) => prev.filter((i) => i.id !== id))}
        onUpdated={load}
      />

      {showModal && (
        <Modal title="Nuevo ingrediente" onClose={() => setShowModal(false)}>
          <IngredientForm
            onCreate={(ing) => {
              setIngredients((prev) => [...prev, ing]);
              setShowModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
