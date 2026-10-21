import { useState } from 'react';
import { X, UserPlus, ShieldCheck } from 'lucide-react';
import { UserSession } from './LoginScreen';

interface NewUserModalProps {
  onClose: () => void;
  onAddUser: (user: UserSession) => void;
}

export const NewUserModal = ({ onClose, onAddUser }: NewUserModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState(`RE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [role, setRole] = useState<UserSession['role']>('Operador Especialista');
  const [shift, setShift] = useState('Turno A (06:00 - 14:30)');

  const avatarColors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserSession = {
      id: `usr-${Date.now()}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@indusmes.com.br`,
      role,
      matricula,
      shift,
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)]
    };

    onAddUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cadastrar Usuário / Operador
              </h3>
              <p className="text-[10px] text-slate-500">
                Adicione operadores, supervisores e técnicos ao sistema MES
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
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nome Completo:</label>
            <input
              type="text"
              required
              placeholder="Ex: Roberto Silveira"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Matrícula / RE:</label>
              <input
                type="text"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cargo / Função:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserSession['role'])}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Operador Especialista">Operador Especialista</option>
                <option value="Supervisor de Linha">Supervisor de Linha</option>
                <option value="Técnico de Manutenção">Técnico de Manutenção</option>
                <option value="Gerente de Produção">Gerente de Produção</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">E-mail Corporativo:</label>
            <input
              type="email"
              placeholder="Ex: roberto.silveira@indusmes.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Turno de Trabalho:</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Turno A (06:00 - 14:30)">Turno A (06:00 - 14:30)</option>
              <option value="Turno B (14:30 - 22:30)">Turno B (14:30 - 22:30)</option>
              <option value="Turno C (22:30 - 06:00)">Turno C (22:30 - 06:00)</option>
              <option value="Administrativo / Geral">Administrativo / Geral</option>
            </select>
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
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Cadastrar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
