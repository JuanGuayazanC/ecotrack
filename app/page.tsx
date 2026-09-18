"use client";

import { FormEvent, useState } from "react";
import type { DiaryEstimate } from "@/lib/estimate";

const SAMPLE = "Hoy usamos 5 camionetas de reparto y gastamos 200 kWh de electricidad.";

export default function Home() {
  const [text, setText] = useState(SAMPLE);
  const [estimate, setEstimate] = useState<DiaryEstimate | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo estimar.");
        setEstimate(null);
        return;
      }
      setEstimate(data);
    } catch {
      setError("Revisa la red e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const intensity = Math.min((estimate?.kgCO2e ?? 0) / 16, 1);

  return (
    <div className="page">
      <header className="mast">
        <p className="mark">EcoTrack AI</p>
        <p className="mark-sub">Bitácora de emisiones para negocios</p>
      </header>

      <main className="sheet">
        <div className="copy">
          <h1>Describe tu actividad. Te devolvemos un estimado.</h1>
          <p>
            Sin formularios ni categorías técnicas: escribe una frase sobre tu
            negocio y el sistema identifica actividades y calcula kg de CO₂
            equivalente.
          </p>
        </div>

        <form className="diary" onSubmit={onSubmit}>
          <label htmlFor="diary">¿Qué pasó hoy en el negocio?</label>
          <textarea
            id="diary"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            required
            aria-describedby="diary-examples"
          />
          <p id="diary-examples" className="examples">
            Ejemplos: “5 camionetas de reparto y 200 kWh de electricidad” ·
            “30 km en auto” · “almuerzo con carne”
          </p>
          <div className="actions">
            <button type="submit" disabled={busy}>
              {busy ? (
                <>
                  Calculando
                  <span className="dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </>
              ) : (
                "Calcular emisiones"
              )}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => setText(SAMPLE)}
              disabled={busy}
            >
              Usar ejemplo
            </button>
          </div>
        </form>

        {error ? (
          <p className="callout callout-error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="result" aria-live="polite">
          <Contour kg={estimate?.kgCO2e ?? 0} intensity={intensity} />
          <div className="result-body">
            <p className="result-label">Estimado total</p>
            <p className="figure">
              {estimate ? estimate.kgCO2e.toFixed(2) : "—"}
              <span> kg CO₂e</span>
            </p>
            {estimate?.activities.length ? (
              <>
                <p className="result-label">Actividades detectadas</p>
                <ul>
                  {estimate.activities.map((item) => (
                    <li key={item.activity}>
                      <span>
                        {item.label}
                        {item.unit !== "porcion" ? ` · ${item.quantity} ${item.unit}` : ""}
                      </span>
                      <strong>{item.kgCO2e.toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
                <p className="methodology">
                  Interpretación por reglas (IA simulada) + factores de
                  emisión documentados en el código. {estimate.note}
                </p>
              </>
            ) : (
              <p className="callout">
                {estimate?.note ??
                  "Aún no hay estimado. Escribe qué pasó hoy y pulsa el botón."}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Contour({ kg, intensity }: { kg: number; intensity: number }) {
  const rings = [0.28, 0.46, 0.64, 0.82];
  return (
    <svg
      className="contour"
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Visual de ${kg} kilogramos de CO2e`}
    >
      <rect width="120" height="120" fill="#d7e0d4" />
      {rings.map((r, i) => (
        <circle
          key={r}
          cx="60"
          cy="60"
          r={r * 52 + intensity * 8}
          fill="none"
          stroke="#1a2f28"
          strokeWidth={i === rings.length - 1 ? 1.6 : 0.7}
          opacity={0.35 + intensity * 0.45}
        />
      ))}
      <circle cx="60" cy="60" r={6 + intensity * 10} fill="#c46b3a" />
    </svg>
  );
}
