import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "/api/route";

const preferenceKeys = ["public", "cheap", "fast", "walk", "transfer"];

const translations = {
  id: {
    heroTitle1: "Ceritakan Perjalananmu,",
    heroTitle2: "Temukan Rutenya.",
    heroDescription:
      "Tulis kebutuhan perjalananmu, dan biarkan Path Wise membantu menemukan rute terbaik untukmu.",
    cardHeading: "Ceritakan perjalananmu",
    textareaPlaceholder:
      "Contoh: Saya mau pergi dari Surabaya ke Malang hari ini sekitar jam 10 pagi, naik transportasi umum, budget maksimal Rp50.000, dan tidak mau terlalu banyak jalan kaki.",
    preferenceLabel: "Preferensi perjalanan",
    preferences: {
      public: "Transportasi umum",
      cheap: "Hemat biaya",
      fast: "Paling cepat",
      walk: "Minim jalan kaki",
      transfer: "Minim transit"
    },
    searchButton: "Cari Rute",
    searching: "Menganalisis perjalanan...",
    resultHeading: "Hasil Rute",
    resultSubheading: "Berikut adalah rekomendasi rute terbaik berdasarkan cerita perjalananmu.",
    from: "DARI",
    to: "KE",
    departure: "BERANGKAT",
    budgetLabel: "BUDGET",
    flexible: "Fleksibel",
    undetermined: "Belum ditentukan",
    routeRecommendation: "Rekomendasi rute",
    options: (n) => `${n} opsi`,
    duration: "Durasi",
    cost: "Biaya",
    transit: "Transit",
    mapIllustration: "Ilustrasi peta · Integrasikan Maps API untuk jalur nyata",
    start: "Awal",
    destinationLabel: "Tujuan",
    totalTime: "Total waktu",
    estimatedCost: "Estimasi biaya",
    walkingLabel: "Jalan kaki",
    routeOrder: "Urutan perjalanan",
    findOtherRoute: "Cari rute lain",
    goToInput: "Ke bagian input",
    expandMap: "Perbesar peta",
    collapseMap: "Perkecil peta",
    tripDescriptionAria: "Ceritakan kebutuhan perjalananmu",
    langLabel: "Bahasa"
  },
  en: {
    heroTitle1: "Tell Us Your Trip,",
    heroTitle2: "Find the Route.",
    heroDescription:
      "Describe your travel needs, and let Path Wise help you find the best route.",
    cardHeading: "Tell us about your trip",
    textareaPlaceholder:
      "Example: I want to go from Surabaya to Malang today around 10 AM, using public transport, with a maximum budget of Rp50,000, and I don't want to walk too much.",
    preferenceLabel: "Travel preferences",
    preferences: {
      public: "Public transport",
      cheap: "Low cost",
      fast: "Fastest",
      walk: "Minimal walking",
      transfer: "Minimal transfers"
    },
    searchButton: "Find Route",
    searching: "Analyzing your trip...",
    resultHeading: "Route Results",
    resultSubheading: "Here are the best route recommendations based on your trip description.",
    from: "FROM",
    to: "TO",
    departure: "DEPARTURE",
    budgetLabel: "BUDGET",
    flexible: "Flexible",
    undetermined: "Not set",
    routeRecommendation: "Recommended routes",
    options: (n) => `${n} options`,
    duration: "Duration",
    cost: "Cost",
    transit: "Transfers",
    mapIllustration: "Map illustration · Integrate a Maps API for the real route",
    start: "Start",
    destinationLabel: "Destination",
    totalTime: "Total time",
    estimatedCost: "Estimated cost",
    walkingLabel: "Walking",
    routeOrder: "Trip sequence",
    findOtherRoute: "Find another route",
    goToInput: "Go to input section",
    expandMap: "Expand map",
    collapseMap: "Collapse map",
    tripDescriptionAria: "Describe your travel needs",
    langLabel: "Language"
  }
};

/* ---------- Icon set (plain line icons, no emoji) ---------- */

function Icon({ name, size = 18 }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  switch (name) {
    case "bus":
      return (
        <svg {...p}>
          <rect x="3.5" y="5" width="17" height="11" rx="2.5" />
          <path d="M3.5 10.5h17" />
          <path d="M7 16v2M17 16v2" />
          <circle cx="7.5" cy="18.4" r="1.2" />
          <circle cx="16.5" cy="18.4" r="1.2" />
        </svg>
      );
    case "train":
      return (
        <svg {...p}>
          <rect x="6" y="3.5" width="12" height="13" rx="3" />
          <path d="M6 10h12" />
          <path d="M9.3 13.3h.01M14.7 13.3h.01" />
          <path d="M8.5 16.5 6.3 20M15.5 16.5l2.2 3.5" />
        </svg>
      );
    case "walk":
      return (
        <svg {...p}>
          <circle cx="13" cy="4.7" r="1.5" />
          <path d="M10.6 8.2l1.6 2.6-2 2.4-1 4.8M12.6 10.6l2.3 1.4 1.6 5M12.6 10.6l-1 3.6 2.8 1.6" />
        </svg>
      );
    case "car":
      return (
        <svg {...p}>
          <path d="M4 15l1.2-4.3A2 2 0 0 1 7.1 9.2h9.8a2 2 0 0 1 1.9 1.5L20 15" />
          <rect x="3" y="15" width="18" height="4" rx="1.5" />
          <circle cx="7.5" cy="19" r="1.3" />
          <circle cx="16.5" cy="19" r="1.3" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.2 12.3l2.4 2.4 5.2-5.4" />
        </svg>
      );
    case "message":
      return (
        <svg {...p}>
          <path d="M4 5.8A2.3 2.3 0 0 1 6.3 3.5h11.4A2.3 2.3 0 0 1 20 5.8v7.4a2.3 2.3 0 0 1-2.3 2.3H10l-4 3.4v-3.4H6.3A2.3 2.3 0 0 1 4 13.2V5.8Z" />
        </svg>
      );
    case "target":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.6" />
          <path d="M12 2.3v3M12 18.7v3M2.3 12h3M18.7 12h3" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...p}>
          <path d="M5 19c8-1 13-6 14-14-8 0-13 5-14 14Z" />
          <path d="M6.3 17.7c2-3 5-5.7 8.7-7.6" />
        </svg>
      );
    case "expand":
      return (
        <svg {...p}>
          <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...p}>
          <path d="M4 6h8M4 12h5M4 18h10" />
          <circle cx="15" cy="6" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      );
    case "map":
      return (
        <svg {...p}>
          <path d="M4 6.3 10 4l4 2 6-2v13.7L14 20l-4-2-6 2Z" />
          <path d="M10 4v13.7M14 6v14" />
        </svg>
      );
    case "list":
      return (
        <svg {...p}>
          <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    case "clock":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.2V12l3.4 2" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...p}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h10A2.5 2.5 0 0 1 19 7.5V9H6.5A2.5 2.5 0 0 1 4 6.5v1Z" />
          <rect x="4" y="9" width="16" height="9.5" rx="2.3" />
          <circle cx="15.6" cy="13.7" r="1.15" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...p}>
          <path d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5M19.5 12a7.5 7.5 0 0 1-12.6 5.5" />
          <path d="M17 4.3v3.2h-3.2M7 19.7v-3.2h3.2" />
        </svg>
      );
    default:
      return null;
  }
}

function modeIconName(mode) {
  const key = (mode || "").toLowerCase();
  if (key.includes("bus")) return "bus";
  if (key.includes("krl") || key.includes("kereta") || key.includes("train") || key.includes("transit")) return "train";
  if (key.includes("jalan") || key.includes("walk")) return "walk";
  return "car";
}

/* Colour + icon per transport mode, used by the route line diagram so it
   adapts to whatever sequence of modes a given route actually uses
   (walking, bus, KRL, MRT, TransJakarta, ride-hailing, etc.). */
function modeLineStyle(mode) {
  const key = (mode || "").toLowerCase();
  if (key.includes("jalan") || key.includes("walk")) {
    return { color: "#64748b", icon: "walk" };
  }
  if (key.includes("mrt")) {
    return { color: "#0f9488", icon: "train" };
  }
  if (key.includes("transjakarta") || /(^|\s)tj(\s|$)/.test(key)) {
    return { color: "#f59e0b", icon: "bus" };
  }
  if (key.includes("krl") || key.includes("kereta") || key.includes("commuter") || key.includes("train")) {
    return { color: "#dc2626", icon: "train" };
  }
  if (key.includes("bus")) {
    return { color: "#2563eb", icon: "bus" };
  }
  if (key.includes("ojol") || key.includes("ride") || key.includes("mobil") || key.includes("car") || key.includes("kendaraan") || key.includes("transport")) {
    return { color: "#7c3aed", icon: "car" };
  }
  if (key.includes("transit") || key.includes("transfer")) {
    return { color: "#94a3b8", icon: "refresh" };
  }
  return { color: "#1c7a4f", icon: "map" };
}

/* Route line diagram: a polished, metro-style summary of the modes a route
   passes through, built from that route's own `modes` list so the number
   of stops and colours always match what the user will actually travel by.
   Always rendered at one consistent, spacious size — no expand/collapse. */
function RouteLineDiagram({ modes, t }) {
  const stops = [
    { key: "start", kind: "endpoint", label: t.start, badge: "A", color: "var(--primary)" },
    ...(modes || []).map((mode, index) => {
      const style = modeLineStyle(mode);
      return { key: `mode-${index}`, kind: "mode", label: mode, icon: style.icon, color: style.color };
    }),
    { key: "end", kind: "endpoint", label: t.destinationLabel, badge: "B", color: "var(--accent-end)" }
  ];

  return (
    <div className="route-line-panel">
      <div className="route-line-track">
        {stops.map((stop, index) => (
          <React.Fragment key={stop.key}>
            <div className={`route-line-stop ${stop.kind}`}>
              <span className={`route-line-dot ${stop.kind}`} style={{ "--stop-color": stop.color }}>
                {stop.kind === "endpoint" ? stop.badge : <Icon name={stop.icon} size={13} />}
              </span>
              <span className="route-line-stop-label">{stop.label}</span>
            </div>
            {index < stops.length - 1 && (
              <span className="route-line-connector" style={{ "--seg-color": stops[index + 1].color }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function LanguageSwitch({ lang, setLang }) {
  return (
    <div className="lang-switch" role="group" aria-label="Language selector">
      <button
        type="button"
        className={`lang-option ${lang === "id" ? "active" : ""}`}
        onClick={() => setLang("id")}
      >
        ID
      </button>
      <button
        type="button"
        className={`lang-option ${lang === "en" ? "active" : ""}`}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}

/* ---------- App ---------- */

function App() {
  const [lang, setLang] = useState("id");
  const [text, setText] = useState("");
  const [preferences, setPreferences] = useState(["public"]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(0);

  const t = translations[lang];
  const preferenceOptions = preferenceKeys.map((key) => [key, t.preferences[key]]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const inputSectionRef = useRef(null);
  const resultSectionRef = useRef(null);
  const textareaRef = useRef(null);
  const isFirstLangRender = useRef(true);

  const displayResult = result;

  const activeRoute = displayResult?.routes?.[selectedRoute] || null;
  const canSearch = text.trim().length >= 10 && !loading;

  const togglePreference = (value) => {
    setPreferences((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const scrollToResult = () => {
    requestAnimationFrame(() => {
      resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const scrollToInput = () => {
    requestAnimationFrame(() => {
      inputSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      textareaRef.current?.focus();
    });
  };

  const searchRoute = async () => {
    if (!canSearch) return;

    setLoading(true);
    setNotice("");

    const payload = {
      message: text.trim(),
      preferences,
      language: lang,
      requestedOutput: [
        "origin",
        "destination",
        "departureTime",
        "budget",
        "preferences",
        "clarification",
        "routeOptions"
      ]
    };

    try {
      console.log("[Path Wise] Mengirim request ke:", API_URL);
      console.log("[Path Wise] Payload:", payload);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      console.log("[Path Wise] Status:", response.status);
      console.log("[Path Wise] Response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error || `API error ${response.status}`
        );
      }

      if (!data) {
        throw new Error("Backend mengembalikan response kosong.");
      }

      if (data.clarification) {
        setNotice(data.clarification);
        setResult(null);
        return;
      }

      if (!Array.isArray(data.routes) || data.routes.length === 0) {
        throw new Error("Backend tidak mengembalikan rute.");
      }

      setResult(data);
      setSelectedRoute(0);

      requestAnimationFrame(() => {
        resultSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    } catch (error) {
      console.error("[Path Wise API Error]:", error);

      setNotice(
        error?.message ||
        "Terjadi kesalahan saat menghubungi server."
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshSearch = () => {
    setText("");
    setResult(null);
    setNotice("");
    setSelectedRoute(0);
    scrollToInput();
  };

  // Konten rute (judul, moda, badge, langkah perjalanan, dll.) dihasilkan oleh
  // AI di backend sesuai bahasa yang dikirim saat request. Supaya switch
  // bahasa langsung konsisten ke semua teks tanpa perlu refresh manual, saat
  // bahasa diganti dan sudah ada hasil rute yang tampil, kita minta ulang
  // rute yang sama ke backend memakai bahasa yang baru dipilih.
  useEffect(() => {
    if (isFirstLangRender.current) {
      isFirstLangRender.current = false;
      return;
    }
    if (result) {
      searchRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={refreshSearch} aria-label={t.goToInput}>
          <span className="brand-mark"><Icon name="leaf" size={19} /></span>
          <span>
            <strong>Path Wise</strong>
          </span>
        </button>

        <LanguageSwitch lang={lang} setLang={setLang} />
      </header>

      <main className="main-content">
        <section className="page-grid" ref={inputSectionRef}>
          <div className="hero-copy">
            <h1>{t.heroTitle1}<br /><span>{t.heroTitle2}</span></h1>
            <p className="hero-description">{t.heroDescription}</p>
          </div>

          <div className="search-card">
            <div className="card-heading">
              <h2>{t.cardHeading}</h2>
            </div>

            <textarea
              id="trip-description"
              aria-label={t.tripDescriptionAria}
              ref={textareaRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t.textareaPlaceholder}
              maxLength={1000}
            />
            <div className="textarea-footer">
              <span>{text.length}/1000</span>
            </div>

            <div className="field-label preference-label">{t.preferenceLabel}</div>
            <div className="preference-grid">
              {preferenceOptions.map(([value, label]) => (
                <button
                  key={value}
                  className={`preference-chip ${preferences.includes(value) ? "selected" : ""}`}
                  onClick={() => togglePreference(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <button className="primary-button" disabled={!canSearch} onClick={searchRoute}>
              {loading ? t.searching : t.searchButton}
            </button>

            {notice && <div className="notice">{notice}</div>}
          </div>
        </section>

        {displayResult && (
          <ResultSection
            result={displayResult}
            activeRoute={activeRoute}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
            onRefresh={refreshSearch}
            resultRef={resultSectionRef}
            t={t}
          />
        )}
      </main>

      <footer className="footer">
        <span>Path Wise</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

function ResultSection({ result, activeRoute, selectedRoute, setSelectedRoute, onRefresh, resultRef, t }) {
  const primaryIcon = activeRoute ? modeIconName(activeRoute.modes?.[0]) : "map";

  return (
    <section className="result-page" ref={resultRef}>
      <div className="page-heading-row">
        <div className="page-heading-title">
          <div>
            <h1>{t.resultHeading}</h1>
            <p>{t.resultSubheading}</p>
          </div>
        </div>
      </div>

      <div className="trip-summary">
        <div><span>{t.from}</span><strong>{result.origin}</strong></div>
        <div className="trip-arrow">→</div>
        <div><span>{t.to}</span><strong>{result.destination}</strong></div>
        <div className="summary-detail"><span>{t.budgetLabel}</span><strong>{result.budget || t.undetermined}</strong></div>
      </div>

      <div className="result-layout">
        <div className="route-column">
          <div className="section-title-row">
            <h2>{t.routeRecommendation}</h2>
            <span className="result-count">{t.options(result.routes?.length || 0)}</span>
          </div>

          {(result.routes || []).map((route, index) => (
            <button
              key={`${route.title}-${index}`}
              className={`route-option ${selectedRoute === index ? "route-selected" : ""}`}
              onClick={() => setSelectedRoute(index)}
            >
              <div className="route-option-top">
                <h3>{route.title}</h3>
                {route.badge && <span className="route-badge">{route.badge}</span>}
              </div>
              <div className="route-mode-words">
                {(route.modes || []).map((mode, i) => (
                  <span className="route-mode-word" key={`${mode}-${i}`}>{mode}</span>
                ))}
              </div>
              <div className="route-stats-row">
                <div className="route-stat">
                  <span className="route-stat-label">{t.duration}</span>
                  <span className="route-stat-value"><Icon name="clock" size={14} />{route.duration}</span>
                </div>
                <div className="route-stat">
                  <span className="route-stat-label">{t.cost}</span>
                  <span className="route-stat-value"><Icon name="wallet" size={14} />{route.cost}</span>
                </div>
                <div className="route-stat">
                  <span className="route-stat-label">{t.transit}</span>
                  <span className="route-stat-value"><Icon name="refresh" size={14} />{route.transfers}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {activeRoute && (
          <div className="route-detail-card">
            <div className="card-heading">
              <span className="heading-icon"><Icon name={primaryIcon} size={19} /></span>
              <div>
                <h2>{activeRoute.title}</h2>
              </div>
            </div>

            <RouteLineDiagram
              modes={activeRoute.modes}
              t={t}
            />

            <div className="detail-summary">
              <div><span>{t.totalTime}</span><strong>{activeRoute.duration}</strong></div>
              <div><span>{t.estimatedCost}</span><strong>{activeRoute.cost}</strong></div>
              <div><span>{t.transit}</span><strong>{activeRoute.transfers}</strong></div>
            </div>

            <h3 className="timeline-title">{t.routeOrder}</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot endpoint">A</div>
                <div className="timeline-content"><strong>{result.origin}</strong></div>
              </div>

              {(activeRoute.steps || []).map((step, index) => (
  <div
    className="timeline-item"
    key={`${step.instruction || "step"}-${index}`}
  >
    <div className="timeline-dot">
      <Icon
        name={modeIconName(step.mode)}
        size={14}
      />
    </div>

    <div className="timeline-content">
      <strong>
        {step.instruction || "-"}
      </strong>

      {step.duration && (
        <div className="timeline-meta">
          {step.duration}
        </div>
      )}
    </div>
  </div>
))}

              <div className="timeline-item last">
                <div className="timeline-dot endpoint">B</div>
                <div className="timeline-content"><strong>{result.destination}</strong></div>
              </div>
            </div>

            <button className="primary-button" onClick={onRefresh}>{t.findOtherRoute}</button>
          </div>
        )}
      </div>
    </section>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Elemen #root tidak ditemukan. Periksa index.html."
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
