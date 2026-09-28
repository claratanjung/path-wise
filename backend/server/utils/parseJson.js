export function extractJson(text) {
  if (!text) return null;

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (
      start === -1 ||
      end === -1 ||
      end <= start
    ) {
      return null;
    }

    try {
      return JSON.parse(
        cleaned.slice(start, end + 1)
      );
    } catch {
      return null;
    }
  }
}

const isFilledString = (value) =>
  typeof value === "string" &&
  value.trim().length > 0;

const INVALID_TEXT = "data tidak sesuai";

const buildInvalidResult = () => ({
  origin: INVALID_TEXT,
  destination: INVALID_TEXT,
  departureTime: INVALID_TEXT,
  budget: INVALID_TEXT,
  routes: [
    {
      title: INVALID_TEXT,
      badge: INVALID_TEXT,
      modes: [INVALID_TEXT],
      duration: INVALID_TEXT,
      cost: INVALID_TEXT,
      transfers: INVALID_TEXT,
      walking: INVALID_TEXT,
      steps: [
        {
          instruction: INVALID_TEXT,
          mode: INVALID_TEXT,
          time: INVALID_TEXT,
          duration: INVALID_TEXT,
          stops: []
        }
      ]
    }
  ]
});

const isInvalidLocation = (value) => {
  if (!isFilledString(value)) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === INVALID_TEXT || normalized === "-";
};

const FALLBACK_STRINGS = {
  id: {
    invalidJson: "AI mengembalikan format JSON yang tidak valid.",
    needDetail: "Mohon beri detail perjalananmu, misalnya asal, tujuan, dan waktu berangkat.",
    flexible: "Fleksibel",
    undetermined: "Belum ditentukan",
    routeFallback: (index) => `Rute ${index}`
  },
  en: {
    invalidJson: "The AI returned an invalid JSON format.",
    needDetail: "Please share more trip details, such as your origin, destination, and departure time.",
    flexible: "Flexible",
    undetermined: "Not set",
    routeFallback: (index) => `Route ${index}`
  }
};

export function normalizeRouteResult(input, language = "id") {
  const strings = FALLBACK_STRINGS[language] || FALLBACK_STRINGS.id;
  const data = extractJson(input);

  if (!data || typeof data !== "object") {
    const err = new Error(strings.invalidJson);

    err.status = 500;
    throw err;
  }

  if (isFilledString(data.clarification)) {
    return {
      clarification: data.clarification
    };
  }

  const routes = Array.isArray(data.routes)
    ? data.routes
    : [];

  const hasInvalidLocation =
    isInvalidLocation(data.origin) ||
    isInvalidLocation(data.destination);

  if (hasInvalidLocation || routes.length === 0) {
    return buildInvalidResult();
  }

  return {
    origin: data.origin || strings.flexible,

    destination:
      data.destination || strings.flexible,

    departureTime:
      data.departureTime || strings.flexible,

    budget:
      data.budget || strings.undetermined,

    routes: routes.map((route, index) => ({
      title:
        route.title ||
        strings.routeFallback(index + 1),

      badge:
        route.badge || "",

      modes:
        Array.isArray(route.modes)
          ? route.modes
          : [],

      duration:
        route.duration || "-",

      cost:
        route.cost || "-",

      transfers:
        route.transfers || "-",

      walking:
        route.walking || "-",

      steps:
        (Array.isArray(route.steps)
          ? route.steps
          : []
        ).map((step) => {
          if (Array.isArray(step)) {
            const [
              instruction = "",
              time = "",
              mode = ""
            ] = step;

            return {
              instruction,
              time,
              mode,
              duration: "",
              stops: []
            };
          }

          return {
            instruction:
              step?.instruction || "",

            mode:
              step?.mode || "",

            time:
              step?.time || "",

            duration:
              step?.duration || "",

            stops: []
          };
        })
    }))
  };
}