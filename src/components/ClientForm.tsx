import React, { useState } from 'react';
import { User, Phone, MessageSquare, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatPhoneNumber } from '../utils/formatters';

interface ClientFormProps {
  clientName: string;
  clientPhone: string;
  clientNotes: string;
  onChangeName: (name: string) => void;
  onChangePhone: (phone: string) => void;
  onChangeNotes: (notes: string) => void;
  onProceedToSummary: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  clientName,
  clientPhone,
  clientNotes,
  onChangeName,
  onChangePhone,
  onChangeNotes,
  onProceedToSummary,
}) => {
  const [touched, setTouched] = useState<{ name: boolean; phone: boolean }>({
    name: false,
    phone: false,
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChangePhone(formatted);
  };

  const isNameValid = clientName.trim().length >= 3;
  const phoneDigits = clientPhone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length >= 10;
  const isFormValid = isNameValid && isPhoneValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    if (isFormValid) {
      onProceedToSummary();
    }
  };

  return (
    <section className="w-full max-w-xl mx-auto px-4 pt-6 pb-36 relative">
      {/* Step Heading */}
      <div className="text-center mb-6">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#e64980] uppercase">
          Etapa 4 de 5
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#c23a5b] mt-1 mb-2">
          Seus Dados de Contato
        </h2>
        <p className="text-xs sm:text-sm text-[#734b55] max-w-md mx-auto">
          Informe seu nome, WhatsApp e qualquer observação importante para personalizarmos seu atendimento.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-[#fbd2dc] p-5 sm:p-7 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nome Completo */}
          <div>
            <label
              htmlFor="clientName"
              className="block text-xs font-bold uppercase tracking-wider text-[#a61e4d] mb-1.5"
            >
              Nome Completo <span className="text-[#e64980]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#e64980]">
                <User className="w-5 h-5" />
              </div>
              <input
                id="clientName"
                type="text"
                autoComplete="name"
                value={clientName}
                onChange={(e) => onChangeName(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                placeholder="Ex: Maria Eduarda Silva"
                className={`w-full h-14 pl-12 pr-4 rounded-2xl bg-[#fffafb] border text-base text-[#2b1e22] placeholder:text-[#bda0a8] focus:outline-none transition-all ${
                  touched.name && !isNameValid
                    ? 'border-red-400 bg-red-50/40 ring-2 ring-red-200'
                    : 'border-[#fbd2dc] focus:border-[#e64980] focus:bg-white focus:ring-2 focus:ring-[#e64980]/20'
                }`}
              />
            </div>
            {touched.name && !isNameValid && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Por favor, informe seu nome completo (mínimo 3 caracteres).</span>
              </p>
            )}
          </div>

          {/* Campo Telefone com DDD */}
          <div>
            <label
              htmlFor="clientPhone"
              className="block text-xs font-bold uppercase tracking-wider text-[#a61e4d] mb-1.5"
            >
              Telefone / WhatsApp com DDD <span className="text-[#e64980]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#e64980]">
                <Phone className="w-5 h-5" />
              </div>
              <input
                id="clientPhone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={clientPhone}
                onChange={handlePhoneChange}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                placeholder="(18) 99999-9999"
                className={`w-full h-14 pl-12 pr-4 rounded-2xl bg-[#fffafb] border text-base text-[#2b1e22] placeholder:text-[#bda0a8] focus:outline-none transition-all tabular-nums ${
                  touched.phone && !isPhoneValid
                    ? 'border-red-400 bg-red-50/40 ring-2 ring-red-200'
                    : 'border-[#fbd2dc] focus:border-[#e64980] focus:bg-white focus:ring-2 focus:ring-[#e64980]/20'
                }`}
              />
            </div>
            {touched.phone && !isPhoneValid && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Informe seu número com DDD (Ex: 18 99673-2692).</span>
              </p>
            )}
          </div>

          {/* Campo Observações (Opcional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="clientNotes"
                className="block text-xs font-bold uppercase tracking-wider text-[#a61e4d]"
              >
                Observações
              </label>
              <span className="text-[11px] text-[#9c6a76] font-medium">Opcional</span>
            </div>
            <div className="relative">
              <div className="absolute top-3.5 left-4 pointer-events-none text-[#e64980]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                id="clientNotes"
                rows={3}
                value={clientNotes}
                onChange={(e) => onChangeNotes(e.target.value)}
                placeholder="Ex: Tenho alergia a algum produto, desejo um penteado para festa à noite, detalhes sobre espessura da trança nagô, etc."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#fffafb] border border-[#fbd2dc] text-sm text-[#2b1e22] placeholder:text-[#bda0a8] focus:outline-none focus:border-[#e64980] focus:bg-white focus:ring-2 focus:ring-[#e64980]/20 transition-all resize-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#8e5c67]">
              Adicione qualquer detalhe ou preferência para a maquiadora já ficar ciente.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-[#fff0f4] border border-[#fcc2d7] flex items-center gap-2.5 text-xs text-[#a61e4d] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#e64980] shrink-0" />
            <span>
              Sem necessidade de cadastro. Seus dados são utilizados exclusivamente para preencher sua mensagem de agendamento.
            </span>
          </div>

          {/* Botão de envio no próprio formulário */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#e64980] to-[#c23a5b] hover:from-[#f06595] hover:to-[#d6336c] text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#e64980]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar para o Resumo</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* BARRA FIXA PERMANENTE NA PARTE INFERIOR DA TELA */}
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
            <span className="text-xs font-bold text-[#b32b50] block truncate">
              {clientName.trim() ? clientName : 'Preencha seus dados'}
            </span>
            <span className="text-[11px] text-[#8e5c67] block truncate">
              {isFormValid ? 'Tudo pronto para conferir' : 'Nome e telefone obrigatórios'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-[#e64980] to-[#c23a5b] hover:from-[#f06595] hover:to-[#d6336c] text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-[#e64980]/30 flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-all"
          >
            <span>Ver Resumo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
