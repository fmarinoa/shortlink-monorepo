import { Copy, Download, Share2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QrModalProps {
  isOpen: boolean;
  slug: string;
  shortUrl: string;
  onClose: () => void;
  onCopyLink: (url: string) => void;
  onShowToast: (message: string, type?: "success" | "error") => void;
}

export default function QrModal({
  isOpen,
  slug,
  shortUrl,
  onClose,
  onCopyLink,
  onShowToast,
}: QrModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const downloadQr = () => {
    const svgElement = qrRef.current?.querySelector("svg");
    if (!svgElement) {
      onShowToast("No se encontró el código QR para descargar", "error");
      return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast("✅ QR descargado", "success");
  };

  const copyLinkForShare = () => {
    onCopyLink(shortUrl);
    onShowToast("✅ Link copiado para compartir", "success");
  };

  const shareQr = async () => {
    if (!navigator.share) {
      copyLinkForShare();
      return;
    }

    try {
      await navigator.share({
        title: `Shortlink /${slug}`,
        text: `Te comparto este shortlink: ${shortUrl}`,
        url: shortUrl,
      });
      onShowToast("✅ Link compartido", "success");
    } catch (error) {
      // Ignore user-initiated share dialog cancellation.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Error sharing shortlink:", error);
      copyLinkForShare();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">QR del shortlink</h2>
            <p className="text-sm text-slate-400 mt-1">/{slug}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 flex justify-center mb-4">
          <div ref={qrRef}>
            <QRCodeSVG value={shortUrl} size={220} level="M" includeMargin />
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 break-all">{shortUrl}</p>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              onCopyLink(shortUrl);
              onShowToast("✅ Link copiado al portapapeles", "success");
            }}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-100 transition-colors"
          >
            <Copy size={16} />
            <span className="text-xs">Copiar</span>
          </button>
          <button
            onClick={shareQr}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
          >
            <Share2 size={16} />
            <span className="text-xs">Compartir</span>
          </button>
          <button
            onClick={downloadQr}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-100 transition-colors"
          >
            <Download size={16} />
            <span className="text-xs">Descargar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
