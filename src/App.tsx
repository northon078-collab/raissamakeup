/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookingState,
  ServiceItem,
  ServiceCategory,
  BusinessSettings,
  AppointmentRecord,
} from './types';
import {
  INITIAL_SERVICES,
  DEFAULT_SETTINGS,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredServices,
  saveStoredServices,
  loadStoredAppointments,
  saveNewAppointment,
} from './data/defaultData';
import { calculateTotalServicesPrice } from './utils/formatters';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServiceCatalog } from './components/ServiceCatalog';
import { DatePicker } from './components/DatePicker';
import { TimeSlotPicker } from './components/TimeSlotPicker';
import { ClientForm } from './components/ClientForm';
import { BookingSummary } from './components/BookingSummary';
import { ConfirmationSuccessModal } from './components/ConfirmationSuccessModal';
import { Footer } from './components/Footer';

export default function App() {
  // App state
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | ServiceCategory>('all');

  // Current Step:
  // 0 = Home / Initial Page
  // 1 = Select Service
  // 2 = Select Date
  // 3 = Select Time
  // 4 = Client Data
  // 5 = Summary & WhatsApp Confirmation
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Active booking draft (including multiple services and notes)
  const [booking, setBooking] = useState<BookingState>({
    services: [],
    date: '',
    time: '',
    clientName: '',
    clientPhone: '',
    clientNotes: '',
  });

  // Modals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Load stored data on mount
  useEffect(() => {
    const loadedSettings = loadStoredSettings();
    const loadedServices = loadStoredServices();
    const loadedAppts = loadStoredAppointments();
    setSettings(loadedSettings);
    setServices(loadedServices);
    setAppointments(loadedAppts);
  }, []);

  // Reliable navigation that guarantees the viewport lands right at the top
  const navigateToStep = useCallback((step: number) => {
    setCurrentStep(step);
    // Instant reset to avoid smooth scroll fighting DOM unmount/render height changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, []);

  // Update Settings handler
  const handleSaveSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Step 1: Select / Toggle Service
  const handleToggleService = (service: ServiceItem) => {
    setBooking((prev) => {
      const exists = prev.services.some((s) => s.id === service.id);
      const updated = exists
        ? prev.services.filter((s) => s.id !== service.id)
        : [...prev.services, service];
      return { ...prev, services: updated };
    });
  };

  const handleProceedToDate = () => {
    if (booking.services.length > 0) {
      navigateToStep(2);
    }
  };

  // Step 2: Select Date
  const handleSelectDate = (date: string) => {
    // Reset time when date changes
    setBooking((prev) => ({ ...prev, date, time: '' }));
  };

  const handleProceedToTime = () => {
    if (booking.date) {
      navigateToStep(3);
    }
  };

  // Step 3: Select Time
  const handleSelectTime = (time: string) => {
    setBooking((prev) => ({ ...prev, time }));
  };

  const handleProceedToClientData = () => {
    if (booking.time) {
      navigateToStep(4);
    }
  };

  // Step 4: Client Data
  const handleProceedToSummary = () => {
    if (booking.clientName && booking.clientPhone) {
      navigateToStep(5);
    }
  };

  // Step 5: WhatsApp Confirmation Success
  const handleConfirmSuccess = () => {
    if (!booking.services || booking.services.length === 0) return;

    const { formatted: totalFormatted } = calculateTotalServicesPrice(booking.services);

    // Save record to local storage
    const newRecord: AppointmentRecord = {
      id: `appt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      serviceName: booking.services.map((s) => s.name).join(' + '),
      servicePrice: totalFormatted,
      date: booking.date,
      time: booking.time,
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      clientNotes: booking.clientNotes,
      status: 'solicitado',
    };

    saveNewAppointment(newRecord);
    setAppointments(loadStoredAppointments());

    // Mark slot as booked for this date to prevent double booking in local session
    if (booking.date && booking.time) {
      const currentBlocked = settings.blockedSlots[booking.date] || [];
      if (!currentBlocked.includes(booking.time)) {
        const updatedBlockedSlots = {
          ...settings.blockedSlots,
          [booking.date]: [...currentBlocked, booking.time],
        };
        const updatedSettings = {
          ...settings,
          blockedSlots: updatedBlockedSlots,
        };
        handleSaveSettings(updatedSettings);
      }
    }

    setIsSuccessModalOpen(true);
  };

  // Reset booking to start fresh
  const handleNewBooking = () => {
    setBooking({
      services: [],
      date: '',
      time: '',
      clientName: '',
      clientPhone: '',
      clientNotes: '',
    });
    setIsSuccessModalOpen(false);
    navigateToStep(0);
  };

  // Navigation handlers
  const handleGoHome = () => {
    navigateToStep(0);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      navigateToStep(currentStep - 1);
    }
  };

  const handleEditStep = (stepNumber: number) => {
    navigateToStep(stepNumber);
  };

  // Get blocked slots for the currently selected date
  const blockedSlotsForDate = booking.date
    ? settings.blockedSlots[booking.date] || []
    : [];

  return (
    <div className="min-h-screen bg-[#fff5f7] text-[#2b1e22] flex flex-col font-sans selection:bg-[#ffc9db] selection:text-[#a61e4d]">
      {/* Sticky Header */}
      <Header
        currentStep={currentStep}
        onBack={currentStep > 0 ? handleBack : undefined}
        onGoHome={handleGoHome}
        instagramUrl={settings.instagramUrl}
        instagramHandle={settings.instagramHandle}
      />

      {/* Step Progress Indicator (Visible during steps 1 to 5) */}
      {currentStep >= 1 && (
        <div className="bg-[#fff8fa] border-b border-[#fbd2dc] py-2.5 px-4 sticky top-16 z-30 shadow-2xs">
          <div className="max-w-xl mx-auto flex items-center justify-between text-[11px] font-semibold text-[#8e5c67]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full justify-between">
              {[
                { step: 1, label: 'Serviço' },
                { step: 2, label: 'Data' },
                { step: 3, label: 'Horário' },
                { step: 4, label: 'Seus Dados' },
                { step: 5, label: 'Confirmar' },
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isCompleted = currentStep > item.step;

                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      if (isCompleted) {
                        navigateToStep(item.step);
                      }
                    }}
                    className={`flex items-center gap-1 py-1 px-1.5 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-[#c23a5b] font-bold border-b-2 border-[#c23a5b]'
                        : isCompleted
                        ? 'text-[#a61e4d] hover:text-[#c23a5b] cursor-pointer'
                        : 'text-[#d8b5bd] cursor-default'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isActive
                          ? 'bg-[#c23a5b] text-white'
                          : isCompleted
                          ? 'bg-[#f783ac] text-white'
                          : 'bg-[#fde2e8] text-[#a61e4d]'
                      }`}
                    >
                      {item.step}
                    </span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto">
        {/* Step 0: Hero / Home */}
        {currentStep === 0 && (
          <>
            <Hero
              onStartBooking={() => {
                setSelectedCategoryFilter('all');
                navigateToStep(1);
              }}
              instagramUrl={settings.instagramUrl}
              instagramHandle={settings.instagramHandle}
            />

            {/* Quick Preview of the 3 Categories on Home */}
            <section className="px-4 pb-10 max-w-xl mx-auto">
              <div className="text-center mb-6">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#e64980] uppercase block">
                  Experiência Exclusiva
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#c23a5b] mt-1">
                  Nossos Serviços
                </h2>
                <div className="flex items-center justify-center gap-2 w-32 mx-auto my-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f49db1]" />
                  <span className="text-[#d4af37] text-xs">✦</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#f49db1]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    setSelectedCategoryFilter('maquiagem');
                    navigateToStep(1);
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#fbd2dc] hover:border-[#e64980] hover:shadow-md transition-all cursor-pointer group text-center"
                >
                  <span className="text-[10px] tracking-wider uppercase text-[#e64980] font-bold block">
                    01
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#b32b50] transition-colors mt-1">
                    Maquiagem
                  </h3>
                  <p className="text-xs text-[#714d55] mt-1.5 leading-relaxed">
                    Com ou sem cílios postiços, pele blindada e acabamento profissional.
                  </p>
                  <span className="inline-block mt-3 text-xs font-bold text-[#c23a5b]">
                    A partir de R$ 75,00
                  </span>
                </div>

                <div
                  onClick={() => {
                    setSelectedCategoryFilter('sobrancelhas');
                    navigateToStep(1);
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#fbd2dc] hover:border-[#e64980] hover:shadow-md transition-all cursor-pointer group text-center"
                >
                  <span className="text-[10px] tracking-wider uppercase text-[#e64980] font-bold block">
                    02
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#b32b50] transition-colors mt-1">
                    Sobrancelhas
                  </h3>
                  <p className="text-xs text-[#714d55] mt-1.5 leading-relaxed">
                    Design personalizado, aplicação de henna e depilação suave de buço.
                  </p>
                  <span className="inline-block mt-3 text-xs font-bold text-[#c23a5b]">
                    A partir de R$ 10,00
                  </span>
                </div>

                <div
                  onClick={() => {
                    setSelectedCategoryFilter('penteados');
                    navigateToStep(1);
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#fbd2dc] hover:border-[#e64980] hover:shadow-md transition-all cursor-pointer group text-center"
                >
                  <span className="text-[10px] tracking-wider uppercase text-[#e64980] font-bold block">
                    03
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#b32b50] transition-colors mt-1">
                    Penteados
                  </h3>
                  <p className="text-xs text-[#714d55] mt-1.5 leading-relaxed">
                    Tranças nagô exclusivas, definição de cachos e penteados para festas.
                  </p>
                  <span className="inline-block mt-3 text-xs font-bold text-[#c23a5b]">
                    A partir de R$ 25,00
                  </span>
                </div>
              </div>

              {/* Botão de Agendamento Direto */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('all');
                    navigateToStep(1);
                  }}
                  className="w-full sm:w-auto min-w-[280px] h-13 px-8 rounded-2xl bg-gradient-to-r from-[#e64980] to-[#c23a5b] hover:from-[#f06595] hover:to-[#d6336c] text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Ver Todos os Serviços & Preços
                </button>
              </div>
            </section>
          </>
        )}

        {/* Step 1: Services Catalog */}
        {currentStep === 1 && (
          <ServiceCatalog
            services={services}
            selectedServices={booking.services}
            onToggleService={handleToggleService}
            onProceedToDate={handleProceedToDate}
            initialCategory={selectedCategoryFilter}
          />
        )}

        {/* Step 2: Choose Date */}
        {currentStep === 2 && (
          <DatePicker
            selectedDate={booking.date}
            onSelectDate={handleSelectDate}
            openDays={settings.openDays}
            blockedDates={settings.blockedDates}
            onProceedToTime={handleProceedToTime}
          />
        )}

        {/* Step 3: Choose Time */}
        {currentStep === 3 && (
          <TimeSlotPicker
            selectedDate={booking.date}
            selectedTime={booking.time}
            onSelectTime={handleSelectTime}
            startHour={settings.startHour}
            endHour={settings.endHour}
            intervalMinutes={settings.intervalMinutes}
            blockedSlotsForDate={blockedSlotsForDate}
            onProceedToClientData={handleProceedToClientData}
          />
        )}

        {/* Step 4: Client Info com Campo de Observações */}
        {currentStep === 4 && (
          <ClientForm
            clientName={booking.clientName}
            clientPhone={booking.clientPhone}
            clientNotes={booking.clientNotes || ''}
            onChangeName={(name) => setBooking((prev) => ({ ...prev, clientName: name }))}
            onChangePhone={(phone) => setBooking((prev) => ({ ...prev, clientPhone: phone }))}
            onChangeNotes={(notes) => setBooking((prev) => ({ ...prev, clientNotes: notes }))}
            onProceedToSummary={handleProceedToSummary}
          />
        )}

        {/* Step 5: Summary & WhatsApp Confirmation */}
        {currentStep === 5 && (
          <BookingSummary
            booking={booking}
            whatsappNumber={settings.whatsappNumber}
            onEditStep={handleEditStep}
            onConfirmSuccess={handleConfirmSuccess}
          />
        )}
      </main>

      {/* Confirmation Success Dialog */}
      <ConfirmationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        booking={booking}
        whatsappNumber={settings.whatsappNumber}
        onNewBooking={handleNewBooking}
      />

      {/* Footer (Sem acesso da profissional) */}
      <Footer
        instagramUrl={settings.instagramUrl}
        instagramHandle={settings.instagramHandle}
        whatsappNumber={settings.whatsappNumber}
      />
    </div>
  );
}
