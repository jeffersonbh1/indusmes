import { useState } from 'react';
import { 
  Columns, 
  Cpu, 
  UserPlus, 
  PlusCircle, 
  Users, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Factory,
  BarChart3
} from 'lucide-react';
import { UserSession } from './LoginScreen';

interface SidebarProps {
  currentUser: UserSession;
  onLogout: () => void;
  onOpenNewMachine: () => void;
  onOpenNewUser: () => void;
  onOpenNewOrder: () => void;
  onOpenUsersList: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Sidebar = ({
  currentUser,
  onLogout,
  onOpenNewMachine,
  onOpenNewUser,
  onOpenNewOrder,
  onOpenUsersList,
  activeSection,
  setActiveSection
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white text-slate-800 border-r border-slate-200/90 flex flex-col justify-between shrink-0 transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Factory className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight block truncate">
                  IndusMES
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Planta Industrial 01
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white mx-auto shadow-sm">
              <Factory className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {/* Item 1: Quadro Kanban */}
          <button
            onClick={() => setActiveSection('kanban')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'kanban'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Quadro Kanban de Máquinas"
          >
            <Columns className="w-4 h-4 text-blue-600 shrink-0" />
            {!collapsed && <span className="truncate">Quadro Kanban</span>}
          </button>

          {/* Item 2: Dashboard OEE (Recharts) */}
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'dashboard'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Dashboard de OEE & Métricas Industriais (Recharts)"
          >
            <BarChart3 className="w-4 h-4 text-purple-600 shrink-0" />
            {!collapsed && <span className="truncate">Dashboard OEE</span>}
          </button>

          {/* Section Divider */}
          {!collapsed && (
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cadastros Industriais
            </div>
          )}

          {/* Item 2: Cadastrar Máquina */}
          <button
            onClick={onOpenNewMachine}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer group"
            title="Cadastrar Nova Máquina"
          >
            <Cpu className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate">Cadastrar Máquina</span>}
          </button>

          {/* Item 3: Cadastrar Usuário / Operador */}
          <button
            onClick={onOpenNewUser}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer group"
            title="Cadastrar Usuário / Operador"
          >
            <UserPlus className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate">Cadastrar Usuário</span>}
          </button>

          {/* Item 4: Cadastrar Ordem / Produto */}
          <button
            onClick={onOpenNewOrder}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer group"
            title="Cadastrar Nova Ordem (OP)"
          >
            <PlusCircle className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate">Cadastrar Ordem (OP)</span>}
          </button>

          {/* Item 5: Lista de Usuários e Equipe */}
          <button
            onClick={onOpenUsersList}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer group"
            title="Usuários e Operadores Cadastrados"
          >
            <Users className="w-4 h-4 text-purple-600 shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="truncate">Equipe / Operadores</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Profile and Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${currentUser.avatarColor}`}>
              {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-slate-900 block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto ${currentUser.avatarColor}`} title={`${currentUser.name} (${currentUser.role})`}>
            {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer justify-center"
          title="Encerrar Sessão"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
};
