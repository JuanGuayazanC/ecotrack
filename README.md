# EcoTrack AI

MVP de bitácora de emisiones para pequeños negocios, en lenguaje natural. Escribe *«Hoy usamos 5 camionetas de reparto y gastamos 200 kWh de electricidad»* y obtén un estimado de kg CO₂e, con desglose por actividad.

## Local (Cursor)

```bash
npm install
npm test
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Para verificar que compila en producción: `npm run build`.

Código: [github.com/JuanGuayazanC/ecotrack](https://github.com/JuanGuayazanC/ecotrack)

## Replit

1. En [replit.com](https://replit.com) → **Create Repl** → **Import from GitHub** (o sube esta carpeta).
2. El archivo `.replit` ya define `npm run dev` en el puerto 3000. `replit.nix` fija Node 22 (requerido por el runner de pruebas).
3. Pulsa **Run**. Luego **Deploy** si necesitas una URL pública.

No hace falta clave de modelo ni variable de entorno: la interpretación de lenguaje natural es un intérprete por reglas (IA simulada, sin llamadas externas) que vive en `lib/estimate.ts` junto a los factores de emisión, documentados en el propio código.

## Qué interpreta hoy

- Comida (carne / pollo / vegetariana), como una porción.
- Transporte personal por trayecto: auto, bus, tren/metro, avión (requiere una distancia en km).
- Electricidad, en kWh.
- Vehículos de reparto de flota, por cantidad (ej. "5 camionetas").

Si no reconoce nada en el texto, lo dice explícitamente y no inventa actividades ni cantidades.

## Entregables del proyecto integrador

| Archivo | Qué es |
| --- | --- |
| `.cursorrules` | Personalidad y reglas del agente |
| `VIBE-REPORT.md` | Reflexión del flujo Vibe Coding |
| `lib/estimate.ts` | Interpretación (IA simulada) + cálculo de emisiones |
| `lib/estimate.test.ts` | Pruebas unitarias de interpretación y cálculo |
