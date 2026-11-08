import React from 'react';
import { Clock, Sun, Sunset, Coffee, Check, ChevronRight } from 'lucide-react';
import { formatDateToPortuguese, generateTimeSlots } from '../utils/formatters';

interface TimeSlotPickerProps {
  selectedDate: string;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  startHour: string;
  endHour: string;
  intervalMinutes: number;
  blockedSlotsForDate: string[];
  onProceedToClientData: () => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  selectedTime,
  onSelectTime,
  startHour,
  endHour,
  intervalMinutes,
  blockedSlotsForDate,
  onProceedToClientData,
}) => {
  const allSlots = generateTimeSlots(startHour, endHour, intervalMinutes);

  // Group slots into Raissa's two working shifts:
  // 1. Manhã: 09:30 às 11:30
  // 2. Tarde: 13:30 às 18:30
  const morningSlots = allSlots.filter((slot) => {
    const [h, m] = slot.split(':').map(Number);
    return h * 60 + m <= 11 * 60 + 30;
  });

  const afternoonSlots = allSlots.filter((slot) => {
    const [h, m] = slot.split(':').map(Number);
    return h * 60 + m >= 13 * 60 + 30;
  });

  const renderSlotGroup = (title: string, icon: React.ReactNode, slots: string[]) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider text-[#b32b50] font-bold">
          {icon}
          <span>{title}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {slots.map((slot) => {
            const isBlocked = blockedSlotsForDate.includes(slot);
            const isSelected = selectedTime === slot;

            return (
              <button
                key={slot}
                type="button"
                disabled={isBlocked}
                onClick={() => onSelectTime(slot)}
                className={`h-12 rounded-xl text-sm font-bold tracking-wider tabular-nums transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#e64980] to-[#c23a5b] text-white shadow-md scale-[1.02]'
                    : isBlocked
                    ? 'bg-[#f8ebef] text-[#c9a7b0] border border-dashed border-[#e6c4cc] cursor-not-allowed line-through'
                    : 'bg-white text-[#2b1e22] border border-[#fbd2dc] hover:bg-[#ffe3eb] hover:border-[#e64980] active:scale-95 shadow-2xs'
                }`}
                title={isBlocked ? 'Horário já reservado ou indisponível' : `Horário: ${slot}`}
              >
                <span>{slot}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const hasTime = Boolean(selectedTime);

  return (
    <section className="w-full max-w-xl mx-auto px-4 pt-6 pb-36 relative">
      {/* Step Heading */}
      <div className="text-center mb-6">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#e64980] uppercase">
          Etapa 3 de 5
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#c23a5b] mt-1 mb-2">
          Escolha o Horário
        </h2>
        <p className="text-xs sm:text-sm text-[#734b55] max-w-md mx-auto">
          Para o dia <strong className="text-[#c23a5b] font-bold">{formatDateToPortuguese(selectedDate)}</strong>.
        </p>
      </div>

      {/* Slots Card */}
      <div className="bg-white rounded-3xl border border-[#fbd2dc] p-5 sm:p-6 shadow-soft">
        {renderSlotGroup('Manhã • 09:30 às 11:30', <Sun className="w-4 h-4 text-[#d4af37]" />, morningSlots)}

        {/* Indicador elegante de intervalo de almoço */}
        <div className="my-5 py-2.5 px-3.5 rounded-2xl bg-[#fff0f4] border border-[#fcd2dd] flex items-center justify-between text-xs text-[#a61e4d]">
          <span className="font-semibold flex items-center gap-2">
            <Coffee className="w-4 h-4 text-[#e64980]" />
            Intervalo de almoço
          </span>
          <span className="text-[11px] font-bold text-[#b32b50] bg-white px-2.5 py-1 rounded-lg border border-[#fbd2dc]">
            11:30 às 13:30
          </span>
        </div>

        {renderSlotGroup('Tarde • 13:30 às 18:30', <Sunset className="w-4 h-4 text-[#e64980]" />, afternoonSlots)}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-[#fdebf0] flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#7d535e]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-white border border-[#fbd2dc]" />
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#e64980]" />
            <span>Selecionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#f8ebef] border border-dashed border-[#e6c4cc]" />
            <span className="line-through">Reservado / Ocupado</span>
          </div>
        </div>
      </div>

      {/* Botão visível no final dos horários */}
      {hasTime && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onProceedToClientData}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#e64980] to-[#c23a5b] hover:from-[#f06595] hover:to-[#d6336c] text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#e64980]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Avançar para Seus Dados ({selectedTime})</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* BARRA FIXA FLUTUANTE ELEGANTE - ELEVADA E COM MARGEM INFERIOR */}
      <div
        className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-[100] bg-white/98 backdrop-blur-md border border-[#f7aab9] rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_rgba(194,58,91,0.28)] py-3 px-4"
        style={{
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          marginBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {hasTime ? (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ffe3eb] text-[#c23a5b] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#d6336c] font-bold block">
                    Horário Escolhido
                  </span>
                  <p className="font-serif font-bold text-base text-[#b32b50] tabular-nums truncate">
                    {selectedTime}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold text-[#b32b50] block">
                  Nenhum horário selecionado
                </span>
                <span className="text-[11px] text-[#8e5c67]">
                  Toque em um horário disponível acima
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!hasTime}
            onClick={onProceedToClientData}
            className={`h-12 px-6 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shrink-0 transition-all ${
              hasTime
                ? 'bg-gradient-to-r from-[#e64980] to-[#c23a5b] hover:from-[#f06595] hover:to-[#d6336c] text-white shadow-lg shadow-[#e64980]/30 active:scale-95 cursor-pointer'
                : 'bg-[#fce4ec] text-[#d48b9c] cursor-not-allowed opacity-80'
            }`}
          >
            <span>Preencher Dados</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
