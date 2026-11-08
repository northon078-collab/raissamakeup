import React, { useState, useEffect } from 'react';
import { ServiceItem, ServiceCategory } from '../types';
import { calculateTotalServicesPrice } from '../utils/formatters';
import { Check, Info, ChevronRight, Plus } from 'lucide-react';

interface ServiceCatalogProps {
  services: ServiceItem[];
  selectedServices: ServiceItem[];
  onToggleService: (service: ServiceItem) => void;
  onProceedToDate: () => void;
  initialCategory?: 'all' | ServiceCategory;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  selectedServices,
  onToggleService,
  onProceedToDate,
  initialCategory = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | ServiceCategory>(initialCategory);

  useEffect(() => {
    if (initialCategory) {
      setActiveTab(initialCategory);
    }
  }, [initialCategory]);

  const categories: { key: 'all' | ServiceCategory; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'maquiagem', label: 'Maquiagem' },
    { key: 'sobrancelhas', label: 'Sobrancelhas' },
    { key: 'penteados', label: 'Penteados' },
  ];

  const filteredServices = activeTab === 'all'
    ? services
    : services.filter((s) => s.category === activeTab);

  const getCategoryTitle = (cat: ServiceCategory) => {
    switch (cat) {
      case 'maquiagem':
        return 'Maquiagem';
      case 'sobrancelhas':
        return 'Sobrancelhas & Depilação Facial';
      case 'penteados':
        return 'Penteados & Cachos';
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((s) => s.id === serviceId);
  };

  const hasSelected = selectedServices.length > 0;
  const { formatted: totalFormatted } = calculateTotalServicesPrice(selectedServices);

  return (
    <section id="catalogo-servicos" className="w-full max-w-xl mx-auto px-4 pt-6 pb-36 relative">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#e64980] uppercase">
          Etapa 1 de 5
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#c23a5b] mt-1 mb-2">
          Escolha seus Serviços
        </h2>
        <p className="text-xs sm:text-sm text-[#734b55] max-w-md mx-auto">
          Você pode selecionar <strong>mais de um serviço</strong> para realizar no mesmo dia!
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#fdebf0] rounded-2xl mb-6 overflow-x-auto no-scrollbar border border-[#fad0dc]">
        {categories.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[85px] py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#e64980] to-[#c23a5b] text-white shadow-sm font-bold'
                  : 'text-[#8c505f] hover:text-[#c23a5b] hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Services List with Multi-Select */}
      <div className="space-y-3.5">
        {filteredServices.map((service) => {
          const isSelected = isServiceSelected(service.id);

          return (
            <div
              key={service.id}
              onClick={() => onToggleService(service)}
              className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-[#ffffff] to-[#fff0f4] border-[#e64980] ring-2 ring-[#e64980]/30 shadow-md'
                  : 'bg-white/95 border-[#fbd2dc] hover:border-[#f783ac] hover:bg-white shadow-soft'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Category tag */}
                  <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-[#d6336c] font-bold mb-1">
                    <span>{getCategoryTitle(service.category)}</span>
                    {service.durationMinutes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-normal text-[#8e5c67]">Aprox. {service.durationMinutes} min</span>
                      </>
                    )}
                  </div>

                  {/* Service Title */}
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#b32b50] leading-snug">
                    {service.name}
                  </h3>

                  {/* Description */}
                  {service.description && (
                    <p className="text-xs text-[#714d55] mt-1 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {/* Note for Tranças Nagô */}
                  {service.priceNote && (
                    <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-[#a61e4d] bg-[#fff0f4] p-2.5 rounded-xl border border-[#fcc2d7]">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#e64980]" />
                      <span>{service.priceNote}</span>
                    </div>
                  )}
                </div>

                {/* Price and Multi-Select Button Column */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  <div className="text-right mb-2">
                    <span className="text-[11px] text-[#8e5c67] block font-medium">
                      {service.isStartingPrice ? 'A partir de' : 'Valor'}
                    </span>
                    <span className="font-serif font-bold text-lg sm:text-xl text-[#c23a5b] tabular-nums">
                      {service.isStartingPrice ? `R$ ${service.price},00` : service.formattedPrice}
                    </span>
                  </div>

                  <div
                    className={`h-9 px-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 pointer-events-none select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#e64980] to-[#c23a5b] text-white shadow-xs'
                        : 'bg-[#fff0f4] text-[#c23a5b] border border-[#f8a5b8]'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Selecionado</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão visível no final da lista de serviços */}
      {hasSelected && (
        <div className="mt-8 mb-4 text-center">
          <button
            type="button"
            onClick={onProceedToDate}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#e64980] to-[#c23a5b] hover:from-[#f06595] hover:to-[#d6336c] text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#e64980]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Avançar para Escolher Data ({selectedServices.length} {selectedServices.length === 1 ? 'item' : 'itens'})</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* BARRA FIXA PERMANENTE NA PARTE INFERIOR DA TELA - SEMPRE FIXA ACOMPANHANDO A ROLAGEM */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] bg-white/98 backdrop-blur-md border-t-2 border-[#f7aab9] shadow-[0_-8px_30px_rgba(194,58,91,0.22)] py-3 px-4"
        style={{
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 12px))',
        }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {hasSelected ? (
              <>
                <span className="text-[11px] uppercase tracking-wider text-[#d6336c] font-bold block truncate">
                  {selectedServices.length === 1
                    ? '1 serviço selecionado'
                    : `${selectedServices.length} serviços selecionados`}
                </span>
                <p className="font-serif font-bold text-base sm:text-lg text-[#b32b50] tabular-nums truncate">
                  Total: {totalFormatted}
                </p>
              </>
            ) : (
              <div>
                <span className="text-xs font-bold text-[#b32b50] block">
                  Nenhum serviço escolhido
                </span>
                <span className="text-[11px] text-[#8e5c67]">
                  Toque em um serviço para agendar
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!hasSelected}
            onClick={onProceedToDate}
            className={`h-12 px-6 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shrink-0 transition-all ${
              hasSelected
                ? 'bg-gradient-to-r from-[#e64980] to-[#c23a5b] hover:from-[#f06595] hover:to-[#d6336c] text-white shadow-lg shadow-[#e64980]/40 ring-2 ring-[#e64980]/30 active:scale-95 cursor-pointer'
                : 'bg-[#fce4ec] text-[#d48b9c] cursor-not-allowed opacity-80'
            }`}
          >
            <span>Escolher Data</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
