type Props = {
  variant?: "button" | "card";
};

export function Cafecito({ variant = "button" }: Props) {
  const link = (
    <a
      href="https://cafecito.app/rodolofpardo"
      rel="noopener noreferrer"
      target="_blank"
      className="inline-flex items-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        srcSet="https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x"
        src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
        alt="Invitame un café en cafecito.app"
        className="h-10 w-auto"
      />
    </a>
  );

  if (variant === "button") return link;

  return (
    <section className="rounded-3xl border border-[color:var(--color-line)] bg-white/70 backdrop-blur p-6 sm:p-8 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
        Bancá el proyecto
      </p>
      <h3 className="mt-3 font-serif text-2xl sm:text-3xl leading-tight">
        Si te resulta útil, <em className="not-italic underline decoration-amber-400 decoration-[3px] underline-offset-4">invitame un cafecito</em>.
      </h3>
      <p className="mt-3 text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
        Esta app es gratis y sin publicidad. Cada foto cuesta unos centavos
        de IA — con un café ayudás a que siga viva y a que más gente pueda
        usarla.
      </p>
      <div className="mt-5 flex justify-center">{link}</div>
    </section>
  );
}
