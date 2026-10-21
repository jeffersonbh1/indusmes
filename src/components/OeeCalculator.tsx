import { useState } from 'react';
import { Calculator, Award, Info, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

export const OeeCalculator = () => {
  const [plannedShiftMin, setPlannedShiftMin] = useState<number>(480); // 8 horas
  const [plannedDowntimeMin, setPlannedDowntimeMin] = useState<number>(30); // almoço/reunião
  const [unplannedDowntimeMin, setUnplannedDowntimeMin] = useState<number>(55); // quebras/setup
  const [idealCycleSec, setIdealCycleSec] = useState<number>(3.5); // 3.5s por peça
  const [totalProduced, setTotalProduced] = useState<number>(6500);
  const [scrapUnits, setScrapUnits] = useState<number>(130);

  // Calculations
  const operatingPlannedTime = Math.max(1, plannedShiftMin - plannedDowntimeMin);
  const actualOperatingTime = Math.max(0, operatingPlannedTime - unplannedDowntimeMin);

  // Availability = Actual Operating Time / Planned Operating Time
  const availability = Math.min(100, Math.max(0, (actualOperatingTime / operatingPlannedTime) * 100));

  // Performance = (Total Units Produced * Ideal Cycle Time in min) / Actual Operating Time
  const idealProductionTimeMin = (totalProduced * idealCycleSec) / 60;
  const performance =
    actualOperatingTime > 0
      ? Math.min(100, Math.max(0, (idealProductionTimeMin / actualOperatingTime) * 100))
      : 0;

  // Quality = (Total - Scrap) / Total
  const goodUnits = Math.max(0, totalProduced - scrapUnits);
  const quality = totalProduced > 0 ? (goodUnits / totalProduced) * 100 : 100;

  // Overall OEE
  const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <span>LABORATÓRIO DIDÁTICO</span>
            <span aria-hidden="true">·</span>
            <span>OEE (OVERALL EQUIPMENT EFFECTIVENESS)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Calculadora Interativa de OEE e as 6 Grandes Perdas
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            O OEE é o indicador de ouro calculado pelo MES. Ele mede a porcentagem de tempo em que a fábrica é <strong>verdadeiramente produtiva</strong>. Experimente ajustar os parâmetros abaixo e veja como pequenos atrasos derrubam o índice global.
          </p>
        </div>
      </div>

      {/* Main Calculator Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Sliders */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Parâmetros do Turno & Chão de Fábrica
          </h2>

          {/* Turno Planejado */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">1. Duração do Turno Planejado:</label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{plannedShiftMin} min ({plannedShiftMin / 60}h)</span>
            </div>
            <input
              type="range"
              min={120}
              max={720}
              step={30}
              value={plannedShiftMin}
              onChange={(e) => setPlannedShiftMin(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Paradas Não Programadas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">2. Paradas Não Planejadas (Quebras, Setup, Falta de Material):</label>
              <span className="font-mono font-bold text-red-600 tabular-nums">{unplannedDowntimeMin} min</span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={5}
              value={unplannedDowntimeMin}
              onChange={(e) => setUnplannedDowntimeMin(Number(e.target.value))}
              className="w-full accent-red-600"
            />
            <p className="text-[11px] text-slate-400">
              Impacta a <strong>Disponibilidade</strong>.
            </p>
          </div>

          {/* Ciclo Ideal */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">3. Tempo de Ciclo Ideal por Peça (Nome de Engenharia):</label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{idealCycleSec.toFixed(1)} segundos</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={idealCycleSec}
              onChange={(e) => setIdealCycleSec(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Peças Totais Produzidas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">4. Total de Peças Produzidas no Turno:</label>
              <span className="font-mono font-bold text-indigo-700 tabular-nums">{totalProduced.toLocaleString()} un</span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={250}
              value={totalProduced}
              onChange={(e) => setTotalProduced(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-400">
              Impacta a <strong>Performance</strong> (velocidade real vs capacidade nominal).
            </p>
          </div>

          {/* Peças Refugadas / Sucateadas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">5. Peças Refugadas / Não Conformes (Scrap):</label>
              <span className="font-mono font-bold text-red-600 tabular-nums">{scrapUnits} un</span>
            </div>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={scrapUnits}
              onChange={(e) => setScrapUnits(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <p className="text-[11px] text-slate-400">
              Impacta a <strong>Qualidade</strong>.
            </p>
          </div>
        </div>

        {/* Right: Real-time Mathematical Results */}
        <div className="lg:col-span-6 space-y-4">
          {/* Big OEE Result Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>RESULTADO FINAL DO OEE</span>
              <span className="font-mono">D × P × Q</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tabular-nums">
                {oee.toFixed(1)}%
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded border ${
                  oee >= 85
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : oee >= 70
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                {oee >= 85
                  ? 'Classe Mundial (World Class)'
                  : oee >= 70
                  ? 'Típico Industrial (Satisfatório)'
                  : 'Gargalo Crítico (Atenção)'}
              </span>
            </div>

            {/* Formula visualization */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
              <div>
                {availability.toFixed(1)}% (D) × {performance.toFixed(1)}% (P) × {quality.toFixed(1)}% (Q)
              </div>
              <div className="text-[11px] text-slate-500">
                = {(availability / 100).toFixed(3)} × {(performance / 100).toFixed(3)} × {(quality / 100).toFixed(3)} = <strong>{oee.toFixed(1)}%</strong>
              </div>
            </div>

            {/* Component Breakdown Bars */}
            <div className="space-y-3 pt-2">
              {/* D */}
              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Disponibilidade (D)</span>
                  <span className="font-mono font-bold text-blue-700 tabular-nums">{availability.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${availability}%` }} />
                </div>
              </div>

              {/* P */}
              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Performance (P)</span>
                  <span className="font-mono font-bold text-indigo-700 tabular-nums">{performance.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${performance}%` }} />
                </div>
              </div>

              {/* Q */}
              <div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Qualidade (Q)</span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">{quality.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: `${quality}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark World Class */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              O Que é OEE de Classe Mundial (World Class)?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Consagrado por Seiichi Nakajima (criador do TPM):
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Disp. Ideal</span>
                <span className="font-bold text-slate-800">≥ 90.0%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Perf. Ideal</span>
                <span className="font-bold text-slate-800">≥ 95.0%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block">Qual. Ideal</span>
                <span className="font-bold text-slate-800">≥ 99.9%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Multiplicando os três valores ideais: 0.90 × 0.95 × 0.999 ≈ 85.4%. Por isso, um OEE de 85% é o patamar de excelência das melhores fábricas do planeta!
            </p>
          </div>
        </div>
      </div>

      {/* As 6 Grandes Perdas da Manufatura (TPM) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Como o MES Mapeia as 6 Grandes Perdas da Manufatura (Six Big Losses)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Perdas de Disponibilidade */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                1. Perdas de Disponibilidade
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>Falhas de Equipamento:</strong> Quebras mecânicas imprevistas, falha de inversor, falta de ar.</li>
              <li><strong>Setup e Ajustes:</strong> Troca de molde/matriz, aquecimento de máquina, limpeza de linha.</li>
            </ul>
          </div>

          {/* Perdas de Performance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                2. Perdas de Performance
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>Pequenas Paradas (Idling):</strong> Engasgo de frascos na esteira por 15 segundos, micro-paradas não registradas no papel.</li>
              <li><strong>Velocidade Reduzida:</strong> Máquina rodando abaixo da velocidade de projeto para evitar travamentos.</li>
            </ul>
          </div>

          {/* Perdas de Qualidade */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                3. Perdas de Qualidade
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>Defeitos em Processo:</strong> Peças fora de cota dimensional, embalagem com vazamento, solda fria.</li>
              <li><strong>Perdas de Ramp-up (Início):</strong> Peças descartadas nos primeiros 20 minutos de ajuste de setup até estabilizar temperatura.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
