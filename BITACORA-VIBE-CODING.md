# Bitácora de Vibe Coding — EcoTrack AI

> Este documento registra únicamente lo que ocurrió realmente durante el desarrollo, verificable en el historial de conversación y en el repositorio (`git log`, commits, archivos modificados). No incluye capturas, métricas ni resultados que no se hayan ejecutado y comprobado en esta sesión.

## 1. Idea y problema

EcoTrack (luego EcoTrack AI) nace como un MVP académico: una herramienta que permite a un usuario registrar actividades relacionadas con su huella de carbono **en lenguaje natural**, sin formularios ni categorías técnicas, y que devuelva una estimación aproximada de emisiones de CO₂e. El problema concreto: un pequeño negocio no tiene tiempo ni conocimiento técnico (GHG Protocol, ISO 14064) para llevar un inventario formal de emisiones, pero sí puede escribir una frase como *"Hoy usamos 5 camionetas de reparto y gastamos 200 kWh de electricidad"*.

## 2. Definición del Vibe

Definido explícitamente en esta sesión, antes de tocar código, como respuesta a una solicitud directa de especificación de producto. Ejes acordados:

- **Personalidad**: asistente de bitácora de negocio, no auditor de sostenibilidad ni consultor ESG.
- **Usuario**: dueño/encargado de un negocio pequeño, sin tiempo ni formación técnica en sostenibilidad.
- **Flujo**: una sola pantalla, sin login, sin persistencia — entrada en lenguaje natural → interpretación visible → cálculo → resultado.
- **UX**: mostrar el razonamiento (qué se interpretó), no solo el número; cero campos técnicos obligatorios.
- **Visual**: conservar la identidad ya construida en la sesión previa de Cursor (paleta turba/cobre/liquen, tipografías Bricolage/Source Serif/IBM Plex Mono, visualización de anillo topográfico), pero con una lectura más "moderna, minimalista y tecnológica" (ajuste pedido más adelante en esta misma sesión, ver iteración de UI).
- **Tono**: cercano, honesto, sin jerga técnica ni culpa ambiental.
- **Límite explícito**: sin auth, sin base de datos, sin dashboards — coherente con `.cursorrules`.

## 3. Master Prompt

El proyecto no se inició desde cero en esta sesión: continúa un trabajo previo hecho en Cursor. El artefacto que actúa como **Master Prompt persistente del proyecto** es `.cursorrules`, presente en el repositorio desde antes de esta sesión, que define personalidad, stack (Next.js + TypeScript + Tailwind), separación de responsabilidades (`lib/` para cálculo), límites explícitos ("no auth, no dashboards hasta que el MVP funcione") y flujo de trabajo. Ese archivo se mantuvo vigente y se respetó en cada iteración de esta sesión — ninguna iteración añadió autenticación, base de datos ni dashboards.

El *prompt* original que generó la primera versión del MVP en Cursor no forma parte de este repositorio y no está disponible para citarlo aquí; solo su resultado (`.cursorrules`, `VIBE-REPORT.md`, `lib/estimate.ts` inicial) es verificable.

El prompt que retomó el proyecto en **esta** sesión fue una solicitud explícita de auditoría ("Analiza... sin modificar archivos todavía"), seguida de la definición formal del Vibe, el plan técnico y finalmente la implementación.

## 4. Estado inicial del proyecto (antes de esta sesión)

Verificado mediante lectura directa del repositorio, sin ejecutar ni instalar nada:

- Next.js 16.3.5 (App Router) + React 19.2.8 + TypeScript + Tailwind 4.
- `lib/estimate.ts`: intérprete determinista por palabras clave + regex, sin IA externa ni claves.
- `app/api/estimate/route.ts`: endpoint `POST` que validaba solo texto vacío.
- `app/page.tsx`: formulario de una sola pantalla con visualización SVG de intensidad.
- `lib/estimate.test.ts`: 2 pruebas con `node:test`.
- `.replit` / `replit.nix`: configuración para correr en Replit sin variables de entorno.
- Sin `node_modules` instalado; nunca se había ejecutado `npm run build` en este repositorio.

## 5. Auditoría realizada

Se realizó una auditoría de solo lectura (sin modificar, instalar ni eliminar nada) cubriendo arquitectura, tecnologías, interfaz, cálculo, API, IA, pruebas, configuración local y de Replit, y documentación. Hallazgos principales:

- El flujo MVP funcionaba de extremo a extremo para el caso "comida + trayecto en km".
- **Bug real encontrado por lectura de código**: la frase "autobús" se clasificaba como "Auto" en vez de "Bus", porque la función de coincidencia de palabras usaba `.includes()` (subcadena) y `"autobus"` contiene `"auto"`.
- El ejemplo motivador del proyecto (vehículos de flota + electricidad) no tenía ninguna cobertura: no existía factor de electricidad ni parsing de cantidad de vehículos.
- `replit.nix` fijaba Node 20, pero el script de test usaba `--experimental-strip-types`, una bandera que requiere Node ≥22.6 — inconsistencia no detectada porque nunca se había corrido en Replit durante la auditoría.

## 6. Construcción del MVP

El MVP base **no se construyó en esta sesión**: ya existía, heredado de la sesión de Cursor. El trabajo de esta sesión fue de **completar** ese MVP para cubrir los requisitos que la auditoría marcó como pendientes (electricidad, vehículos de flota, corrección del bug de clasificación), manteniendo la arquitectura existente (`lib/` separado de la UI, sin nuevas dependencias, mismo contrato de la API).

## 7. Integración de IA

Se formalizó la separación entre interpretación y cálculo dentro de `lib/estimate.ts`:

- `interpretDiary(text)` — la parte que cumple el rol de "IA" del sistema: un intérprete determinista por reglas (coincidencia de palabras con límites de palabra + expresiones regulares de cantidad) que convierte texto libre en actividades estructuradas (`{ activity, label, quantity, unit }`). **No conoce factores de emisión.**
- `calculateEmissions(activities)` — lógica de cálculo puramente determinista: multiplica cantidad × factor documentado en `FACTORS` y sólo puede fallar si `interpretDiary` le entrega una actividad no soportada (lo cual no ocurre, porque `interpretDiary` solo produce actividades para las que existe factor).
- `estimateFromDiary(text)` — compone ambas, mantenido para no romper el contrato ya existente de la API y de la UI.

Decisión explícita (tomada por el desarrollador en esta sesión, confirmando la decisión original documentada en `VIBE-REPORT.md`): la IA sigue siendo un intérprete por reglas, sin llamada a un LLM externo. Esto se declaró honestamente en la interfaz ("Interpretación por reglas — IA simulada") en la iteración de UI, en vez de dejarlo implícito como estaba antes. No se usan API keys porque no hay ningún proveedor externo involucrado.

## 8. Iteraciones realizadas (en esta sesión)

| # | Objetivo del prompt | Qué se pidió | Qué cambió | Resultado | Problema |
|---|---|---|---|---|---|
| 1 | Auditoría inicial | Diagnóstico sin tocar código | Ninguno (solo lectura) | Diagnóstico estructurado entregado | — |
| 2 | Definición del Vibe | Personalidad, usuario, flujo, UX, visual, tono | Ninguno (solo especificación) | Especificación breve acordada | — |
| 3 | Plan técnico | Diseño de la solución completa | Ninguno (solo diseño) | Plan dividido en iteraciones | — |
| 4 | Implementación (flujo E2E) | Bug fix + electricidad + flota + separación IA/cálculo + manejo de errores | `lib/estimate.ts`, `lib/estimate.test.ts`, `app/api/estimate/route.ts`, `app/page.tsx`, `tsconfig.json` | 11/11 tests, build correcto | Bug de build preexistente encontrado y corregido (ver sección 9) |
| 5 | Validación funcional (8 casos) | Probar el flujo completo con casos variados | Ninguno (solo pruebas, en navegador real contra el servidor de desarrollo) | Los 8 casos se comportaron como se esperaba, sin datos inventados | Ninguno nuevo |
| 6 | Reporte de bug | Corregir un error real reportado | — | No ejecutado | El mensaje llegó con el marcador `[PEGAR AQUÍ EL ERROR REAL]` sin completar; se le indicó al usuario que pegara el error real en vez de inventar uno |
| 7 | Iteración visual + UX | Jerarquía clara, copy claro, mismo comportamiento funcional | `app/page.tsx`, `app/globals.css`, `app/layout.tsx` | Verificado visualmente en navegador y sin regresión funcional (tests/build/lint en verde) | Ninguno |
| 8 | Revisión técnica final | Checklist de 12 puntos | `replit.nix` (Node 20→22), `README.md` | Reporte entregado (sección aparte) | Node 22 en Replit no pudo verificarse en un entorno Replit real, solo se corrigió la configuración |
| 9 | Documentación académica | Esta bitácora | `BITACORA-VIBE-CODING.md` (nuevo) | Este documento | — |
| 10 | Auditoría final vs. Capstone | Comparar contra 14 requisitos | Ninguno (solo análisis) | Entregado en la conversación | — |

## 9. Problema técnico encontrado

Se encontraron dos problemas técnicos reales durante esta sesión (no inventados, ambos verificables en el historial de comandos ejecutados):

**Problema A — Clasificación incorrecta de "autobús" como "Auto".**
Detectado durante la auditoría de solo lectura, antes de ejecutar nada.

**Problema B — `npm run build` fallaba con `TS5097`.**
Detectado al ejecutar `npm run build` por primera vez en el repositorio (nunca se había corrido antes, ya que la auditoría inicial evitó instalar dependencias). El error señalaba que `lib/estimate.test.ts` importaba `./estimate.ts` con extensión `.ts` explícita, algo que el compilador de TypeScript de Next.js rechaza por defecto (`allowImportingTsExtensions` no está habilitado). Se confirmó con `git show HEAD:lib/estimate.test.ts` que ese import ya existía antes de cualquier cambio de esta sesión — no fue una regresión introducida ahora, sino un defecto preexistente nunca antes verificado.

## 10. Cómo se resolvió mediante IA

**Problema A**: se determinó la causa leyendo la función `has()` de `lib/estimate.ts`, que usaba `text.includes(needle)` (coincidencia de subcadena). Como `"autobus"` contiene literalmente `"auto"`, cualquier frase con "autobús" activaba la rama de detección de "Auto" antes de llegar a la de "Bus". La corrección fue cambiar la coincidencia a expresiones regulares con límites de palabra (`\bauto\b`), que no matchean "auto" dentro de "autobus". Se verificó con una prueba de regresión dedicada (`lib/estimate.test.ts`) y con una llamada real en el navegador ("Viajé 15km en autobús" → clasificado correctamente como "Bus", 1.34 kg CO₂e).

**Problema B**: se determinó la causa leyendo directamente el mensaje de error de `tsc` (`TS5097`, apuntando a la línea del import). Se confirmó que no era una regresión propia revisando el archivo tal como estaba en el último commit antes de esta sesión. La corrección elegida fue excluir los archivos `*.test.ts` del proyecto de TypeScript que usa `next build` para el chequeo de tipos (`tsconfig.json`), ya que esos archivos se ejecutan directamente con el runtime de Node (`node --experimental-strip-types`) y nunca pasan por el bundler de Next. Se verificó re-ejecutando `npm run build`, que pasó a compilar y tipar correctamente.

## 11. Resultado final

Al cierre de esta sesión, verificado con comandos reales (no asumido):

- `npm test` → 11/11 pruebas en verde (`node --experimental-strip-types --test lib/estimate.test.ts`).
- `npm run build` → compila y tipa correctamente con Turbopack.
- `npm run lint` → sin advertencias ni errores.
- Flujo end-to-end probado en un navegador real contra el servidor de desarrollo: electricidad sola, transporte solo, combinación de electricidad+transporte, entrada vacía (bloqueada en cliente y rechazada con 400 en servidor), entrada ambigua, entrada sin relación con huella de carbono, valores numéricos distintos y unidades en formato natural (sin espacio, con coma decimal) — todos con el comportamiento esperado y sin datos inventados.
- Sin API keys, sin variables de entorno, sin secretos en el código.

## 12. Reflexión sobre Vibe Coding

Retomar un proyecto ajeno (de una sesión de Cursor anterior) exigió primero **leer antes de escribir**: la auditoría de solo lectura no fue un formalismo, fue lo que permitió encontrar el bug de "autobús" antes de construir nada nuevo sobre una base con un defecto silencioso. Esa es una decisión del desarrollador — pedir auditoría antes de código — que cambió el orden de todo lo que vino después.

La separación entre "decisión del desarrollador" y "trabajo delegado a la IA" fue explícita en esta sesión: el desarrollador definió el Vibe, el alcance de cada iteración y los límites (sin auth, sin BD, sin LLM externo); la IA (este agente) tradujo esas decisiones a código, encontró y hasta corrigió errores no vistos (el fallo de build nunca antes ejecutado), y validó cada cambio con pruebas automatizadas y con uso real en navegador — no solo con la afirmación de que "debería funcionar".

También hubo un límite claro de la delegación: cuando llegó un reporte de error con el marcador de posición sin completar, la respuesta correcta no fue inventar un problema plausible para parecer productivo, sino señalar la falta de información y esperar el dato real. Vibe Coding no es aceptar cualquier instrucción al pie de la letra — es distinguir cuándo hay una instrucción completa para ejecutar y cuándo hace falta volver a preguntar.
