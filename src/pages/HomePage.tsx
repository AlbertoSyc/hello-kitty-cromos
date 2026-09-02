import { LogOut } from 'lucide-react';
import type { Card } from '../types';
import { stats } from '../utils/stats';

export default function HomePage({ profile, cards, userCards, onLogout }: {
  profile: string; cards: Card[]; userCards: Record<string, number>; onLogout: () => void;
}) {
  const s = stats(cards, userCards);

  const repeatedByCategory = cards
    .filter(card => (userCards[card.id] ?? 0) > 1)
    .reduce<Record<string, Card[]>>((groups, card) => {
      const category = card.category?.trim() || 'Sin categoría';
      (groups[category] ??= []).push(card);
      return groups;
    }, {});

  const repeatedCategories = Object.entries(repeatedByCategory)
    .sort(([a], [b]) => a.localeCompare(b, 'es'));

  return <div className="space-y-5">
    <header className="flex items-center justify-between">
      <div><p className="text-sm font-bold text-gray-400">Tu colección</p><h1 className="text-3xl font-extrabold text-gray-800">Hola, {profile}</h1></div>
      <button onClick={onLogout} className="rounded-xl bg-white p-3 text-gray-500 shadow-sm ring-1 ring-gray-100" title="Cambiar Perfil"><LogOut size={20} /></button>
    </header>

    <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-pink-100">
      <div className="mb-5 flex items-end justify-between">
        <div><p className="text-sm font-bold text-gray-400">Colección</p><p className="text-3xl font-extrabold text-pink-600">{s.owned} <span className="text-lg text-gray-400">/ {s.total}</span></p></div>
        <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-extrabold text-pink-600">{s.progress}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-pink-500 transition-all duration-500" style={{ width: `${s.progress}%` }} /></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Conseguidos" value={s.owned} />
        <Stat label="Pendientes" value={s.pending} />
        <Stat label="Cromos repetidos" value={s.duplicateCards} />
        <Stat label="Unidades repetidas" value={s.extraUnits} />
      </div>
    </section>

    <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-pink-100">
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-400">Tu colección</p>
        <h2 className="text-2xl font-extrabold text-gray-800">Cromos repetidos</h2>
      </div>

      {repeatedCategories.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-5 text-center text-sm font-bold text-gray-400">
          Todavía no tienes cromos repetidos.
        </div>
      ) : (
        <div className="space-y-5">
          {repeatedCategories.map(([category, categoryCards]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-pink-600">{category}</h3>
              <div className="overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-100">
                {categoryCards
                  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
                  .map(card => (
                    <div key={card.id} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
                      <span className="min-w-12 rounded-lg bg-white px-2 py-1 text-center text-sm font-extrabold text-pink-600 shadow-sm ring-1 ring-gray-100">
                        {card.id}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{card.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>;
}

function Stat({label,value}:{label:string,value:number}) {
  return <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-bold text-gray-400">{label}</p><p className="mt-1 text-2xl font-extrabold text-gray-800">{value}</p></div>;
}
