import React, { useEffect, useRef } from 'react';
import { Party } from '../data/parliamentData';

interface CoalitionMakerProps {
  parties: Party[];
  partyTotals: Record<string, number>;
  selectedParties: Set<string>;
  onToggleParty: (partyId: string) => void;
  onClearParties: () => void;
  targetSeats: number;
  totalChamberSeats: number;
  majorityName: string;
}

export const CoalitionMaker: React.FC<CoalitionMakerProps> = ({
  parties,
  partyTotals,
  selectedParties,
  onToggleParty,
  onClearParties,
  targetSeats,
  totalChamberSeats,
  majorityName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevWinRef = useRef<boolean>(false);

  // Calculate total selected coalition seats
  const coalitionSeats = parties.reduce((sum, p) => {
    if (selectedParties.has(p.id)) {
      return sum + (partyTotals[p.id] || 0);
    }
    return sum;
  }, 0);

  const isWin = coalitionSeats >= targetSeats;

  // Confetti burst on reaching majority
  useEffect(() => {
    if (isWin && !prevWinRef.current) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        prevWinRef.current = true;
        return;
      }

      const box = containerRef.current;
      if (!box) return;

      const activeColors = parties
        .filter((p) => selectedParties.has(p.id))
        .map((p) => p.color);
      const cols = activeColors.length ? activeColors : ['#2e8b4f'];

      for (let k = 0; k < 36; k++) {
        const el = document.createElement('span');
        el.className = 'absolute top-[-12px] w-2 h-3 rounded-sm pointer-events-none animate-fall';
        const xOffset = (Math.random() - 0.5) * 160;
        const rotate = Math.random() * 720;
        const delay = Math.random() * 0.25;

        el.style.left = `${Math.random() * 100}%`;
        el.style.backgroundColor = cols[k % cols.length];
        el.style.setProperty('--x', `${xOffset}px`);
        el.style.setProperty('--r', `${rotate}deg`);
        el.style.animationDelay = `${delay}s`;

        box.appendChild(el);
        setTimeout(() => el.remove(), 1900);
      }
    }
    prevWinRef.current = isWin;
  }, [isWin, parties, selectedParties]);

  // Status badge text
  let statusText = 'Elige partidos';
  if (coalitionSeats > 0) {
    if (isWin) {
      const diff = coalitionSeats - targetSeats;
      statusText = diff === 0 ? `${majorityName} · justo` : `${majorityName} · +${diff}`;
    } else {
      statusText = `Faltan ${targetSeats - coalitionSeats}`;
    }
  }

  const majorityPercentage = (targetSeats / totalChamberSeats) * 100;

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden p-5 rounded-[20px] border border-[#e9e7e0] transition-all duration-300 shadow-[0_1px_2px_rgba(20,20,20,0.04),0_12px_32px_-12px_rgba(20,20,20,0.08)] ${
        isWin
          ? 'border-[#2e8b4f] bg-gradient-to-b from-[#eef9f1] to-white'
          : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-start gap-3 mb-3.5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#17171a] m-0">Coalition maker</h2>
          <p className="text-xs text-[#77756d] m-0 leading-normal">
            Marca los partidos que quieres juntar y comprueba si suman {majorityName.toLowerCase()} ({targetSeats}).
          </p>
        </div>
        <button
          type="button"
          onClick={onClearParties}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#e9e7e0] bg-white text-[#17171a] hover:bg-[#fafaf8] hover:border-[#a19e93] active:scale-95 transition-all cursor-pointer"
        >
          Limpiar
        </button>
      </div>

      {/* Party Chips */}
      <div className="flex flex-wrap gap-2 min-h-[38px] mb-4">
        {parties.map((p) => {
          const count = partyTotals[p.id] || 0;
          if (count === 0) return null;
          const isSelected = selectedParties.has(p.id);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onToggleParty(p.id)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'bg-opacity-15 shadow-xs'
                  : 'bg-[#fafaf8] border-[#e9e7e0] text-[#17171a] hover:border-[#a19e93]'
              }`}
              style={{
                borderColor: isSelected ? p.color : undefined,
                backgroundColor: isSelected ? `${p.color}1c` : undefined,
                color: isSelected ? '#17171a' : undefined
              }}
              title={p.fullName || p.name}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-inner"
                style={{ backgroundColor: p.color }}
              />
              <span>{p.name}</span>
              <b className={`font-bold tabular-nums ${isSelected ? 'text-[#17171a]' : 'text-[#77756d]'}`}>
                {count}
              </b>
            </button>
          );
        })}
      </div>

      {/* Coalition Meter Numbers */}
      <div className="flex items-baseline gap-2 flex-wrap mb-2">
        <b
          className={`text-4xl font-bold tracking-tight tabular-nums leading-none transition-transform duration-300 ${
            isWin ? 'text-[#2e8b4f] scale-105' : 'text-[#17171a]'
          }`}
        >
          {coalitionSeats}
        </b>
        <span className="text-xs text-[#77756d]">/ {targetSeats} escaños</span>
        <em
          className={`not-italic text-xs font-semibold ml-auto px-3 py-1 rounded-full transition-colors duration-300 ${
            isWin ? 'bg-[#2e8b4f] text-white' : 'bg-[#fafaf8] text-[#77756d]'
          }`}
        >
          {statusText}
        </em>
      </div>

      {/* Coalition Progress Bar */}
      <div className="flex h-3 rounded-full bg-[#fafaf8] border border-[#e9e7e0] relative overflow-hidden my-3">
        {parties.map((p) => {
          if (!selectedParties.has(p.id)) return null;
          const count = partyTotals[p.id] || 0;
          if (count === 0) return null;
          const pct = (count / totalChamberSeats) * 100;

          return (
            <div
              key={p.id}
              className="h-full transition-all duration-200"
              style={{ width: `${pct}%`, backgroundColor: p.color }}
              title={`${p.name}: ${count}`}
            />
          );
        })}
        {/* Majority threshold tick */}
        <span
          className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-[#17171a] rounded-sm pointer-events-none"
          style={{ left: `${majorityPercentage}%` }}
          title={`${majorityName}: ${targetSeats}`}
        />
      </div>
    </section>
  );
};
