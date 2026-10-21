import { useState } from 'react';
import { X, Cpu, CheckCircle } from 'lucide-react';
import { KanbanColumn, MachineState } from '../App';

interface NewMachineModalProps {
  onClose: () => void;
  onAddMachine: (newMachine: KanbanColumn) => void;
}

export const NewMachineModal = ({ onClose, onAddMachine }: NewMachineModalProps) => {
  const [code, setCode] = useState('LAS-01');
  const [name, setName] = useState('Corte a Laser Fibra Óptica 6kW');
  const [sector, setSector] = useState('Corte e Conformação');
  const [status, setStatus] = useState<MachineState>('ociosa');
  const [oee, setOee] = useState(85);
  const [operatorName, setOperatorName] = useState('Téc. Eduardo Lima');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `col-${code.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    let badgeColor = {
      bg: 'bg-amber-500',
      text: 'text-slate-950',
      dot: 'bg-slate-950'
    };

    if (status === 'operando') {
      badgeColor = { bg: 'bg-emerald-500', text: 'text-white', dot: 'bg-white' };
    } else if (status === 'parada') {
      badgeColor = { bg: 'bg-rose-500', text: 'text-white', dot: 'bg-white' };
    } else if (status === 'manutencao') {
      badgeColor = { bg: 'bg-purple-600', text: 'text-white', dot: 'bg-white' };
    }

    const newColumn: KanbanColumn = {
      id,
      shortCode: code.toUpperCase(),
      badgeLabel: code.toUpperCase(),
      machineType: sector,
      badgeColor,
      title: name,
      subtitle: status === 'operando' ? `Operando · ${oee}% OEE` : status === 'ociosa' ? 'Ociosa · Livre para ordem' : 'Parada para setup',
      isQueue: false,
      status,
      oee: Number(oee),
      availability: status === 'operando' ? 92.0 : status === 'ociosa' ? 65.0 : 40.0,
      performance: status === 'operando' ? 95.0 : 70.0,
      quality: 99.0,
      idleMinutes: status === 'ociosa' ? 10 : 0,
      cardIds: []
    };

    onAddMachine(newColumn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cadastrar Nova Máquina / Posto
              </h3>
              <p className="text-[10px] text-slate-500">
                A nova máquina aparecerá imediatamente como uma coluna no Kanban
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Código da Máquina:</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: CNC-02, LAS-01"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Setor / Célula:</label>
              <input
                type="text"
                required
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ex: Usinagem, Solda"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nome Completo do Equipamento:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Centro de Usinagem Vertical 4 Eixos"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Status Inicial:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MachineState)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ociosa">Ociosa / Disponível</option>
                <option value="operando">Operando</option>
                <option value="parada">Parada por Falha</option>
                <option value="manutencao">Em Manutenção</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">OEE Alvo Estimado (%):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={oee}
                onChange={(e) => setOee(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Operador / Técnico Responsável:</label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Ex: Carlos Eduardo (Turno A)"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Adicionar Máquina ao Kanban
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
