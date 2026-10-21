import { useState } from 'react';
import { WorkOrder, ProductionLine } from '../types/mes';
import { Plus, CheckCircle, Clock, AlertCircle, Play, Pause, FileText, BarChart2 } from 'lucide-react';

interface WorkOrdersModuleProps {
  workOrders: WorkOrder[];
  lines: ProductionLine[];
  onCreateWorkOrder: (newWo: Omit<WorkOrder, 'id' | 'producedQuantity' | 'scrapQuantity' | 'defectLog'>) => void;
  onUpdateStatus: (woId: string, status: WorkOrder['status']) => void;
}

export const WorkOrdersModule = ({
  workOrders,
  lines,
  onCreateWorkOrder,
  onUpdateStatus
}: WorkOrdersModuleProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedWoId, setSelectedWoId] = useState<string>(workOrders[0]?.id || '');
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Form states for new OP
  const [orderNumber, setOrderNumber] = useState<string>(`OP-2026-N${Math.floor(100 + Math.random() * 900)}`);
  const [productName, setProductName] = useState<string>('Dispositivo Médico Auto-Injetor');
  const [productSku, setProductSku] = useState<string>('MED-INJ-2026');
  const [lineId, setLineId] = useState<string>(lines[0]?.id || 'linha-01');
  const [plannedQty, setPlannedQty] = useState<number>(5000);
  const [operatorName, setOperatorName] = useState<string>('Roberto Guimarães (Técnico N3)');
  const [batchNumber, setBatchNumber] = useState<string>(`LOTE-MED-2026-${Math.floor(100 + Math.random() * 900)}`);

  const filteredOrders = workOrders.filter((wo) => {
    if (filter === 'all') return true;
    return wo.status === filter;
  });

  const selectedWo = workOrders.find((w) => w.id === selectedWoId) || workOrders[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateWorkOrder({
      orderNumber,
      productName,
      productSku,
      lineId,
      plannedQuantity: Number(plannedQty),
      status: 'pending',
      operatorName,
      batchNumber,
      startTime: '08:00',
      targetEndTime: '17:00'
    });
    setModalOpen(false);
    // Reset defaults for next
    setOrderNumber(`OP-2026-N${Math.floor(100 + Math.random() * 900)}`);
  };

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'in_progress':
        return { label: 'Em Produção', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' };
      case 'paused':
        return { label: 'Pausada', cls: 'bg-amber-50 text-amber-700 border-amber-300' };
      case 'completed':
        return { label: 'Concluída', cls: 'bg-blue-50 text-blue-700 border-blue-300' };
      default:
        return { label: 'Pendente / Programada', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span>DISPATCHING & SCHEDULING</span>
              <span aria-hidden="true">·</span>
              <span>MESA FUNÇÃO 2</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Gestão de Ordens de Produção (OP)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              No MES, a Ordem de Produção é o fio condutor: conecta a demanda do ERP à realidade dos operadores, contadores de peças e custos de refugo.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Liberar Nova OP para o Chão de Fábrica
          </button>
        </div>

        {/* Filter Bar (interactive segmented control) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'all', label: 'Todas as Ordens' },
              { id: 'in_progress', label: 'Em Produção' },
              { id: 'paused', label: 'Pausadas' },
              { id: 'pending', label: 'Pendentes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-500">
            {filteredOrders.length} OPs listadas
          </span>
        </div>
      </div>

      {/* Main Grid: Orders List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Orders Table/Cards */}
        <div className="lg:col-span-5 space-y-3">
          {filteredOrders.map((wo) => {
            const isSelected = wo.id === selectedWo?.id;
            const progress = (wo.producedQuantity / (wo.plannedQuantity || 1)) * 100;
            const badge = getStatusBadge(wo.status);

            return (
              <button
                key={wo.id}
                onClick={() => setSelectedWoId(wo.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-blue-700">
                    {wo.orderNumber}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-1 truncate">
                  {wo.productName}
                </h3>

                <div className="text-xs text-slate-500 mt-0.5">
                  Lote: <span className="font-mono text-slate-700">{wo.batchNumber}</span>
                </div>

                {/* Progress */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-600">
                    <span>
                      {wo.producedQuantity.toLocaleString()} / {wo.plannedQuantity.toLocaleString()} un
                    </span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Work Order Inspector */}
        {selectedWo && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">
                  APONTAMENTO DE ORDEM · {selectedWo.orderNumber}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedWo.productName}
                </h2>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  SKU: {selectedWo.productSku} · Lote: {selectedWo.batchNumber}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2">
                {selectedWo.status !== 'in_progress' ? (
                  <button
                    onClick={() => onUpdateStatus(selectedWo.id, 'in_progress')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Iniciar / Retomar OP
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(selectedWo.id, 'paused')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pausar OP
                  </button>
                )}

                {selectedWo.status !== 'completed' && (
                  <button
                    onClick={() => onUpdateStatus(selectedWo.id, 'completed')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Concluir OP
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Meta Planejada</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {selectedWo.plannedQuantity.toLocaleString()} un
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Produzido Bom</span>
                <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                  {selectedWo.producedQuantity.toLocaleString()} un
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Refugo (Scrap)</span>
                <span className="text-base font-bold font-mono text-red-700 tabular-nums">
                  {selectedWo.scrapQuantity.toLocaleString()} un
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Taxa de Eficácia</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {(
                    (selectedWo.producedQuantity /
                      (selectedWo.producedQuantity + selectedWo.scrapQuantity || 1)) *
                    100
                  ).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Assigned Operator & Schedule */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500">Operador / Responsável:</span>
                <span className="font-semibold text-slate-900">{selectedWo.operatorName}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500">Linha de Produção Alocada:</span>
                <span className="font-semibold text-slate-900">
                  {lines.find((l) => l.id === selectedWo.lineId)?.name || selectedWo.lineId}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500">Horário Previsto:</span>
                <span className="font-mono text-slate-900">
                  {selectedWo.startTime} às {selectedWo.targetEndTime}
                </span>
              </div>
            </div>

            {/* Pareto Chart of Scrap Reasons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                  Apontamento Detalhado de Refugo (Pareto de Defeitos)
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  Total: {selectedWo.scrapQuantity} defeitos
                </span>
              </div>

              {selectedWo.defectLog.length > 0 ? (
                <div className="space-y-2">
                  {selectedWo.defectLog.map((def, idx) => {
                    const share = (def.quantity / (selectedWo.scrapQuantity || 1)) * 100;
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800">{def.reason}</span>
                          <span className="font-mono font-bold text-red-600 tabular-nums">
                            {def.quantity} un ({share.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, share)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Registrado às {def.timestamp}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                  Nenhum refugo registrado nesta Ordem de Produção até o momento.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Liberar Nova OP */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Criar e Despachar Nova Ordem de Produção
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Número da Ordem (OP):
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Lote de Fabricação:
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Descrição do Produto:
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Código SKU:
                  </label>
                  <input
                    type="text"
                    required
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Quantidade Meta (un):
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={plannedQty}
                    onChange={(e) => setPlannedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Linha de Destino:
                  </label>
                  <select
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {lines.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Operador / Supervisor:
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Confirmar e Liberar OP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
