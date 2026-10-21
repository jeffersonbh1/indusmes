import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ErpVsMesVsScada = () => {
  const comparisons = [
    {
      criterion: 'Foco Principal',
      erp: 'Financeiro, contabilidade, vendas e planejamento a longo prazo (Semanas/Meses).',
      mes: 'Execução da produção, apontamento em tempo real, OEE e rastreabilidade (Turnos/Horas/Minutos).',
      scada: 'Supervisão visual e controle de processo de máquinas em tempo real (Segundos/Minutos).',
      plc: 'Controle em malha fechada direta de motores, válvulas e sensores (Milissegundos).'
    },
    {
      criterion: 'Pergunta que responde',
      erp: '"O que e quanto a empresa precisa produzir e qual o custo contábil?"',
      mes: '"Como as ordens estão sendo executadas agora e onde estão as perdas?"',
      scada: '"Qual a pressão e temperatura atual do reator neste instante?"',
      plc: '"O sensor fotoelétrico detectou a peça para ligar o pistão?"'
    },
    {
      criterion: 'Quem utiliza',
      erp: 'Diretoria, compras, financeiro, vendas e planejadores de produção (PCP).',
      mes: 'Gerentes de fábrica, engenheiros de produção, supervisores e operadores de linha.',
      scada: 'Operadores de painel de controle, técnicos de automação e instrumentação.',
      plc: 'Engenheiros e programadores de automação (não há interface humana direta).'
    },
    {
      criterion: 'Rastreabilidade',
      erp: 'Lotes contábeis no armazém (entrada e saída de notas fiscais).',
      mes: 'Genealogia detalhada: insumo exato, máquina, operador, segundo e parâmetros.',
      scada: 'Histórico gráfico de variáveis analógicas (curva de temperatura).',
      plc: 'Memória temporária de registradores para lógica de máquina.'
    },
    {
      criterion: 'Cálculo de OEE',
      erp: 'Não calcula com precisão (depende de dados inseridos manualmente).',
      mes: 'Nativo e automático: cruza tempos de sensor com ordens ativas e motivos de parada.',
      scada: 'Pode calcular tempo ligado/desligado bruto, mas não associa a ordens ou produtos.',
      plc: 'Não calcula (apenas fornece os pulsos de contagem brutos).'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
          <span>COMPARAÇÃO TÉCNICA ESTRUTURADA</span>
          <span aria-hidden="true">·</span>
          <span>ARQUITETURA FABRIL</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Diferenças Fundamentais: ERP vs. MES vs. SCADA vs. CLP
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Uma das dúvidas mais comuns na indústria é entender onde termina a responsabilidade de um sistema e começa a do outro.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-700 bg-slate-50 font-semibold">
              <th className="py-3 px-4 w-1/5">Critério</th>
              <th className="py-3 px-4 w-1/5 text-slate-900">ERP (Nível 4)</th>
              <th className="py-3 px-4 w-1/5 text-blue-700 bg-blue-50/50">MES (Nível 3)</th>
              <th className="py-3 px-4 w-1/5 text-slate-900">SCADA (Nível 2)</th>
              <th className="py-3 px-4 w-1/5 text-slate-900">CLP / PLC (Nível 1)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisons.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80">
                <td className="py-3 px-4 font-bold text-slate-900 align-top">
                  {row.criterion}
                </td>
                <td className="py-3 px-4 text-slate-600 align-top leading-relaxed">
                  {row.erp}
                </td>
                <td className="py-3 px-4 text-blue-950 bg-blue-50/30 align-top leading-relaxed font-medium">
                  {row.mes}
                </td>
                <td className="py-3 px-4 text-slate-600 align-top leading-relaxed">
                  {row.scada}
                </td>
                <td className="py-3 px-4 text-slate-600 align-top leading-relaxed">
                  {row.plc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
