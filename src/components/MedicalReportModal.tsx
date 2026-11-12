/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PatientInfo, MriAnalysisResult } from '../types/mri';
import { X, Printer, Check, Edit3, Shield, Hospital } from 'lucide-react';

interface MedicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientInfo;
  analysis: MriAnalysisResult;
  activeSequence: string;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  analysis,
  activeSequence,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [reportData, setReportData] = useState(analysis.report);
  const [radiologistName, setRadiologistName] = useState('Dr. Marcelo de Andrade Guimarães');
  const [radiologistCrm, setRadiologistCrm] = useState('CRM/SP 114.730 - RQE Neurorradiologia 48.912');

  useEffect(() => {
    setReportData(analysis.report);
  }, [analysis]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden my-8 border border-slate-300">
        {/* Top Modal Bar (Excluded from print) */}
        <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Hospital className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-sm">Laudo Médico Estruturado de Ressonância Magnética</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditing ? 'Concluir Edição' : 'Editar Laudo'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar modal de laudo"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Medical Document Body */}
        <div className="p-8 font-sans space-y-6 text-sm leading-relaxed">
          {/* Institutional Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                CENTRO AVANÇADO DE NEURORRADIOLOGIA DIAGNÓSTICA
              </span>
              <span className="text-xs text-slate-600">
                Instituto de Neurociências e Diagnóstico por Imagem · Sistema Neuro-Detec AI
              </span>
            </div>
            <div className="text-right text-xs font-mono text-slate-500">
              <div>PROTOCOLO: {patient.id}-RM</div>
              <div>DATA: {patient.studyDate}</div>
            </div>
          </div>

          {/* Patient Demographics Table */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Paciente:</span>
              <span className="font-semibold text-slate-900">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Idade / Sexo:</span>
              <span className="font-semibold text-slate-900">
                {patient.age} anos · {patient.gender === 'M' ? 'Masculino' : 'Feminino'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Médico Solicitante:</span>
              <span className="font-semibold text-slate-900">{patient.referringPhysician}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Modalidade:</span>
              <span className="font-semibold text-slate-900">RM Encéfalo (1.5 Tesla)</span>
            </div>
          </div>

          {/* Clinical Indication */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 border-b border-slate-200 pb-1">
              1. Indicação Clínica
            </h4>
            {isEditing ? (
              <textarea
                value={reportData.indication}
                onChange={(e) => setReportData({ ...reportData, indication: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 focus:ring-1 focus:ring-cyan-500"
                rows={2}
              />
            ) : (
              <p className="text-slate-800 text-xs">{reportData.indication}</p>
            )}
          </div>

          {/* Technique */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 border-b border-slate-200 pb-1">
              2. Técnica do Exame
            </h4>
            {isEditing ? (
              <textarea
                value={reportData.technique}
                onChange={(e) => setReportData({ ...reportData, technique: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 focus:ring-1 focus:ring-cyan-500"
                rows={2}
              />
            ) : (
              <p className="text-slate-800 text-xs">{reportData.technique}</p>
            )}
          </div>

          {/* Findings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 border-b border-slate-200 pb-1">
              3. Descrição dos Achados
            </h4>
            {isEditing ? (
              <textarea
                value={reportData.findings}
                onChange={(e) => setReportData({ ...reportData, findings: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 focus:ring-1 focus:ring-cyan-500"
                rows={5}
              />
            ) : (
              <p className="text-slate-800 text-xs leading-relaxed text-justify">{reportData.findings}</p>
            )}
          </div>

          {/* Morphometric Summary Table */}
          <div className="border border-slate-200 rounded p-3 bg-slate-50/50 text-xs">
            <span className="font-semibold text-slate-900 block mb-1.5">
              Parâmetros Volumétricos e de Topografia (Neuro-Detec AI Assistance):
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700 font-mono text-[11px]">
              <div>
                Localização: <span className="font-bold text-slate-900">{analysis.anatomicalLocation}</span>
              </div>
              <div>
                Dimensões: <span className="font-bold text-slate-900">{analysis.dimensions.lengthMm} x {analysis.dimensions.widthMm} mm</span>
              </div>
              <div>
                Volume Est.: <span className="font-bold text-slate-900">{analysis.dimensions.volumeCm3} cm³</span>
              </div>
              <div>
                Grau OMS: <span className="font-bold text-slate-900">{analysis.whoGrade}</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Impression */}
          <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
              4. Impressão Diagnóstica
            </h4>
            {isEditing ? (
              <textarea
                value={reportData.impression}
                onChange={(e) => setReportData({ ...reportData, impression: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-cyan-500 font-medium"
                rows={3}
              />
            ) : (
              <p className="text-slate-900 font-medium text-xs leading-relaxed">{reportData.impression}</p>
            )}
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 border-b border-slate-200 pb-1">
              5. Recomendações e Conduta Sugerida
            </h4>
            {isEditing ? (
              <textarea
                value={reportData.recommendation}
                onChange={(e) => setReportData({ ...reportData, recommendation: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 focus:ring-1 focus:ring-cyan-500"
                rows={2}
              />
            ) : (
              <p className="text-slate-800 text-xs">{reportData.recommendation}</p>
            )}
          </div>

          {/* Physician Sign-Off & Verification Stamp */}
          <div className="pt-8 border-t border-slate-300 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-600 shrink-0" />
              <div className="flex flex-col text-[11px]">
                <span className="font-semibold text-slate-900">Validação Algorítmica e Humana</span>
                <span>Análise assistida por modelo computacional convolucional Neuro-Detec.</span>
                <span>A decisão terapêutica final é de responsabilidade estrita do corpo clínico.</span>
              </div>
            </div>

            <div className="text-center md:text-right flex flex-col items-center md:items-end">
              <div className="w-48 border-b border-slate-900 mb-1" />
              <span className="font-semibold text-slate-900">{radiologistName}</span>
              <span className="text-[11px] font-mono text-slate-500">{radiologistCrm}</span>
              <span className="text-[10px] text-slate-400">Assinado digitalmente conforme ICP-Brasil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
