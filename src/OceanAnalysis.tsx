import { useEffect, useRef, useState } from "react";
import type {
  PredictionData,
  RiskZoneData,
  TimeRange,
} from "./oceanData";

type OceanAnalysisProps = {
  liveTemp: number;
  liveWind: number;
  liveVisibility: number;
  liveCurrent: number;
  prediction: PredictionData;
  predictionData: Record<TimeRange, PredictionData>;
  riskZones: RiskZoneData[];
};

function conditionPercent(value: number, minimum: number, maximum: number) {
  return `${Math.round(
    ((value - minimum) / (maximum - minimum)) * 100
  )}%`;
}

export default function OceanAnalysis({
  liveTemp,
  liveWind,
  liveVisibility,
  liveCurrent,
  prediction,
  predictionData,
  riskZones,
}: OceanAnalysisProps) {
  const analysisRef = useRef<HTMLElement>(null);

const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = analysisRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(section);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={analysisRef}
      className={`analysis-page ${isVisible ? "analysis-visible" : ""}`}
    >
      <div className="analysis-shell">
        <div className="analysis-heading">
          <div>
            <p className="analysis-kicker">02 / OCEAN INTELLIGENCE</p>
            <h2>Ocean Analysis</h2>
            <p>
              A live environmental readout for the Bay of Bengal, combining
              current conditions with model-based maritime risk signals.
            </p>
          </div>
          <div className="analysis-state">
            <span className="analysis-state-dot" />
            LIVE MODEL FEED
          </div>
        </div>

        <div className="analysis-layout">
          <section className="analysis-map glass">
            <div className="analysis-section-heading">
              <div>
                <p className="analysis-kicker">PRIMARY VISUALIZATION</p>
                <h3>Bay of Bengal ocean grid</h3>
              </div>
              <span className="analysis-coordinate">13.08° N / 80.27° E</span>
            </div>
            <div className="analysis-map-stage">
  <div className="analysis-map-grid" />

  <div className="ocean-flow-layer" aria-hidden="true">
    <span className="flow-particle particle-1" />
    <span className="flow-particle particle-2" />
    <span className="flow-particle particle-3" />
    <span className="flow-particle particle-4" />
    <span className="flow-particle particle-5" />
    <span className="flow-particle particle-6" />
    <span className="flow-particle particle-7" />
    <span className="flow-particle particle-8" />
    <span className="flow-particle particle-9" />
    <span className="flow-particle particle-10" />
  </div>

  <div className="analysis-map-ring ring-west" />
              <div className="analysis-map-ring ring-east" />
              <div className="analysis-map-ring ring-north" />
              <div className="analysis-map-marker marker-vessel">VESSEL-042</div>
              <div className="analysis-map-marker marker-west">WESTERN / 62</div>
              <div className="analysis-map-marker marker-east">EASTERN / 78</div>
              <div className="analysis-map-marker marker-north">NORTHERN / 56</div>
              <div className="analysis-map-caption">
                <span className="pulse" />
                LIVE OCEAN GRID / RISK ZONES ACTIVE
              </div>
            </div>
          </section>

          <section className="analysis-conditions glass">
            <div className="analysis-section-heading">
              <div>
                <p className="analysis-kicker">LIVE TELEMETRY</p>
                <h3>Ocean conditions</h3>
              </div>
              <span className="analysis-updated">UPDATED LIVE</span>
            </div>

            <div className="condition-list">
              <div className="condition-row">
                <div>
                  <span>SEA TEMPERATURE</span>
                  <strong>{liveTemp.toFixed(1)}°C</strong>
                </div>
                <div className="condition-bar">
                  <i
                    style={{ width: conditionPercent(liveTemp, 27.8, 29) }}
                  />
                </div>
              </div>
              <div className="condition-row">
                <div>
                  <span>WIND SPEED</span>
                  <strong>{liveWind.toFixed(1)} KT</strong>
                </div>
                <div className="condition-bar wind-bar">
                  <i style={{ width: conditionPercent(liveWind, 12, 24) }} />
                </div>
              </div>
              <div className="condition-row">
                <div>
                  <span>VISIBILITY</span>
                  <strong>{liveVisibility.toFixed(1)} NM</strong>
                </div>
                <div className="condition-bar visibility-bar">
                  <i
                    style={{ width: conditionPercent(liveVisibility, 5.5, 10) }}
                  />
                </div>
              </div>
              <div className="condition-row">
                <div>
                  <span>CURRENT SPEED</span>
                  <strong>{liveCurrent.toFixed(1)} KT</strong>
                </div>
                <div className="condition-bar current-bar">
                  <i style={{ width: conditionPercent(liveCurrent, 1.2, 2.6) }} />
                </div>
              </div>
            </div>

            <div className="condition-note">
              Values use the existing live telemetry feed. Bars show their
              position within the dashboard&apos;s monitored operating range.
            </div>
          </section>

          <section className="analysis-ai glass">
            <div className="analysis-section-heading">
              <div>
                <p className="analysis-kicker">MODEL INTERPRETATION</p>
                <h3>AI analysis</h3>
              </div>
              <span className="risk-badge">{prediction.risk}</span>
            </div>
            <div className="analysis-ai-score">
              <strong>{prediction.score}</strong>
              <span>/100 RISK INDEX</span>
            </div>
            <p className="analysis-ai-trend">{prediction.trend}</p>
            <p className="analysis-ai-description">{prediction.description}</p>
            <div className="analysis-ai-signal">
              <span className="analysis-state-dot" />
              Model confidence remains aligned with current ocean signals.
            </div>
          </section>

          <section className="analysis-risks">
            <div className="analysis-section-heading">
              <div>
                <p className="analysis-kicker">RISK ZONE ANALYSIS</p>
                <h3>Regional maritime signals</h3>
              </div>
              <span className="analysis-updated">3 ACTIVE ZONES</span>
            </div>
            <div className="risk-zone-grid">
              {riskZones.map((zone) => (
                <article className="analysis-risk-card glass" key={zone.title}>
                  <div className="risk-card-topline">
                    <span>{zone.title}</span>
                    <strong className={zone.level === "HIGH" ? "high-risk" : "moderate-risk"}>
                      {zone.level}
                    </strong>
                  </div>
                  <div className="risk-card-score">
                    <strong>{zone.score}</strong>
                    <span>/100</span>
                  </div>
                  <p>{zone.reason}</p>
                  <div className="risk-card-action">
                    <span>RECOMMENDED ACTION</span>
                    <p>{zone.recommendation}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="analysis-trends glass">
            <div className="analysis-section-heading">
              <div>
                <p className="analysis-kicker">MODEL HORIZONS</p>
                <h3>Risk outlook</h3>
              </div>
              <span className="analysis-updated">STATIC MODEL DATA</span>
            </div>
            <div className="trend-grid">
              {(["LIVE", "24H", "48H", "72H"] as TimeRange[]).map(
                (range) => (
                  <div
                    className={`trend-item ${
                      range === "LIVE" ? "active-trend" : ""
                    } ${range === "48H" ? "elevated-trend" : ""}`}
                    key={range}
                  >
                    <span>{range}</span>
                    <strong>{predictionData[range].score}</strong>
                    <small>{predictionData[range].risk}</small>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
