type QA = {
  q: string;
  a: React.ReactNode;
};

const PREGUNTAS: QA[] = [
  {
    q: "¿Qué es la Ley 27.642?",
    a: (
      <>
        Es la <strong>Ley de Promoción de la Alimentación Saludable</strong>,
        sancionada en octubre de 2021 y reglamentada por el Decreto 151/2022.
        Obliga a poner octógonos negros en el frente de los envases cuando un
        alimento o bebida tiene exceso de azúcares, grasas totales, grasas
        saturadas, sodio o calorías, según el perfil de nutrientes de la
        Organización Panamericana de la Salud (OPS).
      </>
    ),
  },
  {
    q: "¿Qué significan los octógonos negros?",
    a: (
      <>
        Cada octógono es una advertencia: el producto supera el umbral
        permitido para ese nutriente cada 100 g (sólidos) o 100 ml (líquidos).
        Cuantos más octógonos, más procesado y menos recomendable es el
        alimento, sobre todo para niños, niñas y adolescentes. Además existen
        dos leyendas adicionales:{" "}
        <em>&ldquo;contiene edulcorantes&rdquo;</em> y{" "}
        <em>&ldquo;contiene cafeína&rdquo;</em>.
      </>
    ),
  },
  {
    q: "¿Qué productos están exentos del etiquetado?",
    a: (
      <>
        El Decreto 151/2022 (art. 6) deja afuera a los alimentos en su forma
        natural o sin agregados críticos: frutas, verduras, carnes y huevos
        frescos, leches líquidas, yogures naturales, quesos sin añadidos,
        aceites vegetales, sal, frutas secas, especias e infusiones, fórmulas
        infantiles y alimentos de uso médico. Si a cualquiera de estos se le
        agrega azúcar, sodio o grasas, vuelve a entrar en el régimen general.
      </>
    ),
  },
  {
    q: "¿Sigue vigente en 2026?",
    a: (
      <>
        Sí. La fase 2 de los umbrales OPS está vigente desde agosto de 2024 y
        es la que usa esta app. La ley sigue en pie y aplica a todos los
        productos envasados que se venden en el país, importados o
        nacionales. Si en algún momento se modifica o se intenta derogar, la
        idea de esta app es que la gente conserve una herramienta para
        seguir leyendo lo que come.
      </>
    ),
  },
  {
    q: "¿De dónde salen los umbrales que usa la app?",
    a: (
      <>
        Del perfil de nutrientes de OPS/OMS adoptado por la ley argentina:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Sodio: ≥ 1 mg por cada kcal del producto.</li>
          <li>Azúcares libres: ≥ 10% del valor energético total.</li>
          <li>Grasas saturadas: ≥ 10% del valor energético total.</li>
          <li>Grasas totales: ≥ 30% del valor energético total.</li>
          <li>
            Calorías: ≥ 275 kcal/100 g (sólidos) o ≥ 70 kcal/100 ml
            (líquidos), si hay azúcares o grasas añadidos.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "¿Por qué necesito una app si los envases ya lo traen impreso?",
    a: (
      <>
        Por varios motivos: hay productos importados que todavía no cumplen,
        hay envases viejos en góndola, hay marcas que rediseñan el packaging
        para disimular los octógonos, y hay alimentos a granel que no traen
        rótulo. Esta app te deja chequear cualquier tabla nutricional —
        incluso de productos extranjeros — y ver qué le correspondería según
        la ley argentina.
      </>
    ),
  },
  {
    q: "¿La app reemplaza al etiquetado oficial?",
    a: (
      <>
        No. Es una herramienta informativa. El cálculo es determinista (no lo
        decide la IA), pero la lectura de la tabla la hace un modelo de
        visión y puede equivocarse. Siempre verificá los valores extraídos
        antes de tomar una decisión importante, y confiá en el rótulo
        oficial del envase cuando esté disponible.
      </>
    ),
  },
  {
    q: "¿Qué pasa con mis fotos?",
    a: (
      <>
        Se comprimen en tu celular, se mandan al servidor solamente para que
        el modelo de visión lea la tabla, y no se guardan en ningún lado. No
        hay base de datos de usuarios, no hay login, no hay tracking.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <section className="w-full">
      <header className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
          Preguntas frecuentes
        </p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-tight">
          La ley, los octógonos y vos.
        </h2>
      </header>

      <ul className="flex flex-col divide-y divide-[color:var(--color-line)] rounded-3xl border border-[color:var(--color-line)] bg-white/70 backdrop-blur overflow-hidden">
        {PREGUNTAS.map(({ q, a }) => (
          <li key={q}>
            <details className="group">
              <summary className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 hover:bg-stone-50 transition">
                <span className="text-[15px] sm:text-base font-medium leading-snug text-stone-900">
                  {q}
                </span>
                <span
                  aria-hidden
                  className="faq-chevron mt-0.5 inline-flex items-center justify-center size-6 rounded-full border border-stone-300 text-stone-500 text-lg leading-none transition-transform"
                >
                  +
                </span>
              </summary>
              <div className="px-5 sm:px-6 pb-6 -mt-1 text-sm leading-relaxed text-stone-700">
                {a}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
