/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BoundingBox, DiagnosticProbability, WHOGrade } from '../utils/mriLogic';
export type { BoundingBox, DiagnosticProbability, WHOGrade };

export interface HeatmapPoint {
  x: number; // 0-100%
  y: number; // 0-100%
  intensity: number; // 0-1
  radius: number; // in pixels
}

export interface LesionDimensions {
  lengthMm: number;
  widthMm: number;
  depthMm: number;
  volumeCm3: number;
}

export interface RadiologyReport {
  indication: string;
  technique: string;
  findings: string;
  impression: string;
  recommendation: string;
}

export interface MriAnalysisResult {
  primaryDiagnosis: string;
  category: 'glioma' | 'meningioma' | 'pituitary' | 'no_tumor' | 'other';
  confidence: number;
  whoGrade: WHOGrade;
  anatomicalLocation: string;
  massEffect: string;
  edema: string;
  dimensions: LesionDimensions;
  boundingBox: BoundingBox;
  heatmapPoints: HeatmapPoint[];
  probabilities: DiagnosticProbability[];
  report: RadiologyReport;
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Outro';
  studyDate: string;
  referringPhysician: string;
  clinicalIndication: string;
}

export interface PresetCase {
  id: string;
  title: string;
  shortLabel: string;
  category: 'glioma' | 'meningioma' | 'pituitary' | 'no_tumor' | 'other';
  sequence: string;
  sliceOrientation: 'Axial' | 'Sagital' | 'Coronal';
  imageUrl: string;
  patientInfo: PatientInfo;
  analysis: MriAnalysisResult;
}

export type WindowPreset = 'brain' | 'subdural' | 'bone' | 'contrast';

export interface CaliperMeasurement {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distanceMm: number;
}
