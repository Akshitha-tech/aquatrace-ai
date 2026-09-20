import { useState } from "react";

type LayerKey = "observations" | "trajectories" | "currents" | "hotspots";
type TimelineKey = "24H" | "48H" | "72H";

type Target = {
  name: string;
  region: string;
  observation: string;
};

type ForecastPoint = {
  position: string;
  distance: string;
  speed: string;
  uncertainty: string;
};

const targets: Target[] = [
  {
    name: "Bay of Bengal Debris Slick",
    region: "Bay of Bengal convergence zone",
    observation: "13.0827° N / 80.2707° E",
  },
  {
    name: "Coromandel Coastal Shelf",
    region: "Coromandel coastal shelf",
    observation: "13.2150° N / 80.4920° E",
  },
  {
    name: "River Outflow Plume",
    region: "Northern river outflow plume",
    observation: "13.4100° N / 80.8210° E",
  },
  {
    name: "Autonomous Surface Vessel Detection",
    region: "Surface observation corridor",
    observation: "12.9640° N / 80.1160° E",
  },
];

const forecast: Record<TimelineKey, ForecastPoint> = {
  "24H": {
    position: "13.215° N / 80.492° E",
    distance: "18 km",
    speed: "0.75 m/s",
    uncertainty: "±4.2 km",
  },
  "48H": {
    position: "13.410° N / 80.821° E",
    distance: "31 km",
    speed: "0.82 m/s",
    uncertainty: "±7.8 km",
  },
  "72H": {
    position: "13.690° N / 81.210° E",
    distance: "42 km",
    speed: "0.81 m/s",
    uncertainty: "±12.6 km",
  },
};

const layerLabels: { key: LayerKey; label: string }[] = [
  { key: "observations", label: "Observations" },
  { key: "trajectories", label: "Trajectories" },
  { key: "currents", label: "Ocean Currents" },
  { key: "hotspots", label: "Hotspots" },
];

export default function TrackingPage() {
  const [selectedTarget, setSelectedTarget] = useState(targets[0].name);
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineKey>("72H");
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    observations: true,
    trajectories: true,
    currents: true,
    hotspots: true,
  });

  const activeTarget = targets.find((target) => target.name === selectedTarget) ?? targets[0];
  const activeForecast = forecast[selectedTimeline];

  const toggleLayer = (layer: LayerKey) => {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  };

  return (
    <div className="tracking-page">
      <div className="tracking-shell">
        <header className="tracking-header">
          <div>
            <p className="tracking-kicker">02 / MOVEMENT TRACKING</p>
            <h2>Track Movement</h2>
            <p className="tracking-intro">
              Monitor detected marine debris, understand environmental drivers,
              and visualize its predicted movement over time.
            </p>
          </div>
          <label className="tracking-target-control">
            <span>TRACKING TARGET</span>
            <select
              value={selectedTarget}
              onChange={(event) => setSelectedTarget(event.target.value)}
            >
              {targets.map((target) => (
                <option key={target.name} value={target.name}>
                  {target.name}
                </option>
              ))}
            </select>
            <small>{activeTarget.region} / DEMO TELEMETRY</small>
          </label>
        </header>

        <section className="tracking-workspace">
          <div className="tracking-map-panel">
            <div className="tracking-map-heading">
              <div>
                <p className="tracking-label">PRIMARY TRACKING MAP</p>
                <h3>{activeTarget.name}</h3>
              </div>
              <span className="tracking-map-status"><i /> SIMULATED OBSERVATION</span>
            </div>

            <div className="tracking-map-stage">
              <svg
                className="tracking-map"
                viewBox="0 0 900 560"
                role="img"
                aria-label="Simulated marine debris movement map"
              >
                <defs>
                  <pattern id="tracking-grid" width="54" height="54" patternUnits="userSpaceOnUse">
                    <path d="M 54 0 L 0 0 0 54" fill="none" stroke="rgba(98,218,218,0.14)" strokeWidth="1" />
                  </pattern>
                  <filter id="tracking-glow">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <linearGradient id="tracking-sea" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#061d2b" />
                    <stop offset="1" stopColor="#03101d" />
                  </linearGradient>
                </defs>
                <g className="tracking-map-zoom" style={{ transform: `scale(${zoom})`, transformOrigin: "450px 280px" }}>
                  <rect width="900" height="560" fill="url(#tracking-sea)" />
                  <rect width="900" height="560" fill="url(#tracking-grid)" />
                  <path className="tracking-land" d="M0 90 C130 108 175 55 270 100 S420 170 500 115 S670 55 900 112 L900 0 L0 0Z" />
                  <path className="tracking-land" d="M900 402 C780 360 730 420 640 392 S470 360 390 430 S200 520 0 445 L0 560 L900 560Z" />
                  <g className="tracking-coastline">
                    <path d="M104 0 C128 105 175 152 238 190 S326 264 368 322" />
                    <path d="M790 0 C728 120 716 180 748 242 S775 390 712 560" />
                  </g>
                  <g className="tracking-coordinates">
                    <text x="28" y="34">14.2° N</text><text x="28" y="530">12.4° N</text>
                    <text x="160" y="545">80.0° E</text><text x="725" y="545">82.0° E</text>
                    <text x="677" y="38">BAY OF BENGAL</text>
                  </g>

                  {layers.currents && (
                    <g className="tracking-currents">
                      <path d="M120 210 C260 160 330 208 455 184 S680 120 820 178" />
                      <path d="M115 300 C235 260 330 330 466 284 S690 235 828 290" />
                      <path d="M180 410 C305 350 390 426 525 386 S710 355 812 414" />
                      <path className="current-arrow" d="M290 175 l18 9 -18 9 M540 164 l18 9 -18 9 M354 304 l18 9 -18 9 M640 278 l18 9 -18 9 M470 400 l18 9 -18 9" />
                    </g>
                  )}

                  <g className="tracking-zones">
                    <ellipse cx="310" cy="254" rx="142" ry="78" />
                    <ellipse cx="595" cy="246" rx="112" ry="68" />
                    <ellipse className="priority-zone" cx="684" cy="368" rx="120" ry="74" />
                  </g>

                  {layers.trajectories && (
                    <g className="tracking-trajectory-layer">
                      <path className="tracking-trajectory" d="M234 335 C330 300 374 276 452 278 S585 306 684 368" />
                      <circle className="trajectory-point" cx="358" cy="294" r="6" />
                      <circle className="trajectory-point" cx="478" cy="280" r="6" />
                      <circle className="trajectory-point" cx="578" cy="315" r="6" />
                      <text className="trajectory-label" x="330" y="278">+24H</text>
                      <text className="trajectory-label" x="458" y="262">+48H</text>
                      <text className="trajectory-label" x="560" y="300">+72H</text>
                    </g>
                  )}

                  {layers.observations && (
                    <g className="tracking-observation" filter="url(#tracking-glow)">
                      <circle className="observation-ring" cx="234" cy="335" r="19" />
                      <circle className="observation-point" cx="234" cy="335" r="6" />
                      <text x="202" y="373">CURRENT OBSERVATION</text>
                      <text x="204" y="387">13.0827° N / 80.2707° E</text>
                    </g>
                  )}

                  {layers.hotspots && (
                    <g className="tracking-hotspot" filter="url(#tracking-glow)">
                      <circle className="hotspot-halo" cx="684" cy="368" r="35" />
                      <circle className="hotspot-point" cx="684" cy="368" r="9" />
                      <text x="642" y="420">PREDICTED HOTSPOT</text>
                      <text x="660" y="434">HIGH PRIORITY</text>
                    </g>
                  )}
                </g>
              </svg>

              <div className="tracking-map-controls" aria-label="Map controls">
                <button onClick={() => setZoom((current) => Math.min(1.35, current + 0.1))} aria-label="Zoom in">+</button>
                <button onClick={() => setZoom((current) => Math.max(0.85, current - 0.1))} aria-label="Zoom out">−</button>
                <button onClick={() => setZoom(1)}>RESET</button>
              </div>

              <div className="tracking-layers">
                <button className="tracking-layers-toggle" onClick={() => setShowLayers((current) => !current)}>
                  LAYERS <span>{showLayers ? "−" : "+"}</span>
                </button>
                {showLayers && (
                  <div className="tracking-layer-menu">
                    {layerLabels.map((layer) => (
                      <label key={layer.key}>
                        <input
                          type="checkbox"
                          checked={layers[layer.key]}
                          onChange={() => toggleLayer(layer.key)}
                        />
                        {layer.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="tracking-legend">
                <strong>MAP LEGEND</strong>
                <span><i className="legend-observation" /> Observation</span>
                <span><i className="legend-trajectory" /> Movement trajectory</span>
                <span><i className="legend-hotspot" /> Predicted hotspot</span>
                <span><i className="legend-priority" /> High-priority zone</span>
              </div>
            </div>
          </div>

          <aside className="tracking-forecast-panel">
            <div className="tracking-panel-heading">
              <div>
                <p className="tracking-label">DECISION SUPPORT</p>
                <h3>MOVEMENT FORECAST</h3>
                <p>Environmental telemetry and predicted debris drift</p>
              </div>
              <span className="tracking-demo-badge">DEMO</span>
            </div>

            <div className="tracking-telemetry-grid">
              <div className="tracking-telemetry-card tracking-location-card">
                <span>OBSERVATION LOCATION</span>
                <strong>13.0827° N</strong>
                <strong>80.2707° E</strong>
                <small>Current debris observation</small>
              </div>
              <div className="tracking-telemetry-card">
                <span>CURRENT DIRECTION</span>
                <strong className="tracking-large-value">NE</strong>
                <small>54° heading</small>
              </div>
              <div className="tracking-telemetry-card">
                <span>OCEAN CURRENT</span>
                <strong>1.8 m/s</strong>
                <small>NE · surface current</small>
              </div>
              <div className="tracking-telemetry-card">
                <span>SURFACE WIND</span>
                <strong>18 km/h</strong>
                <small>ENE · surface wind</small>
              </div>
              <div className="tracking-telemetry-card">
                <span>ESTIMATED MOVEMENT</span>
                <strong>42 km/day</strong>
                <small>Predicted average drift</small>
              </div>
              <div className="tracking-telemetry-card tracking-confidence-card">
                <span>FORECAST CONFIDENCE</span>
                <strong>91%</strong>
                <div className="tracking-confidence-bar"><i /></div>
                <small className="tracking-good">HIGH CONFIDENCE</small>
              </div>
            </div>

            <div className="tracking-destination-card">
              <p className="tracking-label">PREDICTED DESTINATION</p>
              <h4>Bay of Bengal Convergence Zone</h4>
              <p>Projected debris concentration based on current hydrodynamic and environmental conditions.</p>
              <div><span>ETA <strong>~72 HOURS</strong></span><span>EXPECTED CONCENTRATION <strong className="tracking-warning">HIGH</strong></span></div>
              <button onClick={() => setSelectedTimeline("72H")}>INSPECT HOTSPOT PREDICTION →</button>
            </div>
          </aside>
        </section>

        <section className="tracking-notice">
          <div><p className="tracking-label">SCIENTIFIC MODELING NOTICE</p><p>This trajectory represents a probabilistic projection based on observed environmental and hydrodynamic conditions. Actual debris movement may vary as ocean currents, wind, and other environmental conditions change.</p></div>
          <span>DEMO TELEMETRY / NOT A GUARANTEED PATH</span>
        </section>

        <section className="tracking-timeline-section">
          <div className="tracking-timeline-heading">
            <div><p className="tracking-kicker">FORECAST WINDOW</p><h3>PROBABLE MOVEMENT TRAJECTORY</h3><p>Projected debris position across the forecast window.</p></div>
            <span>SIMULATED PROJECTION</span>
          </div>
          <div className="tracking-timeline-rail" aria-hidden="true">
            <div className="timeline-node active"><i />CURRENT</div>
            <div className="timeline-node"><i />+24H</div>
            <div className="timeline-node"><i />+48H</div>
            <div className="timeline-node"><i />+72H</div>
            <div className="timeline-node hotspot-node"><i />PREDICTED HOTSPOT</div>
          </div>
          <div className="tracking-timeline-tabs">
            {(Object.keys(forecast) as TimelineKey[]).map((key) => (
              <button key={key} className={selectedTimeline === key ? "active" : ""} onClick={() => setSelectedTimeline(key)}>
                +{key.replace("H", " HOURS")}
              </button>
            ))}
          </div>
          <div className="tracking-timeline-data">
            <div><span>PREDICTED POSITION</span><strong>{activeForecast.position}</strong></div>
            <div><span>DISTANCE TRAVELED</span><strong>{activeForecast.distance}</strong></div>
            <div><span>MOVEMENT SPEED</span><strong>{activeForecast.speed}</strong></div>
            <div><span>DRIFT UNCERTAINTY</span><strong>{activeForecast.uncertainty}</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
}
