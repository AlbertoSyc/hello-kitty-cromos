import { Camera } from 'lucide-react';
import type { Card } from '../types';
import QuantitySelector from './QuantitySelector';

export default function CardItem({
  card, quantity, saving, onChange, photoUrl, onPhoto
}: {
  card: Card;
  quantity: number;
  saving: boolean;
  onChange: (next: number) => void;
  photoUrl?: string | null;
  onPhoto: () => void;
}) {
  return <article className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-pink-100">
    <button type="button" onClick={onPhoto} className="relative block w-full bg-pink-50 p-3 text-left" aria-label={`Hacer foto del cromo ${card.id}`}>
      <img className="card-image mx-auto w-full object-contain" src={photoUrl || card.image} alt={photoUrl ? `Foto del cromo ${card.id}` : `Cromo ${card.id}`} />
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-pink-700 shadow-sm">Nº {card.id}</span>
      {quantity > 1 && <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">Repetido</span>}
      <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-pink-500 text-white shadow-lg">
        <Camera size={20} />
      </span>
      {photoUrl && <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-pink-700 shadow-sm">Mi foto</span>}
    </button>
    <div className="space-y-3 p-4 text-center">
      <div className="min-h-10 text-sm font-extrabold text-gray-700">{card.name}</div>
      <QuantitySelector quantity={quantity} saving={saving} onChange={onChange} />
      {saving && <div className="text-xs font-bold text-gray-400">Guardando...</div>}
    </div>
  </article>;
}
