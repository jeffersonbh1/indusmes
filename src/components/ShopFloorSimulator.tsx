import { useState, useEffect } from 'react';
import { ProductionLine, MachineStation } from '../types/mes';
import { Play, Pause, AlertTriangle, Wrench, RotateCcw, Plus, Zap, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';

interface ShopFloorSimulatorProps {
  lines: ProductionLine[];
  onUpdateStation: (lineId: string, stationId: string, updates: Partial<MachineStation>) => void;
  onInjectScrap: (lineId: string, stationId: string, reason: string) => void;
  onSimulateBatch: (lineId: string) => void;
}

export const ShopFloorSimulator = ({
  lines,
  onUpdateStation,
  onInjectScrap,
  onSimulateBatch
}: ShopFloorSimulatorProps) => {
  const [selectedLineId, setSelectedLineId] = useState<string>(lines[0]?.id || 'linha-01');
  const [selectedStationId, setSelectedStationId] = useState<string>(lines[0]?.stations[0]?.id || 'st-01');
  const [stopReasonModalOpen, setStopReasonModalOpen] = useState<boolean>(false);
  const [customStopReason, setCustomStopReason] = useState<string>('Troca de Ferramenta / Setup');
  const [scrapReasonModalOpen, setScrapReasonModalOpen] = useState<boolean>(false);
  const [customScrapReason, setCustomScrapReason] = useState<string>('Defeito Dimensional fora de tolerância');

  const currentLine = lines.find((l) => l.id === selectedLineId) || lines[0];
  const currentStation =
    currentLine.stations.find((s) => s.id === selectedStationId) || currentLine.stations[0];

  // Calculate OEE for current line aggregated across stations
  const totalPlannedTime = currentLine.stations.reduce((acc, s) => acc + s.totalPlannedTimeMin, 0);
  const totalOperatingTime = currentLine.stations.reduce((acc, s) => acc + s.operatingTimeMin, 0);
  const totalUnits = currentLine.stations.reduce((acc, s) => acc + s.totalUnitsProduced, 0);
  const totalGood = currentLine.stations.reduce((acc, s) => acc + s.goodUnits, 0);
  const totalScrap = currentLine.stations.reduce((acc, s) => acc + s.scrapUnits, 0);

  // Availability = Operating Time / Planned Time
  const availability = totalPlannedTime > 0 ? (totalOperatingTime / totalPlannedTime) * 100 : 0;

  // Quality = Good Units / Total Units
  const quality = totalUnits > 0 ? (totalGood / totalUnits) * 100 : 100;

  // Performance = Ideal Output / Actual Output relative to operating time
  // Weighted performance across stations
  const performanceWeights = currentLine.stations.map((s) => {
    if (s.operatingTimeMin <= 0) return 0;
    const operatingSec = s.operatingTimeMin * 60;
    const idealUnitsPossible = operatingSec / s.idealCycleTimeSec;
    return idealUnitsPossible > 0 ? Math.min(100, (s.totalUnitsProduced / idealUnitsPossible) * 100) : 0;
  });
  const performance =
    performanceWeights.length > 0
      ? performanceWeights.reduce((a, b) => a + b, 0) / performanceWeights.length
      : 0;

  const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

  const getOeeStatusLabel = (val: number) => {
    if (val >= 85) return { label: 'Classe Mundial (World Class)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val >= 70) return { label: 'Operação Típica / Boa', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Crítico / Atenção Necessária', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    running: { label: 'Em Operação', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
    idle: { label: 'Em Espera / Setup', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    stopped: { label: 'Parada Não Programada', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
    maintenance: { label: 'Manutenção Preventiva', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  };

  const handleStopMachine = () => {
    onUpdateStation(currentLine.id, currentStation.id, {
      status: 'stopped',
      stopReason: customStopReason,
      downtimeMin: currentStation.downtimeMin + 15,
      operatingTimeMin: Math.max(0, currentStation.operatingTimeMin - 15),
      currentCycleTimeSec: 0,
    });
    setStopReasonModalOpen(false);
  };

  const handleResumeMachine = () => {
    onUpdateStation(currentLine.id, currentStation.id, {
      status: 'running',
      stopReason: undefined,
      currentCycleTimeSec: currentStation.idealCycleTimeSec * 1.05,
    });
  };

  const handleSpeedChange = (deltaSec: number) => {
    const newCycle = Math.max(0.5, Number((currentStation.currentCycleTimeSec + deltaSec).toFixed(2)));
    onUpdateStation(currentLine.id, currentStation.id, {
      currentCycleTimeSec: newCycle,
    });
  };

  const handleAddScrap = () => {
    onInjectScrap(currentLine.id, currentStation.id, customScrapReason);
    setScrapReasonModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Line Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span>CONTROLE EM TEMPO REAL</span>
              <span aria-hidden="true">·</span>
              <span>NÍVEL 3 (MES SHOP FLOOR)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Simulador de Chão de Fábrica ao Vivo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Experimente a operação real de um MES: alterne estados de máquinas, injete paradas, registre refugos e observe o OEE reagir instantaneamente.
            </p>
          </div>

          {/* Interactive Line Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {lines.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLineId(l.id);
                  setSelectedStationId(l.stations[0]?.id);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedLineId === l.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.name.split('·')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Line Summary Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <strong className="text-slate-900">{currentLine.name}</strong>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Setor: {currentLine.industry}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>OP Ativa: <span className="font-mono font-semibold text-blue-700">{currentLine.activeWorkOrderNumber}</span></span>
          </div>

          <button
            onClick={() => onSimulateBatch(currentLine.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Simular +50 Peças Produzidas
          </button>
        </div>
      </div>

      {/* Real-time OEE KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OEE Geral */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>OEE Geral da Linha</span>
            <span className="font-mono text-[11px]">D × P × Q</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {oee.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                oee >= 85 ? 'bg-emerald-500' : oee >= 70 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, oee)}%` }}
            />
          </div>
          <div className={`text-[11px] font-semibold px-2 py-0.5 rounded border inline-block ${getOeeStatusLabel(oee).color}`}>
            {getOeeStatusLabel(oee).label}
          </div>
        </div>

        {/* Disponibilidade */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Disponibilidade (D)</span>
            <span className="font-mono text-[11px]">Tempo Op / Planejado</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {availability.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(100, availability)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {totalOperatingTime} min rodados / {totalPlannedTime} min
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Performance (P)</span>
            <span className="font-mono text-[11px]">Ciclo Ideal / Real</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {performance.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${Math.min(100, performance)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Capacidade Nominal: {currentLine.targetHourlyRate} un/h
          </div>
        </div>

        {/* Qualidade */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Qualidade (Q)</span>
            <span className="font-mono text-[11px]">Peças Boas / Total</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {quality.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${Math.min(100, quality)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {totalGood.toLocaleString()} boas / {totalScrap.toLocaleString()} refugo
          </div>
        </div>
      </div>

      {/* Shop Floor Stations Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Estações de Trabalho & Máquinas da Linha
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione uma estação para inspecionar parâmetros técnicos e simular eventos de chão de fábrica.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {currentLine.stations.length} Estações Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {currentLine.stations.map((st) => {
            const isSelected = st.id === currentStation.id;
            const config = statusConfig[st.status] || statusConfig.idle;
            const stationScrapRate = st.totalUnitsProduced > 0 ? (st.scrapUnits / st.totalUnitsProduced) * 100 : 0;

            return (
              <button
                key={st.id}
                onClick={() => setSelectedStationId(st.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {st.code}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${config.bg} ${config.text} ${config.border}`}>
                    {config.label}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2 truncate">
                  {st.name}
                </h3>

                {st.stopReason && (
                  <p className="text-[11px] text-red-600 mt-1 line-clamp-1 italic">
                    Motivo: {st.stopReason}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ciclo</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {st.currentCycleTimeSec > 0 ? `${st.currentCycleTimeSec}s` : 'Parado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Refugo</span>
                    <span className={`font-semibold tabular-nums ${st.scrapUnits > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                      {st.scrapUnits} un ({stationScrapRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Station Technical Inspector & Live Interaction Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-blue-600">
              TERMINAL IHM/MES DA ESTAÇÃO · {currentStation.code}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {currentStation.name}
            </h3>
          </div>

          {/* Machine Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {currentStation.status === 'running' ? (
              <button
                onClick={() => setStopReasonModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                Registrar Parada de Máquina
              </button>
            ) : (
              <button
                onClick={handleResumeMachine}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Retomar Operação
              </button>
            )}

            <button
              onClick={() => setScrapReasonModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Apontar Peça Refugada (Scrap)
            </button>
          </div>
        </div>

        {/* Telemetry and Controls Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Station Live Telemetry Readout */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Variáveis Físicas & Contadores Coletados pelo MES
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Tempo de Ciclo Atual</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentStation.currentCycleTimeSec > 0 ? `${currentStation.currentCycleTimeSec}s` : '0.0s'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Ideal: {currentStation.idealCycleTimeSec}s
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Temperatura do Processo</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentStation.temperatureC}°C
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Sensor Pt100 / Termopar
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Pressão Operacional</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentStation.pressureBar} bar
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Transdutor pneumático
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Peças Boas Produzidas</span>
                <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                  {currentStation.goodUnits.toLocaleString()} un
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Contador ótico Nível 1
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Refugos Registrados</span>
                <span className="text-lg font-bold font-mono text-red-700 tabular-nums">
                  {currentStation.scrapUnits} un
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Taxa: {((currentStation.scrapUnits / (currentStation.totalUnitsProduced || 1)) * 100).toFixed(2)}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Tempo Total de Parada</span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentStation.downtimeMin} min
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Última rev: {currentStation.lastMaintenanceDate}
                </span>
              </div>
            </div>

            {/* Cycle Speed Fine Tuning */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Ajuste Fino de Velocidade da Máquina
                </span>
                <span className="text-[11px] text-slate-500">
                  Simule perda de velocidade (impacta diretamente a métrica de Performance do OEE).
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSpeedChange(-0.2)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
                >
                  -0.2s (Mais Rápido)
                </button>
                <button
                  onClick={() => handleSpeedChange(+0.5)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
                >
                  +0.5s (Mais Lento)
                </button>
              </div>
            </div>
          </div>

          {/* Right: What the MES is doing right now */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                LOGGER DO MOTOR MES (BACKGROUND)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                OPC-UA node: ns=2;s={currentStation.code}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 font-mono">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Status da conexão CLP: <strong>Sincronizado</strong> (Latência 12ms)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Ordem de Produção ativa: <strong>{currentLine.activeWorkOrderNumber}</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Intertravamento de segurança: <strong>Em conformidade (NR-12)</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Disponibilidade calculada: <strong>{((currentStation.operatingTimeMin / currentStation.totalPlannedTimeMin) * 100).toFixed(1)}%</strong>
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded border border-slate-700 text-[11px] text-slate-300 leading-relaxed">
              <strong>Como o MES age aqui:</strong> Em vez de um operador anotar em uma folha no final do dia "máquina parou um pouco", o MES captura o início e fim da parada no milissegundo em que o sensor parou de pulsar e força o operador a apontar a justificativa.
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Justificar Parada de Máquina */}
      {stopReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Apontamento de Motivo de Parada (MES)
            </h3>
            <p className="text-xs text-slate-500">
              O sistema MES exige a classificação da parada para alimentar a árvore de perdas (TPM) e cálculo da Disponibilidade.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Selecione o Motivo da Parada:
              </label>
              {[
                'Troca de Ferramenta / Setup',
                'Falta de Matéria-Prima na Linha',
                'Falha Mecânica no Atuador Pneumático',
                'Ajuste de Temperatura e Calibração',
                'Aguardando Liberação da Garantia da Qualidade',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCustomStopReason(reason)}
                  className={`w-full text-left p-2.5 rounded text-xs border transition-colors ${
                    customStopReason === reason
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStopReasonModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleStopMachine}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Confirmar Parada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Apontar Refugo / Defeito */}
      {scrapReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Apontamento de Refugo / Scrap (Qualidade)
            </h3>
            <p className="text-xs text-slate-500">
              Registra uma unidade refugada e atualiza o Pareto de defeitos do lote em tempo real.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Motivo do Defeito de Qualidade:
              </label>
              {[
                'Defeito Dimensional fora de tolerância',
                'Tampa ou embalagem danificada/riscada',
                'Volume de dosagem abaixo do limite inferior',
                'Falha na leitura do código Datamatrix',
                'Trinca térmica ou deformação mecânica',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCustomScrapReason(reason)}
                  className={`w-full text-left p-2.5 rounded text-xs border transition-colors ${
                    customScrapReason === reason
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setScrapReasonModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddScrap}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700"
              >
                Confirmar Refugo (+1 Peça)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
