import { Octogono, Leyenda } from "./Octogono";
import type {
  DatosNutricionales,
  ResultadoCalculo,
} from "@/lib/octogonos";

type ProductoInfo = {
  marca?: string;
  nombre?: string;
  reclamos?: string[];
};

export function Resultado({
  producto,
  datos,
  resultado,
  notas,
  porPorcionUnicamente,
}: {
  producto?: ProductoInfo;
  datos: DatosNutricionales;
  resultado: ResultadoCalculo;
  notas?: string;
  porPorcionUnicamente?: boolean;
}) {
  const tieneProducto = producto && (producto.marca || producto.nombre);
  const sinSellos =
    resultado.octogonos.length === 0 && resultado.leyendas.length === 0;
  const exencion = resultado.exencion;

  return (
    <section className="flex flex-col gap-6 w-full">
      {tieneProducto && (
        <header className="text-center">
          {producto.marca && (
            <p className="text-xs uppercase tracking-wider text-stone-500">
              {producto.marca}
            </p>
          )}
          {producto.nombre && (
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {producto.nombre}
            </h2>
          )}
          {producto.reclamos && producto.reclamos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
              {producto.reclamos.slice(0, 4).map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-stone-100 text-stone-600 rounded-full px-2 py-0.5"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </header>
      )}

      {exencion ? (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 text-center">
          <div className="text-3xl">⚖</div>
          <p className="mt-2 font-semibold text-lg text-blue-900">
            Producto EXENTO del etiquetado frontal
          </p>
          <p className="text-sm text-blue-800 mt-2 leading-relaxed">
            {exencion.motivo}
          </p>
          <p className="text-[11px] text-blue-700 mt-3 italic">
            Fundamento legal: {exencion.articulo}
          </p>
        </div>
      ) : sinSellos ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
          <div className="text-3xl">✓</div>
          <p className="mt-2 font-semibold text-lg">
            Este producto no llevaría octógonos.
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Según los umbrales de la Ley 27.642, ninguno de los valores
            supera los límites del perfil OPS.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-stone-500 mb-4">
            Octógonos correspondientes
          </h2>
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {resultado.octogonos.map((o) => (
              <Octogono key={o.tipo} tipo={o.tipo} size={120} />
            ))}
            {resultado.leyendas.map((l) => (
              <Leyenda key={l.tipo} tipo={l.tipo} size={220} />
            ))}
          </div>

          <div className="mt-6 space-y-2">
            {resultado.octogonos.map((o) => (
              <p key={o.tipo} className="text-xs text-stone-600">
                <strong className="text-stone-900">{o.titulo}:</strong>{" "}
                {o.detalle}
              </p>
            ))}
          </div>
        </div>
      )}

      <details className="rounded-2xl border border-stone-200 bg-white p-5">
        <summary className="cursor-pointer text-sm font-medium text-stone-700">
          Ver datos extraídos de la tabla
        </summary>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-stone-500">Estado</dt>
          <dd className="font-medium">
            {datos.estado === "solido" ? "Sólido (por 100 g)" : "Líquido (por 100 ml)"}
          </dd>
          <dt className="text-stone-500">Energía</dt>
          <dd className="font-medium">{datos.energiaKcal} kcal</dd>
          <dt className="text-stone-500">Grasas totales</dt>
          <dd className="font-medium">{datos.grasasTotalesG} g</dd>
          <dt className="text-stone-500">Grasas saturadas</dt>
          <dd className="font-medium">{datos.grasasSaturadasG} g</dd>
          <dt className="text-stone-500">Azúcares</dt>
          <dd className="font-medium">{datos.azucaresG} g</dd>
          <dt className="text-stone-500">Sodio</dt>
          <dd className="font-medium">{datos.sodioMg} mg</dd>
        </dl>
        {notas && (
          <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            ⚠ {notas}
          </p>
        )}
        {porPorcionUnicamente && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            ⚠ La tabla parecía traer datos solo por porción. Los valores
            pueden estar ajustados. Verificá manualmente si vas a usarlos
            para algo importante.
          </p>
        )}
      </details>

      <p className="text-[11px] text-stone-400 text-center max-w-md mx-auto">
        Esta app es una herramienta informativa. El cálculo se basa en los
        umbrales del perfil de nutrientes OPS según Ley 27.642 + Decreto
        151/2022. No reemplaza el etiquetado oficial del envase.
      </p>
    </section>
  );
}
