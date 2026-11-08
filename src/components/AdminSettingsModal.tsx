import React, { useState } from 'react';
import { BusinessSettings, ServiceItem, AppointmentRecord } from '../types';
import {
  X,
  Lock,
  Calendar,
  Clock,
  Phone,
  Settings,
  Plus,
  Trash2,
  Check,
  ShieldAlert,
  ListOrdered,
  DollarSign,
} from 'lucide-react';
import { formatDateToPortuguese } from '../utils/formatters';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
  services: ServiceItem[];
  onSaveServices: (services: ServiceItem[]) => void;
  appointments: AppointmentRecord[];
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  services,
  onSaveServices,
  appointments,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<'appointments' | 'dates' | 'hours' | 'services' | 'general'>('appointments');

  // Local state for editing
  const [localSettings, setLocalSettings] = useState<BusinessSettings>(settings);
  const [localServices, setLocalServices] = useState<ServiceItem[]>(services);

  // New blocked date input
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Block slot input
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');

  // New service state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<'maquiagem' | 'sobrancelhas' | 'penteados'>('maquiagem');

  if (!isOpen) return null;

  // Simple PIN authentication for professional access (PIN: 1234 or raissa)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().toLowerCase() === '1234' || pinInput.trim().toLowerCase() === 'raissa') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    const current = [...localSettings.openDays];
    const exists = current.includes(dayIndex);
    const updated = exists ? current.filter((d) => d !== dayIndex) : [...current, dayIndex].sort();
    const newConfig = { ...localSettings, openDays: updated };
    setLocalSettings(newConfig);
    onSaveSettings(newConfig);
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    if (localSettings.blockedDates.includes(newBlockedDate)) return;

    const updated = [...localSettings.blockedDates, newBlockedDate];
    const newConfig = { ...localSettings, blockedDates: updated };
    setLocalSettings(newConfig);
    onSaveSettings(newConfig);
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = (dateToRemove: string) => {
    const updated = localSettings.blockedDates.filter((d) => d !== dateToRemove);
    const newConfig = { ...localSettings, blockedDates: updated };
    setLocalSettings(newConfig);
    onSaveSettings(newConfig);
  };

  const handleBlockSlot = () => {
    if (!slotDate || !slotTime) return;
    const currentSlotsForDate = localSettings.blockedSlots[slotDate] || [];
    if (currentSlotsForDate.includes(slotTime)) return;

    const updatedSlots = {
      ...localSettings.blockedSlots,
      [slotDate]: [...currentSlotsForDate, slotTime],
    };
    const newConfig = { ...localSettings, blockedSlots: updatedSlots };
    setLocalSettings(newConfig);
    onSaveSettings(newConfig);
    setSlotTime('');
  };

  const handleUnblockSlot = (date: string, time: string) => {
    const currentSlotsForDate = localSettings.blockedSlots[date] || [];
    const updated = currentSlotsForDate.filter((t) => t !== time);
    const updatedSlots = { ...localSettings.blockedSlots, [date]: updated };
    const newConfig = { ...localSettings, blockedSlots: updatedSlots };
    setLocalSettings(newConfig);
    onSaveSettings(newConfig);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    alert('Configurações salvas com sucesso!');
  };

  const handleUpdatePrice = (serviceId: string, newPrice: number) => {
    const updated = localServices.map((s) => {
      if (s.id === serviceId) {
        return {
          ...s,
          price: newPrice,
          formattedPrice: s.isStartingPrice ? `A partir de R$ ${newPrice},00` : `R$ ${newPrice},00`,
        };
      }
      return s;
    });
    setLocalServices(updated);
    onSaveServices(updated);
  };

  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const numericPrice = parseFloat(newServicePrice.replace(',', '.'));
    if (isNaN(numericPrice)) return;

    const newService: ServiceItem = {
      id: `custom-${Date.now()}`,
      name: newServiceName,
      category: newServiceCategory,
      price: numericPrice,
      formattedPrice: `R$ ${numericPrice.toFixed(2).replace('.', ',')}`,
      description: 'Serviço personalizado adicionado pela maquiadora.',
    };

    const updated = [...localServices, newService];
    setLocalServices(updated);
    onSaveServices(updated);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      const updated = localServices.filter((s) => s.id !== serviceId);
      setLocalServices(updated);
      onSaveServices(updated);
    }
  };

  const dayLabels = [
    { idx: 0, name: 'Domingo' },
    { idx: 1, name: 'Segunda' },
    { idx: 2, name: 'Terça' },
    { idx: 3, name: 'Quarta' },
    { idx: 4, name: 'Quinta' },
    { idx: 5, name: 'Sexta' },
    { idx: 6, name: 'Sábado' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#eedad5] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f2e5e2] flex items-center justify-between bg-[#fcf8f7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#faeae7] text-[#8e4545] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#8e4545]">
                Painel da Profissional
              </h3>
              <span className="text-[10px] text-[#a07474] uppercase tracking-wider block">
                Raissa Makeup — Gestão
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7e5c61] hover:bg-[#f2e2de] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#faf0ee] border border-[#eedad5] text-[#b76e6e] flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl font-bold text-[#8e4545] mb-1">
              Acesso Restrito
            </h4>
            <p className="text-xs text-[#715c60] max-w-xs mb-5">
              Digite seu PIN de maquiadora para gerenciar horários, datas e serviços. (Padrão: <strong>1234</strong> ou <strong>raissa</strong>)
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Digite o PIN"
                className="w-full h-12 px-4 rounded-xl border border-[#e8d5d1] text-center text-lg tracking-widest focus:outline-none focus:border-[#b76e6e] focus:ring-2 focus:ring-[#b76e6e]/20"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-600">PIN incorreto. Tente novamente.</p>
              )}
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#8e4545] text-white font-medium text-xs uppercase tracking-wider hover:bg-[#a15151] transition-all cursor-pointer"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-[#f2e5e2] bg-[#fdfbfb] overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'appointments'
                    ? 'bg-[#8e4545] text-white'
                    : 'text-[#6e585b] hover:bg-[#f6eae7]'
                }`}
              >
                Solicitações ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('dates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'dates'
                    ? 'bg-[#8e4545] text-white'
                    : 'text-[#6e585b] hover:bg-[#f6eae7]'
                }`}
              >
                Dias & Folgas
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'hours'
                    ? 'bg-[#8e4545] text-white'
                    : 'text-[#6e585b] hover:bg-[#f6eae7]'
                }`}
              >
                Bloquear Horários
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'services'
                    ? 'bg-[#8e4545] text-white'
                    : 'text-[#6e585b] hover:bg-[#f6eae7]'
                }`}
              >
                Preços & Serviços
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'general'
                    ? 'bg-[#8e4545] text-white'
                    : 'text-[#6e585b] hover:bg-[#f6eae7]'
                }`}
              >
                Configurações
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Tab 1: Appointments History */}
              {activeTab === 'appointments' && (
                <div>
                  <h4 className="font-serif font-bold text-base text-[#2c1d20] mb-2">
                    Histórico de Solicitações Recebidas
                  </h4>
                  <p className="text-xs text-[#715c60] mb-4">
                    Registros das clientes que clicaram em confirmar agendamento no WhatsApp neste dispositivo.
                  </p>

                  {appointments.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#faf3f1] border border-[#f0deda] text-xs text-[#8c676d]">
                      Nenhuma solicitação registrada ainda. Quando as clientes clicarem no botão do WhatsApp, o registro aparecerá aqui.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="p-3.5 rounded-2xl bg-[#fdfbfb] border border-[#eedad5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-[#2d1b1f]">
                                {appt.clientName}
                              </span>
                              <span className="text-[10px] text-[#916b6f] font-mono">
                                {appt.clientPhone}
                              </span>
                            </div>
                            <p className="text-xs text-[#715c60] mt-0.5">
                              <strong>{appt.serviceName}</strong> · {appt.servicePrice}
                            </p>
                            <span className="text-[11px] text-[#b76e6e] font-semibold">
                              {formatDateToPortuguese(appt.date)} às {appt.time}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#9e8b8e] self-end sm:self-center">
                            Solicitado em {new Date(appt.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Days & Blocked Dates */}
              {activeTab === 'dates' && (
                <div className="space-y-6">
                  {/* Days of Week */}
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#2c1d20] mb-1">
                      Dias da Semana em que Atende
                    </h4>
                    <p className="text-xs text-[#715c60] mb-3">
                      Selecione os dias ativos para atendimento:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {dayLabels.map((day) => {
                        const isSelected = localSettings.openDays.includes(day.idx);
                        return (
                          <button
                            key={day.idx}
                            type="button"
                            onClick={() => handleToggleDay(day.idx)}
                            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#8e4545] text-white border-[#8e4545]'
                                : 'bg-[#faf2f0] text-[#715c60] border-[#eedad5] hover:bg-[#f6eae7]'
                            }`}
                          >
                            <span>{day.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Blocked Dates */}
                  <div className="pt-4 border-t border-[#f2e5e2]">
                    <h4 className="font-serif font-bold text-base text-[#2c1d20] mb-1">
                      Bloquear Datas Específicas (Feriados / Folgas)
                    </h4>
                    <p className="text-xs text-[#715c60] mb-3">
                      Adicione datas em que o agendamento estará indisponível no calendário:
                    </p>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="date"
                        value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                        className="h-10 px-3 rounded-xl border border-[#eedad5] text-xs text-[#2d1b1f] focus:outline-none focus:border-[#b76e6e]"
                      />
                      <button
                        type="button"
                        onClick={handleAddBlockedDate}
                        className="h-10 px-4 rounded-xl bg-[#8e4545] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#a15151] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Bloquear</span>
                      </button>
                    </div>

                    {localSettings.blockedDates.length === 0 ? (
                      <p className="text-xs text-[#9c8488]">Nenhuma data específica bloqueada.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {localSettings.blockedDates.map((dateStr) => (
                          <div
                            key={dateStr}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#faeae7] border border-[#eecdc6] text-xs text-[#7e4343]"
                          >
                            <span>{dateStr}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlockedDate(dateStr)}
                              className="text-[#8e4545] hover:text-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Block Hours */}
              {activeTab === 'hours' && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-[#2c1d20] mb-1">
                    Bloqueio Manual de Horários
                  </h4>
                  <p className="text-xs text-[#715c60] mb-3">
                    Bloqueie horários específicos para pausas, almoço ou compromissos externos:
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-[#eedad5] text-xs text-[#2d1b1f] focus:outline-none focus:border-[#b76e6e]"
                    />
                    <input
                      type="time"
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-[#eedad5] text-xs text-[#2d1b1f] focus:outline-none focus:border-[#b76e6e]"
                    />
                    <button
                      type="button"
                      onClick={handleBlockSlot}
                      className="h-10 px-4 rounded-xl bg-[#8e4545] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#a15151] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Bloquear Horário</span>
                    </button>
                  </div>

                  <div className="space-y-2 mt-4">
                    {Object.entries(localSettings.blockedSlots).map(([d, times]) => {
                      if (!times || times.length === 0) return null;
                      return (
                        <div key={d} className="p-3 rounded-xl bg-[#faf2f0] border border-[#eedad5]">
                          <span className="font-serif font-semibold text-xs text-[#2d1b1f] block mb-1.5">
                            {formatDateToPortuguese(d)} ({d})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {times.map((t) => (
                              <span
                                key={t}
                                className="px-2.5 py-1 rounded-md bg-white border border-[#e8cecb] text-xs text-[#7e4343] flex items-center gap-1.5"
                              >
                                <span>{t}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUnblockSlot(d, t)}
                                  className="text-[#8e4545] hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Services and Prices */}
              {activeTab === 'services' && (
                <div className="space-y-5">
                  <h4 className="font-serif font-bold text-base text-[#2c1d20]">
                    Tabela de Serviços e Preços
                  </h4>
                  <div className="space-y-3">
                    {localServices.map((service) => (
                      <div
                        key={service.id}
                        className="p-3 rounded-xl bg-[#fdfbfb] border border-[#eedad5] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-[#9f6d6d] uppercase tracking-wider block">
                            {service.category}
                          </span>
                          <p className="font-serif font-semibold text-sm text-[#2d1b1f] truncate">
                            {service.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#715c60]">R$</span>
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => handleUpdatePrice(service.id, parseFloat(e.target.value) || 0)}
                            className="w-20 h-9 px-2 rounded-lg border border-[#eedad5] text-xs font-bold text-[#8e4545] text-right"
                          />
                          {service.id.startsWith('custom-') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteService(service.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Service Form */}
                  <div className="p-4 rounded-2xl bg-[#faf2f0] border border-[#eedad5]">
                    <span className="font-serif font-semibold text-xs text-[#2c1d20] block mb-2">
                      Cadastrar Novo Serviço
                    </span>
                    <form onSubmit={handleAddNewService} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nome do serviço"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="h-10 px-3 rounded-xl border border-[#eedad5] text-xs bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Valor (ex: 50,00)"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        className="h-10 px-3 rounded-xl border border-[#eedad5] text-xs bg-white"
                        required
                      />
                      <div className="flex gap-2">
                        <select
                          value={newServiceCategory}
                          onChange={(e) => setNewServiceCategory(e.target.value as any)}
                          className="h-10 px-2 rounded-xl border border-[#eedad5] text-xs bg-white flex-1"
                        >
                          <option value="maquiagem">Maquiagem</option>
                          <option value="sobrancelhas">Sobrancelhas</option>
                          <option value="penteados">Penteados</option>
                        </select>
                        <button
                          type="submit"
                          className="h-10 px-3 rounded-xl bg-[#8e4545] text-white text-xs font-semibold uppercase"
                        >
                          Adicionar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 5: General Settings */}
              {activeTab === 'general' && (
                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d3a3d] mb-1">
                      Número do WhatsApp Oficial (apenas números com DDD)
                    </label>
                    <input
                      type="text"
                      value={localSettings.whatsappNumber}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })
                      }
                      placeholder="5518996732692"
                      className="w-full h-11 px-3 rounded-xl border border-[#eedad5] text-xs text-[#2d1b1f]"
                    />
                    <span className="text-[11px] text-[#9c8488] block mt-0.5">
                      Número atual: 5518996732692 (+55 18 99673-2692)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d3a3d] mb-1">
                        Horário de Abertura
                      </label>
                      <input
                        type="time"
                        value={localSettings.startHour}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, startHour: e.target.value })
                        }
                        className="w-full h-11 px-3 rounded-xl border border-[#eedad5] text-xs text-[#2d1b1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d3a3d] mb-1">
                        Horário de Término
                      </label>
                      <input
                        type="time"
                        value={localSettings.endHour}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, endHour: e.target.value })
                        }
                        className="w-full h-11 px-3 rounded-xl border border-[#eedad5] text-xs text-[#2d1b1f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4d3a3d] mb-1">
                      Intervalo entre Atendimentos (em minutos)
                    </label>
                    <select
                      value={localSettings.intervalMinutes}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          intervalMinutes: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full h-11 px-3 rounded-xl border border-[#eedad5] text-xs text-[#2d1b1f] bg-white"
                    >
                      <option value="30">30 minutos</option>
                      <option value="45">45 minutos</option>
                      <option value="60">60 minutos (1 hora)</option>
                      <option value="90">90 minutos (1h 30m)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#8e4545] text-white font-medium text-xs uppercase tracking-wider hover:bg-[#a15151] transition-all cursor-pointer mt-4"
                  >
                    Salvar Alterações
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
