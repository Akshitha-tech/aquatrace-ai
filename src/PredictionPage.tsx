import { useEffect, useRef, useState } from "react";
import "./PredictionPage.css";

type ForecastTarget = "DEBRIS" | "VESSEL" | "OCEAN CONDITIONS";
type ForecastWindow = "6H" | "12H" | "24H" | "48H";
type LayerKey = "currents" | "trajectory" | "zones";

type ForecastPoint = {
  label: string;
  position: string;
  speed: string;
  heading: string;
  displacement: string;
  confidence: number;
  risk: number;
};

const forecastPoints: Record<ForecastWindow, ForecastPoint> = {
  "6H": { label: "+06H", position: "13.10° N / 80.31° E", speed: "0.9 KT", heading: "092°", displacement: "4.8 NM", confidence: 93, risk: 52 },
  "12H": { label: "+12H", position: "13.13° N / 80.36° E", speed: "1.0 KT", heading: "097°", displacement: "9.2 NM", confidence: 90, risk: 58 },
  "24H": { label: "+24H", position: "13.21° N / 80.49° E", speed: "1.1 KT", heading: "102°", displacement: "18.4 NM", confidence: 87, risk: 64 },
  "48H": { label: "+48H", position: "13.41° N / 80.72° E", speed: "1.2 KT", heading: "108°", displacement: "34.1 NM", confidence: 74, risk: 71 },
};

const windows: ForecastWindow[] = ["6H", "12H", "24H", "48H"];
const layers: { key: LayerKey; label: string }[] = [
  { key: "currents", label: "Ocean current flow" },
  { key: "trajectory", label: "Predicted trajectory" },
  { key: "zones", label: "Forecast zones" },
];

export default function PredictionPage() {
  const predictionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [target, setTarget] = useState<ForecastTarget>("DEBRIS");
  const [selectedWindow, setSelectedWindow] = useState<ForecastWindow>("24H");
  const [selectedPoint, setSelectedPoint] = useState<ForecastWindow>("24H");
  const [showLayers, setShowLayers] = useState(false);
  const [layersVisible, setLayersVisible] = useState<Record<LayerKey, boolean>>({ currents: true, trajectory: true, zones: true });

  useEffect(() => {
    const section = predictionRef.current;
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

  const point = forecastPoints[selectedPoint];
  const selectWindow = (window: ForecastWindow) => {
    setSelectedWindow(window);
    setSelectedPoint(window);
  };
  const toggleLayer = (key: LayerKey) => setLayersVisible((current) => ({ ...current, [key]: !current[key] }));

  return (
    <section ref={predictionRef} className={`prediction-page ${isVisible ? "prediction-visible" : ""}`}>
      <div className="prediction-shell">
        <header className="prediction-header"><div><p className="prediction-kicker">05 / PREDICTIVE OCEAN INTELLIGENCE</p><h2>Ocean Prediction</h2><p className="prediction-intro">Forecast debris movement, vessel trajectories, and environmental risk using AquaTrace hydrodynamic models.</p></div><div className="prediction-live-state"><i /> MODEL FORECAST ACTIVE</div></header>

        <section className="prediction-control-bar">
          <div><span>FORECAST TARGET</span>{(["DEBRIS", "VESSEL", "OCEAN CONDITIONS"] as ForecastTarget[]).map((item) => <button key={item} className={target === item ? "active" : ""} onClick={() => setTarget(item)}>{item}</button>)}</div>
          <div><span>FORECAST WINDOW</span>{windows.map((window) => <button key={window} className={selectedWindow === window ? "active" : ""} onClick={() => selectWindow(window)}>{window === "6H" ? "6 HOURS" : `+${window.replace("H", " HOURS")}`}</button>)}</div>
          <div><span>REGION</span><button className="active">BAY OF BENGAL</button></div>
        </section>

        <section className="prediction-workspace">
          <div className="prediction-map-panel"><div className="prediction-map-heading"><div><p className="prediction-label">PREDICTIVE OCEAN MODEL</p><h3>Bay of Bengal forecast grid</h3></div><div className="prediction-map-meta"><span>13.08° N / 80.27° E</span><strong>FORECAST {point.label}</strong></div></div>
            <div className="prediction-map-stage">
              <svg className="prediction-map" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Simulated predictive ocean movement visualization">
                <defs><pattern id="prediction-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="rgba(98,218,218,.12)" /></pattern><linearGradient id="prediction-sea" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#071e2b" /><stop offset="1" stopColor="#03101a" /></linearGradient></defs>
                <g className="prediction-map-zoom">
                  <rect width="900" height="560" fill="url(#prediction-sea)" /><rect width="900" height="560" fill="url(#prediction-grid)" />
                  <g className="prediction-coordinates"><text x="28" y="34">14.2° N</text><text x="28" y="530">12.4° N</text><text x="160" y="545">80.0° E</text><text x="725" y="545">82.0° E</text><text x="675" y="38">BAY OF BENGAL</text></g>
                  {layersVisible.currents && <g className="prediction-currents"><path d="M-20 165C160 90 285 215 425 145S710 70 930 170" /><path d="M-20 292C155 225 280 340 445 270S720 210 930 310" /><path d="M-20 430C160 350 310 465 490 390S730 340 930 430" /><path className="prediction-flow-arrow" d="M270 135l18 9-18 9M565 125l18 9-18 9M380 280l18 9-18 9M680 270l18 9-18 9M505 400l18 9-18 9" /></g>}
                  {layersVisible.zones && <g className="prediction-zones"><ellipse className="forecast-zone" cx="560" cy="265" rx={selectedWindow === "48H" ? 175 : 138} ry={selectedWindow === "48H" ? 105 : 82} /><ellipse className="risk-zone" cx="735" cy="390" rx="112" ry="68" /><text x="475" y="160">FORECAST ZONE</text><text x="680" y="480">RISK REGION / MODERATE</text></g>}
                  {layersVisible.trajectory && <g className="prediction-trajectory-layer"><path className="prediction-trajectory-history" d="M165 405C230 378 270 350 325 335" /><path className="prediction-trajectory" d="M165 405C250 370 300 365 365 315S485 265 560 250S680 260 765 310" /><circle className="prediction-current-point" cx="165" cy="405" r="7" /><circle className={`prediction-forecast-point point-${selectedPoint}`} cx={selectedPoint === "6H" ? 365 : selectedPoint === "12H" ? 455 : selectedPoint === "24H" ? 560 : 700} cy={selectedPoint === "6H" ? 315 : selectedPoint === "12H" ? 280 : selectedPoint === "24H" ? 250 : 270} r="8" /><text x="110" y="445">CURRENT POSITION</text><text x="130" y="388">VESSEL / DEBRIS-017</text><text x="335" y="300">+06H</text><text x="430" y="265">+12H</text><text x="535" y="232">+24H</text><text x="680" y="252">+48H</text></g>}
                </g>
              </svg>
              <div className="prediction-map-scan" aria-hidden="true" /><div className="prediction-layers"><button onClick={() => setShowLayers((current) => !current)}>TELEMETRY LAYERS <span>{showLayers ? "-" : "+"}</span></button>{showLayers && <div>{layers.map((layer) => <label key={layer.key}><input type="checkbox" checked={layersVisible[layer.key]} onChange={() => toggleLayer(layer.key)} />{layer.label}</label>)}</div>}</div><div className="prediction-legend"><strong>FORECAST LEGEND</strong><span><i className="legend-current" /> Current position</span><span><i className="legend-history" /> Historical path</span><span><i className="legend-predicted" /> Predicted path</span><span><i className="legend-risk" /> Risk region</span></div><span className="prediction-map-caption"><i /> DEMO MODEL / REPRESENTATIONAL FORECAST DATA</span>
            </div>
            <div className="prediction-timeline"><span>NOW</span>{windows.map((window) => <button key={window} className={selectedPoint === window ? "active" : ""} onClick={() => selectWindow(window)}><i />{window === "6H" ? "+06H" : `+${window.replace("H", "H")}`}</button>)}</div>
          </div>

          <aside className="prediction-intelligence-column">
            <section className="prediction-panel"><div className="prediction-panel-heading"><div><p className="prediction-label">FORECAST STATUS</p><h3>Model forecast active</h3></div><span className="prediction-status"><i /> READY</span></div><div className="prediction-status-grid"><div><strong>{point.confidence}%</strong><span>CONFIDENCE</span></div><div><strong>{selectedWindow}</strong><span>HORIZON</span></div><div><strong>ACTIVE</strong><span>MODEL STATUS</span></div><div><strong>LIVE</strong><span>LAST UPDATE</span></div></div></section>
            <section className="prediction-panel"><div className="prediction-panel-heading"><div><p className="prediction-label">PREDICTED MOVEMENT</p><h3>{target === "VESSEL" ? "VESSEL-042" : "DEBRIS-017"}</h3></div><span className="prediction-demo">DEMO DATA</span></div><div className="prediction-detail-list"><div><span>CURRENT SPEED</span><strong>0.8 KT</strong></div><div><span>PREDICTED SPEED</span><strong>{point.speed}</strong></div><div><span>CURRENT HEADING</span><strong>084°</strong></div><div><span>PREDICTED HEADING</span><strong>{point.heading}</strong></div><div><span>EXPECTED DISPLACEMENT</span><strong>{point.displacement}</strong></div></div></section>
            <section className="prediction-panel"><div className="prediction-panel-heading"><div><p className="prediction-label">FORECAST CONDITIONS</p><h3>Ocean intelligence</h3></div><span className="prediction-updated">UPDATED LIVE</span></div><div className="prediction-condition-list"><div><span>SEA TEMPERATURE<strong>28.4°C</strong></span><i><b style={{ width: "72%" }} /></i></div><div><span>WIND<strong>13.1 KT</strong></span><i><b className="orange" style={{ width: "55%" }} /></i></div><div><span>CURRENT<strong>1.3 KT</strong></span><i><b className="blue" style={{ width: "62%" }} /></i></div><div><span>VISIBILITY<strong>7.5 NM</strong></span><i><b className="coral" style={{ width: "58%" }} /></i></div></div></section>
            <section className="prediction-panel prediction-interpretation"><div className="prediction-panel-heading"><div><p className="prediction-label">MODEL INTERPRETATION</p><h3>Forecast stable</h3></div><span className="prediction-status">STABLE</span></div><p>Predicted movement remains consistent with the current hydrodynamic field.</p><strong>{point.confidence}%</strong><small>FORECAST CONFIDENCE / AQUATRACE HYDRODYNAMIC CORE V2.4</small></section>
            <section className="prediction-panel prediction-risk-panel"><div className="prediction-panel-heading"><div><p className="prediction-label">FORECAST RISK</p><h3>Risk index</h3></div><span className="prediction-risk-level">MODERATE</span></div><strong className="prediction-risk-score">{point.risk}<small>/100</small></strong><div className="prediction-risk-list"><div><span>PRIMARY FACTOR</span><b>Ocean current</b></div><div><span>SECONDARY FACTOR</span><b>Wind direction</b></div><div><span>FORECAST WINDOW</span><b>{selectedWindow.replace("H", " HOURS")}</b></div></div></section>
          </aside>
        </section>

        <section className="prediction-bottom-grid"><article className="prediction-panel"><p className="prediction-label">FORECAST TIMELINE</p><h3>Movement outlook</h3><div className="prediction-history"><div><time>NOW</time><span>Current observation</span></div><div><time>+06H</time><span>Trajectory update</span></div><div><time>+12H</time><span>Forecast zone expands</span></div><div><time>+24H</time><span>Primary forecast</span></div><div><time>+48H</time><span>Extended uncertainty</span></div></div></article><article className="prediction-panel"><p className="prediction-label">UNCERTAINTY</p><h3>Forecast confidence band</h3><div className="prediction-uncertainty"><div><span>HIGH CONFIDENCE</span><i><b style={{ width: "87%" }} /></i></div><div><span>MEDIUM CONFIDENCE</span><i><b className="medium" style={{ width: "67%" }} /></i></div><div><span>LOW CONFIDENCE</span><i><b className="low" style={{ width: "43%" }} /></i></div></div><small>Representational uncertainty increases across the demo horizon.</small></article><article className="prediction-panel prediction-actions"><p className="prediction-label">PREDICTION ACTIONS</p><h3>Operator tools</h3><div><button onClick={() => document.querySelector(".prediction-map-panel")?.scrollIntoView({ behavior: "smooth", block: "center" })}>VIEW CURRENT TRACK</button><button onClick={() => setTarget("OCEAN CONDITIONS")}>COMPARE FORECASTS</button><button onClick={() => window.print()}>EXPORT FORECAST</button><button onClick={() => document.getElementById("tracking")?.scrollIntoView({ behavior: "smooth" })}>SEND TO MONITORING</button></div></article></section>
      </div>
    </section>
  );
}
