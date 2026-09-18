import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateFromDiary } from "./estimate.ts";

describe("estimateFromDiary", () => {
  it("estima carne + 20 km en bus", () => {
    const result = estimateFromDiary("Hoy comí carne y viajé 20km en bus");

    assert.ok(Math.abs(result.kgCO2e - (7.2 + 20 * 0.089)) < 0.02);
    const labels = result.activities.map((a) => a.label);
    assert.ok(labels.includes("Comida con carne"));
    assert.ok(labels.includes("Bus"));
    const bus = result.activities.find((a) => a.label === "Bus");
    assert.equal(bus?.km, 20);
    assert.equal(bus?.kgCO2e, 1.78);
  });

  it("devuelve vacío si no reconoce actividades", () => {
    const result = estimateFromDiary("Hoy solo descansé");
    assert.equal(result.kgCO2e, 0);
    assert.equal(result.activities.length, 0);
  });
});
