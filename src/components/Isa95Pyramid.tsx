import { useState } from 'react';
import { ISA95_LEVELS } from '../data/mockData';
import { Isa95Level } from '../types/mes';
import { ArrowRight, Layers, Cpu, Server, Database, Activity, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface Isa95PyramidProps {
  onGoToSimulator: () => void;
}

export const Isa95Pyramid = ({ onGoToSimulator }: Isa95PyramidProps) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(3); // MES as default
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimulatingFlow, setIsSimulatingFlow] = useState<boolean>(false);

  const activeLevelData: Isa95Level =
    ISA95_LEVELS.find((l) => l.level === selectedLevel) || ISA95_LEVELS[1];

  const simulationSteps = [
    {
      title: '1. ERP cria a Ordem de Produção (OP)',
      from: 'Nível 4 (ERP)',
      to: 'Nível 3 (MES)',
      protocol: 'REST API / IDoc',
      desc: 'O ERP calcula a demanda de vendas e envia: "Produzir 10.000 frascos do lote L-88 com BOM de materiais".',
    },
    {
      title: '2. MES programa e despacha para a Linha',
      from: 'Nível 3 (MES)',
      to: 'Nível 2/1 (SCADA & CLP)',
      protocol: 'OPC-UA / MQTT',
      desc: 'O MES verifica disponibilidade de máquinas, qualificação dos operadores e envia receitas e setpoints.',
    },
    {
      title: '3. CLP & Sensores executam o ciclo físico',
      from: 'Nível 1 & 0',
      to: 'Chão de Fábrica',
      protocol: 'PROFINET / IO-Link',
      desc: 'Motores acionam esteiras, atuadores dosam o líquido e barreiras fotoelétricas contam cada frasco em 2,8s.',
    },
    {
      title: '4. CLP envia contagem e alarmes ao MES',
      from: 'Nível 1 (CLP)',
      to: 'Nível 3 (MES)',
      protocol: 'OPC-UA / WebSockets',
      desc: 'O MES registra instantaneamente: peças boas, refugos e calcula Disponibilidade, Performance e Qualidade (OEE).',
    },
    {
      title: '5. MES aponta fechamento e custos ao ERP',
      from: 'Nível 3 (MES)',
      to: 'Nível 4 (ERP)',
      protocol: 'REST API / OData',
      desc: 'O MES dá baixa no estoque de matéria-prima, registra refugo real e envia custo fabril consolidado para a contabilidade.',
    },
  ];

  const handleRunFlowStep = () => {
    setIsSimulatingFlow(true);
    setSimStep((prev) => (prev + 1) % simulationSteps.length);
  };

  return (
    <div className="space-y-10">
      {/* Editorial Hero Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <span>NORMA INTERNACIONAL ANSI/ISA-95</span>
            <span aria-hidden="true">·</span>
            <span>IEC 62264</span>
            <span aria-hidden="true">·</span>
            <span>INDÚSTRIA 4.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
            O que é um Sistema MES na Indústria?
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            O <strong className="text-slate-900 font-semibold">MES (Manufacturing Execution System)</strong> ou <em>Sistema de Execução da Manufatura</em> é a plataforma digital que gerencia, monitora e rastreia em tempo real todas as atividades de produção ocorrendo no chão de fábrica — desde o recebimento da matéria-prima até o produto acabado.
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Ele preenche a lacuna histórica entre o mundo corporativo de negócios (<strong className="text-slate-800">ERP</strong>, focado em semanas/dias) e o mundo de controle de automação (<strong className="text-slate-800">CLPs e SCADA</strong>, focado em milissegundos). Sem o MES, a fábrica opera "às cegas", dependendo de pranchetas de papel e planilhas atrasadas.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onGoToSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Ver Chão de Fábrica ao Vivo
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedLevel(3)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg transition-colors"
            >
              Examinar o Nível MES (ISA-95 Nível 3)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive ISA-95 Pyramid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Visual Pyramid (5 Levels) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Pirâmide de Automação ISA-95</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique em cada nível para entender sua função e integração com o MES.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {ISA95_LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl.level;
              const isMes = lvl.level === 3;

              // Trapezoid-like visual widths
              const widthClasses = {
                4: 'w-7/12 mx-auto',
                3: 'w-8/12 mx-auto',
                2: 'w-9/12 mx-auto',
                1: 'w-10/12 mx-auto',
                0: 'w-full',
              }[lvl.level as 4 | 3 | 2 | 1 | 0];

              return (
                <button
                  key={lvl.level}
                  onClick={() => setSelectedLevel(lvl.level)}
                  className={`w-full text-left transition-all duration-150 rounded-lg p-3 relative border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                      : isMes
                      ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isMes
                            ? 'bg-amber-500 text-white'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Nível {lvl.level}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {lvl.acronym}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {lvl.timeHorizon}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {lvl.name}
                  </p>

                  {isMes && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
                      <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Coração Operacional · Ponte TI / TA</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>TI (Tecnologia da Informação)</span>
              <span className="text-slate-400">vs</span>
              <span>TA (Tecnologia da Operação)</span>
            </div>
            <p className="text-slate-500 leading-normal">
              O MES é o ponto de convergência de <strong>IT/OT</strong>: traduz métricas corporativas de negócio (financeiro, pedidos) em comandos e controles de chão de fábrica (velocidade, OEE, refugo).
            </p>
          </div>
        </div>

        {/* Right: Detailed Deep Dive of the selected Level */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-mono font-semibold text-blue-600">
                NÍVEL {activeLevelData.level} · {activeLevelData.acronym}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {activeLevelData.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Horizonte Temporal</span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                {activeLevelData.timeHorizon}
              </span>
            </div>
          </div>

          {/* Primary Role */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Função Principal
            </h4>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
              {activeLevelData.primaryRole}
            </p>
          </div>

          {/* Interação Direta com o MES */}
          <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1.5">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4 text-blue-600" />
              Interação com o Sistema MES (Nível 3)
            </h4>
            <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
              {activeLevelData.mesInteraction}
            </p>
          </div>

          {/* Dados Chave & Exemplos de Mercado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Exemplos de Softwares / Equipamentos
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeLevelData.examples.map((ex, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Protocolos & Interfaces Típicos
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeLevelData.protocols.map((prot, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                  >
                    {prot}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dados Manipulados */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Dados e Objetos Transitados
            </span>
            <p className="text-xs font-mono text-slate-700 mt-1 bg-slate-50 p-2.5 rounded border border-slate-200">
              {activeLevelData.keyData}
            </p>
          </div>
        </div>
      </div>

      {/* Live Data Flow Simulator (ERP <-> MES <-> PLC) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span>SIMULAÇÃO DE FLUXO DE DADOS</span>
              <span aria-hidden="true">·</span>
              <span>PASSO A PASSO</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              Como os Dados Fluem na Prática entre ERP, MES e Máquinas
            </h3>
          </div>

          <button
            onClick={handleRunFlowStep}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            Avançar Passo ({simStep + 1} de {simulationSteps.length})
          </button>
        </div>

        {/* Steps indicator bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {simulationSteps.map((step, idx) => {
            const isActive = simStep === idx;
            const isDone = simStep > idx;

            return (
              <button
                key={idx}
                onClick={() => setSimStep(idx)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-xs'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-500 mb-0.5">
                  Etapa {idx + 1}
                </div>
                <div className="text-xs truncate">{step.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active step explanation box */}
        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <span className="font-bold text-sm text-slate-900">
              {simulationSteps[simStep].title}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Origem: {simulationSteps[simStep].from}
              </span>
              <span>→</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                Destino: {simulationSteps[simStep].to}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {simulationSteps[simStep].protocol}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {simulationSteps[simStep].desc}
          </p>
        </div>
      </div>

      {/* 4 Grandes Perguntas Respondidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <h4 className="font-bold text-sm text-slate-900">
            1. Por que o ERP sozinho não resolve o chão de fábrica?
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            O ERP é transacional e trabalha com ordens de dias/semanas. Ele não sabe se uma esteira parou por 3 minutos por falta de ar comprimido, nem mede o ciclo de cada peça para calcular OEE em tempo real.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <h4 className="font-bold text-sm text-slate-900">
            2. Por que o SCADA sozinho não substitui o MES?
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            O SCADA é focado no processo e na máquina (temperatura, pressão, ligar/desligar motor). Ele não gerencia ordens de produção, não faz genealogia de lote, nem calcula custos de refugo ou gerencia matriz de qualificação de operadores.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <h4 className="font-bold text-sm text-slate-900">
            3. Qual o retorno sobre o investimento (ROI)?
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Em média, a implantação de um MES eleva o OEE de 5% a 15%, reduz o refugo (scrap) em até 30%, diminui estoques em processo (WIP) e elimina 100% dos erros de lançamento manual de dados em papel.
          </p>
        </div>
      </div>
    </div>
  );
};
