/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRESET_CASES } from './data/presetCases';
import { PresetCase, PatientInfo, MriAnalysisResult } from './types/mri';
import { Header } from './components/Header';
import { PatientBanner } from './components/PatientBanner';
import { MriViewer } from './components/MriViewer';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { MedicalReportModal } from './components/MedicalReportModal';
import { ModelMetricsModal } from './components/ModelMetricsModal';
import { UploadModal } from './components/UploadModal';
import { Sparkles, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  // Active case state
  const [activeCase, setActiveCase] = useState<PresetCase>(PRESET_CASES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Switch between preset clinical cases
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_CASES.find((c) => c.id === presetId);
    if (found) {
      setActiveCase(found);
      setErrorMessage(null);
    }
  };

  // Re-run AI analysis via backend API
  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const isCustomImage = activeCase.imageUrl?.startsWith('data:image/');
      const response = await fetch('/api/analyze-mri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: isCustomImage ? undefined : activeCase.id.replace('case-', ''),
          imageBase64: isCustomImage ? activeCase.imageUrl : undefined,
          sequence: activeCase.sequence,
          patientInfo: activeCase.patientInfo,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setActiveCase((prev) => ({
          ...prev,
          analysis: data.analysis,
        }));
      } else {
        setErrorMessage(data.error || 'Erro ao processar imagem.');
      }
    } catch (err: any) {
      console.warn('API error, keeping clinical ground-truth cache:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle custom uploaded scan
  const handleUploadComplete = async (
    imageBase64: string,
    patientInfo: PatientInfo,
    sequence: string
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-mri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          sequence,
          patientInfo,
        }),
      });

      const data = await response.json();
      const analysis: MriAnalysisResult = data.success ? data.analysis : activeCase.analysis;

      const newCase: PresetCase = {
        id: `upload-${Date.now()}`,
        title: `Exame Carregado: ${patientInfo.name}`,
        shortLabel: 'Upload Personalizado',
        category: analysis.category,
        sequence,
        sliceOrientation: sequence.includes('Sagital') ? 'Sagital' : 'Axial',
        imageUrl: imageBase64,
        patientInfo,
        analysis,
      };

      setActiveCase(newCase);
    } catch (err: any) {
      console.error('Falha ao processar upload:', err);
      setErrorMessage('Erro ao conectar com a API de análise de imagem.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Bar Header (Adhering strictly to Top Bar Contract) */}
      <Header
        onOpenReport={() => setIsReportOpen(true)}
        onOpenMetrics={() => setIsMetricsOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onReanalyze={handleReanalyze}
        isAnalyzing={isAnalyzing}
      />

      {/* Patient & Case Demographics Ribbon */}
      <PatientBanner
        patient={activeCase.patientInfo}
        activeSequence={activeCase.sequence}
        activePresetId={activeCase.id}
        onSelectPreset={handleSelectPreset}
        presetCases={PRESET_CASES}
      />

      {/* Error alert if any */}
      {errorMessage && (
        <div className="bg-rose-950/60 border-b border-rose-800 text-rose-300 text-xs px-6 py-2.5 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white underline font-mono text-[11px]"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Clinical Diagnostic Workspace (Split Console Layout) */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Viewport Column (7 or 8 columns on desktop) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <MriViewer
            imageUrl={activeCase.imageUrl}
            category={activeCase.analysis.category}
            primaryDiagnosis={activeCase.analysis.primaryDiagnosis}
            confidence={activeCase.analysis.confidence}
            boundingBox={activeCase.analysis.boundingBox}
            heatmapPoints={activeCase.analysis.heatmapPoints}
            sliceOrientation={activeCase.sliceOrientation}
            activeSequence={activeCase.sequence}
          />

          {/* Quick Case Thumbnails Switcher */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                Galeria de Casos de Referência Diagnóstica
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                4 Casos Clínicos Estratificados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_CASES.map((c) => {
                const isSelected = c.id === activeCase.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectPreset(c.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <img
                      src={c.imageUrl}
                      alt={c.shortLabel}
                      className="w-10 h-10 rounded object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-slate-100 truncate">
                        {c.shortLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {c.patientInfo.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Diagnostic Results Column (4 or 5 columns on desktop) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <DiagnosticPanel
            analysis={activeCase.analysis}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenMetrics={() => setIsMetricsOpen(true)}
          />

          {/* Clinical Assistant Note */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-300">
                Nota de Conformidade para Uso Médico
              </span>
              <p className="leading-relaxed text-[11px] text-slate-400">
                O Neuro-Detec é uma ferramenta de triagem e apoio ao diagnóstico por imagem
                desenvolvida a partir de redes neurais convolucionais (CNNs). Os achados devem ser
                correlacionados com a anamnese, exame físico neurológico e avaliação especializada
                do médico neurorradiologista.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Structured Medical Report Modal (CBR standard with print) */}
      <MedicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        patient={activeCase.patientInfo}
        analysis={activeCase.analysis}
        activeSequence={activeCase.sequence}
      />

      {/* Model Architecture & Training Metrics Modal */}
      <ModelMetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
      />

      {/* Upload Custom MRI Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
