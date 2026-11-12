/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PatientInfo } from '../types/mri';
import { User, Calendar, ShieldCheck, Activity } from 'lucide-react';

interface PatientBannerProps {
  patient: PatientInfo;
  activeSequence: string;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  presetCases: Array<{ id: string; shortLabel: string; category: string }>;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  activeSequence,
  activePresetId,
  onSelectPreset,
  presetCases,
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Patient demographics */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-100 text-sm tracking-tight">{patient.name}</span>
          <span className="font-mono text-cyan-400/90 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            {patient.id}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>{patient.age} anos</span>
          <span aria-hidden="true">·</span>
          <span>{patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : 'Outro'}</span>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className="font-mono">{patient.studyDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium">{activeSequence}</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400">Campo 1.5 Tesla</span>
        </div>
      </div>

      {/* Case presets segmented selector */}
      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-400 px-2 uppercase tracking-wider">
          Casos Clínicos:
        </span>
        {presetCases.map((c) => {
          const isActive = c.id === activePresetId;
          return (
            <button
              key={c.id}
              onClick={() => onSelectPreset(c.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {c.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
