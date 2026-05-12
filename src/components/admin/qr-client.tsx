// src/components/admin/qr-client.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  storeName: string;
  storeUrl: string;
  primaryColor: string;
}

export function QRClient({ storeName, storeUrl, primaryColor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrLoaded, setQrLoaded] = useState(false);

  useEffect(() => {
    // Cargar qrcode.js desde CDN
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
      const container = document.getElementById("qr-container");
      if (!container) return;
      container.innerHTML = "";

      // @ts-ignore
      new QRCode(container, {
        text: storeUrl,
        width: 280,
        height: 280,
        colorDark: "#0E1117",
        colorLight: "#ffffff",
        correctLevel: 3, // HIGH
      });
      setQrLoaded(true);
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [storeUrl]);

  const handleDownload = () => {
    const container = document.getElementById("qr-container");
    const canvas = container?.querySelector("canvas");
    if (!canvas) return;

    // Crear canvas con logo y texto
    const finalCanvas = document.createElement("canvas");
    const size = 400;
    finalCanvas.width = size;
    finalCanvas.height = size + 80;
    const ctx = finalCanvas.getContext("2d")!;

    // Fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // QR centrado
    const margin = (size - 280) / 2;
    ctx.drawImage(canvas, margin, margin, 280, 280);

    // Nombre de la tienda
    ctx.fillStyle = "#0E1117";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(storeName, size / 2, size + 32);

    // URL
    ctx.fillStyle = primaryColor;
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(storeUrl.replace("https://", ""), size / 2, size + 56);

    const link = document.createElement("a");
    link.download = `qr-${storeName.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const container = document.getElementById("qr-container");
    const canvas = container?.querySelector("canvas");
    if (!canvas) return;

    printWin.document.write(`
      <html>
        <head>
          <title>QR ${storeName}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; }
            img { width: 280px; height: 280px; margin-bottom: 1rem; }
            h2 { margin: 0 0 0.5rem; font-size: 1.25rem; color: #0E1117; }
            p { margin: 0; font-size: 0.875rem; color: ${primaryColor}; }
          </style>
        </head>
        <body>
          <img src="${canvas.toDataURL()}" />
          <h2>${storeName}</h2>
          <p>${storeUrl}</p>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const SIZES = [
    { label: "Sticker pequeño", size: "5×5 cm", use: "Mesas, productos" },
    { label: "Cartel A5", size: "14×20 cm", use: "Mostrador, vidrieras" },
    { label: "Cartel A4", size: "21×29 cm", use: "Pared, puerta" },
    { label: "Cartel A3", size: "29×42 cm", use: "Pizarras, carteles grandes" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-normal text-ink">Código QR</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Tus clientes lo escanean y van directo a tu tienda
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1.2fr] gap-6">
        {/* QR preview */}
        <div className="bg-white border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
          <div
            id="qr-container"
            className="w-[280px] h-[280px] flex items-center justify-center"
          >
            {!qrLoaded && (
              <div className="flex items-center justify-center w-full h-full">
                <svg className="animate-spin h-8 w-8 text-green" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>

          {qrLoaded && (
            <>
              <div className="text-center">
                <p className="font-semibold text-ink text-sm">{storeName}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: primaryColor }}>
                  {storeUrl.replace("https://", "")}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="secondary" size="sm" onClick={handleDownload} className="flex-1">
                  ⬇️ Descargar PNG
                </Button>
                <Button variant="secondary" size="sm" onClick={handlePrint} className="flex-1">
                  🖨️ Imprimir
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sizes and tips */}
        <div className="space-y-4">
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-ink mb-3">¿Dónde usarlo?</h2>
            <div className="space-y-2.5">
              {SIZES.map(s => (
                <div key={s.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    📄
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{s.label}</p>
                    <p className="text-xs text-ink-muted">{s.size} · {s.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-pale border border-green/20 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-green-dark mb-2">💡 Tips para más pedidos</h2>
            <ul className="space-y-1.5">
              {[
                "Pegalo en la puerta de entrada",
                "Imprimilo en el menú físico",
                "Publicalo en tu bio de Instagram",
                "Agregalo a tus historias como link sticker",
                "Ponelo en los recibos o bolsas",
              ].map(tip => (
                <li key={tip} className="text-xs text-green-dark flex items-start gap-1.5">
                  <span className="mt-0.5">→</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Share link section */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ink mb-3">Compartir link directamente</h2>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-ink font-mono truncate">
            {storeUrl}
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              navigator.clipboard.writeText(storeUrl);
            }}
          >
            Copiar
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(`¡Pedí a ${storeName} desde acá! 👉 ${storeUrl}`)}`, color: "#25D366" },
            { label: "Instagram", url: `https://www.instagram.com/`, color: "#E1306C" },
            { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`, color: "#1877F2" },
          ].map(social => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener"
              className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: social.color }}
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
