export type MachineStatus = 'running' | 'idle' | 'stopped' | 'maintenance';

export interface KanbanMachine {
  id: string;
  code: string;
  name: string;
  sector: string;
  status: MachineStatus;
  idleReason?: string;
  stopReason?: string;
  oee: number;
  availability: number;
  idleTimeMin: number;
  operatingTimeMin: number;
  currentSpeed: number; // un/h
  targetSpeed: number; // un/h
  operator: {
    name: string;
    shift: string;
    certified: boolean;
  };
  assignedActivityIds: string[];
}

export interface ProductionActivity {
  id: string;
  orderNumber: string;
  operationName: string;
  productName: string;
  sku: string;
  batchNumber: string;
  plannedQty: number;
  producedQty: number;
  scrapQty: number;
  estimatedDurationHours: number;
  elapsedMinutes: number;
  priority: 'urgente' | 'alta' | 'normal' | 'baixa';
  assignedMachineId: string | null; // null = Backlog / PCP
  status: 'in_execution' | 'queued' | 'paused' | 'completed' | 'unassigned';
  customer: string;
  dueDate: string;
}

export interface MachineStation {
  id: string;
  name: string;
  code: string;
  lineId: string;
  status: MachineStatus;
  stopReason?: string;
  currentWorkOrderId?: string;
  idealCycleTimeSec: number; // segundos por peça ideal
  currentCycleTimeSec: number;
  temperatureC: number;
  pressureBar: number;
  totalPlannedTimeMin: number;
  operatingTimeMin: number;
  downtimeMin: number;
  totalUnitsProduced: number;
  goodUnits: number;
  scrapUnits: number;
  lastMaintenanceDate: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  industry: string;
  description: string;
  targetHourlyRate: number;
  activeWorkOrderNumber: string;
  stations: MachineStation[];
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  productSku: string;
  lineId: string;
  plannedQuantity: number;
  producedQuantity: number;
  scrapQuantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  operatorName: string;
  batchNumber: string;
  startTime: string;
  targetEndTime: string;
  defectLog: Array<{
    reason: string;
    quantity: number;
    timestamp: string;
  }>;
}

export interface OeeMetrics {
  availability: number; // 0 to 100
  performance: number; // 0 to 100
  quality: number; // 0 to 100
  oee: number; // 0 to 100
}

export interface Isa95Level {
  level: number;
  name: string;
  acronym: string;
  timeHorizon: string;
  primaryRole: string;
  examples: string[];
  protocols: string[];
  mesInteraction: string;
  keyData: string;
}

export interface MesaFunction {
  id: number;
  title: string;
  titleEn: string;
  shortDesc: string;
  detailedExplanation: string;
  shopFloorApplication: string;
  benefit: string;
  category: 'planejamento' | 'execucao' | 'analise' | 'qualidade';
}

export interface BatchTraceabilityRecord {
  batchNumber: string;
  productName: string;
  manufactureDate: string;
  expiryDate: string;
  operator: string;
  productionLine: string;
  rawMaterials: Array<{
    name: string;
    lotNumber: string;
    supplier: string;
    quantity: string;
  }>;
  processParameters: Array<{
    parameter: string;
    target: string;
    measured: string;
    status: 'conform' | 'deviated';
  }>;
  qualityTests: Array<{
    testName: string;
    specification: string;
    result: string;
    approved: boolean;
  }>;
  status: 'released' | 'quarantine' | 'rejected';
}
