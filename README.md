# Etiquetado Frontal — Octógonos AR

> Escaneá la tabla nutricional de un producto y descubrí qué octógonos le corresponden según la Ley 27.642.

App pensada para que la ciudadanía argentina mantenga acceso a información nutricional clara aunque cambie o se derogue la Ley de Promoción de la Alimentación Saludable.

## Cómo funciona

1. El usuario saca foto de la tabla nutricional desde el celular.
2. La imagen se comprime en el cliente (1280px máx, JPEG 0.82) — reduce costo de IA ~70%.
3. Se envía a un modelo de visión vía Vercel AI Gateway, que extrae los valores nutricionales en formato estructurado.
4. El cálculo de octógonos es **determinista en el servidor** — basado en los umbrales del perfil OPS (Fase 2, vigente desde 2024-08).
5. Se muestran los octógonos correspondientes + desglose de por qué.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Tailwind CSS v4**
- **AI SDK v6** + **Vercel AI Gateway** (modelo de visión configurable)
- **Zod** para schema del output del modelo
- **TypeScript** estricto

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Configurar AI_GATEWAY_API_KEY en .env.local
#    Obtené tu key en: https://vercel.com/dashboard/ai-gateway

# 4. Levantar el dev server
npm run dev
```

Abrí http://localhost:3000 y probá con una foto de un envase.

## Deploy a Vercel

```bash
# 1. Instalar Vercel CLI si no la tenés
npm i -g vercel

# 2. Linkear el proyecto
vercel link

# 3. Configurar la env var en producción
vercel env add AI_GATEWAY_API_KEY production

# 4. Deploy
vercel --prod
```

## Control de costos (IMPORTANTE)

La app llama a un modelo de IA por cada foto subida. **Sin control de gasto, una app viral te puede generar una factura inesperada.** Antes de hacerlo público, configurá:

### 1. Spend limit en AI Gateway

En tu dashboard de [Vercel AI Gateway](https://vercel.com/dashboard/ai-gateway) configurá un **monthly spend limit**. Recomendado para arrancar: USD 20-50. Cuando se llega, las requests fallan y la app muestra error — no te llega factura sorpresa.

### 2. Rate limit por IP

Por default: 15 fotos por IP por día (configurable con `RATE_LIMIT_PER_DAY`).
La implementación actual es **in-memory** — sirve para arrancar pero se resetea entre cold starts.

**Para producción seria**, reemplazar `lib/rate-limit.ts` con Upstash Redis (Marketplace de Vercel, free tier alcanza para los primeros miles de usuarios). Ver comentarios en el archivo.

### 3. Vercel BotID

Activá [Vercel BotID](https://vercel.com/docs/botid) para que no te scrapeen la API. Gratis.

### 4. Modelo barato por default

El default es `google/gemini-2.5-flash` (~$0.001/foto). Cambialo en `.env` con `AI_MODEL`. Alternativas:

- `anthropic/claude-haiku-4-5` — un poco mejor en OCR ambiguo
- `openai/gpt-4o-mini` — alternativa adicional

## Estructura

```
app/
  layout.tsx            # Metadata, fuentes globales
  page.tsx              # Home (mobile-first)
  globals.css           # Tailwind + tema
  api/analyze/route.ts  # Endpoint que llama a la IA y calcula octógonos
components/
  EscaneoCamara.tsx     # Captura cámara + flujo de UI
  Octogono.tsx          # SVG de los octógonos y leyendas
  Resultado.tsx         # Render de octógonos + desglose
lib/
  octogonos.ts          # Cálculo determinista (umbrales OPS Fase 2)
  image.ts              # Compresión client-side
  rate-limit.ts         # Rate limit por IP (in-memory para arrancar)
```

## Roadmap próximo

- [ ] Detección de leyendas (cafeína, edulcorantes) vía foto adicional de la lista de ingredientes
- [ ] Modo manual: el usuario tipea los valores si la foto falla
- [ ] Cache por hash de imagen (Vercel Runtime Cache)
- [ ] Histórico personal de productos escaneados
- [ ] Comparador entre productos
- [ ] PWA / instalable como app
- [ ] Botón de donación / sponsoreo institucional

## Disclaimer

Esta app es una herramienta informativa basada en los umbrales del perfil de nutrientes OPS según la Ley 27.642 y el Decreto 151/2022. Los resultados son una estimación y **no reemplazan el etiquetado oficial del envase**. La lectura automática de la tabla nutricional puede tener errores — siempre verificá los valores extraídos antes de tomar decisiones.

## Licencia

MIT. Hecho para ser útil.
