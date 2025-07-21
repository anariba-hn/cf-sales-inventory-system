import { useState, useTransition } from 'react';
import { createProductType } from '@/actions/product';
import { ProductType } from '@/models/product.model';

type ProductTypeProps = {
  onCreate: (newType: ProductType) => void;
};

export function ProductTypeForm({ onCreate }: ProductTypeProps) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const newType = await createProductType(formData);
      if (newType) {
        onCreate(newType);
        setName('');
      }
    });
  };
  return (
    <form action={handleSubmit} className="space-y-4 mt-6">
      <input
        name="name"
        placeholder="Nombre del tipo de producto"
        className="border p-2 w-full"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={pending}
      />
      <button type="submit" className="bg-green-600 text-white p-2 rounded">
        {pending ? 'Creando...' : 'Crear tipo de producto'}
      </button>
    </form>
  );
}
