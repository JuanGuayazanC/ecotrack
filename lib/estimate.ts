export type ActivityEstimate = {
  label: string;
  kgCO2e: number;
  km?: number;
};

export type DiaryEstimate = {
  kgCO2e: number;
  activities: ActivityEstimate[];
  note: string;
};

/** Factores aproximados (kg CO2e). Fuentes típicas: DEFRA / Our World in Data. */
export const FACTORS = {
  beefMeal: 7.2,
  chickenMeal: 1.8,
  vegMeal: 0.9,
  busPerKm: 0.089,
  carPerKm: 0.171,
  planePerKm: 0.255,
  railPerKm: 0.041,
} as const;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function has(text: string, ...needles: string[]) {
  return needles.some((n) => text.includes(n));
}

export function estimateFromDiary(raw: string): DiaryEstimate {
  const text = raw.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const activities: ActivityEstimate[] = [];

  if (has(text, "carne", "res", "hamburguesa", "steak", "beef")) {
    activities.push({ label: "Comida con carne", kgCO2e: FACTORS.beefMeal });
  } else if (has(text, "pollo", "chicken")) {
    activities.push({ label: "Comida con pollo", kgCO2e: FACTORS.chickenMeal });
  } else if (has(text, "vegetari", "ensalada", "vegano")) {
    activities.push({ label: "Comida vegetal", kgCO2e: FACTORS.vegMeal });
  }

  const kmMatch = text.match(/(\d+(?:[.,]\d+)?)\s*km/);
  const km = kmMatch ? Number(kmMatch[1].replace(",", ".")) : undefined;

  if (km !== undefined && Number.isFinite(km)) {
    if (has(text, "avion", "vuelo", "plane", "flight")) {
      activities.push({
        label: "Avión",
        km,
        kgCO2e: round2(km * FACTORS.planePerKm),
      });
    } else if (has(text, "auto", "coche", "carro", "car ", "uber")) {
      activities.push({
        label: "Auto",
        km,
        kgCO2e: round2(km * FACTORS.carPerKm),
      });
    } else if (has(text, "metro", "tren", "train", "rail")) {
      activities.push({
        label: "Tren / metro",
        km,
        kgCO2e: round2(km * FACTORS.railPerKm),
      });
    } else if (has(text, "bus", "autobus", "camión", "camion")) {
      activities.push({
        label: "Bus",
        km,
        kgCO2e: round2(km * FACTORS.busPerKm),
      });
    }
  }

  const kgCO2e = round2(activities.reduce((sum, a) => sum + a.kgCO2e, 0));
  const note =
    activities.length === 0
      ? "No reconocí actividades con factor. Prueba con comida o un trayecto en km."
      : "Estimado de orden de magnitud, no un inventario formal.";

  return { kgCO2e, activities, note };
}
