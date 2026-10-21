import { useState } from 'react';
import { MESA_11_FUNCTIONS } from '../data/mockData';
import { MesaFunction } from '../types/mes';
import { CheckCircle2, ChevronRight, BookOpen, Layers, ShieldCheck, Cpu } from 'lucide-react';

export const MesaFunctionsModule = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeFuncId, setActiveFuncId] = useState<number>(1);

  const categories = [
    { id: 'todos', label: 'Todas as 11 Funções' },
    { id: 'execucao', label: 'Execução & Controle' },
    { id: 'planejamento', label: 'Planejamento & Recursos' },
    { id: 'qualidade', label: 'Qualidade & Rastreabilidade' },
    { id: 'analise', label: 'Análise de Performance' },
  ];

  const filteredFunctions = MESA_11_FUNCTIONS.filter((fn) => {
    if (selectedCategory === 'todos') return true;
    return fn.category === selectedCategory;
  });

  const activeFunction: MesaFunction =
    MESA_11_FUNCTIONS.find((fn) => fn.id === activeFuncId) || MESA_11_FUNCTIONS[0];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <span>MODELO MESA INTERNATIONAL</span>
            <span aria-hidden="true">·</span>
            <span>PADRÃO GLOBAL DA MANUFATURA</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            As 11 Funções Essenciais de um Sistema MES
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Em 1997, a <strong>MESA (Manufacturing Enterprise Solutions Association)</strong> estabeleceu os 11 pilares funcionais que um sistema precisa abranger para ser legitimamente classificado como um MES completo. Conheça cada uma e como atuam no dia a dia fabril.
          </p>

          {/* Category Filter */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 11 Functions List & Detailed Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive List */}
        <div className="lg:col-span-5 space-y-2">
          {filteredFunctions.map((fn) => {
            const isSelected = fn.id === activeFunction.id;

            return (
              <button
                key={fn.id}
                onClick={() => setActiveFuncId(fn.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    Função {fn.id < 10 ? `0${fn.id}` : fn.id}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {fn.category}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-1 truncate">
                  {fn.title}
                </h3>

                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {fn.titleEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Deep Dive Card */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-600">
              <span>PILAR MESA #{activeFunction.id}</span>
              <span aria-hidden="true">·</span>
              <span>{activeFunction.titleEn}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {activeFunction.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {activeFunction.shortDesc}
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              O Que o MES Faz Nesta Função
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {activeFunction.detailedExplanation}
            </p>
          </div>

          {/* Real Application */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Exemplo Real no Chão de Fábrica
            </h4>
            <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 text-xs sm:text-sm text-blue-950 leading-relaxed">
              {activeFunction.shopFloorApplication}
            </div>
          </div>

          {/* Business Benefit */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Benefício Direto para a Indústria
            </h4>
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              ✓ {activeFunction.benefit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
