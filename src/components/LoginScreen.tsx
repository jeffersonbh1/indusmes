import { useState } from 'react';
import { Factory, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Gerente de Produção' | 'Supervisor de Linha' | 'Operador Especialista' | 'Técnico de Manutenção';
  matricula: string;
  shift: string;
  avatarColor: string;
}

interface LoginScreenProps {
  onLogin: (user: UserSession) => void;
  availableUsers?: UserSession[];
}

export const LoginScreen = ({ onLogin, availableUsers }: LoginScreenProps) => {
  const [email, setEmail] = useState('gerente@indusmes.com.br');
  const [password, setPassword] = useState('123456');

  const DEMO_USERS: UserSession[] = [
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
      email: 'operador@indusmes.com.br',
      role: 'Operador Especialista',
      matricula: 'RE-1044',
      shift: 'Turno A (06:00 - 14:30)',
      avatarColor: 'bg-amber-600'
    }
  ];

  const usersList = availableUsers && availableUsers.length > 0 ? availableUsers : DEMO_USERS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = email.trim().toLowerCase();
    const matched = usersList.find(
      (u) => u.email.toLowerCase() === cleanInput || u.matricula.toLowerCase() === cleanInput
    ) || usersList[0];
    onLogin(matched);
  };

  return (
    <div className="min-h-screen w-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden">
        {/* Top Header - Clean Light Theme */}
        <div className="bg-white border-b border-slate-100 p-6 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md mx-auto mb-1">
            <Factory className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            IndusMES Industrial
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sistema de Execução da Manufatura · Acesso Seguro
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              E-mail Corporativo ou Matrícula:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: gerente@indusmes.com.br"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Senha de Acesso:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Acessar Chão de Fábrica</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Selector */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 text-center uppercase tracking-wider">
              Acesso Rápido para Demonstração:
            </span>
            <div className="space-y-1.5">
              {usersList.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onLogin(user)}
                  className="w-full p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all cursor-pointer group bg-slate-50/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${user.avatarColor}`}>
                      {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {user.role} · {user.matricula}
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Autenticação Auditada · Em conformidade com ISA-95 e CFR 21 Part 11
        </div>
      </div>
    </div>
  );
};
