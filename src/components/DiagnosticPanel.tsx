/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MriAnalysisResult } from '../types/mri';
import { evaluateClinicalRisk, formatConfidence } from '../utils/mriLogic';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface DiagnosticPanelProps {
  analysis: MriAnalysisResult;
  onOpenReport: () => void;
  onOpenMetrics: () => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  analysis,
  onOpenReport,
  onOpenMetrics,
}) => {
  const risk = evaluateClinicalRisk(analysis.category, analysis.confidence, analysis.whoGrade);

  const riskBadgeStyles = {
    normal: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
    low: 'bg-blue-950/40 text-blue-300 border-blue-800/60',
    moderate: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
    high: 'bg-orange-950/40 text-orange-300 border-orange-800/60',
    critical: 'bg-rose-950/40 text-rose-300 border-rose-800/60',
  }[risk.level];

  return (
    <div className="flex flex-col gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg text-slate-100">
      {/* Primary Diagnostic Classification */}
      <div className="flex flex-col gap-2.5 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Classificação Diagnóstica
            </span>
          </div>
          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
            Neuro-Detec AI
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
            {analysis.primaryDiagnosis}
          </h2>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {formatConfidence(analysis.confidence)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Confiabilidade
            </span>
          </div>
        </div>

        {/* Clinical Urgency Banner */}
        <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${riskBadgeStyles}`}>
          {risk.level === 'normal' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{risk.urgencyLabel}</span>
            <span className="text-slate-300 leading-relaxed">{risk.suggestedAction}</span>
          </div>
        </div>
      </div>

      {/* Model Probabilities / Differential Diagnosis Distribution */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Probabilidades por Classe</span>
          <button
            onClick={onOpenMetrics}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono"
          >
            Ver Matriz de Confusão
          </button>
        </div>

        <div className="space-y-2">
          {analysis.probabilities.map((prob) => {
            const pct = Math.round(prob.confidence * 100);
            const isHighest = prob.confidence === Math.max(...analysis.probabilities.map((p) => p.confidence));

            return (
              <div key={prob.id} className="flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isHighest ? 'text-white' : 'text-slate-400'}`}>
                    {prob.name}
                  </span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {formatConfidence(prob.confidence)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighest
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Morphometric & Anatomical Key Findings Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex flex-col gap-1 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Topografia / Localização</span>
          <span className="text-slate-200 font-medium leading-tight">
            {analysis.anatomicalLocation}
          </span>
        </div>

        <div className="flex flex-col gap-1 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Classificação OMS (WHO)</span>
          <span className="text-slate-200 font-bold font-mono">
            {analysis.whoGrade === 'Não Aplicável' ? 'Não Aplicável' : `Grau ${analysis.whoGrade}`}
          </span>
          <span className="text-[10px] text-slate-400">Classificação SNC 2021</span>
        </div>

        <div className="flex flex-col gap-1 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Dimensões & Volume</span>
          {analysis.dimensions.lengthMm > 0 ? (
            <div className="flex flex-col">
              <span className="font-mono text-slate-200 tabular-nums">
                {analysis.dimensions.lengthMm} × {analysis.dimensions.widthMm} mm
              </span>
              <span className="font-mono text-cyan-400 text-[11px] tabular-nums font-semibold">
                Vol: ~{analysis.dimensions.volumeCm3} cm³
              </span>
            </div>
          ) : (
            <span className="text-slate-400">Sem lesão mensurável</span>
          )}
        </div>

        <div className="flex flex-col gap-1 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Efeito de Massa / Desvio</span>
          <span className="text-slate-200 font-medium leading-tight">
            {analysis.massEffect}
          </span>
        </div>
      </div>

      {/* Action Footer: Open Full Structured Medical Report */}
      <div className="pt-2">
        <button
          onClick={onOpenReport}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs transition-colors border border-slate-700 shadow-sm"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Abrir Laudo Médico Estruturado (CBR)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
        </button>
      </div>
    </div>
  );
};
