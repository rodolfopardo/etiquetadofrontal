import { Octogono, Leyenda } from "@/components/Octogono";

export default function Preview() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-2xl font-bold mb-6">Preview de octógonos y leyendas</h1>
      <p className="text-sm text-stone-500 mb-8">
        Solo para verificación visual durante desarrollo. Borrar este route antes de prod.
      </p>
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <Octogono tipo="exceso_calorias" />
        <Octogono tipo="exceso_grasas_saturadas" />
        <Octogono tipo="exceso_grasas_totales" />
        <Octogono tipo="exceso_azucares" />
        <Octogono tipo="exceso_sodio" />
      </section>
      <section className="flex flex-col gap-3">
        <Leyenda tipo="contiene_edulcorantes" />
        <Leyenda tipo="contiene_cafeina" />
      </section>
    </main>
  );
}
