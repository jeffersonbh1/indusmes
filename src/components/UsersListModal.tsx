import { useState } from 'react';
import { X, Users, Search, CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react';
import { UserSession } from './LoginScreen';

interface UsersListModalProps {
  users: UserSession[];
  onClose: () => void;
  onOpenNewUser: () => void;
}

export const UsersListModal = ({ users, onClose, onOpenNewUser }: UsersListModalProps) => {
  const [query, setQuery] = useState('');

  const filtered = users.filter((u) => 
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.matricula.toLowerCase().includes(query.toLowerCase()) ||
    u.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Usuários e Operadores Cadastrados
              </h3>
              <p className="text-[10px] text-slate-500">
                {users.length} profissionais habilitados na planta
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

        {/* Search & Action */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula ou cargo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenNewUser();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {/* List of Users */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.avatarColor}`}>
                  {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {u.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-slate-700 font-semibold">{u.matricula}</span>
                    <span>·</span>
                    <span className="text-blue-700 font-medium">{u.role}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {u.shift}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Ativo / NR-12
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Nenhum usuário encontrado com o termo "{query}".
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
