import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, AlertTriangle, ShieldCheck, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SaaSPricing: React.FC = () => {
  const { user, upgradePlan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSelectPlan = async (planId: 'free' | 'premium' | 'enterprise') => {
    if (user?.plan === planId) return;

    setLoadingPlan(planId);
    setSuccessMsg('');

    // Simulate standard secure payment processing gateways (e.g. Stripe, ASAAS)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await upgradePlan(planId);
      
      setSuccessMsg(`Parabéns! Sua assinatura foi atualizada para o plano ${planId.toUpperCase()} com sucesso!`);
      
      // Celebrate
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Plano Gratuito',
      price: 'R$ 0',
      period: 'para sempre',
      description: 'Ideal para controle pessoal básico',
      features: [
        'Dashboard financeiro simples',
        'Até 10 transações por mês',
        'Cadastro de categorias',
        'Tema Escuro / Light',
        'Metas de hábitos diários'
      ],
      limitations: [
        'Sem gráficos avançados de tendências',
        'Exportação restrita a PDF básico',
        'Sem suporte dedicado'
      ],
      color: 'border-slate-200 dark:border-slate-800'
    },
    {
      id: 'premium',
      name: 'Premium Pro',
      price: 'R$ 29,90',
      period: 'por mês',
      description: 'Perfeito para investidores e freelancers',
      features: [
        'Transações ILIMITADAS',
        'Todos os gráficos avançados (recharts)',
        'Filtros por período e buscas textuais',
        'Exportação completa em PDF, Excel e CSV',
        'Acesso completo a metas e rotinas',
        'Suporte prioritário via WhatsApp'
      ],
      limitations: [],
      color: 'border-blue-500 dark:border-blue-500/80 shadow-md shadow-blue-500/10 scale-105 relative',
      highlight: true
    },
    {
      id: 'enterprise',
      name: 'Corporate',
      price: 'R$ 79,90',
      period: 'por mês',
      description: 'Inteligência executiva avançada',
      features: [
        'Tudo do plano Premium Pro',
        'Painel administrativo completo',
        'Logs de auditoria e acesso detalhados',
        'Múltiplos perfis (multi-user)',
        'Previsão de caixa baseada em IA (Simulada)',
        'Gerente de contas dedicado'
      ],
      limitations: [],
      color: 'border-violet-500 dark:border-violet-500/80'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header text */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl text-slate-900 dark:text-white">
          Escolha o Plano Ideal para Suas Finanças
        </h2>
        <p className="text-sm text-slate-400">
          Acesse métricas exclusivas, relatórios avançados e automatizações inteligentes. Troque de plano a qualquer momento para testar.
        </p>
      </div>

      {/* Success alert message */}
      {successMsg && (
        <div className="max-w-4xl mx-auto rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 shrink-0 animate-pulse" />
          {successMsg}
        </div>
      )}

      {/* Plans List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch pt-5">
        {plans.map((p) => {
          const isCurrent = user?.plan === p.id;
          const isLoading = loadingPlan === p.id;

          return (
            <div
              key={p.id}
              className={`glass-card p-8 rounded-3xl border ${p.color} flex flex-col justify-between`}
            >
              {p.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Mais Recomendado
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                
                <div className="mt-5 flex items-baseline gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans">{p.price}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ {p.period}</span>
                </div>

                {/* Features list */}
                <ul className="mt-6 space-y-3">
                  {p.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {p.limitations.map((limit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400 dark:text-slate-500">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-through">{limit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <button
                  onClick={() => handleSelectPlan(p.id as any)}
                  disabled={isCurrent || isLoading || loadingPlan !== null}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
                    ${isCurrent
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                      : p.highlight
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/15'
                        : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200'
                    }
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrent ? (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Plano Atual
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      {p.id === 'free' ? 'Escolher Plano Grátis' : 'Simular Assinatura'}
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Guarantee Badge */}
      <div className="max-w-md mx-auto text-center border-t border-slate-100 dark:border-slate-900 pt-6">
        <span className="text-[10px] text-slate-450 uppercase tracking-widest font-bold block mb-1">Pagamentos Seguros Garantidos</span>
        <p className="text-[10px] text-slate-400">Ambiente de sandbox seguro. Nenhuma cobrança real será feita ao cartão.</p>
      </div>

    </div>
  );
};
