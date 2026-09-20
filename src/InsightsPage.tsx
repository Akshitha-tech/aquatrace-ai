import { useEffect, useRef, useState } from "react";
import type { PredictionData, RiskZoneData, TimeRange } from "./oceanData";
import "./InsightsPage.css";

type InsightsPageProps = {
  liveTemp: number;
  liveWind: number;
  liveCurrent: number;
  prediction: PredictionData;
  predictionData: Record<TimeRange, PredictionData>;
  riskZones: RiskZoneData[];
};

type InsightLayer = "ocean" | "detections" | "tracks" | "forecast" | "risk";

const layerLabels: { key: InsightLayer; label: string }[] = [
  { key: "ocean", label: "OCEAN" },
  { key: "detections", label: "DETECTIONS" },
  { key: "tracks", label: "TRACKS" },
  { key: "forecast", label: "FORECAST" },
  { key: "risk", label: "RISK" },
];

const observations = [
  { id: "01", title: "DETECTION CLUSTER", detail: "17 demo objects are concentrated within the current observation region.", source: "Detection / 91% average confidence" },
  { id: "02", title: "TRACK MOVEMENT", detail: "Active tracks follow the observed northeast current field.", source: "Tracking / simulated position data" },
  { id: "03", title: "FORECAST", detail: "Projected trajectories extend toward the eastern forecast region.", source: "Prediction / 72H model horizon" },
  { id: "04", title: "MODEL CONFIDENCE", detail: "Forecast confidence remains within the current demo model range.", source: "Hydrodynamic Core v2.4 / 87%" },
];

function downloadBriefing(props: InsightsPageProps) {
  const content = [
    "AQUATRACE AI / OCEAN INTELLIGENCE",
    "DEMO SYNTHESIS BRIEFING",
    "",
    `Ocean temperature: ${props.liveTemp.toFixed(1)} C`,
    `Wind: ${props.liveWind.toFixed(1)} KT`,
    `Current: ${props.liveCurrent.toFixed(1)} KT`,
    `Risk index: ${props.prediction.score} / 100 (${props.prediction.risk})`,
    "Detected objects: 17 demo objects",
    "Active tracks: 12 simulated tracks",
    "Forecast confidence: 87% demo model confidence",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "aquatrace-insights-briefing.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export default function InsightsPage(props: InsightsPageProps) {
  const { liveTemp, liveWind, liveCurrent, prediction, predictionData, riskZones } = props;
  const forecastScore = predictionData["72H"].score;
  const elevatedZones = riskZones.filter((zone) => zone.level === "HIGH").length;
  const insightsRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedObservation, setExpandedObservation] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<InsightLayer, boolean>>({ ocean: true, detections: true, tracks: true, forecast: true, risk: true });

  useEffect(() => {
    const section = insightsRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(section);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const toggleLayer = (layer: InsightLayer) => setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section ref={insightsRef} className={`insights-page ${isVisible ? "insights-visible" : ""}`}>
      <div className="insights-shell">
        <header className="insights-header"><div><p className="insights-kicker">06 / OCEAN INTELLIGENCE</p><h2>Ocean Insights</h2><p className="insights-intro">A unified intelligence view combining ocean conditions, detected objects, active tracks, and predictive model output.</p></div><div className="insights-live-state"><i /> LIVE INTELLIGENCE FEED</div></header>

        <section className="insights-summary"><div className="insights-summary-heading"><p className="insights-label">SYSTEM INTELLIGENCE</p><span>DEMO SYNTHESIS / APP STATE</span></div><div className="insights-summary-grid"><article><span>ACTIVE TRACKS</span><strong>12</strong><small>SIMULATED / MONITORING</small></article><article><span>DETECTED OBJECTS</span><strong>17</strong><small>DEMO OBSERVATION SET</small></article><article><span>FORECAST CONFIDENCE</span><strong>87%</strong><small>72H MODEL SCORE {forecastScore}</small></article><article><span>RISK INDEX</span><strong>{prediction.score}<em>/100</em></strong><small>{prediction.risk} / {elevatedZones} ELEVATED ZONE</small></article><article><span>MODEL STATUS</span><strong className="ready-value">READY</strong><small>AQUATRACE CORE V2.4</small></article></div></section>

        <section className="insights-workspace">
          <div className="insights-map-panel"><div className="insights-map-heading"><div><p className="insights-label">OCEAN INTELLIGENCE GRID</p><h3>Bay of Bengal</h3></div><span>13.08° N / 80.27° E</span></div><div className="insights-map-stage"><svg className="insights-map" viewBox="0 0 900 560" role="img" aria-label="Combined AquaTrace ocean intelligence visualization"><defs><pattern id="insights-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="rgba(98,218,218,.12)" /></pattern><linearGradient id="insights-sea" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#071e2b" /><stop offset="1" stopColor="#03101a" /></linearGradient></defs><rect width="900" height="560" fill="url(#insights-sea)" /><rect width="900" height="560" fill="url(#insights-grid)" /><g className="insights-coordinates"><text x="28" y="34">14.2° N</text><text x="28" y="530">12.4° N</text><text x="160" y="545">80.0° E</text><text x="725" y="545">82.0° E</text><text x="672" y="38">BAY OF BENGAL</text></g>{layers.ocean && <g className="insights-currents"><path d="M-20 165C160 90 285 215 425 145S710 70 930 170" /><path d="M-20 300C155 225 280 340 445 270S720 210 930 310" /><path d="M-20 430C160 350 310 465 490 390S730 340 930 430" /><path className="insights-flow-arrow" d="M270 135l18 9-18 9M565 125l18 9-18 9M380 280l18 9-18 9M680 270l18 9-18 9" /></g>}{layers.risk && <g className="insights-risk-zone"><ellipse cx="720" cy="380" rx="130" ry="78" /><text x="650" y="478">RISK ZONE / MODERATE</text></g>}{layers.forecast && <g className="insights-forecast"><path d="M190 390C280 350 360 340 440 290S610 250 760 300" /><circle cx="545" cy="270" r="8" /><text x="510" y="245">FORECAST / +24H</text></g>}{layers.tracks && <g className="insights-track"><path d="M190 390C260 340 330 325 405 295" /><circle cx="405" cy="295" r="7" /><text x="420" y="292">VESSEL-042 / ACTIVE</text></g>}{layers.detections && <g className="insights-detections"><rect x="268" y="330" width="52" height="38" /><rect x="342" y="300" width="45" height="34" /><rect x="476" y="238" width="48" height="35" /><text x="260" y="390">17 OBJECTS / DETECTION REGION</text></g>}<circle className="insights-observation" cx="190" cy="390" r="11" /><text className="insights-observation-label" x="105" y="425">CURRENT OBSERVATION</text></svg><div className="insights-map-scan" aria-hidden="true" /><div className="insights-map-layers"><span>LAYERS</span>{layerLabels.map((layer) => <button key={layer.key} className={layers[layer.key] ? "active" : ""} onClick={() => toggleLayer(layer.key)}>{layer.label}</button>)}</div><div className="insights-map-legend"><strong>MAP LEGEND</strong><span><i className="legend-track" /> ACTIVE TRACK</span><span><i className="legend-detection" /> DETECTION</span><span><i className="legend-history" /> HISTORICAL PATH</span><span><i className="legend-forecast" /> PREDICTED PATH</span><span><i className="legend-risk" /> RISK ZONE</span><span><i className="legend-flow" /> CURRENT FLOW</span></div><span className="insights-map-caption"><i /> DEMO SYNTHESIS / SIMULATED SYSTEM DATA</span></div></div>

          <aside className="insights-intelligence-column"><section className="insights-panel"><div className="insights-panel-heading"><div><p className="insights-label">SITUATION STATUS</p><h3>Monitoring</h3></div><span className="insights-status"><i /> READY</span></div><div className="insights-status-list"><div><span>OCEAN CONDITIONS</span><strong>STABLE</strong></div><div><span>DETECTION ACTIVITY</span><strong>ANALYZED</strong></div><div><span>TRACKING ACTIVITY</span><strong>MONITORING</strong></div><div><span>FORECAST CONFIDENCE</span><strong>87%</strong></div></div></section><section className="insights-panel insights-model"><div className="insights-panel-heading"><div><p className="insights-label">MODEL INTERPRETATION</p><h3>Primary signal</h3></div><span className="insights-status">ANALYSIS READY</span></div><p>Ocean-current movement is influencing the projected trajectory of monitored objects.</p><strong>87%</strong><small>CONFIDENCE / AQUATRACE HYDRODYNAMIC CORE V2.4</small></section><section className="insights-panel"><div className="insights-panel-heading"><div><p className="insights-label">RISK OVERVIEW</p><h3>Current model risk</h3></div><span className="insights-risk-status">{prediction.risk}</span></div><strong className="insights-risk-score">{prediction.score}<small>/100</small></strong><div className="insights-risk-bars"><div><span>CURRENT SPEED<strong>{liveCurrent.toFixed(1)} KT</strong></span><i><b style={{ width: "62%" }} /></i></div><div><span>WIND DIRECTION<strong>{liveWind.toFixed(1)} KT</strong></span><i><b className="orange" style={{ width: "55%" }} /></i></div><div><span>OBJECT DENSITY<strong>17 OBJECTS</strong></span><i><b className="blue" style={{ width: "48%" }} /></i></div><div><span>FORECAST UNCERTAINTY<strong>MEDIUM</strong></span><i><b className="coral" style={{ width: "42%" }} /></i></div></div></section></aside>
        </section>

        <section className="insights-observations insights-section"><div className="insights-section-heading"><div><p className="insights-kicker">KEY OBSERVATIONS</p><h3>Cross-system signals</h3></div><span>SELECT AN OBSERVATION TO INSPECT</span></div><div className="insights-observation-grid">{observations.map((observation) => <article key={observation.id} className={expandedObservation === observation.id ? "expanded" : ""} onClick={() => setExpandedObservation(expandedObservation === observation.id ? null : observation.id)}><span className="observation-number">{observation.id}</span><div><strong>{observation.title}</strong><p>{observation.detail}</p>{expandedObservation === observation.id && <small>{observation.source}</small>}</div><b>{expandedObservation === observation.id ? "-" : "+"}</b></article>)}</div></section>

        <section className="insights-pipeline insights-section"><div className="insights-section-heading"><div><p className="insights-kicker">SYNTHESIS PIPELINE</p><h3>How the system connects</h3></div><span>DEMO MODEL STATE</span></div><div className="insights-pipeline-row"><div><span>OCEAN CONDITIONS</span><strong>{liveTemp.toFixed(1)}°C</strong><small><i /> ACTIVE</small></div><i className="pipeline-arrow">↓</i><div><span>DETECTION</span><strong>17 OBJECTS</strong><small><i /> ANALYZED</small></div><i className="pipeline-arrow">↓</i><div><span>TRACKING</span><strong>12 ACTIVE</strong><small><i /> MONITORING</small></div><i className="pipeline-arrow">↓</i><div><span>PREDICTION</span><strong>87% CONFIDENCE</strong><small><i /> FORECAST READY</small></div><i className="pipeline-arrow">↓</i><div><span>INSIGHTS</span><strong>{prediction.score} / 100</strong><small><i /> SYNTHESIS READY</small></div></div></section>

        <section className="insights-bottom-grid"><article className="insights-panel insights-signal-panel"><div className="insights-panel-heading"><div><p className="insights-label">SIGNAL ACTIVITY</p><h3>Recent system activity</h3></div><span>SIMULATED WINDOW</span></div><svg viewBox="0 0 680 170" role="img" aria-label="Recent system signal activity"><path className="signal-grid" d="M0 20H680M0 85H680M0 150H680M0 20V150M170 20V150M340 20V150M510 20V150M680 20V150" /><polyline points="0,126 95,108 190,116 285,72 380,89 475,52 570,68 680,35" /><circle cx="475" cy="52" r="5" /></svg><div className="signal-labels"><span>DETECTION</span><span>TRACKING</span><span>FORECAST</span><span>OCEAN</span></div></article><article className="insights-panel insights-timeline"><p className="insights-label">INTELLIGENCE TIMELINE</p><h3>Recent events</h3><div><time>14:32</time><span>Forecast model updated</span></div><div><time>14:28</time><span>Track VESSEL-042 updated</span></div><div><time>14:21</time><span>New debris observation received</span></div><div><time>14:14</time><span>Ocean field refreshed</span></div><div><time>14:05</time><span>Detection analysis completed</span></div></article><article className="insights-panel insights-actions"><p className="insights-label">MONITORING ACTIONS</p><h3>Open a system layer</h3><div><button onClick={() => goTo("detection")}>OPEN DETECTION</button><button onClick={() => goTo("tracking")}>VIEW TRACKS</button><button onClick={() => goTo("prediction")}>VIEW FORECAST</button><button onClick={() => goTo("ocean-analysis")}>ANALYZE OCEAN</button><button onClick={() => downloadBriefing(props)}>EXPORT INTEL BRIEFING</button></div></article></section>
        <div className="insights-data-note">Insights values are application/demo data unless explicitly marked as live App telemetry. They do not represent a connected production inference service.</div>
      </div>
    </section>
  );
}
