/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Ruler,
  Eye,
  Sliders,
  Maximize2,
  Layers,
  Crosshair,
  SplitSquareVertical,
  CheckCircle2,
} from 'lucide-react';
import { BoundingBox, HeatmapPoint, WindowPreset, CaliperMeasurement } from '../types/mri';
import { calculatePhysicalDistanceMm } from '../utils/mriLogic';

interface MriViewerProps {
  imageUrl: string;
  category: string;
  primaryDiagnosis: string;
  confidence: number;
  boundingBox: BoundingBox;
  heatmapPoints: HeatmapPoint[];
  sliceOrientation: string;
  activeSequence: string;
}

export const MriViewer: React.FC<MriViewerProps> = ({
  imageUrl,
  category,
  primaryDiagnosis,
  confidence,
  boundingBox,
  heatmapPoints,
  sliceOrientation,
  activeSequence,
}) => {
  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Windowing & Display state
  const [windowPreset, setWindowPreset] = useState<WindowPreset>('brain');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(110);
  const [invert, setInvert] = useState<boolean>(false);

  // Overlays
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(65);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [splitMode, setSplitMode] = useState<boolean>(false);
  const [heatmapColormap, setHeatmapColormap] = useState<'jet' | 'viridis' | 'hot'>('jet');

  // Caliper Measurement Tool
  const [caliperActive, setCaliperActive] = useState<boolean>(false);
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperMeasurements, setCaliperMeasurements] = useState<CaliperMeasurement[]>([]);

  // Crosshair coordinate tracking
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Apply Window presets
  const applyWindowPreset = (preset: WindowPreset) => {
    setWindowPreset(preset);
    if (preset === 'brain') {
      setBrightness(100);
      setContrast(110);
      setInvert(false);
    } else if (preset === 'subdural') {
      setBrightness(115);
      setContrast(140);
      setInvert(false);
    } else if (preset === 'bone') {
      setBrightness(130);
      setContrast(220);
      setInvert(false);
    } else if (preset === 'contrast') {
      setBrightness(105);
      setContrast(160);
      setInvert(false);
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    applyWindowPreset('brain');
    setCaliperMeasurements([]);
    setCaliperStart(null);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(4, Math.max(0.8, Number((prev + delta).toFixed(1)))));
  };

  // Mouse interaction for Panning or Caliper
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (caliperActive) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
      const clickY = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;

      if (!caliperStart) {
        setCaliperStart({ x: clickX, y: clickY });
      } else {
        const dx = (clickX - caliperStart.x) * (rect.width / 100);
        const dy = (clickY - caliperStart.y) * (rect.height / 100);
        const pixelDist = Math.sqrt(dx * dx + dy * dy);
        const mm = calculatePhysicalDistanceMm(pixelDist, 0.45);

        setCaliperMeasurements((prev) => [
          ...prev,
          {
            x1: caliperStart.x,
            y1: caliperStart.y,
            x2: clickX,
            y2: clickY,
            distanceMm: mm,
          },
        ]);
        setCaliperStart(null);
      }
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;
    const normX = Math.round((currX / rect.width) * 100);
    const normY = Math.round((currY / rect.height) * 100);

    setCursorCoords({ x: currX, y: currY, normX, normY });

    if (isPanning && !caliperActive) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoom(0.2);
    } else {
      handleZoom(-0.2);
    }
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : ''}`,
  };

  const hasValidBox = boundingBox && boundingBox.width > 0 && boundingBox.height > 0 && category !== 'no_tumor';

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Left: Window Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Janela:</span>
          {(['brain', 'subdural', 'bone', 'contrast'] as WindowPreset[]).map((p) => {
            const labels: Record<WindowPreset, string> = {
              brain: 'Parênquima',
              subdural: 'Subdural',
              bone: 'Óssea',
              contrast: 'Alto Contraste',
            };
            return (
              <button
                key={p}
                onClick={() => applyWindowPreset(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  windowPreset === p
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        {/* Center: Viewer Interaction Tools */}
        <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleZoom(0.2)}
            title="Aproximar Zoom (+20%)"
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-cyan-400 px-1 text-[11px] tabular-nums">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => handleZoom(-0.2)}
            title="Afastar Zoom (-20%)"
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-800 mx-1" />
          <button
            onClick={() => setCaliperActive(!caliperActive)}
            title="Régua de Medição Caliper (Distância em mm)"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              caliperActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Régua mm</span>
          </button>
          <div className="w-px h-3.5 bg-slate-800 mx-1" />
          <button
            onClick={() => setInvert(!invert)}
            title="Inverter Sinal (Negativo / Positivo)"
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              invert ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inverter
          </button>
          <button
            onClick={handleResetView}
            title="Redefinir visualização e zoom"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: AI Overlays Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Alternar Mapa Grad-CAM de Ativação do Modelo"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              showHeatmap
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grad-CAM</span>
          </button>

          <button
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            title="Alternar Bounding Box da Lesão"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              showBoundingBox
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>ROI Delimitação</span>
          </button>

          <button
            onClick={() => setSplitMode(!splitMode)}
            title="Comparação lado a lado (Original vs IA)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              splitMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>
      </div>

      {/* Main Medical Stage / Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-[540px] bg-black overflow-hidden select-none ${
          caliperActive ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Anatomical Orientation Markers */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-[11px] font-mono font-bold text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          A (Anterior)
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-[11px] font-mono font-bold text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          P (Posterior)
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-[11px] font-mono font-bold text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          R (Direito)
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-[11px] font-mono font-bold text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          L (Esquerdo)
        </div>

        {/* Scan metadata HUD overlay (top left) */}
        {!splitMode && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-0.5 text-[11px] font-mono text-slate-300/90 bg-slate-950/70 p-2 rounded border border-slate-800/80">
            <span className="font-semibold text-cyan-400">NEURO-DETEC v2.4</span>
            <span>SEQ: {activeSequence}</span>
            <span>PLANO: {sliceOrientation}</span>
            <span>ESCALA: 0.45 mm/px</span>
            <span>ZOOM: {(zoom * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Live Coordinate Crosshair HUD (bottom right) */}
        {cursorCoords && (
          <div className="absolute bottom-3 right-3 z-20 pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800/80">
            X: <span className="text-slate-200 tabular-nums">{cursorCoords.normX}%</span> · Y:{' '}
            <span className="text-slate-200 tabular-nums">{cursorCoords.normY}%</span>
          </div>
        )}

        {/* Viewport Content */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {splitMode ? (
            /* Split View: Left Original vs Right Heatmap/AI Overlay */
            <div className="grid grid-cols-2 gap-2 w-full h-full p-4">
              <div className="relative flex flex-col items-center justify-center border-r border-slate-800/80 bg-black">
                <span className="absolute top-2 left-2 z-10 text-[10px] font-mono bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded">
                  ORIGINAL / SEM FILTRO
                </span>
                <img
                  src={imageUrl}
                  alt="MRI Original"
                  style={filterStyle}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative flex flex-col items-center justify-center bg-black">
                <span className="absolute top-2 left-2 z-10 text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40">
                  IA NEURO-DETEC + GRAD-CAM
                </span>
                <div className="relative max-h-full max-w-full flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="MRI AI Enhanced"
                    style={filterStyle}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  {renderHeatmapOverlay()}
                  {hasValidBox && renderBoundingBoxOverlay()}
                </div>
              </div>
            </div>
          ) : (
            /* Single High-Resolution Stage */
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Brain MRI Scan"
                style={filterStyle}
                className="max-h-full max-w-full object-contain pointer-events-none"
                referrerPolicy="no-referrer"
              />

              {/* Heatmap overlay */}
              {showHeatmap && renderHeatmapOverlay()}

              {/* Bounding box ROI */}
              {showBoundingBox && hasValidBox && renderBoundingBoxOverlay()}

              {/* Caliper measurement lines */}
              {renderCaliperLines()}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Fine-Tuning Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-5">
          {/* Brightness slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Brilho:</span>
            <input
              type="range"
              min="50"
              max="160"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono text-[11px] tabular-nums text-slate-400 w-8">
              {brightness}%
            </span>
          </div>

          {/* Contrast slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Contraste:</span>
            <input
              type="range"
              min="50"
              max="240"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono text-[11px] tabular-nums text-slate-400 w-8">
              {contrast}%
            </span>
          </div>

          {/* Heatmap Opacity */}
          {showHeatmap && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Opacidade Grad-CAM:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
              <span className="font-mono text-[11px] tabular-nums text-rose-300 w-8">
                {heatmapOpacity}%
              </span>
            </div>
          )}
        </div>

        {/* Caliper Instruction / Counter */}
        {caliperActive && (
          <div className="flex items-center gap-2 text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-800/60 font-mono text-[11px]">
            <span>
              {caliperStart
                ? 'Clique no ponto final para medir'
                : 'Clique no ponto inicial na imagem'}
            </span>
            {caliperMeasurements.length > 0 && (
              <button
                onClick={() => setCaliperMeasurements([])}
                className="text-xs text-amber-400 underline ml-2 hover:text-amber-200"
              >
                Limpar medições ({caliperMeasurements.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function renderHeatmapOverlay() {
    if (!heatmapPoints || heatmapPoints.length === 0) return null;
    return (
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{ opacity: heatmapOpacity / 100 }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            {heatmapPoints.map((pt, idx) => (
              <radialGradient
                key={`grad-${idx}`}
                id={`heatGrad-${idx}`}
                cx={`${pt.x}%`}
                cy={`${pt.y}%`}
                r={`${pt.radius}%`}
                fx={`${pt.x}%`}
                fy={`${pt.y}%`}
              >
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          {heatmapPoints.map((pt, idx) => (
            <circle
              key={`heat-circ-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r={pt.radius}
              fill={`url(#heatGrad-${idx})`}
            />
          ))}
        </svg>
      </div>
    );
  }

  function renderBoundingBoxOverlay() {
    return (
      <div
        className="absolute border-2 border-cyan-400 bg-cyan-400/10 pointer-events-none rounded transition-all duration-200"
        style={{
          left: `${boundingBox.x}%`,
          top: `${boundingBox.y}%`,
          width: `${boundingBox.width}%`,
          height: `${boundingBox.height}%`,
        }}
      >
        <div className="absolute -top-6 left-0 bg-cyan-500 text-slate-950 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap">
          ROI: {category.toUpperCase()} · {(confidence * 100).toFixed(1)}%
        </div>
      </div>
    );
  }

  function renderCaliperLines() {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {caliperMeasurements.map((m, idx) => {
          const midX = (m.x1 + m.x2) / 2;
          const midY = (m.y1 + m.y2) / 2;
          return (
            <g key={`caliper-${idx}`}>
              <line
                x1={m.x1}
                y1={m.y1}
                x2={m.x2}
                y2={m.y2}
                stroke="#fbbf24"
                strokeWidth="0.8"
                strokeDasharray="2,1"
              />
              <circle cx={m.x1} cy={m.y1} r="1" fill="#f59e0b" />
              <circle cx={m.x2} cy={m.y2} r="1" fill="#f59e0b" />
              <text
                x={midX}
                y={midY - 1.5}
                fill="#fde68a"
                fontSize="2.8"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                className="bg-black/80"
              >
                {m.distanceMm} mm
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
};
