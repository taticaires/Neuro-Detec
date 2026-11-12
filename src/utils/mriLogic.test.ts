import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePhysicalDistanceMm,
  calculateLesionVolumeCm3,
  sanitizeBoundingBox,
  evaluateClinicalRisk,
  formatConfidence,
} from './mriLogic';

test('calculatePhysicalDistanceMm converts pixel delta to millimeters', () => {
  assert.equal(calculatePhysicalDistanceMm(100, 0.45), 45);
  assert.equal(calculatePhysicalDistanceMm(0, 0.45), 0);
  assert.equal(calculatePhysicalDistanceMm(50, 0.5), 25);
});

test('calculateLesionVolumeCm3 computes ellipsoid volume accurately', () => {
  // 30mm x 20mm x 20mm => (pi * 30 * 20 * 20) / 6000 = (37699.11) / 6000 ~= 6.28 cm3
  const volume = calculateLesionVolumeCm3(30, 20, 20);
  assert.ok(Math.abs(volume - 6.28) < 0.05);
  assert.equal(calculateLesionVolumeCm3(0, 20), 0);
});

test('sanitizeBoundingBox clamps coordinates within 0 to 100 percentage range', () => {
  const box = sanitizeBoundingBox({ x: -10, y: 15, width: 120, height: 90 });
  assert.equal(box.x, 0);
  assert.equal(box.y, 15);
  assert.equal(box.width, 100);
  assert.equal(box.height, 85);
});

test('evaluateClinicalRisk categorizes pathologies and returns proper urgency', () => {
  const normalRisk = evaluateClinicalRisk('no_tumor', 0.99);
  assert.equal(normalRisk.level, 'normal');

  const gliomaHighRisk = evaluateClinicalRisk('glioma', 0.95, 'IV');
  assert.equal(gliomaHighRisk.level, 'critical');

  const pituitaryRisk = evaluateClinicalRisk('pituitary', 0.92);
  assert.equal(pituitaryRisk.level, 'moderate');
  assert.ok(pituitaryRisk.suggestedAction.includes('quiasma'));
});

test('formatConfidence formats decimal into percentage with 1 decimal digit', () => {
  assert.equal(formatConfidence(0.9642), '96.4%');
  assert.equal(formatConfidence(1.2), '100.0%');
  assert.equal(formatConfidence(-0.1), '0.0%');
});
