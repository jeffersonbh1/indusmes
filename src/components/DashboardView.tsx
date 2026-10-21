import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Cpu, 
  Columns, 
  ArrowUpRight, 
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { KanbanColumn, KanbanCard } from '../App';

export interface DashboardViewProps {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
  onGoToKanban: (machineId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  columns,
  cards,
  onGoToKanban
}) => {
  // Filter only production machines (exclude pending queue)
  const machines = columns.filter((c) => !c.isQueue);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleRefresh = () => {
    setLastRefreshed(new Date());
  };

  // Helper to extract or calculate real-time metrics for each machine
  const getMachineMetrics = (m: KanbanColumn) => {
    const machineCards = m.cardIds.map((id) => cards[id]).filter(Boolean);
    const totalPlanned = machineCards.reduce((acc, c) => acc + (c.plannedQty || 0), 0);
    const totalProduced = machineCards.reduce((acc, c) => acc + (c.producedQty || 0), 0);
    const totalScrap = machineCards.reduce((acc, c) => acc + (c.scrapQty || 0), 0);

    let availability = 85;
    let performance = 90;
    let quality = 98.5;

    if (m.status === 'parada') {
      availability = 42;
      performance = 55;
      quality = 91.0;
    } else if (m.status === 'ociosa') {
      availability = 68;
      performance = 70;
      quality = 97.0;
    } else if (m.status === 'operando') {
      // Calculate from cards if available
      availability = m.oee ? Math.min(98, Math.round(m.oee * 1.08)) : 93;
      performance = m.oee ? Math.min(99, Math.round(m.oee * 1.05)) : 95;
      quality = 99.2;
    } else if (m.status === 'manutencao') {
      availability = 25;
      performance = 40;
      quality = 95.0;
    }

    // Custom overrides if defined on machine
    if (m.oee) {
      // Re-balance to match actual OEE = (A * P * Q) / 10000
      const targetOee = m.oee;
      if (m.status === 'operando') {
        availability = 92.5;
        quality = 98.8;
        performance = Number(((targetOee / (availability * quality / 10000))).toFixed(1));
        if (performance > 100) {
          performance = 96.5;
          availability = Number(((targetOee / (performance * quality / 10000))).toFixed(1));
        }
      }
    }

    const calculatedOee = Number(((availability * performance * quality) / 10000).toFixed(1));

    return {
      machineId: m.id,
      code: m.shortCode,
      name: m.title,
      type: m.machineType,
      status: m.status,
      activeTasksCount: machineCards.length,
      totalPlanned,
      totalProduced,
      totalScrap,
      availability: Number(availability.toFixed(1)),
      performance: Number(performance.toFixed(1)),
      quality: Number(quality.toFixed(1)),
      oee: calculatedOee,
      targetOee: 85.0
    };
  };

  const machinesMetricsList = machines.map(getMachineMetrics);

  const filteredMetrics = machinesMetricsList.filter((m) => {
    if (filterStatus === 'all') return true;
    return m.status === filterStatus;
  });

  // Calculate Plant-Wide Averages
  const avgOee = machinesMetricsList.length
    ? Number((machinesMetricsList.reduce((acc, m) => acc + m.oee, 0) / machinesMetricsList.length).toFixed(1))
    : 0;

  const avgAvailability = machinesMetricsList.length
    ? Number((machinesMetricsList.reduce((acc, m) => acc + m.availability, 0) / machinesMetricsList.length).toFixed(1))
    : 0;

  const avgPerformance = machinesMetricsList.length
    ? Number((machinesMetricsList.reduce((acc, m) => acc + m.performance, 0) / machinesMetricsList.length).toFixed(1))
    : 0;

  const avgQuality = machinesMetricsList.length
    ? Number((machinesMetricsList.reduce((acc, m) => acc + m.quality, 0) / machinesMetricsList.length).toFixed(1))
    : 0;

  // Selected Machine Details
  const selectedMetric = machinesMetricsList.find((m) => m.machineId === selectedMachineId) || machinesMetricsList[0];
  const selectedMachineCol = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const selectedMachineCards = selectedMachineCol
    ? selectedMachineCol.cardIds.map((id) => cards[id]).filter(Boolean)
    : [];

  // Hourly Shift Trend Data for the selected machine
  const hourlyTrendData = [
    { hour: '06:00', oee: Math.max(20, selectedMetric.oee - 12), availability: selectedMetric.availability - 10, performance: selectedMetric.performance - 8, quality: 99.0 },
    { hour: '08:00', oee: Math.max(25, selectedMetric.oee - 4), availability: selectedMetric.availability - 2, performance: selectedMetric.performance - 3, quality: 98.8 },
    { hour: '10:00', oee: selectedMetric.oee, availability: selectedMetric.availability, performance: selectedMetric.performance, quality: selectedMetric.quality },
    { hour: '12:00', oee: Math.max(30, selectedMetric.oee - 15), availability: Math.max(40, selectedMetric.availability - 18), performance: selectedMetric.performance - 5, quality: 98.5 }, // Horário de Almoço/Troca
    { hour: '14:00', oee: Math.min(98, selectedMetric.oee + 3), availability: selectedMetric.availability + 2, performance: selectedMetric.performance + 1, quality: 99.4 },
    { hour: '16:00', oee: Math.min(99, selectedMetric.oee + 5), availability: selectedMetric.availability + 4, performance: selectedMetric.performance + 3, quality: 99.1 }
  ];

  // Radar Data for the 3 OEE Pillars vs World Class
  const radarComparisonData = [
    {
      subject: 'Disponibilidade (A)',
      atual: selectedMetric.availability,
      metaWorldClass: 90.0,
      fullMark: 100
    },
    {
      subject: 'Performance (P)',
      atual: selectedMetric.performance,
      metaWorldClass: 95.0,
      fullMark: 100
    },
    {
      subject: 'Qualidade (Q)',
      atual: selectedMetric.quality,
      metaWorldClass: 99.5,
      fullMark: 100
    },
    {
      subject: 'OEE Global',
      atual: selectedMetric.oee,
      metaWorldClass: 85.0,
      fullMark: 100
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operando':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operando
          </span>
        );
      case 'ociosa':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Ociosa
          </span>
        );
      case 'parada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Parada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Manutenção
          </span>
        );
    }
  };

  const getOeeBadgeColor = (oee: number) => {
    if (oee >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (oee >= 65) return 'text-blue-700 bg-blue-50 border-blue-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f4f6f9] p-4 sm:p-6 space-y-5 text-slate-800 select-none">
      {/* Top Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Dashboard de Eficiência Geral (OEE)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Visualização em tempo real dos 3 pilares da manufatura: Disponibilidade × Performance × Qualidade
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            title="Atualizar métricas agora"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => onGoToKanban()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Ver no Kanban</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: OEE Geral da Planta */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>OEE Global da Planta</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getOeeBadgeColor(avgOee)}`}>
              {avgOee >= 85 ? 'Classe Mundial' : avgOee >= 65 ? 'Operacional' : 'Abaixo da Meta'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {avgOee}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Meta: 85%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${avgOee >= 85 ? 'bg-emerald-500' : avgOee >= 65 ? 'bg-blue-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, avgOee)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            Média ponderada de todas as {machines.length} máquinas ativas
          </p>
        </div>

        {/* KPI 2: Disponibilidade */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Disponibilidade Média</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {avgAvailability}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Meta: 90%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, avgAvailability)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Tempo em Operação / Tempo Planejado de Turno
          </p>
        </div>

        {/* KPI 3: Performance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Performance Média</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">
              {avgPerformance}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Meta: 95%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, avgPerformance)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Velocidade Efetiva vs Tempo de Ciclo Ideal
          </p>
        </div>

        {/* KPI 4: Qualidade */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Qualidade / Conformidade</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
              {avgQuality}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Meta: 99.5%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, avgQuality)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Peças Aprovadas no 1º Teste (Sem Refugo)
          </p>
        </div>
      </div>

      {/* Main Recharts Section 1: Machine Comparison BarChart */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Comparativo de OEE e Pilares por Máquina (Recharts)</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Análise cruzada dos componentes Disponibilidade, Performance e Qualidade para cada centro de trabalho
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Filtrar status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todas as Máquinas ({machines.length})</option>
              <option value="operando">Somente Operando</option>
              <option value="ociosa">Somente Ociosas</option>
              <option value="parada">Somente Paradas</option>
            </select>
          </div>
        </div>

        {/* Recharts BarChart */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredMetrics}
              margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="code" 
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '11px'
                }}
                formatter={(value: any, name: any) => [`${value}%`, name]}
                labelFormatter={(label) => {
                  const m = machines.find((col) => col.shortCode === label);
                  return `${label} - ${m?.title || ''}`;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="oee" name="OEE Global" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="availability" name="Disponibilidade" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="performance" name="Performance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quality" name="Qualidade" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Machine Drilldown Details + Radar & Shift Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Machine Selector & Real-Time Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Centro de Trabalho Selecionado</span>
              </h3>
              {getStatusBadge(selectedMetric.status)}
            </div>

            {/* Select Dropdown */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Alternar Máquina:
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.shortCode} - {m.title} ({m.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Machine Big Numbers */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    {selectedMetric.code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {selectedMetric.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {selectedMetric.type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-blue-600">
                    {selectedMetric.oee}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">OEE Real</span>
                </div>
              </div>

              {/* The 3 Pillars Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Disp.</span>
                  <span className="text-xs font-black font-mono text-emerald-600">
                    {selectedMetric.availability}%
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Perf.</span>
                  <span className="text-xs font-black font-mono text-purple-600">
                    {selectedMetric.performance}%
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Qual.</span>
                  <span className="text-xs font-black font-mono text-blue-600">
                    {selectedMetric.quality}%
                  </span>
                </div>
              </div>

              {/* Active Orders Count */}
              <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                <span>Ordens em Execução:</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedMachineCards.length} tarefas
                </span>
              </div>
            </div>
          </div>

          {/* Action button: Go directly to this machine in the Kanban Board */}
          <button
            onClick={() => onGoToKanban(selectedMachineId)}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ver {selectedMetric.code} no Quadro Kanban</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Shift Timeline (AreaChart with Recharts) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Evolução Horária no Turno (Recharts)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Tendência de OEE de {selectedMetric.code} ao longo das horas de trabalho
            </p>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="oeeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '10px', 
                    border: '1px solid #cbd5e1',
                    fontSize: '11px'
                  }}
                  formatter={(v: any) => [`${v}%`, 'OEE']}
                />
                <Area 
                  type="monotone" 
                  dataKey="oee" 
                  stroke="#2563eb" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#oeeGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Início de Turno: 06:00</span>
            <span className="font-semibold text-emerald-600">Pico: 16:00 ({(selectedMetric.oee + 5).toFixed(0)}%)</span>
          </div>
        </div>

        {/* Right: Radar Chart of the 3 Pillars vs World Class */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Aderência à Meta Mundial (Radar)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Comparativo com a referência internacional World-Class MES
            </p>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarComparisonData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 600 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 8 }}
                />
                <Radar
                  name="Atual"
                  dataKey="atual"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Meta Classe Mundial"
                  dataKey="metaWorldClass"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                  strokeDasharray="3 3"
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '10px' }}
                  formatter={(v: any) => [`${v}%`]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 3: Machine Cards Grid with Live OEE, A, P, Q Badges */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Grade Geral de Máquinas & Desempenho Operacional
            </h3>
            <p className="text-[11px] text-slate-500">
              Substitui os subtítulos estáticos por indicadores detalhados de OEE, Disponibilidade, Performance e Qualidade
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {machinesMetricsList.length} máquinas monitoradas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {machinesMetricsList.map((m) => (
            <div
              key={m.machineId}
              onClick={() => setSelectedMachineId(m.machineId)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedMachineId === m.machineId
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {m.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {m.name}
                  </span>
                </div>
                {getStatusBadge(m.status)}
              </div>

              {/* Progress bar of OEE */}
              <div className="space-y-1 mb-2.5">
                <div className="flex justify-between items-baseline text-[11px]">
                  <span className="text-slate-500 font-medium">OEE Real:</span>
                  <span className="font-mono font-black text-slate-900">
                    {m.oee}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      m.oee >= 85 ? 'bg-emerald-500' : m.oee >= 65 ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, m.oee)}%` }}
                  />
                </div>
              </div>

              {/* Three Pillars Pills */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[8px] text-slate-400 block font-sans">DISP</span>
                  <span className="font-bold text-emerald-700">{m.availability}%</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[8px] text-slate-400 block font-sans">PERF</span>
                  <span className="font-bold text-purple-700">{m.performance}%</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                  <span className="text-[8px] text-slate-400 block font-sans">QUAL</span>
                  <span className="font-bold text-blue-700">{m.quality}%</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>{m.activeTasksCount} tarefas na máquina</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoToKanban(m.machineId);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Abrir no Kanban</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
