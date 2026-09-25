import { config } from "../config.js";

const VEHICLE_TO_MODE = {
  RAIL: "KRL",
  METRO_RAIL: "KRL",
  HEAVY_RAIL: "KRL",
  SUBWAY: "KRL",
  LIGHT_RAIL: "KRL",
  COMMUTER_TRAIN: "KRL",
  LONG_DISTANCE_TRAIN: "KRL",
  TRAM: "MRT"
};

const STRINGS = {
  id: {
    bus: "Bus",
    ferry: "Kapal",
    publicTransport: "Transportasi umum",
    walk: "Jalan kaki",
    continueTrip: "Lanjutkan perjalanan",
    krlTowards: (line, arrivalStop) => `Naik KRL ${line ? `${line} ` : ""}${arrivalStop ? `arah ${arrivalStop}` : ""}`.trim(),
    otherModeTo: (mode, line, arrivalStop) => `Naik ${mode} ${line || ""}${arrivalStop ? ` menuju ${arrivalStop}` : ""}`.trim(),
    hour: "jam",
    minute: "menit",
    transfers: (n) => `${n} kali`
  },
  en: {
    bus: "Bus",
    ferry: "Ferry",
    publicTransport: "Public transport",
    walk: "Walk",
    continueTrip: "Continue your trip",
    krlTowards: (line, arrivalStop) => `Take the KRL ${line ? `${line} ` : ""}${arrivalStop ? `towards ${arrivalStop}` : ""}`.trim(),
    otherModeTo: (mode, line, arrivalStop) => `Take the ${mode} ${line || ""}${arrivalStop ? ` to ${arrivalStop}` : ""}`.trim(),
    hour: "hr",
    minute: "min",
    transfers: (n) => `${n} transfer${n === 1 ? "" : "s"}`
  }
};

const getStrings = (language) => STRINGS[language] || STRINGS.id;

const parseSeconds = (raw) => {
  const num = Number(String(raw || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : 0;
};

const secondsToHuman = (raw, language = "id") => {
  const s = getStrings(language);
  const minutes = Math.max(1, Math.round(parseSeconds(raw) / 60));
  if (minutes < 60) return `${minutes} ${s.minute}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} ${s.hour} ${rest} ${s.minute}` : `${hours} ${s.hour}`;
};

const formatClock = (date) => {
  const jakarta = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(jakarta.getUTCHours())}.${pad(jakarta.getUTCMinutes())}`;
};

const toRfc3339 = (departureTime) => {
  const match = String(departureTime || "").match(/(\d{1,2})[:.](\d{2})/);
  const now = new Date();
  if (!match) return new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(match[1]), Number(match[2]));
  return date.toISOString();
};

const stripHtml = (text) => String(text || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const modeLabel = (step, language = "id") => {
  const s = getStrings(language);
  const line = step?.transitDetails?.transitLine;
  const vehicle = String(line?.vehicle?.type || "").toUpperCase();
  const name = String(line?.nameShort || "").toLowerCase();
  if (/commuter|krl|lin |kereta/.test(name)) return "KRL";
  if (vehicle === "BUS") return s.bus;
  if (vehicle === "FERRY") return s.ferry;
  return VEHICLE_TO_MODE[vehicle] || s.publicTransport;
};

const parseFare = (fare) => {
  if (!fare || !fare.units) return "";
  const units = Number(fare.units) || 0;
  const nanos = Number(fare.nanos) || 0;
  const total = units + nanos / 1e9;
  if (total <= 0) return "";
  return `Rp${Math.round(total).toLocaleString("id-ID")}`;
};

function stepToRouteStep(step, fromClock, language = "id") {
  const s = getStrings(language);
  const navigation = stripHtml(step?.navigationInstruction?.instructions);
  const transit = step?.transitDetails;
  const durationSec = step?.duration || "";

  if (!transit) {
    return {
      instruction: navigation || s.continueTrip,
      mode: s.walk,
      time: "",
      duration: secondsToHuman(durationSec, language),
      stops: [],
      clockDeltaMin: Math.round(parseSeconds(durationSec) / 60)
    };
  }

  const line = transit.transitLine || {};
  const departureStop = transit.stopDetails?.departureStop?.name || "";
  const arrivalStop = transit.stopDetails?.arrivalStop?.name || "";
  const mode = modeLabel({ transitDetails: transit }, language);
  const lineName = line.nameShort || line.name || "";
  const stops = [departureStop, arrivalStop].filter(Boolean);
  const arrivalClock = transit.stopDetails?.arrivalTime
    ? new Date(transit.stopDetails.arrivalTime)
    : new Date(fromClock.getTime() + parseSeconds(durationSec) * 1000);

  const instruction = mode === "KRL"
    ? s.krlTowards(lineName, arrivalStop)
    : s.otherModeTo(mode, lineName, arrivalStop);

  return {
    instruction,
    mode,
    time: `${formatClock(fromClock)} – ${formatClock(arrivalClock)}`,
    duration: secondsToHuman(durationSec, language),
    stops,
    clockDeltaMin: Math.round(parseSeconds(durationSec) / 60),
    boardingClock: fromClock,
    arrivalClock
  };
}

export function parseTransitResponse(googleResponse, departureTime, language = "id") {
  const s = getStrings(language);
  const routes = Array.isArray(googleResponse?.routes) ? googleResponse.routes : [];
  if (!routes.length) return { routes: [] };

  const parsed = routes.map((route) => {
    const legs = route?.legs || [];
    let clock = toRfc3339(departureTime);
    const start = new Date(clock);
    let cursor = new Date(start);

    const steps = [];
    let walkingMinutes = 0;
    const modes = [];
    let transfers = 0;
    let prevMode = "";

    legs.forEach((leg) => {
      (leg?.steps || []).forEach((step) => {
        const parsedStep = stepToRouteStep(step, cursor, language);
        steps.push({
          instruction: parsedStep.instruction,
          mode: parsedStep.mode,
          time: parsedStep.time,
          duration: parsedStep.duration,
          stops: parsedStep.stops
        });
        cursor = parsedStep.clockDeltaMin
          ? new Date(cursor.getTime() + parsedStep.clockDeltaMin * 60 * 1000)
          : new Date(cursor.getTime());
        if (parsedStep.mode === s.walk) {
          walkingMinutes += parsedStep.clockDeltaMin || 0;
        } else {
          if (!modes.includes(parsedStep.mode)) modes.push(parsedStep.mode);
          if (prevMode && prevMode !== parsedStep.mode) transfers += 1;
          prevMode = parsedStep.mode;
        }
      });
    });

    const duration = secondsToHuman(route.duration, language);
    const fare = parseFare(route.fare);

    return {
      steps,
      modes: modes.length ? modes : [s.publicTransport],
      duration,
      cost: fare || "-",
      transfers: s.transfers(transfers),
      walking: `${Math.max(1, walkingMinutes)} ${s.minute}`
    };
  });

  return { routes: parsed };
}

export async function fetchTransitRoutes({ originText, destinationText, departureTime, language = "id" }) {
  if (!config.googleMapsApiKey) {
    const err = new Error("GOOGLE_MAPS_API_KEY belum diatur. Tambahkan di file .env agar rute dihitung Google Maps.");
    err.status = 501;
    throw err;
  }
  if (!originText || !destinationText) return { routes: [] };

  const body = {
    origin: { address: originText },
    destination: { address: destinationText },
    travelMode: "TRANSIT",
    computeAlternativeRoutes: true,
    departureTime: toRfc3339(departureTime),
    languageCode: language === "en" ? "en" : "id",
    units: "METRIC",
    transitPreferences: {
      routingPreference: "FEWER_TRANSFERS"
    },
    routeModifiers: { avoidFerries: true }
  };

  const fieldMask = [
    "routes.duration",
    "routes.distanceMeters",
    "routes.fare",
    "routes.legs.steps.duration",
    "routes.legs.steps.travelMode",
    "routes.legs.steps.navigationInstruction.instructions",
    "routes.legs.steps.transitDetails.transitLine.name",
    "routes.legs.steps.transitDetails.transitLine.nameShort",
    "routes.legs.steps.transitDetails.transitLine.vehicle.type",
    "routes.legs.steps.transitDetails.stopDetails.departureStop.name",
    "routes.legs.steps.transitDetails.stopDetails.arrivalStop.name",
    "routes.legs.steps.transitDetails.stopDetails.departureTime",
    "routes.legs.steps.transitDetails.stopDetails.arrivalTime"
  ].join(",");

  const response = await fetch(config.googleMapsApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": config.googleMapsApiKey,
      "X-Goog-FieldMask": fieldMask
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const err = new Error(`Google Maps API error ${response.status}: ${text.slice(0, 200)}`);
    err.status = 502;
    throw err;
  }

  const data = await response.json();
  return parseTransitResponse(data, departureTime, language);
}