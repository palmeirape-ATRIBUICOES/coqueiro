import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, ScanLine } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Aponte a câmera para o código de barras');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setManualCode('');
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setScannerStatus('Câmera não suportada neste navegador. Digite o código abaixo.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setScannerStatus('Buscando código de barras...');

        // If BarcodeDetector API is natively available in browser
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          });

          const detectFrame = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  if (rawValue) {
                    onScan(rawValue);
                    onClose();
                    return;
                  }
                }
              } catch (e) {
                // Ignore detection frame errors
              }
            }
            animFrameRef.current = requestAnimationFrame(detectFrame);
          };

          animFrameRef.current = requestAnimationFrame(detectFrame);
        }
      }
    } catch (err) {
      console.warn('Camera access warning:', err);
      setScannerStatus('Digite ou escaneie o código de barras abaixo:');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 100000,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'pop-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ScanLine size={20} style={{ color: '#10b981' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Leitor de Código de Barras</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera Feed Container */}
        <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: '#000000', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Laser overlay line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            right: '10%',
            height: '2px',
            backgroundColor: '#ef4444',
            boxShadow: '0 0 12px #ef4444',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Footer Controls */}
        <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 600 }}>
            {scannerStatus}
          </p>

          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Digite o código (EAN/Cód)..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                backgroundColor: '#059669',
                border: 'none',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '0 20px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} /> Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
