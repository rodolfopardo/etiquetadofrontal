"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image";
import { Resultado } from "./Resultado";
import type {
  DatosNutricionales,
  ResultadoCalculo,
} from "@/lib/octogonos";

type RespuestaAPI = {
  datos: DatosNutricionales;
  resultado: ResultadoCalculo;
  notas?: string;
  porPorcionUnicamente?: boolean;
};

export function EscaneoCamara() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [estado, setEstado] = useState<"idle" | "procesando" | "ok" | "error">(
    "idle",
  );
  const [respuesta, setRespuesta] = useState<RespuestaAPI | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setRespuesta(null);
    setEstado("procesando");
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Error desconocido");
      }
      setRespuesta(json);
      setEstado("ok");
    } catch (e: unknown) {
      const mensaje = e instanceof Error ? e.message : "Algo salió mal";
      setError(mensaje);
      setEstado("error");
    }
  }

  function reset() {
    setPreview(null);
    setRespuesta(null);
    setError(null);
    setEstado("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      {estado === "idle" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative w-full rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-16 text-center transition hover:border-stone-900 hover:bg-stone-50 active:scale-[0.99]"
        >
          <div className="text-5xl mb-3">📷</div>
          <p className="text-lg font-semibold">Sacar foto de la tabla</p>
          <p className="text-sm text-stone-500 mt-1">
            Apuntá la cámara a la <strong>información nutricional</strong> del envase
          </p>
          <p className="text-xs text-stone-400 mt-4">
            Tip: buena luz, tabla plana, columna por 100 g/ml visible
          </p>
        </button>
      )}

      {estado === "procesando" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
          {preview && (
            <img
              src={preview}
              alt="Foto del producto"
              className="mx-auto max-h-48 rounded-lg mb-4"
            />
          )}
          <div className="flex items-center justify-center gap-2 text-stone-600">
            <div className="size-2 rounded-full bg-stone-900 animate-pulse" />
            <span className="text-sm">Leyendo la tabla nutricional…</span>
          </div>
        </div>
      )}

      {estado === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-white text-sm font-medium"
          >
            Probar de nuevo
          </button>
        </div>
      )}

      {estado === "ok" && respuesta && (
        <>
          {preview && (
            <img
              src={preview}
              alt="Foto analizada"
              className="mx-auto max-h-40 rounded-lg"
            />
          )}
          <Resultado {...respuesta} />
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-stone-900 px-4 py-3 text-white text-sm font-medium"
          >
            Escanear otro producto
          </button>
        </>
      )}
    </div>
  );
}
