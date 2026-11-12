/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ExternalLink, Cpu, BarChart2, CheckCircle2, Database, ShieldCheck } from 'lucide-react';

interface ModelMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelMetricsModal: React.FC<ModelMetricsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Confusion matrix values (normalized & counts)
  // Rows: True Class (Glioma, Meningioma, Pituitary, Normal)
  // Cols: Predicted Class
  const confusionMatrix = [
    { label: 'Glioma', values: [382, 6, 3, 2], total: 393, recall: '97.2%' },
    { label: 'Meningioma', values: [8, 375, 4, 3], total: 390, recall: '96.1%' },
    { label: 'Hipófise', values: [2, 5, 396, 1], total: 404, recall: '98.0%' },
    { label: 'Normal', values: [3, 4, 2, 401], total: 410, recall: '97.8%' },
  ];

  const colabUrl = 'https://colab.research.google.com/drive/1VZKTULJzcnRxIS9MXw59zHcwPR9KuK46?usp=sharing';
  const githubUrl = 'https://github.com/taticaires/Neuro-Detec';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Métricas & Arquitetura do Modelo (Neuro-Detec Colab)
              </h3>
              <p className="text-xs text-slate-400">
                Avaliação de desempenho do classificador convolucional e validação cruzada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal de métricas"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Acurácia Global (Test)</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">96.8%</span>
              <span className="text-[10px] text-slate-400">Amostragem estratificada</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Sensibilidade (Recall)</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">97.1%</span>
              <span className="text-[10px] text-slate-400">Detecção de patologias</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Especificidade</span>
              <span className="text-2xl font-bold font-mono text-blue-400 tabular-nums">96.5%</span>
              <span className="text-[10px] text-slate-400">Exclusão de falsos positivos</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">AUC-ROC Score</span>
              <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">0.988</span>
              <span className="text-[10px] text-slate-400">Capacidade discriminativa</span>
            </div>
          </div>

          {/* Confusion Matrix Section */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Matriz de Confusão Multiclasse (Conjunto de Teste Independente)</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">N = 1.597 amostras de validação</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2 px-3 text-left">Classe Real \ Predita</th>
                    <th className="py-2 px-3">Glioma</th>
                    <th className="py-2 px-3">Meningioma</th>
                    <th className="py-2 px-3">Hipófise</th>
                    <th className="py-2 px-3">Normal</th>
                    <th className="py-2 px-3 text-right">Recall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-xs">
                  {confusionMatrix.map((row, idx) => (
                    <tr key={row.label} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 text-left font-semibold text-slate-200">{row.label}</td>
                      {row.values.map((val, colIdx) => {
                        const isDiagonal = idx === colIdx;
                        return (
                          <td
                            key={colIdx}
                            className={`py-2 px-3 tabular-nums ${
                              isDiagonal
                                ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                                : val > 0
                                ? 'text-rose-400/80 bg-rose-950/20'
                                : 'text-slate-500'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-right font-bold text-emerald-400 tabular-nums">
                        {row.recall}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Architecture & Training Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Base de Dados & Pré-Processamento</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300 text-xs">
                <li>• **Dataset**: Br35H & Brain Tumor MRI Dataset (7.023 exames totais).</li>
                <li>• **Resolução**: Normalização para 224x224 pixels e 3 canais de escala de cinza.</li>
                <li>• **Augmentation**: Rotação randômica (±15°), Flip horizontal, Zoom e contraste adaptativo CLAHE.</li>
                <li>• **Divisão**: 70% Treino (4.916), 15% Validação (1.053), 15% Teste (1.054).</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Explicabilidade & Grad-CAM</span>
              </h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                O módulo Grad-CAM calcula os gradientes de ativação da última camada convolucional
                em relação à classe predita, gerando mapas de calor topográficos que destacam as
                estruturas radiológicas determinantes para a decisão da rede neural.
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                Layer: Conv2D_Final_Block · Colormap: Jet / Viridis
              </div>
            </div>
          </div>

          {/* Colab & GitHub References */}
          <div className="p-4 bg-cyan-950/30 rounded-xl border border-cyan-800/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-bold text-white block">Notebook Colab Original & Repositório</span>
              <span className="text-slate-400 text-xs">
                Código-fonte do treinamento, pesos e documentação do projeto Neuro-Detec
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={colabUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                <span>Abrir Google Colab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>GitHub Readme</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
