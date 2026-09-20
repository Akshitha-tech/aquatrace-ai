import { useEffect, useState } from "react";
import OceanScene from "./OceanScene";
import DetectionPage from "./DetectionPage";
import OceanAnalysis from "./OceanAnalysis";
import TrackingPage from "./TrackingPage";
import PredictionPage from "./PredictionPage";
import InsightsPage from "./InsightsPage";

import {
  predictionData,
  riskZones,
  type RiskZoneData,
  type TimeRange,
} from "./oceanData";

function driftValue(
  current: number,
  step: number,
  minimum: number,
  maximum: number
) {
  const nextValue = current + (Math.random() - 0.5) * step * 2;

  return Number(
    Math.min(maximum, Math.max(minimum, nextValue)).toFixed(1)
  );
}

function toPercent(value: number, minimum: number, maximum: number) {
  return `${Math.round(
    ((value - minimum) / (maximum - minimum)) * 100
  )}%`;
}

export default function App() {
  const [selectedRange, setSelectedRange] =
  useState<TimeRange>("LIVE");

const [isLoading, setIsLoading] = useState(true);
const [isFading, setIsFading] = useState(false);
const [currentTime, setCurrentTime] = useState(
  new Date()
);
  const [showVessel, setShowVessel] =
    useState(false);

  const [selectedRisk, setSelectedRisk] =
    useState<RiskZoneData | null>(null);

  const [liveTemp, setLiveTemp] =
    useState(28.4);

  const [liveWind, setLiveWind] =
    useState(18);

  const [liveVisibility, setLiveVisibility] =
    useState(8.2);

  const [liveCurrent, setLiveCurrent] =
  useState(1.8);

useEffect(() => {
  const fadeTimer = setTimeout(() => {
    setIsFading(true);
  }, 1500);

  const hideTimer = setTimeout(() => {
    setIsLoading(false);
  }, 2000);

  return () => {
    clearTimeout(fadeTimer);
    clearTimeout(hideTimer);
  };
}, []);

useEffect(() => {
  const clock = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => {
    clearInterval(clock);
  };
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    setLiveTemp((current) => driftValue(current, 0.05, 27.8, 29));
    setLiveWind((current) => driftValue(current, 0.6, 12, 24));
    setLiveVisibility((current) =>
      driftValue(current, 0.15, 5.5, 10)
    );
    setLiveCurrent((current) => driftValue(current, 0.08, 1.2, 2.6));
  }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const prediction =
    predictionData[selectedRange];

  return (
  <main className={`app ${isLoading ? "is-loading" : "is-ready"}`}>

    {isLoading && (
      <div
        className={`loading-screen ${
          isFading ? "fade-out" : ""
        }`}
      >
        <div className="loading-content">

          <div className="loading-logo">
            AT
          </div>

          <h2>
            AQUATRACE AI
          </h2>

          <p>
            OCEAN INTELLIGENCE SYSTEM
          </p>

          <div className="loading-bar">
            <div className="loading-progress" />
          </div>

          <span>
            INITIALIZING OCEAN DATA...
          </span>

        </div>
      </div>
    )}

    {/* 3D OCEAN */}
    <div className="ocean-background">
      <OceanScene
        onVesselClick={() => {
          setShowVessel(true);
        }}
        onRiskZoneClick={(zoneIndex: number) => {
          setSelectedRisk(riskZones[zoneIndex]);
        }}
      />
    </div>

      <section className="dashboard-section" id="dashboard">
      <div className={`hud ${isLoading ? "dashboard-pending" : "dashboard-ready"}`}>

        {/* =========================
            TOP BAR
        ========================= */}

        <header className="topbar">

          <div className="brand">

            <div className="brand-mark">
              AT
            </div>

            <div>
              <h1>AquaTrace AI</h1>

              <span>
                Ocean Intelligence Platform
              </span>
            </div>

          </div>

                    <nav className="top-navigation">

            <button
              onClick={() => {
                document
                  .getElementById("dashboard")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              LIVE OCEAN
            </button>

            <button
              onClick={() => {
                document
                  .getElementById("ocean-analysis")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              ANALYSIS
            </button>

            <button
  onClick={() => {
    document
      .getElementById("detection")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }}
>
  DETECTION
</button>

            <button
              onClick={() => {
                document
                  .getElementById("tracking")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
            >
              TRACKING
            </button>

            <button
              onClick={() => {
                document
                  .getElementById("prediction")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
            >
              PREDICTION
            </button>

            <button
              onClick={() => {
                document
                  .getElementById("insights")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
            >
              INSIGHTS
            </button>

          </nav>
          <div className="system-status">

  <span className="status-dot" />

  SYSTEM ONLINE

  <span className="clock-divider">|</span>

  <div className="live-clock">
  <span className="live-time">
    {currentTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })}
  </span>

  <span className="live-date">
    {currentTime.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}
  </span>

  <span className="timezone">
    IST
  </span>
</div>

</div>

        </header>


        {/* =========================
            LEFT PANEL
        ========================= */}

        <section className="left-panel glass">

          <div className="eyebrow">
            LIVE OCEAN ANALYSIS
          </div>

          <h2>
            Bay of Bengal
            <br />
            <span>Intelligence</span>
          </h2>

          <p className="description">
            AI-powered monitoring of ocean
            conditions, vessel movement and
            emerging maritime risks.
          </p>


          <div className="metric">

            <div>
              <span>
                SEA TEMPERATURE
              </span>

              <strong>
                {liveTemp.toFixed(1)}°C
              </strong>
            </div>

            <div className="metric-line">
              <div
                className="metric-fill"
                style={{
                  width: toPercent(liveTemp, 27.8, 29),
                }}
              />
            </div>

          </div>


          <div className="metric">

            <div>
              <span>
                WIND SPEED
              </span>

              <strong>
                {liveWind.toFixed(1)} KT
              </strong>
            </div>

            <div className="metric-line">
              <div
                className="metric-fill wind"
                style={{
                  width: toPercent(liveWind, 12, 24),
                }}
              />
            </div>

          </div>


          <div className="metric">

            <div>
              <span>
                VISIBILITY
              </span>

              <strong>
                {liveVisibility.toFixed(1)} NM
              </strong>
            </div>

            <div className="metric-line">
              <div
                className="metric-fill visibility"
                style={{
                  width: toPercent(liveVisibility, 5.5, 10),
                }}
              />
            </div>

          </div>

        </section>


        {/* =========================
            RIGHT PANEL
        ========================= */}

        <section className="right-panel glass">

          <div className="panel-heading">

            <div>

              <span className="eyebrow">
                AI PREDICTION
              </span>

              <h3>
                Maritime Risk
              </h3>

            </div>

            <div className="risk-badge">
              {prediction.risk}
            </div>

          </div>


          <div className="risk-score">

            <div className="score">

              {prediction.score}

              <small>
                /100
              </small>

            </div>

            <div className="score-label">
              RISK INDEX
            </div>

          </div>


          <div className="prediction">

            <div className="prediction-icon">
              ↗
            </div>

            <div>

              <strong>
                {prediction.trend}
              </strong>

              <p>
                {prediction.description}
              </p>

            </div>

          </div>


          <div className="forecast">

            <div>
              <span>24H</span>
              <strong>64</strong>
            </div>

            <div>
              <span>48H</span>
              <strong>71</strong>
            </div>

            <div>
              <span>72H</span>
              <strong>58</strong>
            </div>

          </div>

        </section>


        {/* =========================
            ACTIVE VESSEL
        ========================= */}

        <button
          className="bottom-left glass mini-panel vessel-card-button"
          onClick={() => {
            setShowVessel(true);
          }}
        >

          <div className="mini-title">
            ACTIVE VESSEL
          </div>

          <div className="vessel-info">

            <span className="vessel-icon">
              ◈
            </span>

            <div>

              <strong>
                VESSEL-042
              </strong>

              <span>
                Bay of Bengal
              </span>

            </div>

          </div>

          <div className="coordinates">
            13.0827° N &nbsp; 80.2707° E
          </div>

          <div className="click-hint">
            CLICK FOR INTELLIGENCE →
          </div>

        </button>


        {/* =========================
            OCEAN SIGNALS
        ========================= */}

        <div className="bottom-right glass mini-panel">

          <div className="mini-title">
            OCEAN SIGNALS
          </div>

          <div className="signal">

            <span className="signal-dot" />

            Current flow detected

          </div>

          <div className="signal">

            <span className="signal-dot warning" />

            Elevated risk zone

          </div>

          <div className="signal">

            <span className="signal-dot" />

            Vessel tracking active

          </div>

        </div>


        {/* =========================
            LIVE OCEAN TELEMETRY
        ========================= */}

        <div className="live-data-panel">

          <div className="live-data-header">

            <span className="live-dot" />

            LIVE OCEAN TELEMETRY

          </div>


          <div className="live-data-grid">

            <div className="live-data-item">

              <span>
                SEA TEMP
              </span>

              <strong key={`temp-${liveTemp}`}>
                {liveTemp.toFixed(1)}°C
              </strong>

            </div>


            <div className="live-data-item">

              <span>
                WIND
              </span>

              <strong key={`wind-${liveWind}`}>
                {liveWind.toFixed(1)} KT
              </strong>

            </div>


            <div className="live-data-item">

              <span>
                VISIBILITY
              </span>

              <strong key={`visibility-${liveVisibility}`}>
                {liveVisibility.toFixed(1)} NM
              </strong>

            </div>


            <div className="live-data-item">

              <span>
                CURRENT
              </span>

              <strong key={`current-${liveCurrent}`}>
                {liveCurrent.toFixed(1)} KT
              </strong>

            </div>


            <div className="live-data-item">

              <span>
                AI CONFIDENCE
              </span>

              <strong>
                94.2%
              </strong>

            </div>

          </div>

        </div>


        {/* =========================
            AI ACTIVITY
        ========================= */}

        <div className="ai-activity-panel">

          <div className="ai-activity-header">

            <span className="activity-dot" />

            AI ACTIVITY

          </div>


          <div className="activity-item">

            <span className="activity-line" />

            <div>

              <strong>
                ROUTE UPDATE
              </strong>

              <p>
                Vessel-042 route recalculated
              </p>

            </div>

          </div>


          <div className="activity-item">

            <span className="activity-line" />

            <div>

              <strong>
                OCEAN MODEL
              </strong>

              <p>
                Current velocity updated
              </p>

            </div>

          </div>


          <div className="activity-item">

            <span className="activity-line warning" />

            <div>

              <strong>
                RISK ENGINE
              </strong>

              <p>
                Eastern zone probability elevated
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            TIME CONTROLS
        ========================= */}

        <div className="time-controls glass">

          {(
            [
              "LIVE",
              "24H",
              "48H",
              "72H",
            ] as TimeRange[]
          ).map((range) => (

            <button
              key={range}
              className={
                selectedRange === range
                  ? "time-button active"
                  : "time-button"
              }
              onClick={() => {
                setSelectedRange(range);
              }}
            >
              {range}
            </button>

          ))}

        </div>



        {/* =========================
            VESSEL INTELLIGENCE
        ========================= */}

        {showVessel && (

          <div
            className="vessel-overlay"
            onClick={() => {
              setShowVessel(false);
            }}
          >

            <div
              className="vessel-modal glass"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >

              <button
                className="close-vessel"
                onClick={() => {
                  setShowVessel(false);
                }}
              >
                ×
              </button>


              <div className="eyebrow">
                VESSEL INTELLIGENCE
              </div>

              <h2>
                VESSEL-042
              </h2>


              <div className="vessel-status">

                <span className="status-dot" />

                TRACKING ACTIVE

              </div>


              <div className="vessel-details">

                <div className="vessel-detail">

                  <span>
                    LOCATION
                  </span>

                  <strong>
                    13.0827° N
                    <br />
                    80.2707° E
                  </strong>

                </div>


                <div className="vessel-detail">

                  <span>
                    SPEED
                  </span>

                  <strong>
                    12.4 km/h
                  </strong>

                </div>


                <div className="vessel-detail">

                  <span>
                    HEADING
                  </span>

                  <strong>
                    NE 042°
                  </strong>

                </div>


                <div className="vessel-detail">

                  <span>
                    RISK LEVEL
                  </span>

                  <strong className="risk-text">
                    MODERATE
                  </strong>

                </div>

              </div>


              <div className="route-box">

                <span>
                  AI PREDICTED ROUTE
                </span>

                <p>
                  Current route remains within
                  the monitored fishing zone.
                  AI analysis detects moderate
                  maritime risk along the
                  projected route.
                </p>

              </div>


              <button
                className="close-button"
                onClick={() => {
                  setShowVessel(false);
                }}
              >
                CLOSE INTELLIGENCE
              </button>

            </div>

          </div>

        )}


        {/* =========================
            RISK INTELLIGENCE
        ========================= */}

        {selectedRisk && (

          <div
            className="vessel-overlay"
            onClick={() => {
              setSelectedRisk(null);
            }}
          >

            <div
              className="vessel-modal glass risk-modal"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >

              <button
                className="close-vessel"
                onClick={() => {
                  setSelectedRisk(null);
                }}
              >
                ×
              </button>


              <div className="eyebrow">
                AI RISK ANALYSIS
              </div>

              <h2>
                {selectedRisk.title}
              </h2>


              <div className="risk-modal-score">

                <div>

                  <span>
                    RISK INDEX
                  </span>

                  <strong>
                    {selectedRisk.score}

                    <small>
                      /100
                    </small>

                  </strong>

                </div>


                <div className="risk-modal-badge">
                  {selectedRisk.level}
                </div>

              </div>


              <div className="risk-analysis-box">

                <span>
                  DETECTED CONDITIONS
                </span>

                <p>
                  {selectedRisk.reason}
                </p>

              </div>


              <div className="risk-recommendation">

                <span>
                  AI RECOMMENDATION
                </span>

                <p>
                  {selectedRisk.recommendation}
                </p>

              </div>


              <button
                className="close-button"
                onClick={() => {
                  setSelectedRisk(null);
                }}
              >
                CLOSE ANALYSIS
              </button>

            </div>

          </div>

        )}

        <div className="dashboard-scroll-cue" aria-hidden="true">
          SCROLL TO EXPLORE <span>↓</span>
        </div>
      </div>
      </section>

            <section id="ocean-analysis">
        <OceanAnalysis
          liveTemp={liveTemp}
          liveWind={liveWind}
          liveVisibility={liveVisibility}
          liveCurrent={liveCurrent}
          prediction={prediction}
          predictionData={predictionData}
          riskZones={riskZones}
        />
      </section>
      <section id="detection">
  <DetectionPage />
</section>

      <section id="tracking">
        <TrackingPage />
      </section>

      <section id="prediction">
        <PredictionPage />
      </section>

      <section id="insights">
        <InsightsPage
          liveTemp={liveTemp}
          liveWind={liveWind}
          liveCurrent={liveCurrent}
          prediction={prediction}
          predictionData={predictionData}
          riskZones={riskZones}
        />
      </section>

      
    </main>
  );
}
