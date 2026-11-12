/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BoundingBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
}

export interface DiagnosticProbability {
  id: string;
  name: string;
  category: 'glioma' | 'meningioma' | 'pituitary' | 'no_tumor' | 'other';
  confidence: number; // 0 to 1
  description: string;
}

export type WHOGrade = 'I' | 'II' | 'III' | 'IV' | 'Não Aplicável';

export interface LesionDimensions {
  lengthMm: number;
  widthMm: number;
  depthMm?: number;
}

/**
 * Calculates physical measurement in millimeters given pixel distance and pixel spacing (mm/px).
 */
export function calculatePhysicalDistanceMm(pixelDistance: number, pixelSpacingMm = 0.45): number {
  if (pixelDistance <= 0 || pixelSpacingMm <= 0) return 0;
  return Number((pixelDistance * pixelSpacingMm).toFixed(1));
}

/**
 * Calculates approximate lesion volume in cm³ using clinical ABC/2 or ellipsoid formula:
 * Volume = (Length * Width * Depth * pi) / 6000 (when dimensions in mm)
 */
export function calculateLesionVolumeCm3(
  lengthMm: number,
  widthMm: number,
  depthMm = lengthMm * 0.9
): number {
  if (lengthMm <= 0 || widthMm <= 0 || depthMm <= 0) return 0;
  const volumeMm3 = (Math.PI * lengthMm * widthMm * depthMm) / 6;
  return Number((volumeMm3 / 1000).toFixed(2));
}

/**
 * Clamps bounding box values strictly within [0, 100] coordinates.
 */
export function sanitizeBoundingBox(box: BoundingBox): BoundingBox {
  const x = Math.max(0, Math.min(100, box.x));
  const y = Math.max(0, Math.min(100, box.y));
  const width = Math.max(0, Math.min(100 - x, box.width));
  const height = Math.max(0, Math.min(100 - y, box.height));
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    width: Number(width.toFixed(2)),
    height: Number(height.toFixed(2)),
  };
}

/**
 * Returns clinical risk level and recommendation badge based on diagnostic category and confidence.
 */
export function evaluateClinicalRisk(
  category: string,
  confidence: number,
  whoGrade?: WHOGrade
): {
  level: 'normal' | 'low' | 'moderate' | 'high' | 'critical';
  urgencyLabel: string;
  suggestedAction: string;
} {
  if (category === 'no_tumor') {
    return {
      level: 'normal',
      urgencyLabel: 'Sem achados patológicos agudos',
      suggestedAction: 'Seguimento clínico eletivo conforme sintomas basais do paciente.',
    };
  }

  if (category === 'glioma') {
    const isHighGrade = whoGrade === 'III' || whoGrade === 'IV';
    return {
      level: isHighGrade ? 'critical' : 'high',
      urgencyLabel: isHighGrade ? 'Alta prioridade (Suspeita Alto Grau)' : 'Prioridade moderada',
      suggestedAction:
        'Avaliação neurocirúrgica urgente, espectroscopia por RM e planejamento estereotáxico/biópsia.',
    };
  }

  if (category === 'meningioma') {
    return {
      level: confidence > 0.85 ? 'moderate' : 'low',
      urgencyLabel: 'Lesão extra-axial delimitada',
      suggestedAction:
        'Correlacionar com sintomas neurológicos focais. Considerar seguimento por imagem em 6 meses ou parecer neurocirúrgico.',
    };
  }

  if (category === 'pituitary') {
    return {
      level: 'moderate',
      urgencyLabel: 'Lesão expansiva selar/hipofisária',
      suggestedAction:
        'Avaliação campimétrica visual urgente (risco de compressão do quiasma óptico) e dosagem do painel hormonal hipofisário.',
    };
  }

  return {
    level: 'moderate',
    urgencyLabel: 'Investigação complementar recomendada',
    suggestedAction: 'Correlação com dados clínicos e sequências adicionais com contraste endovenoso.',
  };
}

/**
 * Formats confidence ratio as percentage string with fixed precision.
 */
export function formatConfidence(ratio: number): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  return `${(clamped * 100).toFixed(1)}%`;
}
