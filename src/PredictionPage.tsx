import { useState } from "react";

type PredictionTime = "NOW" | "24H" | "48H" | "72H";
type LayerKey = "observations" | "trajectories" | "currents" | "hotspots";

type Hotspot = {
  id: string;
  zone: string;
  name: string;
  probability: number;
  eta: string;
  items: number;
  priority: string;
  x: number;
  y: number;
};

const timeOptions: PredictionTime[] = ["NOW", "24H", "48H", "72H"];

const hotspots: Hotspot[] = [
  { id: "C", zone: "ZONE C", name: "Bay Convergence Zone", probability: 87, eta: "~72 HOURS", items: 17, priority: "HIGH PRIORITY", x: 73, y: 63 },
  { id: "B", zone: "ZONE B", name: "Coastal Shelf", probability: 64, eta: "~48 HOURS", items: 11, priority: "MODERATE", x: 57, y: 43 },
  { id: "A", zone: "ZONE A", name: "River Outflow", probability: 38, eta: "~24 HOURS", items: 6, priority: "LOW", x: 38, y: 31 },
];

const timeAdjustedProbability: Record<PredictionTime, number[]> = {
  NOW: [87, 64, 38],
  "24H": [89, 68, 42],
  "48H": [92, 73, 46],
  "72H": [95, 78, 51],
};

const layerLabels: { key: LayerKey; label: string }[] = [
  { key: "observations", label: "Observations" },
  { key: "trajectories", label: "Trajectories" },
  { key: "currents", label: "Ocean Currents" },
  { key: "hotspots", label: "Hotspots" },
];

export default function PredictionPage() {
  const [selectedTime, setSelectedTime] = useState<PredictionTime>("NOW");
  const [selectedHotspotId, setSelectedHotspotId] = useState("C");
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    observations: true,
    trajectories: true,
    currents: true,
    hotspots: true,
  });

  const selectedIndex = hotspots.findIndex((hotspot) => hotspot.id === selectedHotspotId);
  const selectedHotspot = hotspots[selectedIndex] ?? hotspots[0];
  const selectedProbability = timeAdjustedProbability[selectedTime][selectedIndex < 0 ? 0 : selectedIndex];

  const toggleLayer = (layer: LayerKey) => {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  };

  return (
    <div className="prediction-page">
      <div className="prediction-shell">
        <header className="prediction-header">
          <div>
            <p className="prediction-kicker">04 / HOTSPOT PREDICTION</p>
            <h2>Predict Hotspots</h2>
            <p className="prediction-intro">
              Identify where marine plastic could accumulate next using observed debris,
              ocean currents, wind conditions, and predicted movement.
            </p>
          </div>
          <div className="prediction-stage"><span /> STAGE 4: PREDICT</div>
        </header>

        <div className="prediction-time-selector" role="tablist" aria-label="Prediction time">
          {timeOptions.map((time) => (
            <button key={time} className={selectedTime === time ? "active" : ""} onClick={() => setSelectedTime(time)}>
              {time === "NOW" ? "NOW" : `+${time} HOURS`}
            </button>
          ))}
        </div>

        <section className="prediction-workspace">
          <div className="prediction-map-panel">
            <div className="prediction-map-heading">
              <div><p className="prediction-label">ACCUMULATION MODEL / SIMULATED DATA</p><h3>Bay of Bengal prediction field</h3></div>
              <span className="prediction-map-status"><i /> DEMO PROJECTION</span>
            </div>
            <div className="prediction-map-stage">
              <svg className="prediction-map" viewBox="0 0 900 560" role="img" aria-label="Simulated hotspot prediction map">
                <defs>
                  <pattern id="prediction-grid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="rgba(103,228,223,.14)" /></pattern>
                  <linearGradient id="prediction-sea" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#061d2b" /><stop offset="1" stopColor="#03101d" /></linearGradient>
                  <filter id="prediction-glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <g className="prediction-map-zoom" style={{ transform: `scale(${zoom})`, transformOrigin: "450px 280px" }}>
                  <rect width="900" height="560" fill="url(#prediction-sea)" /><rect width="900" height="560" fill="url(#prediction-grid)" />
                  <path className="prediction-land" d="M0 92C130 110 178 52 270 100S420 168 500 115 670 55 900 112V0H0Z" /><path className="prediction-land" d="M900 402C780 360 730 420 640 392S470 360 390 430 200 520 0 445V560H900Z" />
                  <g className="prediction-coastline"><path d="M104 0C128 105 175 152 238 190S326 264 368 322" /><path d="M790 0C728 120 716 180 748 242S775 390 712 560" /></g>
                  <g className="prediction-coordinates"><text x="28" y="34">14.2° N</text><text x="28" y="530">12.4° N</text><text x="160" y="545">80.0° E</text><text x="725" y="545">82.0° E</text><text x="660" y="38">BAY OF BENGAL</text></g>
                  {layers.currents && <g className="prediction-currents"><path d="M108 220C260 165 346 212 470 180S680 125 830 178" /><path d="M110 330C260 268 350 335 475 290S696 244 830 300" /><path className="prediction-arrow" d="M270 182l18 9-18 9M548 166l18 9-18 9M390 305l18 9-18 9M680 278l18 9-18 9" /></g>}
                  {layers.trajectories && <g className="prediction-trajectory-layer"><path className="prediction-trajectory" d="M224 340C320 306 380 278 470 282S600 322 730 354" /><circle className="prediction-point" cx="365" cy="294" r="6" /><circle className="prediction-point" cx="505" cy="292" r="6" /><circle className="prediction-point" cx="622" cy="324" r="6" /><text x="341" y="276">+24H / 18 KM</text><text x="478" y="270">+48H / 31 KM</text><text x="590" y="306">+72H / 42 KM</text></g>}
                  {layers.observations && <g className="prediction-observation" filter="url(#prediction-glow)"><circle className="prediction-observation-ring" cx="224" cy="340" r="19" /><circle className="prediction-observation-point" cx="224" cy="340" r="6" /><text x="176" y="380">CURRENT OBSERVATION</text><text x="178" y="394">13.0827° N / 80.2707° E</text></g>}
                  {layers.hotspots && hotspots.map((hotspot, index) => { const active = hotspot.id === selectedHotspotId; const probability = timeAdjustedProbability[selectedTime][index]; return <g key={hotspot.id} className={`prediction-hotspot ${active ? "selected" : ""}`} filter="url(#prediction-glow)" onClick={() => setSelectedHotspotId(hotspot.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedHotspotId(hotspot.id); }}><ellipse cx={hotspot.x * 9} cy={hotspot.y * 5.6} rx={active ? 66 : 48} ry={active ? 42 : 32} /><circle cx={hotspot.x * 9} cy={hotspot.y * 5.6} r={active ? 9 : 7} /><text x={hotspot.x * 9 - 25} y={hotspot.y * 5.6 - 28}>{hotspot.zone}</text><text x={hotspot.x * 9 - 20} y={hotspot.y * 5.6 + 27}>{probability}% / {hotspot.eta}</text></g>; })}
                  <g className="prediction-priority-zone"><ellipse cx="650" cy="370" rx="140" ry="88" /><text x="615" y="475">HIGH PRIORITY</text></g>
                </g>
              </svg>
              <div className="prediction-map-controls"><button onClick={() => setZoom((value) => Math.min(1.35, value + .1))} aria-label="Zoom in">+</button><button onClick={() => setZoom((value) => Math.max(.85, value - .1))} aria-label="Zoom out">−</button><button onClick={() => setZoom(1)}>RESET</button></div>
              <div className="prediction-layers"><button onClick={() => setShowLayers((value) => !value)}>TELEMETRY LAYERS <span>{showLayers ? "−" : "+"}</span></button>{showLayers && <div>{layerLabels.map((layer) => <label key={layer.key}><input type="checkbox" checked={layers[layer.key]} onChange={() => toggleLayer(layer.key)} />{layer.label}</label>)}</div>}</div>
              <div className="prediction-legend"><strong>MAP LEGEND</strong><span><i className="prediction-legend-observation" /> Observation</span><span><i className="prediction-legend-trajectory" /> Movement trajectory</span><span><i className="prediction-legend-hotspot" /> Predicted hotspot</span><span><i className="prediction-legend-priority" /> High-priority zone</span></div>
            </div>
          </div>

          <aside className="prediction-details-panel">
            <div className="prediction-details-heading"><div><p className="prediction-label">SELECTED ACCUMULATION ZONE</p><h3>PREDICTED HOTSPOT</h3></div><span className="prediction-demo-badge">DEMO</span></div>
            <div className="prediction-zone-title"><span>{selectedHotspot.zone}</span><h4>{selectedHotspot.name}</h4></div>
            <div className="prediction-stat-list"><div><span>ACCUMULATION PROBABILITY</span><strong>{selectedProbability}%</strong></div><div><span>ESTIMATED TIME</span><strong>{selectedHotspot.eta}</strong></div><div><span>CURRENT PLASTIC DENSITY</span><strong className="prediction-warning">HIGH</strong></div><div><span>PREDICTION CONFIDENCE</span><strong>91%</strong></div></div>
            <div className="prediction-factors"><p className="prediction-label">PRIMARY FACTORS</p><div><span>OCEAN CURRENT</span><strong>1.8 m/s</strong><small>NE</small></div><div><span>SURFACE WIND</span><strong>18 km/h</strong><small>ENE</small></div><div><span>EXISTING PLASTIC CONCENTRATION</span><strong className="prediction-warning">HIGH</strong></div></div>
            <div className="prediction-notice"><p className="prediction-label">FORECAST NOTICE</p><p>This hotspot represents a probabilistic projection based on observed debris distribution, hydrodynamic conditions, surface wind, and predicted movement. Actual accumulation may vary as environmental conditions change.</p></div>
          </aside>
        </section>

        <section className="prediction-scale"><div><p className="prediction-label">REFERENCE SCALE</p><h3>ACCUMULATION PROBABILITY INTENSITY</h3></div><div className="prediction-scale-bar"><span className="scale-low" /><span className="scale-moderate" /><span className="scale-high" /></div><div className="prediction-scale-labels"><span>LOW<strong>0–35%</strong></span><span>MODERATE<strong>36–70%</strong></span><span>HIGH<strong>71–100%</strong></span></div></section>

        <section className="prediction-dispatch"><div className="prediction-dispatch-heading"><div><p className="prediction-kicker">OPERATIONAL PRIORITY</p><h3>OPERATIONAL DISPATCH ADVISORY</h3><p>Predicted accumulation zones requiring monitoring or operational attention.</p></div><span>SIMULATED PROJECTION</span></div><div className="prediction-dispatch-grid">{hotspots.map((hotspot, index) => <article key={hotspot.id} className={`prediction-dispatch-card ${index === 0 ? "high" : index === 1 ? "moderate" : "low"}`} onClick={() => setSelectedHotspotId(hotspot.id)}><div><span>{hotspot.priority}</span><strong>{hotspot.probability}%</strong></div><h4>{hotspot.zone}</h4><h5>{hotspot.name}</h5><p>{index === 0 ? "High predicted accumulation probability with converging surface currents." : index === 1 ? "Moderate accumulation probability along projected debris trajectory." : "Lower predicted concentration under current conditions."}</p><dl><dt>{index === 2 ? "ARRIVAL" : "EXPECTED ARRIVAL"}</dt><dd>{index === 2 ? "LOW / UNCERTAIN" : hotspot.eta}</dd><dt>RECOMMENDED ACTION</dt><dd>{index === 0 ? "Prepare targeted monitoring" : index === 1 ? "Increase observation frequency" : "Continue passive monitoring"}</dd></dl></article>)}</div></section>
      </div>
    </div>
  );
}
