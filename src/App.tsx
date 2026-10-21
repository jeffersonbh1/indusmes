import { useState, DragEvent } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  AlertTriangle,
  AlignLeft,
  Calendar,
  Flag,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { LoginScreen, UserSession } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { NewMachineModal } from './components/NewMachineModal';
import { NewUserModal } from './components/NewUserModal';
import { UsersListModal } from './components/UsersListModal';

export type MachineState = 'operando' | 'ociosa' | 'parada' | 'manutencao';

export interface KanbanCard {
  id: string;
  orderNumber: string;
  taskCode: string; // e.g. "Tarefa #14"
  productName: string;
  operation: string;
  plannedQty: number;
  producedQty: number;
  scrapQty: number;
  priority: 'urgente' | 'alta' | 'normal';
  customer: string;
  dayBadge: string; // "seg", "ter", "qua", "qui", "sex"
  avatarColor: string;
  operatorName?: string;
}

export interface KanbanColumn {
  id: string;
  shortCode: string; // "PENDENTES", "CNC-01", "INJ-02", etc.
  badgeLabel: string; // "A FAZER", "CNC-01", etc.
  machineType: string; // "Torno CNC", "Injetora", "Prensa", etc.
  badgeColor: {
    bg: string;
    text: string;
    dot: string;
  };
  title: string;
  subtitle: string;
  isQueue: boolean;
  status: MachineState;
  oee?: number;
  idleMinutes?: number;
  stopReason?: string;
  cardIds: string[];
}

const INITIAL_USERS: UserSession[] = [
  {
    id: 'usr-01',
    name: 'Jefferson Santos',
    email: 'gerente@indusmes.com.br',
    role: 'Gerente de Produção',
    matricula: 'RE-4091',
    shift: 'Administrativo / Geral',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'usr-02',
    name: 'Mariana Vasconcelos',
    email: 'supervisor@indusmes.com.br',
    role: 'Supervisor de Linha',
    matricula: 'RE-2185',
    shift: 'Turno A (06:00 - 14:30)',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-03',
    name: 'Marcos Silveira',
    email: 'marcos.silveira@indusmes.com.br',
    role: 'Operador Especialista',
    matricula: 'RE-1044',
    shift: 'Turno A (06:00 - 14:30)',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-04',
    name: 'Patrícia Duarte',
    email: 'patricia.duarte@indusmes.com.br',
    role: 'Operador Especialista',
    matricula: 'RE-1088',
    shift: 'Turno A (06:00 - 14:30)',
    avatarColor: 'bg-rose-600'
  },
  {
    id: 'usr-05',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@indusmes.com.br',
    role: 'Técnico de Manutenção',
    matricula: 'RE-3302',
    shift: 'Turno A (06:00 - 14:30)',
    avatarColor: 'bg-purple-600'
  }
];

const INITIAL_CARDS: Record<string, KanbanCard> = {
  // Atividades Pendentes
  'c-14': {
    id: 'c-14',
    taskCode: 'Tarefa #14',
    orderNumber: 'OP-8814',
    productName: 'Eixo Estriado 40mm Aço 4340',
    operation: 'Usinagem em torno CNC',
    plannedQty: 800,
    producedQty: 0,
    scrapQty: 0,
    priority: 'alta',
    customer: 'Scania',
    dayBadge: 'seg',
    avatarColor: 'bg-emerald-500'
  },
  'c-13': {
    id: 'c-13',
    taskCode: 'Tarefa #13',
    orderNumber: 'OP-8813',
    productName: 'Tampa ABS Texturizada',
    operation: 'Injeção plástica de precisão',
    plannedQty: 2500,
    producedQty: 0,
    scrapQty: 0,
    priority: 'urgente',
    customer: 'Whirlpool',
    dayBadge: 'qui',
    avatarColor: 'bg-rose-500'
  },
  'c-12': {
    id: 'c-12',
    taskCode: 'Tarefa #12',
    orderNumber: 'OP-8812',
    productName: 'Chapa Estampada com Furo 5mm',
    operation: 'Estampagem em prensa 400T',
    plannedQty: 1500,
    producedQty: 0,
    scrapQty: 0,
    priority: 'alta',
    customer: 'Mercedes',
    dayBadge: 'qua',
    avatarColor: 'bg-emerald-600'
  },
  'c-11': {
    id: 'c-11',
    taskCode: 'Tarefa #11',
    orderNumber: 'OP-8811',
    productName: 'Bucha Autolubrificante TM-23',
    operation: 'Torneamento fino e bisel',
    plannedQty: 600,
    producedQty: 0,
    scrapQty: 0,
    priority: 'urgente',
    customer: 'Embraer',
    dayBadge: 'qua',
    avatarColor: 'bg-emerald-500'
  },
  'c-10': {
    id: 'c-10',
    taskCode: 'Tarefa #10',
    orderNumber: 'OP-8810',
    productName: 'Suporte de Bateria Blindado',
    operation: 'Soldagem robotizada MIG',
    plannedQty: 400,
    producedQty: 0,
    scrapQty: 0,
    priority: 'urgente',
    customer: 'John Deere',
    dayBadge: 'seg',
    avatarColor: 'bg-rose-500'
  },
  'c-15': {
    id: 'c-15',
    taskCode: 'Tarefa #15',
    orderNumber: 'OP-8815',
    productName: 'Conector de Chicote Automotivo',
    operation: 'Montagem e teste elétrico',
    plannedQty: 900,
    producedQty: 0,
    scrapQty: 0,
    priority: 'normal',
    customer: 'Volvo',
    dayBadge: 'sex',
    avatarColor: 'bg-amber-600'
  },

  // Máquina CNC-01
  'c-09': {
    id: 'c-09',
    taskCode: 'Tarefa #09',
    orderNumber: 'OP-8809',
    productName: 'Eixo de Transmissão 32mm',
    operation: 'Torneamento de desbaste e rosca',
    plannedQty: 1000,
    producedQty: 840,
    scrapQty: 8,
    priority: 'alta',
    customer: 'Scania',
    dayBadge: 'seg',
    avatarColor: 'bg-emerald-500',
    operatorName: 'M. Silveira'
  },
  'c-08': {
    id: 'c-08',
    taskCode: 'Tarefa #08',
    orderNumber: 'OP-8808',
    productName: 'Flange de Acoplamento SAE-1045',
    operation: 'Faceamento e usinagem interna',
    plannedQty: 450,
    producedQty: 0,
    scrapQty: 0,
    priority: 'alta',
    customer: 'Parker',
    dayBadge: 'ter',
    avatarColor: 'bg-teal-600'
  },

  // Máquina INJ-02
  'c-07': {
    id: 'c-07',
    taskCode: 'Tarefa #07',
    orderNumber: 'OP-8807',
    productName: 'Painel Frontal ABS Cinza',
    operation: 'Injeção termoplástica 4 cavidades',
    plannedQty: 2000,
    producedQty: 1650,
    scrapQty: 18,
    priority: 'alta',
    customer: 'Whirlpool',
    dayBadge: 'sex',
    avatarColor: 'bg-emerald-500',
    operatorName: 'P. Duarte'
  },
  'c-06': {
    id: 'c-06',
    taskCode: 'Tarefa #06',
    orderNumber: 'OP-8806',
    productName: 'Suporte Interno Poliamida PA6',
    operation: 'Injeção plástica alta pressão',
    plannedQty: 1200,
    producedQty: 0,
    scrapQty: 0,
    priority: 'normal',
    customer: 'Marcopolo',
    dayBadge: 'seg',
    avatarColor: 'bg-amber-800'
  },

  // Máquina ROB-04 (Solda - Parada)
  'c-05': {
    id: 'c-05',
    taskCode: 'Tarefa #05',
    orderNumber: 'OP-8805',
    productName: 'Chassi Tubular Dianteiro',
    operation: 'Soldagem robotizada MIG/MAG',
    plannedQty: 300,
    producedQty: 120,
    scrapQty: 4,
    priority: 'alta',
    customer: 'John Deere',
    dayBadge: 'ter',
    avatarColor: 'bg-rose-500',
    operatorName: 'L. Mendes'
  },
  'c-02': {
    id: 'c-02',
    taskCode: 'Tarefa #02',
    orderNumber: 'OP-8802',
    productName: 'Berço Traseiro Reforçado',
    operation: 'Solda por pontos estrutural',
    plannedQty: 250,
    producedQty: 0,
    scrapQty: 0,
    priority: 'normal',
    customer: 'Caterpillar',
    dayBadge: 'seg',
    avatarColor: 'bg-slate-700'
  },

  // Máquina MON-05 (Montagem)
  'c-01': {
    id: 'c-01',
    taskCode: 'Tarefa #01',
    orderNumber: 'OP-8801',
    productName: 'Módulo Inversor 48V',
    operation: 'Montagem mecânica e teste',
    plannedQty: 350,
    producedQty: 310,
    scrapQty: 2,
    priority: 'alta',
    customer: 'WEG',
    dayBadge: 'seg',
    avatarColor: 'bg-amber-800',
    operatorName: 'C. Nogueira'
  },
  'c-03': {
    id: 'c-03',
    taskCode: 'Tarefa #03',
    orderNumber: 'OP-8803',
    productName: 'Chicote Elétrico Blindado',
    operation: 'Clipagem e teste de chicote',
    plannedQty: 600,
    producedQty: 0,
    scrapQty: 0,
    priority: 'normal',
    customer: 'Volvo',
    dayBadge: 'qui',
    avatarColor: 'bg-purple-700'
  },
  'c-04': {
    id: 'c-04',
    taskCode: 'Tarefa #04',
    orderNumber: 'OP-8804',
    productName: 'Caixa de Conexão IP67',
    operation: 'Vedação e teste estanqueidade',
    plannedQty: 500,
    producedQty: 0,
    scrapQty: 0,
    priority: 'alta',
    customer: 'Schneider',
    dayBadge: 'seg',
    avatarColor: 'bg-rose-500'
  }
};

const INITIAL_COLUMNS: KanbanColumn[] = [
  {
    id: 'col-pending',
    shortCode: 'A FAZER',
    badgeLabel: 'A FAZER',
    machineType: 'Fila do PCP',
    badgeColor: {
      bg: 'bg-amber-400',
      text: 'text-amber-950',
      dot: 'bg-amber-950'
    },
    title: 'Tarefas Pendentes',
    subtitle: 'Fila de Espera PCP',
    isQueue: true,
    status: 'ociosa',
    cardIds: ['c-14', 'c-13', 'c-12', 'c-11', 'c-10', 'c-15']
  },
  {
    id: 'col-cnc-01',
    shortCode: 'CNC-01',
    badgeLabel: 'CNC-01',
    machineType: 'Torno 5 Eixos',
    badgeColor: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      dot: 'bg-white'
    },
    title: 'Torno CNC 5 Eixos',
    subtitle: 'Operando · 88% OEE',
    isQueue: false,
    status: 'operando',
    oee: 88.4,
    idleMinutes: 15,
    cardIds: ['c-09', 'c-08']
  },
  {
    id: 'col-inj-02',
    shortCode: 'INJ-02',
    badgeLabel: 'INJ-02',
    machineType: 'Injetora 350T',
    badgeColor: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      dot: 'bg-white'
    },
    title: 'Injetora Engel 350T',
    subtitle: 'Operando · 82% OEE',
    isQueue: false,
    status: 'operando',
    oee: 82.0,
    idleMinutes: 20,
    cardIds: ['c-07', 'c-06']
  },
  {
    id: 'col-pre-03',
    shortCode: 'PRE-03',
    badgeLabel: 'PRE-03',
    machineType: 'Prensa 400T',
    badgeColor: {
      bg: 'bg-amber-500',
      text: 'text-slate-950',
      dot: 'bg-slate-950'
    },
    title: 'Prensa Schuler 400T',
    subtitle: 'Ociosa · Livre há 1h45',
    isQueue: false,
    status: 'ociosa',
    oee: 52.0,
    idleMinutes: 105,
    cardIds: []
  },
  {
    id: 'col-rob-04',
    shortCode: 'ROB-04',
    badgeLabel: 'ROB-04',
    machineType: 'Célula de Solda',
    badgeColor: {
      bg: 'bg-rose-500',
      text: 'text-white',
      dot: 'bg-white'
    },
    title: 'Célula Solda KUKA',
    subtitle: 'Parada · Falha no bico',
    isQueue: false,
    status: 'parada',
    stopReason: 'Troca de bico e calibração de gás',
    oee: 67.5,
    idleMinutes: 50,
    cardIds: ['c-05', 'c-02']
  },
  {
    id: 'col-mon-05',
    shortCode: 'MON-05',
    badgeLabel: 'MON-05',
    machineType: 'Posto Montagem',
    badgeColor: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      dot: 'bg-white'
    },
    title: 'Montagem & Teste',
    subtitle: 'Operando · 92% OEE',
    isQueue: false,
    status: 'operando',
    oee: 91.5,
    idleMinutes: 10,
    cardIds: ['c-01', 'c-03', 'c-04']
  },
  {
    id: 'col-cq-06',
    shortCode: 'CQ-06',
    badgeLabel: 'CQ-06',
    machineType: 'Inspeção & CQ',
    badgeColor: {
      bg: 'bg-slate-800',
      text: 'text-white',
      dot: 'bg-emerald-400'
    },
    title: 'Controle de Qualidade',
    subtitle: 'Ociosa · Bancada livre',
    isQueue: false,
    status: 'ociosa',
    oee: 79.0,
    idleMinutes: 80,
    cardIds: []
  }
];

export default function App() {
  // Authentication session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(INITIAL_USERS[0]);
  const [usersList, setUsersList] = useState<UserSession[]>(INITIAL_USERS);

  // Kanban state
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [cards, setCards] = useState<Record<string, KanbanCard>>(INITIAL_CARDS);
  const [activeSection, setActiveSection] = useState<string>('kanban');
  
  // Drag and drop states
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Modals state
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [editingMachine, setEditingMachine] = useState<KanbanColumn | null>(null);
  const [machineStatusInput, setMachineStatusInput] = useState<MachineState>('operando');
  const [machineReasonInput, setMachineReasonInput] = useState<string>('');
  
  // Registration modals
  const [newOrderModalOpen, setNewOrderModalOpen] = useState<boolean>(false);
  const [newMachineModalOpen, setNewMachineModalOpen] = useState<boolean>(false);
  const [newUserModalOpen, setNewUserModalOpen] = useState<boolean>(false);
  const [usersListModalOpen, setUsersListModalOpen] = useState<boolean>(false);

  // New order form
  const [newNum, setNewNum] = useState<string>(`OP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newProd, setNewProd] = useState<string>('');
  const [newCust, setNewCust] = useState<string>('');
  const [newQty, setNewQty] = useState<number>(500);
  const [newPriority, setNewPriority] = useState<KanbanCard['priority']>('alta');

  // If not authenticated, render Login Screen
  if (!currentUser) {
    return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;
  }

  // Machine KPI counters
  const machineCols = columns.filter((c) => !c.isQueue);
  const totalMachines = machineCols.length;
  const runningCount = machineCols.filter((m) => m.status === 'operando').length;
  const idleCount = machineCols.filter((m) => m.status === 'ociosa').length;
  const stoppedCount = machineCols.filter((m) => m.status === 'parada' || m.status === 'manutencao').length;
  const totalIdleMinutes = machineCols.reduce((acc, m) => acc + (m.idleMinutes || 0), 0);

  // Drag Handlers
  const handleDragStart = (e: DragEvent, cardId: string) => {
    e.dataTransfer.setData('text/plain', cardId);
    setDraggedCardId(cardId);
  };

  const handleDragOver = (e: DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColId(colId);
  };

  const handleDragLeave = (colId: string) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: DragEvent, targetColId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (!cardId) return;

    setColumns((prevCols) => {
      let sourceColId = '';
      for (const col of prevCols) {
        if (col.cardIds.includes(cardId)) {
          sourceColId = col.id;
          break;
        }
      }

      if (sourceColId === targetColId) return prevCols;

      return prevCols.map((col) => {
        // Remove from source
        if (col.id === sourceColId) {
          const updatedIds = col.cardIds.filter((id) => id !== cardId);
          const wasMachine = !col.isQueue;
          const newStatus = wasMachine && updatedIds.length === 0 && col.status === 'operando' ? 'ociosa' : col.status;
          return {
            ...col,
            cardIds: updatedIds,
            status: newStatus,
            subtitle: updatedIds.length === 0 && wasMachine ? 'Ociosa · Sem ordem' : col.subtitle,
            badgeColor: updatedIds.length === 0 && wasMachine ? { bg: 'bg-amber-500', text: 'text-slate-950', dot: 'bg-slate-950' } : col.badgeColor
          };
        }

        // Add to target
        if (col.id === targetColId) {
          const updatedIds = [...col.cardIds, cardId];
          const wasMachine = !col.isQueue;
          const newStatus = wasMachine && col.status === 'ociosa' ? 'operando' : col.status;
          return {
            ...col,
            cardIds: updatedIds,
            status: newStatus,
            subtitle: newStatus === 'operando' && wasMachine ? `Operando · ${col.oee || 85}% OEE` : col.subtitle,
            badgeColor: newStatus === 'operando' && wasMachine ? { bg: 'bg-emerald-500', text: 'text-white', dot: 'bg-white' } : col.badgeColor
          };
        }

        return col;
      });
    });

    setDraggedCardId(null);
    setDragOverColId(null);
  };

  // Machine status update
  const handleSaveMachineStatus = () => {
    if (!editingMachine) return;
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === editingMachine.id) {
          let badgeColor = col.badgeColor;
          let subtitle = col.subtitle;

          if (machineStatusInput === 'operando') {
            badgeColor = { bg: 'bg-emerald-500', text: 'text-white', dot: 'bg-white' };
            subtitle = `Operando · ${col.oee || 85}% OEE`;
          } else if (machineStatusInput === 'ociosa') {
            badgeColor = { bg: 'bg-amber-500', text: 'text-slate-950', dot: 'bg-slate-950' };
            subtitle = machineReasonInput ? `Ociosa · ${machineReasonInput}` : 'Ociosa · Livre';
          } else if (machineStatusInput === 'parada') {
            badgeColor = { bg: 'bg-rose-500', text: 'text-white', dot: 'bg-white' };
            subtitle = machineReasonInput ? `Parada · ${machineReasonInput}` : 'Parada por falha';
          }

          return {
            ...col,
            status: machineStatusInput,
            subtitle,
            badgeColor,
            stopReason: machineStatusInput === 'parada' ? machineReasonInput || 'Parada apontada' : undefined
          };
        }
        return col;
      })
    );
    setEditingMachine(null);
  };

  // Create new machine (Appends as a new machine block in Kanban!)
  const handleAddMachine = (newCol: KanbanColumn) => {
    setColumns((prev) => [...prev, newCol]);
  };

  // Create new user (Appends to usersList)
  const handleAddUser = (newUser: UserSession) => {
    setUsersList((prev) => [newUser, ...prev]);
  };

  // Create new order in the pending queue
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `c-${Date.now()}`;
    const taskNumber = Object.keys(cards).length + 1;
    const newCard: KanbanCard = {
      id: newId,
      taskCode: `Tarefa #${taskNumber < 10 ? `0${taskNumber}` : taskNumber}`,
      orderNumber: newNum,
      productName: newProd,
      operation: 'Operação de manufatura',
      plannedQty: Number(newQty),
      producedQty: 0,
      scrapQty: 0,
      priority: newPriority,
      customer: newCust || 'Cliente Padrão',
      dayBadge: 'seg',
      avatarColor: 'bg-blue-600'
    };

    setCards((prev) => ({ ...prev, [newId]: newCard }));
    setColumns((prev) =>
      prev.map((col) => {
        if (col.isQueue) {
          return { ...col, cardIds: [newId, ...col.cardIds] };
        }
        return col;
      })
    );

    setNewOrderModalOpen(false);
    setNewNum(`OP-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewProd('');
    setNewCust('');
  };

  const getPriorityFlagColor = (priority: KanbanCard['priority']) => {
    switch (priority) {
      case 'urgente':
        return 'text-red-500 fill-red-500';
      case 'alta':
        return 'text-amber-500 fill-amber-500';
      case 'normal':
        return 'text-emerald-500 fill-emerald-500';
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f4f6f9] text-slate-800 flex font-sans select-none">
      {/* Sidebar Menu */}
      <Sidebar
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenNewMachine={() => setNewMachineModalOpen(true)}
        onOpenNewUser={() => setNewUserModalOpen(true)}
        onOpenNewOrder={() => setNewOrderModalOpen(true)}
        onOpenUsersList={() => setUsersListModalOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/90 px-4 py-2 shrink-0 flex items-center justify-between gap-2">
          {/* Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight whitespace-nowrap">
                Quadro de Chão de Fábrica
              </span>
            </div>

            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline truncate">
              Arraste as tarefas pendentes para as máquinas
            </span>
          </div>

          {/* Machine Status Counters & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs shrink-0">
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-500">Operando:</span>
              <strong className="text-slate-800 font-bold">{runningCount}</strong>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-500">Ociosas:</span>
              <strong className="text-slate-800 font-bold">{idleCount}</strong>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-500">Paradas:</span>
              <strong className="text-slate-800 font-bold">{stoppedCount}</strong>
            </div>

            <button
              onClick={() => setNewOrderModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Nova Tarefa</span>
            </button>
          </div>
        </header>

        {/* Kanban Board Canvas with permanent horizontal scroll */}
        <main className="flex-1 p-3 overflow-hidden min-h-0 flex flex-col">
          <div className="flex-1 flex items-stretch gap-3 overflow-x-auto overflow-y-hidden pb-3 pt-1 px-1">
            {columns.map((col) => {
              const isDragTarget = dragOverColId === col.id;
              const columnCards = col.cardIds
                .map((id) => cards[id])
                .filter(Boolean) as KanbanCard[];

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={() => handleDragLeave(col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`bg-[#e4e7ec] rounded-2xl p-2.5 flex flex-col h-full border min-w-0 transition-all w-64 sm:w-72 shrink-0 ${
                    isDragTarget
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30'
                      : 'border-slate-300/70'
                  }`}
                >
                  {/* Column Top Header: Badge is strictly contained with min-w-0 & truncate */}
                  <div className="pb-1.5 pt-0.5 px-0.5 shrink-0 min-w-0 space-y-1">
                    {/* Row 1: The Badge Pill */}
                    <div className="flex items-center justify-between gap-1 min-w-0 w-full">
                      <button
                        onClick={() => {
                          if (!col.isQueue) {
                            setEditingMachine(col);
                            setMachineStatusInput(col.status);
                            setMachineReasonInput(col.stopReason || '');
                          }
                        }}
                        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold tracking-wide uppercase shadow-2xs transition-transform min-w-0 flex-1 max-w-[calc(100%-24px)] ${
                          !col.isQueue ? 'hover:scale-102 cursor-pointer' : ''
                        } ${col.badgeColor.bg} ${col.badgeColor.text}`}
                        title={`${col.badgeLabel} - Clique para alterar status`}
                      >
                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 border border-black/20 ${col.badgeColor.dot}`} />
                        <span className="truncate block text-left">
                          {col.shortCode}
                        </span>
                      </button>

                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 font-mono shrink-0 px-1">
                        {columnCards.length}
                      </span>
                    </div>

                    {/* Row 2: Machine Type & Subtitle */}
                    <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate px-0.5" title={col.title}>
                      <strong className="text-slate-700">{col.machineType}</strong> · {col.subtitle}
                    </div>
                  </div>

                  {/* Cards Container: Smooth internal scroll, cleanly contained */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 pr-0.5 min-h-0 min-w-0">
                    {columnCards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onClick={() => setSelectedCard(card)}
                        className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 shadow-2xs border border-slate-200/90 hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing text-xs space-y-1.5 min-w-0 group"
                      >
                        {/* Card Title & Code */}
                        <div className="flex items-baseline justify-between gap-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight group-hover:text-blue-600 transition-colors truncate">
                            {card.taskCode}
                          </h3>
                          <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 font-semibold shrink-0">
                            {card.orderNumber}
                          </span>
                        </div>

                        {/* Product Name (Cleanly truncated) */}
                        <p className="text-[10px] sm:text-[11px] text-slate-500 truncate leading-snug" title={card.productName}>
                          {card.productName}
                        </p>

                        {/* Description Icon (the 3 lines from image) */}
                        <div className="text-slate-300 flex items-center pt-0.5">
                          <AlignLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>

                        {/* Bottom Metadata: Avatar Circle + Calendar Day + Priority Flag */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] sm:text-[10px] min-w-0 gap-1">
                          {/* Avatar */}
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 ${card.avatarColor}`}>
                            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </div>

                          {/* Calendar Day Badge */}
                          <div className="flex items-center gap-0.5 sm:gap-1 border border-slate-200 bg-slate-50/80 px-1 py-0.5 rounded text-slate-600 font-mono text-[8px] sm:text-[9px] truncate shrink-0">
                            <Calendar className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-slate-400" />
                            <span>{card.dayBadge}</span>
                          </div>

                          {/* Priority Flag */}
                          <div className="border border-slate-200 bg-slate-50/80 p-0.5 rounded shrink-0">
                            <Flag className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${getPriorityFlagColor(card.priority)}`} />
                          </div>
                        </div>

                        {/* If card is on a machine, show compact progress */}
                        {!col.isQueue && card.plannedQty > 0 && (
                          <div className="pt-0.5">
                            <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-slate-500 mb-0.5">
                              <span>{card.producedQty}/{card.plannedQty}</span>
                              <span className="font-bold text-slate-700">
                                {((card.producedQty / card.plannedQty) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${(card.producedQty / card.plannedQty) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty State */}
                    {columnCards.length === 0 && (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 sm:p-3 text-center my-auto space-y-0.5">
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block">
                          Livre
                        </span>
                        <p className="text-[9px] text-slate-400">
                          Solte uma tarefa
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Modal: Detalhes da Tarefa / Ordem */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-5 space-y-3 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold text-blue-600">
                  {selectedCard.taskCode} · {selectedCard.orderNumber}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 truncate">
                  {selectedCard.productName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">Cliente</span>
                  <strong className="text-slate-800 truncate block">{selectedCard.customer}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Dia / Prazo</span>
                  <strong className="text-slate-800">{selectedCard.dayBadge}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Prioridade</span>
                  <span className="capitalize font-bold text-slate-800">{selectedCard.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Operador</span>
                  <strong className="text-slate-800 truncate block">{selectedCard.operatorName || 'Livre'}</strong>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5 text-[11px]">Operação:</span>
                <p className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700 text-[11px]">
                  {selectedCard.operation}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Progresso:</span>
                  <strong>{selectedCard.producedQty} / {selectedCard.plannedQty} un</strong>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(selectedCard.producedQty / selectedCard.plannedQty) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Estado da Máquina */}
      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-5 space-y-3 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {editingMachine.badgeLabel}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingMachine.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingMachine(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">
                Status Operacional da Máquina:
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'operando', label: 'Operando', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                  { id: 'ociosa', label: 'Ociosa', cls: 'bg-amber-50 text-amber-800 border-amber-300' },
                  { id: 'parada', label: 'Parada', cls: 'bg-rose-50 text-rose-800 border-rose-300' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setMachineStatusInput(st.id as MachineState)}
                    className={`p-2 rounded border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      machineStatusInput === st.id ? `${st.cls} ring-2 ring-blue-500` : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motivo (se Ociosa ou Parada):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Troca de ferramenta, sem ordens..."
                  value={machineReasonInput}
                  onChange={(e) => setMachineReasonInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setEditingMachine(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMachineStatus}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Nova Tarefa / OP */}
      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-5 space-y-3 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Nova Tarefa na Fila de Pendentes
              </h3>
              <button
                onClick={() => setNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Código da OP:</label>
                <input
                  type="text"
                  required
                  value={newNum}
                  onChange={(e) => setNewNum(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Descrição da Peça / Produto:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Eixo Estriado de Câmbio"
                  value={newProd}
                  onChange={(e) => setNewProd(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Cliente:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Scania, Embraer"
                    value={newCust}
                    onChange={(e) => setNewCust(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Quantidade:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Prioridade:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as KanbanCard['priority'])}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900"
                >
                  <option value="urgente">Urgente (Bandeira Vermelha)</option>
                  <option value="alta">Alta (Bandeira Amarela)</option>
                  <option value="normal">Normal (Bandeira Verde)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewOrderModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  Adicionar à Fila
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Máquina */}
      {newMachineModalOpen && (
        <NewMachineModal
          onClose={() => setNewMachineModalOpen(false)}
          onAddMachine={handleAddMachine}
        />
      )}

      {/* Modal: Cadastrar Usuário */}
      {newUserModalOpen && (
        <NewUserModal
          onClose={() => setNewUserModalOpen(false)}
          onAddUser={handleAddUser}
        />
      )}

      {/* Modal: Lista de Usuários */}
      {usersListModalOpen && (
        <UsersListModal
          users={usersList}
          onClose={() => setUsersListModalOpen(false)}
          onOpenNewUser={() => setNewUserModalOpen(true)}
        />
      )}
    </div>
  );
}
