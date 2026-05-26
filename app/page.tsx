import { EscaneoCamara } from "@/components/EscaneoCamara";

export default function Home() {
  return (
    <main className="mx-auto max-w-md px-5 pt-10 pb-16 flex flex-col gap-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
          Ley 27.642
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Etiquetado Frontal
        </h1>
        <p className="mt-3 text-stone-600 text-sm leading-relaxed">
          Escaneá y averiguá qué contienen los alimentos.
        </p>
      </header>

      <EscaneoCamara />

      <footer className="text-center text-xs text-stone-400 mt-4">
        <p>
          Hecho para defender el derecho a saber qué comemos.{" "}
          <br />
          Basado en el perfil de nutrientes OPS.
        </p>
      </footer>
    </main>
  );
}
