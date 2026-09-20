import { useEffect, useRef, useState } from "react";
import "./TrackingPage.css";

type LayerKey = "observations" | "trajectories" | "currents" | "hotspots";
type TimelineKey = "24H" | "48H" | "72H";
type TrackType = "VESSEL" | "DEBRIS";

type Track = {
  id: string;
  type: TrackType;
  status: "ACTIVE" | "DRIFTING";
  speed: string;
  heading: string;
  location: string;
  x: number;
  y: number;
  path: string;
};

type ForecastPoint = {
  position: string;
  distance: string;
  speed: string;
  uncertainty: string;
};

const tracks: Track[] = [
  { id: "VESSEL-042", type: "VESSEL", status: "ACTIVE", speed: "1.3 KT", heading: "084°", location: "13.08° N / 80.27° E", x: 44, y: 43, path: "M 235 340 C 320 290 380 315 455 245 S 590 225 700 155" },
  { id: "DEBRIS-017", type: "DEBRIS", status: "DRIFTING", speed: "0.8 KT", heading: "062°", location: "13.21° N / 80.49° E", x: 69, y: 28, path: "M 205 455 C 290 430 330 390 405 365 S 570 310 700 245" },
  { id: "DEBRIS-023", type: "DEBRIS", status: "DRIFTING", speed: "1.1 KT", heading: "112°", location: "12.96° N / 80.12° E", x: 27, y: 71, path: "M 130 430 C 235 475 320 450 400 410 S 580 415 750 365" },
];

const forecast: Record<TimelineKey, ForecastPoint> = {
  "24H": { position: "13.15° N / 80.36° E", distance: "18 km", speed: "0.75 m/s", uncertainty: "±4.2 km" },
  "48H": { position: "13.31° N / 80.61° E", distance: "31 km", speed: "0.82 m/s", uncertainty: "±7.8 km" },
  "72H": { position: "13.49° N / 80.86° E", distance: "42 km", speed: "0.81 m/s", uncertainty: "±12.6 km" },
};

const layerLabels: { key: LayerKey; label: string }[] = [
  { key: "observations", label: "Observations" },
  { key: "trajectories", label: "Trajectories" },
  { key: "currents", label: "Ocean Currents" },
  { key: "hotspots", label: "Hotspots" },
];

export default function TrackingPage() {
  const trackingRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState("VESSEL-042");
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineKey>("72H");
  const [trackFilter, setTrackFilter] = useState<"ALL" | TrackType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRIFTING">("ALL");
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(false);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ observations: true, trajectories: true, currents: true, hotspots: true });

  useEffect(() => {
    const section = trackingRef.current;
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

  const visibleTracks = tracks.filter((track) =>
    (trackFilter === "ALL" || track.type === trackFilter) &&
    (statusFilter === "ALL" || track.status === statusFilter)
  );
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  const activeForecast = forecast[selectedTimeline];
  const toggleLayer = (layer: LayerKey) => setLayers((current) => ({ ...current, [layer]: !current[layer] }));

  return (
    <section ref={trackingRef} className={`tracking-page ${isVisible ? "tracking-visible" : ""}`}>
      <div className="tracking-shell">
        <header className="tracking-header"><div><p className="tracking-kicker">04 / OCEAN TRACKING</p><h2>Ocean Tracking</h2><p className="tracking-intro">Live tracking of vessels, detected debris clusters, and ocean-current movement across monitored regions.</p></div><div className="tracking-live-state"><i /> LIVE TRACKING FEED</div></header>

        <section className="tracking-filter-bar" aria-label="Tracking filters">
          <div><span>TRACK TYPE</span><button className={trackFilter === "ALL" ? "active" : ""} onClick={() => setTrackFilter("ALL")}>ALL</button><button className={trackFilter === "VESSEL" ? "active" : ""} onClick={() => setTrackFilter("VESSEL")}>VESSELS</button><button className={trackFilter === "DEBRIS" ? "active" : ""} onClick={() => setTrackFilter("DEBRIS")}>DEBRIS</button></div>
          <div><span>STATUS</span><button className={statusFilter === "ALL" ? "active" : ""} onClick={() => setStatusFilter("ALL")}>ALL</button><button className={statusFilter === "ACTIVE" ? "active" : ""} onClick={() => setStatusFilter("ACTIVE")}>ACTIVE</button><button className={statusFilter === "DRIFTING" ? "active" : ""} onClick={() => setStatusFilter("DRIFTING")}>DRIFTING</button></div>
          <div><span>TIME WINDOW</span><button className="active">LIVE</button></div>
        </section>

        <section className="tracking-workspace">
          <div className="tracking-map-panel"><div className="tracking-map-heading"><div><p className="tracking-label">PRIMARY TRACKING MAP</p><h3>Bay of Bengal tracking grid</h3></div><span className="tracking-coordinate">13.08° N / 80.27° E</span></div>
            <div className="tracking-map-stage">
              <svg className="tracking-map" viewBox="0 0 900 560" role="img" aria-label="Simulated AquaTrace ocean tracking visualization">
                <defs><pattern id="tracking-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(98,218,218,0.12)" strokeWidth="1" /></pattern><linearGradient id="tracking-sea" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#071e2b" /><stop offset="1" stopColor="#03101a" /></linearGradient></defs>
                <g className="tracking-map-zoom" style={{ transform: `scale(${zoom})`, transformOrigin: "450px 280px" }}>
                  <rect width="900" height="560" fill="url(#tracking-sea)" /><rect width="900" height="560" fill="url(#tracking-grid)" />
                  <path className="tracking-current-band" d="M-20 180 C160 90 275 220 410 150 S700 65 930 155" /><path className="tracking-current-band secondary" d="M-20 365 C150 300 280 430 430 350 S700 290 930 390" />
                  <g className="tracking-coordinates"><text x="28" y="34">14.2° N</text><text x="28" y="530">12.4° N</text><text x="160" y="545">80.0° E</text><text x="725" y="545">82.0° E</text><text x="672" y="38">BAY OF BENGAL</text></g>
                  {layers.currents && <g className="tracking-currents"><path d="M70 170 C205 105 310 210 435 160 S700 85 850 170" /><path d="M60 285 C215 220 320 335 470 270 S700 220 860 300" /><path d="M80 430 C230 365 345 460 510 395 S720 350 850 425" /><path className="tracking-flow-arrow" d="M250 140 l18 9 -18 9 M555 133 l18 9 -18 9 M365 283 l18 9 -18 9 M660 272 l18 9 -18 9 M500 408 l18 9 -18 9" /></g>}
                  {layers.hotspots && <g className="tracking-zones"><ellipse cx="610" cy="210" rx="150" ry="86" /><ellipse className="priority-zone" cx="720" cy="390" rx="120" ry="70" /><text x="540" y="110">CURRENT ZONE</text></g>}
                  {layers.trajectories && <g className="tracking-trajectory-layer">{visibleTracks.map((track) => <path key={track.id} className={`tracking-trajectory ${track.id === selectedTrack.id ? "selected" : ""}`} d={track.path} />)}</g>}
                  {layers.observations && visibleTracks.map((track) => <g key={track.id} className={`tracking-marker ${track.id === selectedTrack.id ? "selected" : ""}`} onClick={() => setSelectedTrackId(track.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedTrackId(track.id); }}><circle className="tracking-marker-ring" cx={track.x * 9} cy={track.y * 5.6} r={track.id === selectedTrack.id ? 25 : 18} /><circle className="tracking-marker-point" cx={track.x * 9} cy={track.y * 5.6} r={track.type === "VESSEL" ? 6 : 5} /><text x={track.x * 9 + 13} y={track.y * 5.6 - 8}>{track.id}</text><text className="marker-status" x={track.x * 9 + 13} y={track.y * 5.6 + 8}>{track.status} / {track.speed}</text></g>)}
                </g>
              </svg>
              <div className="tracking-map-scan" aria-hidden="true" /><div className="tracking-map-controls"><button onClick={() => setZoom((current) => Math.min(1.35, current + 0.1))} aria-label="Zoom in">+</button><button onClick={() => setZoom((current) => Math.max(0.85, current - 0.1))} aria-label="Zoom out">-</button><button onClick={() => setZoom(1)}>RESET</button></div>
              <div className="tracking-layers"><button className="tracking-layers-toggle" onClick={() => setShowLayers((current) => !current)}>LAYERS <span>{showLayers ? "-" : "+"}</span></button>{showLayers && <div className="tracking-layer-menu">{layerLabels.map((layer) => <label key={layer.key}><input type="checkbox" checked={layers[layer.key]} onChange={() => toggleLayer(layer.key)} />{layer.label}</label>)}</div>}</div>
              <div className="tracking-legend"><strong>TRACK LEGEND</strong><span><i className="legend-current" /> Current flow</span><span><i className="legend-history" /> Historical path</span><span><i className="legend-predicted" /> Predicted path</span></div><span className="tracking-map-caption"><i /> DEMO TRACKING FEED / SIMULATED POSITION DATA</span>
            </div>
          </div>

          <aside className="tracking-telemetry-column">
            <section className="tracking-panel tracking-live-panel"><div className="tracking-panel-heading"><div><p className="tracking-label">LIVE TRACKING</p><h3>Active tracks</h3></div><span className="tracking-live-badge"><i /> LIVE</span></div><div className="tracking-stat-grid"><div><strong>12</strong><span>ACTIVE TRACKS</span></div><div><strong>4</strong><span>VESSELS</span></div><div><strong>8</strong><span>DEBRIS CLUSTERS</span></div><div><strong>86%</strong><span>COVERAGE</span></div></div></section>
            <section className="tracking-panel"><div className="tracking-panel-heading"><div><p className="tracking-label">SELECTED TRACK</p><h3>{selectedTrack.id}</h3></div><span className={`tracking-status ${selectedTrack.status.toLowerCase()}`}>{selectedTrack.status}</span></div><div className="tracking-detail-list"><div><span>SPEED</span><strong>{selectedTrack.speed}</strong></div><div><span>HEADING</span><strong>{selectedTrack.heading}</strong></div><div><span>LATITUDE / LONGITUDE</span><strong>{selectedTrack.location}</strong></div><div><span>TRACK TYPE</span><strong>{selectedTrack.type}</strong></div></div></section>
            <section className="tracking-panel"><div className="tracking-panel-heading"><div><p className="tracking-label">OCEAN CONDITIONS</p><h3>Current intelligence</h3></div><span className="tracking-updated">UPDATED LIVE</span></div><div className="tracking-condition-list"><div><span>CURRENT SPEED<strong>1.3 KT</strong></span><i><b style={{ width: "62%" }} /></i></div><div><span>CURRENT DIRECTION<strong>084°</strong></span><i><b className="orange" style={{ width: "48%" }} /></i></div><div><span>SEA TEMPERATURE<strong>28.4°C</strong></span><i><b className="blue" style={{ width: "72%" }} /></i></div><div><span>WIND<strong>13.1 KT</strong></span><i><b className="coral" style={{ width: "55%" }} /></i></div></div></section>
            <section className="tracking-panel tracking-model-panel"><div className="tracking-panel-heading"><div><p className="tracking-label">MODEL INTERPRETATION</p><h3>Track confidence</h3></div><span className="tracking-status active">STABLE</span></div><strong className="tracking-confidence">87%</strong><p>Current trajectory remains consistent with observed ocean conditions.</p><small>MODEL / AQUATRACE HYDRODYNAMIC CORE V2.4</small></section>
          </aside>
        </section>

        <section className="tracking-bottom-grid"><article className="tracking-panel"><p className="tracking-label">TRACK HISTORY</p><h3>Recent events</h3><div className="tracking-history"><div><time>14:32</time><span>VESSEL-042 position updated</span></div><div><time>14:28</time><span>Current vector recalculated</span></div><div><time>14:21</time><span>Debris cluster linked</span></div><div><time>14:14</time><span>New observation received</span></div></div></article><article className="tracking-panel"><p className="tracking-label">TRAJECTORY ANALYSIS</p><h3>Movement signal</h3><div className="tracking-analysis-metrics"><div><span>CURRENT TRACK</span><strong>1.3 KT</strong></div><div><span>EST. DRIFT</span><strong>0.8 KT</strong></div><div><span>CONFIDENCE</span><strong>87%</strong></div></div><div className="tracking-analysis-bar"><i /></div></article><article className="tracking-panel tracking-actions-panel"><p className="tracking-label">TRACKING ACTIONS</p><h3>Operator tools</h3><div><button onClick={() => document.querySelector(".tracking-map-panel")?.scrollIntoView({ behavior: "smooth", block: "center" })}>FOCUS TRACK</button><button onClick={() => setSelectedTimeline("24H")}>VIEW HISTORY</button><button onClick={() => setTrackFilter("ALL")}>COMPARE TRACKS</button><button onClick={() => window.print()}>EXPORT REPORT</button></div></article></section>
        <section className="tracking-timeline-section tracking-panel"><div className="tracking-timeline-heading"><div><p className="tracking-kicker">PREDICTIVE MOVEMENT ANALYSIS</p><h3>Probable movement trajectory</h3><p>Projected position across the simulated forecast window.</p></div><span>DEMO MODEL DATA</span></div><div className="tracking-timeline-rail"><div className="timeline-node active"><i />CURRENT</div><div className="timeline-node"><i />+24H</div><div className="timeline-node"><i />+48H</div><div className="timeline-node hotspot-node"><i />+72H / HOTSPOT</div></div><div className="tracking-timeline-tabs">{(Object.keys(forecast) as TimelineKey[]).map((key) => <button key={key} className={selectedTimeline === key ? "active" : ""} onClick={() => setSelectedTimeline(key)}>+{key.replace("H", " HOURS")}</button>)}</div><div className="tracking-timeline-data"><div><span>PREDICTED POSITION</span><strong>{activeForecast.position}</strong></div><div><span>DISTANCE TRAVELED</span><strong>{activeForecast.distance}</strong></div><div><span>MOVEMENT SPEED</span><strong>{activeForecast.speed}</strong></div><div><span>DRIFT UNCERTAINTY</span><strong>{activeForecast.uncertainty}</strong></div></div></section>
      </div>
    </section>
  );
}
