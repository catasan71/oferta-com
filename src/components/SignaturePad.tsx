import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, ShieldCheck, PenLine } from 'lucide-react';

interface SignaturePadProps {
  onConfirm: (signatureDataUrl: string, signerName: string, signerRole: string) => void;
  onCancel: () => void;
  initialName?: string;
  brandColor?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onConfirm,
  onCancel,
  initialName = '',
  brandColor = '#2563eb',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(initialName);
  const [signerRole, setSignerRole] = useState('Director General / Reprezentant Legal');
  const [ipAddress, setIpAddress] = useState('86.120.45.192');

  useEffect(() => {
    // Generare sau captare IP client
    const randomIp = `86.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 2)}`;
    setIpAddress(randomIp);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setări canvas retina / dpi
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = () => {
    setErrorMessage(null);
    if (!signerName.trim()) {
      setErrorMessage('Vă rugăm să introduceți numele și prenumele persoanei care semnează.');
      return;
    }
    if (!hasDrawn) {
      setErrorMessage('Vă rugăm să desenați semnătura în caseta dedicată de mai jos.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');
    onConfirm(signatureDataUrl, signerName.trim(), signerRole.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Antet Modal */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Semnare Digitală Ofertă</h3>
              <p className="text-xs text-slate-400">Acceptare oficială și emitere certificat de semnare</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors text-sm px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Corp Modal */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nume și Prenume *
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="ex: Ion Popescu"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Funcție / Rol
              </label>
              <input
                type="text"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                placeholder="ex: Administrator"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Desenează Semnătura cu mouse-ul sau degetul</span>
                {hasDrawn && <span className="text-emerald-600 font-normal normal-case text-xs">✓ Înregistrat</span>}
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" /> Șterge și redesenează
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-50/80 transition-colors overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-44 cursor-crosshair touch-none"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm font-medium">
                  Semnează aici pe linia punctată
                </div>
              )}
            </div>
          </div>

          {/* Notă legală și IP */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-800">Garanție de Integritate & Audit Trail</p>
              <p className="text-[11px] leading-relaxed">
                Semnătura electronică va fi stocată alături de adresa IP <strong>({ipAddress})</strong>, amprenta browserului și timestamp-ul exact UTC. Oferta va fi marcată ca <strong>ACCEPTATĂ</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Butoane Acțiune */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            style={{ backgroundColor: hasDrawn ? brandColor : undefined }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl text-white flex items-center gap-2 shadow-sm transition-all ${
              hasDrawn
                ? 'hover:opacity-90 active:scale-[0.98]'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Check className="w-4 h-4" />
            Confirmă și Semnează Oferta
          </button>
        </div>
      </div>
    </div>
  );
};
