interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickSimulate: () => void;
}

export const Header = ({ activeTab, setActiveTab, onQuickSimulate }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('kanban');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors"
        >
          IndusMES
        </a>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              activeTab === 'kanban' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Quadro Kanban (Chão de Fábrica)
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              activeTab === 'overview' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Conceito & Pirâmide ISA-95
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              activeTab === 'simulator' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Linhas Contínuas
          </button>
          <button
            onClick={() => setActiveTab('oee')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              activeTab === 'oee' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Calculadora OEE
          </button>
          <button
            onClick={() => setActiveTab('traceability')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              activeTab === 'traceability' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Rastreabilidade
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickSimulate}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Ver Quadro Kanban
          </button>
        </div>
      </div>

      {/* Mobile nav fallback for small screens */}
      <div className="md:hidden flex overflow-x-auto gap-3 px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs">
        {[
          { id: 'kanban', label: 'Quadro Kanban' },
          { id: 'overview', label: 'Conceito ISA-95' },
          { id: 'simulator', label: 'Linhas Contínuas' },
          { id: 'oee', label: 'Calculadora OEE' },
          { id: 'traceability', label: 'Rastreabilidade' },
          { id: 'mesa', label: '11 MESA' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${
              activeTab === item.id
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
