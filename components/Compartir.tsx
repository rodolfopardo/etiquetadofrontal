"use client";

import { useEffect, useState } from "react";

const HASHTAG = "EtiquetadoFrontal";
const MENSAJE =
  "Sacale una foto a cualquier envase y averiguá qué estás comiendo: qué octógonos le corresponden según la ley argentina 👇";

export function Compartir() {
  const [url, setUrl] = useState("");
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + "/");
    setPuedeCompartir(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const texto = `${MENSAJE} #${HASHTAG}`;
  const e = encodeURIComponent;

  const whatsapp = `https://wa.me/?text=${e(`${texto}\n${url}`)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${e(MENSAJE)}&url=${e(url)}&hashtags=${e(HASHTAG)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`;

  const compartirNativo = async () => {
    try {
      await navigator.share({
        title: "Etiquetado Frontal Argentina",
        text: texto,
        url,
      });
    } catch {
      /* el usuario canceló el menú de compartir */
    }
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  };

  const btn =
    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <section className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        Pasá la voz
      </p>
      <h3 className="mt-3 font-serif text-2xl sm:text-3xl leading-tight">
        Ayudá a que más gente sepa{" "}
        <em className="not-italic underline decoration-amber-400 decoration-[3px] underline-offset-4">
          qué está comiendo
        </em>
        .
      </h3>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        {puedeCompartir && (
          <button
            type="button"
            onClick={compartirNativo}
            className={`${btn} bg-stone-900 hover:bg-stone-800`}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15a2.99 2.99 0 0 0 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92Z" />
            </svg>
            Compartir
          </button>
        )}

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-[#25D366] hover:bg-[#1ebe57]`}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.027zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
          </svg>
          WhatsApp
        </a>

        <a
          href={twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-black hover:bg-stone-800`}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </a>

        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-[#1877F2] hover:bg-[#0f63d1]`}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>

        <button
          type="button"
          onClick={copiarLink}
          className={`${btn} bg-stone-200 !text-stone-700 hover:bg-stone-300`}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {copiado ? "¡Copiado!" : "Copiar link"}
        </button>
      </div>
    </section>
  );
}
