/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, FileImage, User, Calendar } from 'lucide-react';
import { PatientInfo } from '../types/mri';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (imageBase64: string, patientInfo: PatientInfo, sequence: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('Paciente Novo');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Outro'>('M');
  const [patientId, setPatientId] = useState(`PAC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [sequence, setSequence] = useState('T2 Axial');
  const [clinicalIndication, setClinicalIndication] = useState('Investigação diagnóstica de queixa neurológica focal.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecione um arquivo de imagem válido (PNG, JPG, DICOM exportado).');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      setBase64Data(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!base64Data) {
      setErrorMessage('Por favor faça upload da imagem de ressonância magnética.');
      return;
    }

    const patientInfo: PatientInfo = {
      id: patientId,
      name: patientName,
      age: Number(patientAge),
      gender: patientGender,
      studyDate: new Date().toISOString().split('T')[0],
      referringPhysician: 'Equipe de Neurologia e Neurorradiologia',
      clinicalIndication,
    };

    onUploadComplete(base64Data, patientInfo, sequence);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Carregar Novo Exame de Ressonância Magnética
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal de upload"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Upload Zone */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 font-semibold block">Imagem de Ressonância (Corte Axial, Sagital ou Coronal):</label>
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl p-6 text-center transition-colors bg-slate-950/40 flex flex-col items-center justify-center">
              {previewUrl ? (
                <div className="relative group max-h-48 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview exame"
                    className="max-h-48 rounded object-contain border border-slate-700"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs font-medium">
                      Trocar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <UploadCloud className="w-10 h-10 text-cyan-400" />
                  <span className="font-semibold text-slate-200 text-sm">
                    Clique para selecionar ou arraste o exame aqui
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Formatos suportados: PNG, JPG, JPEG, TIFF (exportados de workstation DICOM)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Demographics & Clinical Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Nome do Paciente:</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Prontuário / ID:</label>
              <input
                type="text"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Idade:</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Sexo Biológico:</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as 'M' | 'F' | 'Outro')}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Sequência de RM:</label>
              <select
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="T2 Axial">T2 Axial</option>
                <option value="T1 Contrast-Enhanced Axial">T1 Axial Pós-Contraste</option>
                <option value="FLAIR Axial">FLAIR Axial</option>
                <option value="T1 Sagital">T1 Sagital</option>
                <option value="Coronal T2">Coronal T2</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Indicação / Sintomas Clínicos:</label>
              <input
                type="text"
                value={clinicalIndication}
                onChange={(e) => setClinicalIndication(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!base64Data}
              className={`px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors ${
                !base64Data ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Processar Diagnóstico IA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
