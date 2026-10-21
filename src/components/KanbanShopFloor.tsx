import { useState, DragEvent } from 'react';
import { KanbanMachine, ProductionActivity, MachineStatus } from '../types/mes';
import { 
  Play, 
  Pause, 
  AlertTriangle, 
  Wrench, 
  Clock, 
  Plus, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  MoveRight, 
  Filter, 
  Zap, 
  Layers, 
  ChevronRight, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';

interface KanbanShopFloorProps {
  initialMachines: KanbanMachine[];
  initialActivities: ProductionActivity[];
}

export const KanbanShopFloor = ({ initialMachines, initialActivities }: KanbanShopFloorProps) => {
  const [machines, setMachines] = useState<KanbanMachine[]>(initialMachines);
  const [activities, setActivities] = useState<ProductionActivity[]>(initialActivities);
  
  // Drag and Drop state
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [dragOverMachineId, setDragOverMachineId] = useState<string | null>(null);
  const [isBacklogDragOver, setIsBacklogDragOver] = useState<boolean>(false);

  // Filters & Management Views
  const [sectorFilter, setSectorFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Inspection modals
  const [selectedActivity, setSelectedActivity] = useState<ProductionActivity | null>(null);
  const [selectedMachineToEdit, setSelectedMachineToEdit] = useState<KanbanMachine | null>(null);
  const [stopReasonInput, setStopReasonInput] = useState<string>('Aguardando liberação de matéria-prima');

  // Executive Management KPIs
  const totalMachines = machines.length;
  const runningMachines = machines.filter((m) => m.status === 'running').length;
  const idleMachines = machines.filter((m) => m.status === 'idle').length;
  const stoppedMachines = machines.filter((m) => m.status === 'stopped' || m.status === 'maintenance').length;
  const avgOee = (machines.reduce((acc, m) => acc + m.oee, 0) / (totalMachines || 1)).toFixed(1);
  const totalIdleTime = machines.reduce((acc, m) => acc + m.idleTimeMin, 0);

  // Filtered Machines
  const filteredMachines = machines.filter((m) => {
    if (sectorFilter !== 'todos' && m.sector !== sectorFilter) return false;
    if (statusFilter !== 'todos' && m.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchMachine = m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
      const matchOp = m.assignedActivityIds.some((actId) => {
        const act = activities.find((a) => a.id === actId);
        return act?.orderNumber.toLowerCase().includes(q) || act?.productName.toLowerCase().includes(q);
      });
      return matchMachine || matchOp;
    }
    return true;
  });

  // Unassigned activities in the Backlog (PCP / ERP)
  const backlogActivities = activities.filter((a) => !a.assignedMachineId || a.status === 'unassigned');

  // Drag handlers
  const handleDragStart = (e: DragEvent, activityId: string) => {
    e.dataTransfer.setData('text/plain', activityId);
    setDraggedActivityId(activityId);
  };

  const handleDragOverMachine = (e: DragEvent, machineId: string) => {
    e.preventDefault();
    setDragOverMachineId(machineId);
  };

  const handleDragLeaveMachine = (machineId: string) => {
    if (dragOverMachineId === machineId) {
      setDragOverMachineId(null);
    }
  };

  const handleDropOnMachine = (e: DragEvent, targetMachineId: string) => {
    e.preventDefault();
    const activityId = e.dataTransfer.getData('text/plain') || draggedActivityId;
    if (!activityId) return;

    // Update Activity
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          return {
            ...act,
            assignedMachineId: targetMachineId,
            status: act.status === 'unassigned' ? 'queued' : act.status,
          };
        }
        return act;
      })
    );

    // Update Machines: remove from previous machine's array, add to new machine
    setMachines((prev) =>
      prev.map((m) => {
        let newIds = m.assignedActivityIds.filter((id) => id !== activityId);
        if (m.id === targetMachineId) {
          newIds = [...newIds, activityId];
          // If machine was idle, automatically set to running if an activity is dispatched!
          const newStatus = m.status === 'idle' ? 'running' : m.status;
          return {
            ...m,
            assignedActivityIds: newIds,
            status: newStatus,
            idleReason: newStatus === 'running' ? undefined : m.idleReason,
          };
        }
        return {
          ...m,
          assignedActivityIds: newIds,
          // If machine has no more activities, mark idle
          status: newIds.length === 0 && m.status === 'running' ? 'idle' : m.status,
          idleReason: newIds.length === 0 && m.status === 'running' ? 'Sem atividades na fila' : m.idleReason,
        };
      })
    );

    setDraggedActivityId(null);
    setDragOverMachineId(null);
  };

  const handleDropOnBacklog = (e: DragEvent) => {
    e.preventDefault();
    const activityId = e.dataTransfer.getData('text/plain') || draggedActivityId;
    if (!activityId) return;

    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          return {
            ...act,
            assignedMachineId: null,
            status: 'unassigned',
          };
        }
        return act;
      })
    );

    setMachines((prev) =>
      prev.map((m) => {
        const newIds = m.assignedActivityIds.filter((id) => id !== activityId);
        return {
          ...m,
          assignedActivityIds: newIds,
          status: newIds.length === 0 && m.status === 'running' ? 'idle' : m.status,
          idleReason: newIds.length === 0 && m.status === 'running' ? 'Sem atividades na fila' : m.idleReason,
        };
      })
    );

    setDraggedActivityId(null);
    setIsBacklogDragOver(false);
  };

  // Quick increment pieces in execution
  const handleQuickProduce = (activityId: string, qty: number) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const newProduced = Math.min(act.plannedQty, act.producedQty + qty);
          const isDone = newProduced >= act.plannedQty;
          return {
            ...act,
            producedQty: newProduced,
            status: isDone ? 'completed' : act.status,
          };
        }
        return act;
      })
    );
  };

  // Change machine status
  const handleUpdateMachineStatus = (machineId: string, newStatus: MachineStatus, reason?: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            status: newStatus,
            stopReason: newStatus === 'stopped' ? reason || 'Parada apontada pelo operador' : undefined,
            idleReason: newStatus === 'idle' ? reason || 'Máquina aguardando alocação' : undefined,
          };
        }
        return m;
      })
    );
    setSelectedMachineToEdit(null);
  };

  const getStatusBadge = (status: MachineStatus) => {
    switch (status) {
      case 'running':
        return { label: 'Operando', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' };
      case 'idle':
        return { label: 'Ociosa / Disponível', badge: 'bg-amber-50 text-amber-700 border-amber-300' };
      case 'stopped':
        return { label: 'Parada / Falha', badge: 'bg-red-50 text-red-700 border-red-300' };
      case 'maintenance':
        return { label: 'Em Manutenção', badge: 'bg-purple-50 text-purple-700 border-purple-300' };
    }
  };

  const getPriorityBadge = (priority: ProductionActivity['priority']) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'alta':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'normal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'baixa':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Management Dashboard Header (Chão de Fábrica Overview) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span>LAYOUT KANBAN DINÂMICO</span>
              <span aria-hidden="true">·</span>
              <span>VISÃO GERENCIAL DE MÁQUINAS & ATIVIDADES</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Quadro de Chão de Fábrica: Máquinas & Atividades
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cada coluna representa uma máquina ou centro de serviço. Arraste as ordens de produção (OPs) do Backlog ou entre as máquinas para alocar e sequenciar a fabricação em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Atualização em tempo real (OPC-UA/MQTT)
            </span>
          </div>
        </div>

        {/* 4 Executive KPI Cards (Visão da Gerência: Produção, Ociosidade e Status) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Máquinas Operando */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Máquinas em Operação
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {runningMachines}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {totalMachines} ({((runningMachines / (totalMachines || 1)) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(runningMachines / (totalMachines || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* 2. Ociosidade */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Ociosidade no Turno
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono tabular-nums">
                {idleMachines}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                máquinas ({totalIdleTime} min)
              </span>
            </div>
            <div className="text-[11px] text-amber-800">
              {idleMachines > 0 ? 'Disponíveis para receber novas OPs' : 'Zero máquinas sem ordem'}
            </div>
          </div>

          {/* 3. Paradas & Manutenção */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Paradas / Manutenção
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-red-700 font-mono tabular-nums">
                {stoppedMachines}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                máquinas
              </span>
            </div>
            <div className="text-[11px] text-red-700">
              Gargalos exigindo intervenção técnica
            </div>
          </div>

          {/* 4. OEE Geral Médio */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              OEE Médio da Planta
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {avgOee}%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Meta Fabril: ≥ 85.0%
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <span className="text-xs font-semibold px-2 text-slate-500">Setor:</span>
              {['todos', 'Usinagem', 'Injeção', 'Estamparia', 'Soldagem', 'Montagem'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSectorFilter(sec)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    sectorFilter === sec
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sec === 'todos' ? 'Todos' : sec}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <span className="text-xs font-semibold px-2 text-slate-500">Status:</span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'running', label: 'Operando' },
                { id: 'idle', label: 'Ociosas' },
                { id: 'stopped', label: 'Paradas' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === st.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar máquina ou OP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Board: Backlog on Left/Top + Machine Kanban Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Backlog Column (Fila Geral de OPs do PCP/ERP para arrastar) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsBacklogDragOver(true);
          }}
          onDragLeave={() => setIsBacklogDragOver(false)}
          onDrop={handleDropOnBacklog}
          className={`xl:col-span-3 bg-white rounded-xl border p-4 space-y-3 transition-all ${
            isBacklogDragOver
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200'
          }`}
        >
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Fila de Espera / PCP
              </h2>
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {backlogActivities.length} OPs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Ordens geradas pelo ERP aguardando alocação. <strong>Arraste para qualquer máquina</strong> à direita.
            </p>
          </div>

          {backlogActivities.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
              Nenhuma OP na fila de espera. Todas as ordens estão alocadas no chão de fábrica!
            </div>
          ) : (
            <div className="space-y-2.5">
              {backlogActivities.map((act) => (
                <div
                  key={act.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, act.id)}
                  onClick={() => setSelectedActivity(act)}
                  className="p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-grab active:cursor-grabbing text-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-blue-700 text-[11px]">
                      {act.orderNumber}
                    </span>
                    <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(act.priority)}`}>
                      {act.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug line-clamp-1">
                      {act.productName}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Operação: {act.operationName}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
                    <span>Meta: {act.plannedQty} un</span>
                    <span>Prazo: {act.dueDate}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Cliente: {act.customer}</span>
                    <span className="text-blue-600 font-medium flex items-center gap-0.5">
                      Arrastar <MoveRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Machine Kanban Columns (Centros de Trabalho) */}
        <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {filteredMachines.map((machine) => {
            const isDragTarget = dragOverMachineId === machine.id;
            const machineActivities = machine.assignedActivityIds
              .map((id) => activities.find((a) => a.id === id))
              .filter(Boolean) as ProductionActivity[];

            const activeActivity = machineActivities[0];
            const queuedActivities = machineActivities.slice(1);
            const statusInfo = getStatusBadge(machine.status);

            return (
              <div
                key={machine.id}
                onDragOver={(e) => handleDragOverMachine(e, machine.id)}
                onDragLeave={() => handleDragLeaveMachine(machine.id)}
                onDrop={(e) => handleDropOnMachine(e, machine.id)}
                className={`bg-white rounded-xl border flex flex-col transition-all duration-150 ${
                  isDragTarget
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md bg-blue-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Machine Header Card */}
                <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/70 rounded-t-xl">
                  {/* Machine Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                        {machine.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {machine.sector}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedMachineToEdit(machine)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-transform hover:scale-102 ${statusInfo.badge}`}
                      title="Clique para alterar status da máquina"
                    >
                      {statusInfo.label}
                    </button>
                  </div>

                  {/* Machine Name */}
                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                    {machine.name}
                  </h3>

                  {/* Telemetry Strip: OEE, Ociosidade, Velocidade */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-white p-2 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-400 block">OEE</span>
                      <span className={`font-bold tabular-nums ${machine.oee >= 85 ? 'text-emerald-700' : machine.oee >= 70 ? 'text-blue-700' : 'text-amber-700'}`}>
                        {machine.oee.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ociosidade</span>
                      <span className={`font-bold tabular-nums ${machine.idleTimeMin > 60 ? 'text-amber-700' : 'text-slate-700'}`}>
                        {machine.idleTimeMin} min
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Velocidade</span>
                      <span className="font-bold text-slate-800 tabular-nums">
                        {machine.currentSpeed} un/h
                      </span>
                    </div>
                  </div>

                  {/* Machine Stop or Idle Reason */}
                  {machine.stopReason && (
                    <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200 leading-tight">
                      <strong>Motivo da Parada:</strong> {machine.stopReason}
                    </div>
                  )}

                  {machine.idleReason && machine.status === 'idle' && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 leading-tight">
                      <strong>Motivo da Ociosidade:</strong> {machine.idleReason}
                    </div>
                  )}

                  {/* Operator Info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {machine.operator.name}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {machine.operator.shift.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Machine Activities Area (In Execution + Queue) */}
                <div className="p-3 space-y-3 flex-1 min-h-[300px]">
                  {/* Section 1: Atividade em Execução Agora */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <span>Em Execução Agora</span>
                      {activeActivity && (
                        <span className="font-mono text-emerald-700 font-semibold text-[10px]">
                          AO VIVO
                        </span>
                      )}
                    </div>

                    {activeActivity ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, activeActivity.id)}
                        onClick={() => setSelectedActivity(activeActivity)}
                        className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing text-xs space-y-2.5 ${
                          machine.status === 'running'
                            ? 'bg-blue-50/40 border-blue-300 shadow-2xs'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-extrabold text-blue-700 text-xs">
                            {activeActivity.orderNumber}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(activeActivity.priority)}`}>
                            {activeActivity.priority}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 leading-snug">
                            {activeActivity.productName}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {activeActivity.operationName}
                          </p>
                        </div>

                        {/* Live Production Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono text-slate-700">
                            <span>Produzido: <strong>{activeActivity.producedQty}</strong> / {activeActivity.plannedQty} un</span>
                            <span className="font-bold">
                              {((activeActivity.producedQty / (activeActivity.plannedQty || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${Math.min(100, (activeActivity.producedQty / activeActivity.plannedQty) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Telemetry Footer */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                          <span>Refugo: <strong className="text-red-600">{activeActivity.scrapQty} un</strong></span>
                          <span>Prazo: {activeActivity.dueDate}</span>
                        </div>

                        {/* Interactive Quick Buttons for Operator/Manager */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickProduce(activeActivity.id, 10);
                            }}
                            className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-semibold text-slate-700 transition-colors"
                          >
                            +10 Peças
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickProduce(activeActivity.id, 50);
                            }}
                            className="flex-1 py-1 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-semibold transition-colors"
                          >
                            +50 Peças
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-1">
                        <span className="text-xs font-semibold text-slate-600 block">
                          Nenhuma OP em execução
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">
                          Esta máquina está ociosa. Arraste uma OP do Backlog aqui para iniciar.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Fila Sequenciada de Próximas Atividades */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Fila Programada ({queuedActivities.length})</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Sequência FIFO
                      </span>
                    </div>

                    {queuedActivities.length === 0 ? (
                      <div className="p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                        Fila vazia. Sem ordens agendadas na sequência.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {queuedActivities.map((qAct, idx) => (
                          <div
                            key={qAct.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, qAct.id)}
                            onClick={() => setSelectedActivity(qAct)}
                            className="p-2.5 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-700 text-[11px]">
                                #{idx + 1} · {qAct.orderNumber}
                              </span>
                              <span className={`text-[9px] font-semibold uppercase px-1 py-0.5 rounded border ${getPriorityBadge(qAct.priority)}`}>
                                {qAct.priority}
                              </span>
                            </div>
                            <h5 className="font-medium text-slate-900 line-clamp-1">
                              {qAct.productName}
                            </h5>
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <span>Lote: {qAct.plannedQty} un</span>
                              <span>Est: {qAct.estimatedDurationHours}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Detalhes da Atividade / Ordem de Produção */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">
                  ORDEM DE PRODUÇÃO · {selectedActivity.orderNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedActivity.productName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">SKU do Produto</span>
                  <span className="font-bold text-slate-800">{selectedActivity.sku}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Número de Lote</span>
                  <span className="font-bold text-slate-800">{selectedActivity.batchNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cliente Solicitante</span>
                  <span className="font-bold text-slate-800">{selectedActivity.customer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Data Prometida (Due Date)</span>
                  <span className="font-bold text-slate-800">{selectedActivity.dueDate}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Operação Técnica Cadastrada na Rota (MES):
                </span>
                <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800">
                  {selectedActivity.operationName}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span>Progresso da Produção:</span>
                  <span className="font-bold">
                    {selectedActivity.producedQty} de {selectedActivity.plannedQty} peças ({((selectedActivity.producedQty / selectedActivity.plannedQty) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(selectedActivity.producedQty / selectedActivity.plannedQty) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-3 bg-red-50 rounded border border-red-200 text-red-800">
                <span>Peças Refugadas (Scrap apontado):</span>
                <span className="font-bold">{selectedActivity.scrapQty} unidades</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajustar Estado da Máquina (Gerência Chão de Fábrica) */}
      {selectedMachineToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  CONTROLE DE MÁQUINA · {selectedMachineToEdit.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedMachineToEdit.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMachineToEdit(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-semibold text-slate-700 block">
                Selecione o Novo Estado da Máquina:
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateMachineStatus(selectedMachineToEdit.id, 'running')}
                  className="p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 text-center"
                >
                  Em Operação
                </button>
                <button
                  onClick={() => handleUpdateMachineStatus(selectedMachineToEdit.id, 'idle', 'Aguardando próxima OP')}
                  className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 text-center"
                >
                  Ociosa / Disponível
                </button>
                <button
                  onClick={() => handleUpdateMachineStatus(selectedMachineToEdit.id, 'stopped', stopReasonInput)}
                  className="p-3 rounded-lg border border-red-300 bg-red-50 text-red-800 font-bold hover:bg-red-100 text-center"
                >
                  Parada Não Programada
                </button>
                <button
                  onClick={() => handleUpdateMachineStatus(selectedMachineToEdit.id, 'maintenance', 'Manutenção preventiva')}
                  className="p-3 rounded-lg border border-purple-300 bg-purple-50 text-purple-800 font-bold hover:bg-purple-100 text-center"
                >
                  Em Manutenção
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Motivo da Parada / Ociosidade (para auditoria MES):
                </label>
                <input
                  type="text"
                  value={stopReasonInput}
                  onChange={(e) => setStopReasonInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedMachineToEdit(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
