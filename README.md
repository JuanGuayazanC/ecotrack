# EcoTrack

MVP de diario de huella de carbono en lenguaje natural. Escribe *«Hoy comí carne y viajé 20km en bus»* y obtén un estimado de kg CO₂e.

## Local (Cursor)

```bash
npm install
npm test
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Código: [github.com/JuanGuayazanC/ecotrack](https://github.com/JuanGuayazanC/ecotrack)

## Replit

1. En [replit.com](https://replit.com) → **Create Repl** → **Import from GitHub** (o sube esta carpeta).
2. El archivo `.replit` ya define `npm run dev` en el puerto 3000.
3. Pulsa **Run**. Luego **Deploy** si necesitas una URL pública.

No hace falta clave de modelo: el estimador vive en `lib/estimate.ts` con factores documentados.

## Entregables del proyecto integrador

| Archivo | Qué es |
| --- | --- |
| `.cursorrules` | Personalidad y reglas del agente |
| `VIBE-REPORT.md` | Reflexión del flujo Vibe Coding |
| `lib/estimate.ts` | Núcleo del prototipo |
