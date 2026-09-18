export type ActivityUnit = "porcion" | "km" | "kWh" | "unidades";

/**
 * Salida de la etapa de interpretación (lenguaje natural → datos estructurados).
 * Deliberadamente NO conoce factores de emisión: solo identifica qué actividad
 * es y cuánta cantidad hay. Esta es la parte "IA" del sistema (hoy un
 * intérprete determinista por reglas, claramente simulado — ver README).
 */
export type DetectedActivity = {
  activity: string;
  label: string;
  quantity: number;
  unit: ActivityUnit;
};

export type ActivityEstimate = DetectedActivity & {
  kgCO2e: number;
};

export type DiaryEstimate = {
  kgCO2e: number;
  activities: ActivityEstimate[];
  note: string;
};

/**
 * Factores de emisión (kg CO2e). Fuentes orientativas: DEFRA / Our World in Data.
 * - electricityPerKwh: intensidad aproximada de una mezcla eléctrica promedio global;
 *   ajústalo si conoces el factor real de la red local del negocio.
 * - deliveryVanPerUnit: estimado grueso para una camioneta/camión de reparto en una
 *   ruta urbana típica de un día (~50 km) con un vehículo comercial ligero a diésel.
 *   Es un orden de magnitud, no un cálculo por ruta real.
 */
export const FACTORS = {
  beefMeal: 7.2,
  chickenMeal: 1.8,
  vegMeal: 0.9,
  busPerKm: 0.089,
  carPerKm: 0.171,
  planePerKm: 0.255,
  railPerKm: 0.041,
  electricityPerKwh: 0.42,
  deliveryVanPerUnit: 15,
} as const;

/** Une cada `activity` que puede detectar la IA con su factor de cálculo. */
const ACTIVITY_FACTORS: Record<string, number> = {
  comida_carne: FACTORS.beefMeal,
  comida_pollo: FACTORS.chickenMeal,
  comida_vegetal: FACTORS.vegMeal,
  transporte_bus: FACTORS.busPerKm,
  transporte_auto: FACTORS.carPerKm,
  transporte_avion: FACTORS.planePerKm,
  transporte_tren: FACTORS.railPerKm,
  electricidad: FACTORS.electricityPerKwh,
  vehiculos_reparto: FACTORS.deliveryVanPerUnit,
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function has(text: string, ...needles: string[]) {
  // \b evita falsos positivos como "auto" dentro de "autobús" o "res" dentro de "interesante".
  return needles.some((n) => new RegExp(`\\b${n}\\b`).test(text));
}

function matchQuantity(text: string, unitPattern: string): number | undefined {
  const match = text.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(?:${unitPattern})`));
  if (!match) return undefined;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Etapa de interpretación (la "IA" de EcoTrack): convierte una frase en
 * lenguaje natural en una lista de actividades estructuradas. No calcula
 * emisiones ni conoce los factores — eso es responsabilidad exclusiva de
 * `calculateEmissions`.
 */
export function interpretDiary(raw: string): DetectedActivity[] {
  const text = raw.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const activities: DetectedActivity[] = [];

  if (has(text, "carne", "res", "hamburguesa", "steak", "beef")) {
    activities.push({ activity: "comida_carne", label: "Comida con carne", quantity: 1, unit: "porcion" });
  } else if (has(text, "pollo", "chicken")) {
    activities.push({ activity: "comida_pollo", label: "Comida con pollo", quantity: 1, unit: "porcion" });
  } else if (has(text, "vegetari", "ensalada", "vegano")) {
    activities.push({ activity: "comida_vegetal", label: "Comida vegetal", quantity: 1, unit: "porcion" });
  }

  const km = matchQuantity(text, "km");
  if (km !== undefined) {
    if (has(text, "avion", "vuelo", "plane", "flight")) {
      activities.push({ activity: "transporte_avion", label: "Avión", quantity: km, unit: "km" });
    } else if (has(text, "auto", "coche", "carro", "car", "uber")) {
      activities.push({ activity: "transporte_auto", label: "Auto", quantity: km, unit: "km" });
    } else if (has(text, "metro", "tren", "train", "rail")) {
      activities.push({ activity: "transporte_tren", label: "Tren / metro", quantity: km, unit: "km" });
    } else if (has(text, "bus", "autobus")) {
      activities.push({ activity: "transporte_bus", label: "Bus", quantity: km, unit: "km" });
    }
  }

  const kwh = matchQuantity(text, "kwh");
  if (kwh !== undefined) {
    activities.push({ activity: "electricidad", label: "Electricidad", quantity: kwh, unit: "kWh" });
  }

  const fleet = matchQuantity(text, "camionetas?|camiones?|furgonetas?");
  if (fleet !== undefined) {
    activities.push({ activity: "vehiculos_reparto", label: "Vehículos de reparto", quantity: fleet, unit: "unidades" });
  }

  return activities;
}

/**
 * Etapa de cálculo (lógica tradicional, determinista): traduce actividades ya
 * estructuradas en kg CO2e usando únicamente `FACTORS`. No interpreta texto.
 */
export function calculateEmissions(detected: DetectedActivity[]): DiaryEstimate {
  const activities: ActivityEstimate[] = detected.map((item) => ({
    ...item,
    kgCO2e: round2(item.quantity * ACTIVITY_FACTORS[item.activity]),
  }));

  const kgCO2e = round2(activities.reduce((sum, a) => sum + a.kgCO2e, 0));
  const note =
    activities.length === 0
      ? "No reconocí actividades con factor. Prueba con comida, electricidad (kWh) o un trayecto en km."
      : "Estimado de orden de magnitud, no un inventario formal.";

  return { kgCO2e, activities, note };
}

/** Punto de entrada compuesto: interpreta y luego calcula. */
export function estimateFromDiary(raw: string): DiaryEstimate {
  return calculateEmissions(interpretDiary(raw));
}
