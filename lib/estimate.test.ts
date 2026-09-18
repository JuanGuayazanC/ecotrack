import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateFromDiary, interpretDiary, calculateEmissions } from "./estimate.ts";

describe("estimateFromDiary", () => {
  it("estima carne + 20 km en bus", () => {
    const result = estimateFromDiary("Hoy comí carne y viajé 20km en bus");

    assert.ok(Math.abs(result.kgCO2e - (7.2 + 20 * 0.089)) < 0.02);
    const labels = result.activities.map((a) => a.label);
    assert.ok(labels.includes("Comida con carne"));
    assert.ok(labels.includes("Bus"));
    const bus = result.activities.find((a) => a.label === "Bus");
    assert.equal(bus?.quantity, 20);
    assert.equal(bus?.kgCO2e, 1.78);
  });

  it("devuelve vacío si no reconoce actividades", () => {
    const result = estimateFromDiary("Hoy solo descansé");
    assert.equal(result.kgCO2e, 0);
    assert.equal(result.activities.length, 0);
  });

  it("devuelve vacío ante una entrada sin relación con huella de carbono", () => {
    const result = estimateFromDiary("Ayer vi una película con mi familia");
    assert.equal(result.kgCO2e, 0);
    assert.equal(result.activities.length, 0);
  });

  it("no confunde 'autobús' con 'auto' (regresión del bug de precedencia)", () => {
    const result = estimateFromDiary("Viajé 15km en autobús");
    assert.equal(result.activities.length, 1);
    assert.equal(result.activities[0].label, "Bus");
    assert.equal(result.activities[0].kgCO2e, Math.round(15 * 0.089 * 100) / 100);
  });

  it("interpreta electricidad en kWh", () => {
    const result = estimateFromDiary("Hoy consumimos 350 kWh de electricidad.");
    assert.equal(result.activities.length, 1);
    const electricidad = result.activities[0];
    assert.equal(electricidad.activity, "electricidad");
    assert.equal(electricidad.quantity, 350);
    assert.equal(electricidad.unit, "kWh");
    assert.equal(electricidad.kgCO2e, 147);
    assert.equal(result.kgCO2e, 147);
  });

  it("interpreta vehículos de reparto por cantidad", () => {
    const result = estimateFromDiary("Usamos 5 camionetas de reparto.");
    assert.equal(result.activities.length, 1);
    const flota = result.activities[0];
    assert.equal(flota.activity, "vehiculos_reparto");
    assert.equal(flota.quantity, 5);
    assert.equal(flota.unit, "unidades");
    assert.equal(flota.kgCO2e, 75);
  });

  it("interpreta el ejemplo canónico: flota + electricidad combinados", () => {
    const result = estimateFromDiary(
      "Hoy usamos 5 camionetas de reparto y gastamos 200 kWh de electricidad.",
    );
    const byActivity = Object.fromEntries(result.activities.map((a) => [a.activity, a]));
    assert.equal(byActivity.vehiculos_reparto?.kgCO2e, 75);
    assert.equal(byActivity.electricidad?.kgCO2e, 84);
    assert.equal(result.kgCO2e, 159);
  });

  it("tolera formatos numéricos naturales (sin espacio, con decimal)", () => {
    const result = estimateFromDiary("Gastamos 220kwh y viajamos 3,5km en auto");
    const byActivity = Object.fromEntries(result.activities.map((a) => [a.activity, a]));
    assert.equal(byActivity.electricidad?.quantity, 220);
    assert.equal(byActivity.transporte_auto?.quantity, 3.5);
  });

  it("no inventa actividades ante una entrada ambigua sin cantidades reconocibles", () => {
    const result = estimateFromDiary("Hoy el negocio estuvo bastante ocupado");
    assert.equal(result.kgCO2e, 0);
    assert.equal(result.activities.length, 0);
  });
});

describe("interpretDiary (etapa de interpretación)", () => {
  it("no calcula kgCO2e: solo produce actividad, cantidad y unidad", () => {
    const detected = interpretDiary("Gastamos 200 kWh de electricidad");
    assert.deepEqual(detected, [
      { activity: "electricidad", label: "Electricidad", quantity: 200, unit: "kWh" },
    ]);
  });
});

describe("calculateEmissions (etapa de cálculo)", () => {
  it("es determinista y no depende de texto", () => {
    const result = calculateEmissions([
      { activity: "vehiculos_reparto", label: "Vehículos de reparto", quantity: 5, unit: "unidades" },
    ]);
    assert.equal(result.kgCO2e, 75);
  });
});
