"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image";
import { Resultado } from "./Resultado";
import type {
  DatosNutricionales,
  ResultadoCalculo,
} from "@/lib/octogonos";

type ProductoInfo = {
  marca?: string;
  nombre?: string;
  reclamos?: string[];
};

type RespuestaAPI = {
  producto?: ProductoInfo;
  datos: DatosNutricionales;
  resultado: ResultadoCalculo;
  notas?: string;
  porPorcionUnicamente?: boolean;
};

type Paso = "frente" | "tabla" | "procesando" | "ok" | "error";

export function EscaneoCamara() {
  const inputFrenteRef = useRef<HTMLInputElement>(null);
  const inputTablaRef = useRef<HTMLInputElement>(null);

  const [paso, setPaso] = useState<Paso>("frente");
  const [previewFrente, setPreviewFrente] = useState<string | null>(null);
  const [previewTabla, setPreviewTabla] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState<RespuestaAPI | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function tomarFotoFrente(file: File) {
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      setPreviewFrente(dataUrl);
      setPaso("tabla");
    } catch (e: unknown) {
      const mensaje =
        e instanceof Error ? e.message : "No se pudo procesar la foto";
      setError(mensaje);
      setPaso("error");
    }
  }

  async function tomarFotoTablaYEnviar(file: File) {
    setError(null);
    setPaso("procesando");
    try {
      const dataUrlTabla = await compressImage(file);
      setPreviewTabla(dataUrlTabla);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          frente: previewFrente ?? undefined,
          tabla: dataUrlTabla,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Error desconocido");
      }
      setRespuesta(json);
      setPaso("ok");
    } catch (e: unknown) {
      const mensaje = e instanceof Error ? e.message : "Algo salió mal";
      setError(mensaje);
      setPaso("error");
    }
  }

  function reset() {
    setPreviewFrente(null);
    setPreviewTabla(null);
    setRespuesta(null);
    setError(null);
    setPaso("frente");
    if (inputFrenteRef.current) inputFrenteRef.current.value = "";
    if (inputTablaRef.current) inputTablaRef.current.value = "";
  }

  function saltarFrente() {
    setPaso("tabla");
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <input
        ref={inputFrenteRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void tomarFotoFrente(f);
        }}
      />
      <input
        ref={inputTablaRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void tomarFotoTablaYEnviar(f);
        }}
      />

      {/* Indicador de progreso */}
      {(paso === "frente" || paso === "tabla") && (
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
          <span
            className={`size-2 rounded-full ${
              paso === "frente" ? "bg-stone-900" : "bg-emerald-500"
            }`}
          />
          <span>Frente</span>
          <span className="w-6 h-px bg-stone-300" />
          <span
            className={`size-2 rounded-full ${
              paso === "tabla" ? "bg-stone-900" : "bg-stone-300"
            }`}
          />
          <span>Tabla nutricional</span>
        </div>
      )}

      {/* PASO 1: frente */}
      {paso === "frente" && (
        <>
          <button
            type="button"
            onClick={() => inputFrenteRef.current?.click()}
            className="group relative w-full rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-14 text-center transition hover:border-stone-900 hover:bg-stone-50 active:scale-[0.99]"
          >
            <div className="text-5xl mb-3">📦</div>
            <p className="text-lg font-semibold">Foto del frente del envase</p>
            <p className="text-sm text-stone-500 mt-1">
              Para identificar la marca y el producto
            </p>
          </button>
          <button
            type="button"
            onClick={saltarFrente}
            className="text-xs text-stone-500 underline self-center"
          >
            Saltar — no tengo el frente a mano
          </button>
        </>
      )}

      {/* PASO 2: tabla */}
      {paso === "tabla" && (
        <>
          {previewFrente && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
              <img
                src={previewFrente}
                alt="Frente del envase"
                className="size-16 rounded-lg object-cover"
              />
              <div className="text-xs">
                <p className="font-medium text-emerald-900">
                  Frente capturado ✓
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewFrente(null);
                    setPaso("frente");
                  }}
                  className="text-emerald-700 underline mt-0.5"
                >
                  Volver a sacar
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => inputTablaRef.current?.click()}
            className="group relative w-full rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-14 text-center transition hover:border-stone-900 hover:bg-stone-50 active:scale-[0.99]"
          >
            <div className="text-5xl mb-3">📋</div>
            <p className="text-lg font-semibold">Foto de la tabla nutricional</p>
            <p className="text-sm text-stone-500 mt-1">
              Apuntá a la <strong>información nutricional</strong> del envase
            </p>
            <p className="text-xs text-stone-400 mt-3">
              Tip: buena luz, tabla plana, columna por 100 g/ml visible
            </p>
          </button>
        </>
      )}

      {/* Procesando */}
      {paso === "procesando" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
          <div className="flex gap-2 justify-center mb-3">
            {previewFrente && (
              <img
                src={previewFrente}
                alt="Frente"
                className="h-24 rounded-lg"
              />
            )}
            {previewTabla && (
              <img
                src={previewTabla}
                alt="Tabla"
                className="h-24 rounded-lg"
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-stone-600">
            <div className="size-2 rounded-full bg-stone-900 animate-pulse" />
            <span className="text-sm">Analizando el producto…</span>
          </div>
        </div>
      )}

      {/* Error */}
      {paso === "error" && (
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

      {/* OK */}
      {paso === "ok" && respuesta && (
        <>
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
