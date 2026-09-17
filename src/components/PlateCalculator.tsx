import React, { useState } from 'react';
import { X, Dumbbell, Sparkles } from 'lucide-react';
import { haptics } from '../lib/haptics';

interface PlateCalculatorProps {
  initialWeight: number;
  unit: 'kg' | 'lb';
  onClose: () => void;
  onApply?: (weight: number) => void;
}

export const PlateCalculator: React.FC<PlateCalculatorProps> = ({
  initialWeight,
  unit,
  onClose,
  onApply,
}) => {
  const barWeight = unit === 'kg' ? 20 : 45;
  const [targetWeight, setTargetWeight] = useState<number>(
    initialWeight > 0 ? initialWeight : (unit === 'kg' ? 60 : 135)
  );

  // Standard plate inventory
  const availablePlates =
    unit === 'kg'
      ? [25, 20, 15, 10, 5, 2.5, 1.25]
      : [45, 35, 25, 10, 5, 2.5];

  // Colors for plates
  const plateColors: Record<number, string> = {
    // kg
    25: 'bg-[#E36565] text-white border-red-500', // Red
    20: 'bg-[#3C82F6] text-white border-blue-500', // Blue
    15: 'bg-[#E8B347] text-[#14151A] border-amber-400', // Yellow
    10: 'bg-[#10B981] text-white border-emerald-500', // Green
    5: 'bg-[#33353D] text-white border-[#555866]', // White / Iron
    2.5: 'bg-[#1F2937] text-white border-gray-600',
    1.25: 'bg-[#374151] text-white border-gray-500',
    // lb
    45: 'bg-[#3C82F6] text-white border-blue-500',
    35: 'bg-[#E8B347] text-[#14151A] border-amber-400',
    // 25: already defined
  };

  function calculatePlates(target: number) {
    if (target < barWeight) return { sidePlates: [], remainder: 0, perSide: 0 };

    let neededPerSide = (target - barWeight) / 2;
    const sidePlates: number[] = [];

    for (const plate of availablePlates) {
      while (neededPerSide >= plate - 0.001) {
        sidePlates.push(plate);
        neededPerSide = Math.round((neededPerSide - plate) * 100) / 100;
      }
    }

    return {
      sidePlates,
      remainder: neededPerSide,
      perSide: (target - barWeight) / 2,
    };
  }

  const { sidePlates, remainder, perSide } = calculatePlates(targetWeight);

  function adjustTarget(delta: number) {
    haptics.step();
    setTargetWeight((w) => Math.max(barWeight, Math.round((w + delta) * 10) / 10));
  }

  function handleApply() {
    haptics.tap();
    if (onApply) {
      onApply(targetWeight);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
      <div className="card w-full max-w-sm p-4 bg-[#15171C] border border-[#2D313A] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#22252C]">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#E8B347]" />
            <h3 className="font-display text-lg uppercase tracking-wider text-[#EDEEF0]">
              Plate Math Calculator
            </h3>
          </div>
          <button
            onClick={() => {
              haptics.tap();
              onClose();
            }}
            className="text-[#8B8F98] hover:text-[#EDEEF0] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Weight Controls */}
        <div className="text-center py-2 mb-3 bg-[#0E1013] border border-[#22252C] rounded-[2px]">
          <div className="text-[10px] uppercase tracking-wider text-[#8B8F98] font-mono">
            Target Barbell Load
          </div>
          <div className="flex items-center justify-center gap-3 my-1">
            <button
              type="button"
              onClick={() => adjustTarget(unit === 'kg' ? -2.5 : -5)}
              className="w-8 h-8 flex items-center justify-center border border-[#2D313A] bg-[#15171C] text-[#EDEEF0] text-sm font-bold hover:border-[#E8B347] active:scale-95"
            >
              -{unit === 'kg' ? '2.5' : '5'}
            </button>
            <div className="font-display text-3xl text-[#EDEEF0] font-bold tracking-tight">
              {targetWeight} <span className="text-xs font-mono text-[#E8B347] uppercase">{unit}</span>
            </div>
            <button
              type="button"
              onClick={() => adjustTarget(unit === 'kg' ? 2.5 : 5)}
              className="w-8 h-8 flex items-center justify-center border border-[#2D313A] bg-[#15171C] text-[#EDEEF0] text-sm font-bold hover:border-[#E8B347] active:scale-95"
            >
              +{unit === 'kg' ? '2.5' : '5'}
            </button>
          </div>
          <div className="text-[11px] text-[#8B8F98] font-mono">
            Bar: {barWeight} {unit} • Load per side: <strong className="text-[#EDEEF0]">{Math.max(0, perSide)} {unit}</strong>
          </div>
        </div>

        {/* Barbell Visual Representation */}
        <div className="p-3 mb-3 bg-[#0E1013] border border-[#22252C] rounded-[2px]">
          <div className="text-[10px] uppercase tracking-wider text-[#8B8F98] mb-2 font-mono flex items-center justify-between">
            <span>Barbell Sleeve (Each Side)</span>
            <span>{sidePlates.length} Plates</span>
          </div>

          {targetWeight < barWeight ? (
            <div className="text-xs text-[#E36565] font-mono text-center py-2">
              Weight is less than empty bar ({barWeight} {unit})
            </div>
          ) : sidePlates.length === 0 ? (
            <div className="text-xs text-[#8B8F98] font-mono text-center py-2">
              Empty Barbell only ({barWeight} {unit})
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 min-h-[52px] overflow-x-auto py-1">
              {/* Bar collar */}
              <div className="w-2.5 h-12 bg-gray-500 rounded-[1px] shrink-0" title="Collar" />
              {/* Loaded plates */}
              {sidePlates.map((plate, i) => {
                const colorClass = plateColors[plate] || 'bg-[#2D313A] text-white border-gray-600';
                const heightClass =
                  plate >= 45 || plate >= 20
                    ? 'h-11 w-6 text-xs'
                    : plate >= 25 || plate >= 10
                    ? 'h-9 w-5 text-[11px]'
                    : 'h-7 w-4 text-[9px]';

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center font-mono font-bold border rounded-[2px] shrink-0 shadow-xs ${colorClass} ${heightClass}`}
                    title={`${plate} ${unit} plate`}
                  >
                    {plate}
                  </div>
                );
              })}
              {/* Bar tip */}
              <div className="w-4 h-3 bg-gray-400 rounded-r-[1px] shrink-0" />
            </div>
          )}

          {remainder > 0 && (
            <div className="text-[10px] text-[#E8B347] font-mono text-center mt-1">
              Note: {remainder * 2} {unit} difference cannot be loaded with standard plates.
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {onApply && (
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary flex-1 py-2 text-xs uppercase tracking-wider font-bold"
            >
              Use {targetWeight} {unit}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              haptics.tap();
              onClose();
            }}
            className="btn-ghost flex-1 py-2 text-xs uppercase tracking-wider text-[#8B8F98] border-[#2D313A]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
