/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Brain, FileText, BarChart3, UploadCloud, Stethoscope } from 'lucide-react';

interface HeaderProps {
  onOpenReport: () => void;
  onOpenMetrics: () => void;
  onOpenUpload: () => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReport,
  onOpenMetrics,
  onOpenUpload,
  onReanalyze,
  isAnalyzing,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100 z-30">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <a
        href="/"
        className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
      >
        <Brain className="w-5 h-5 text-cyan-400 shrink-0" />
        <span>Neuro-Detec</span>
      </a>

      {/* Zone 2: 4–5 clean single-line navigation actions */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400/80" />
          <span>Carregar Exame</span>
        </button>
        <button
          onClick={onOpenReport}
          className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <FileText className="w-4 h-4 text-cyan-400/80" />
          <span>Laudo Médico CBR</span>
        </button>
        <button
          onClick={onOpenMetrics}
          className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <BarChart3 className="w-4 h-4 text-cyan-400/80" />
          <span>Métricas do Modelo Colab</span>
        </button>
        <a
          href="https://colab.research.google.com/drive/1VZKTULJzcnRxIS9MXw59zHcwPR9KuK46?usp=sharing"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Stethoscope className="w-4 h-4 text-cyan-400/80" />
          <span>Notebook Colab</span>
        </a>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className={`px-4 py-2 text-xs font-semibold rounded-lg text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap shrink-0 ${
            isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Processando Imagem...</span>
            </>
          ) : (
            <>
              <Brain className="w-3.5 h-3.5" />
              <span>Processar Análise IA</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
