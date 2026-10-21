import { useState } from 'react';
import { MOCK_TRACEABILITY_RECORD } from '../data/mockData';
import { BatchTraceabilityRecord } from '../types/mes';
import { Search, ShieldCheck, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, RefreshCw, Layers } from 'lucide-react';

export const TraceabilityModule = () => {
  const [searchTerm, setSearchTerm] = useState<string>('LOTE-FARMA-2026-088');
  const [record, setRecord] = useState<BatchTraceabilityRecord>(MOCK_TRACEABILITY_RECORD);
  const [activeTab, setActiveTab] = useState<'raw' | 'process' | 'quality'>('raw');
  const [exportNotice, setExportNotice] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Keep or reload mock with feedback
    setRecord({ ...MOCK_TRACEABILITY_RECORD, batchNumber: searchTerm.toUpperCase() });
  };

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span>ELECTRONIC BATCH RECORD (EBR)</span>
              <span aria-hidden="true">·</span>
              <span>MESA FUNÇÃO 6</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Rastreabilidade Total & Genealogia de Lote
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              O MES registra o "prontuário digital" da manufatura: saiba exatamente qual fornecedor, máquina, operador e sensor esteve presente em cada segundo da produção.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            Exportar Certificado de Análise (CoA)
          </button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-4 flex flex-wrap items-center gap-2 max-w-xl">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o número do lote (ex: LOTE-FARMA-2026-088)"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Buscar Genealogia
          </button>
        </form>

        {exportNotice && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Certificado de Análise e Genealogia exportado com assinatura eletrônica em conformidade com CFR 21 Part 11!
            </span>
          </div>
        )}
      </div>

      {/* Batch Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                LOTE: {record.batchNumber}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-300">
                Status: Liberado para Expedição (Aprovado CQ)
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {record.productName}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Fabricação: <span className="font-mono">{record.manufactureDate}</span> · Validade: <span className="font-mono">{record.expiryDate}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <div><strong>Linha:</strong> {record.productionLine}</div>
            <div><strong>Responsável Técnico:</strong> {record.operator}</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-md">
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'raw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            1. Matérias-Primas (BOM)
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'process' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            2. Parâmetros de Processo
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'quality' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            3. Ensaios de Qualidade
          </button>
        </div>

        {/* Tab 1: Raw Materials */}
        {activeTab === 'raw' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lotes de Insumos e Matérias-Primas Consumidas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Material / Insumo</th>
                    <th className="py-2.5 px-3 font-semibold">Lote do Fornecedor</th>
                    <th className="py-2.5 px-3 font-semibold">Fornecedor Homologado</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Qtd Consumida</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.rawMaterials.map((mat, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{mat.name}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-700">{mat.lotNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600">{mat.supplier}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">{mat.quantity}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Conforme
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Process Parameters */}
        {activeTab === 'process' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Parâmetros Críticos de Controle (CPP) Gravados pelos Sensores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {record.processParameters.map((param, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{param.parameter}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Em Tolerância
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                    <span className="text-slate-500">Alvo Engenharia: {param.target}</span>
                    <span className="font-bold text-slate-900">Real Medido: {param.measured}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Quality Tests */}
        {activeTab === 'quality' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ensaios Físico-Químicos e Inspeção Final de Liberação
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold">Ensaio / Teste</th>
                    <th className="py-2.5 px-3 font-semibold">Especificação Farmacopeica</th>
                    <th className="py-2.5 px-3 font-semibold">Resultado Obtido</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Parecer Técnico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.qualityTests.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{t.testName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{t.specification}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.result}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Aprovado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Real World Case: O Cenário do Recall Cirúrgico */}
      <div className="bg-slate-900 text-white rounded-xl p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <span>CASO PRÁTICO INDUSTRIAL</span>
          <span aria-hidden="true">·</span>
          <span>POR QUE A RASTREABILIDADE DO MES SALVA MILHÕES</span>
        </div>

        <h3 className="text-lg md:text-xl font-bold">
          Cenário: Fornecedor avisa que um lote de tampas plásticas estava com microfissuras
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700 space-y-2">
            <span className="font-bold text-red-400 block text-sm">
              Sem Sistema MES (Fábrica Convencional a Papel)
            </span>
            <p>
              A equipe leva de 2 a 3 semanas vasculhando pastas de arquivos de papel e relatórios de turno para saber quais produtos receberam aquelas tampas. Com medo de sanções da Anvisa ou processos, a diretoria é obrigada a recolher <strong>todos os produtos fabricados nos últimos 3 meses</strong>. Custo: Milhões de reais e danos graves à reputação da marca.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700 space-y-2">
            <span className="font-bold text-emerald-400 block text-sm">
              Com Sistema MES (Rastreabilidade Digital Integrada)
            </span>
            <p>
              O engenheiro insere o código do insumo <code className="text-amber-300">CAP-LAC-4410</code> no MES. Em <strong>4 segundos</strong>, o sistema lista exatamente as 10.200 unidades do lote <code className="text-amber-300">LOTE-FARMA-2026-088</code> que o utilizaram, com número de paletes e centros de distribuição. Faz-se um recall cirúrgico e 100% controlado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
