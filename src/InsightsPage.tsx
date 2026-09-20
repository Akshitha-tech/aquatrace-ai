import type { PredictionData, RiskZoneData, TimeRange } from "./oceanData";

type InsightsPageProps = {
  liveTemp: number;
  liveWind: number;
  liveCurrent: number;
  prediction: PredictionData;
  predictionData: Record<TimeRange, PredictionData>;
  riskZones: RiskZoneData[];
};

type TrendPoint = { period: string; detections: number };

const detectionTrend: TrendPoint[] = [
  { period: "DAY 1", detections: 42 },
  { period: "DAY 2", detections: 57 },
  { period: "DAY 3", detections: 51 },
  { period: "DAY 4", detections: 73 },
  { period: "DAY 5", detections: 81 },
  { period: "DAY 6", detections: 76 },
  { period: "DAY 7", detections: 94 },
];

const hotspotTrend = [
  { period: "+24H", probability: 48 },
  { period: "+48H", probability: 67 },
  { period: "+72H", probability: 87 },
];

const classifications = [
  { name: "PET bottles & drinkware", value: 41 },
  { name: "Polyethylene fragments", value: 29 },
  { name: "Ghost fishing nets & monofilaments", value: 14 },
  { name: "Expanded polystyrene", value: 9 },
  { name: "Rigid crates & caps", value: 7 },
];

function chartPoints(values: number[], width: number, height: number, max: number) {
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function downloadBriefing({
  liveTemp,
  liveWind,
  liveCurrent,
  prediction,
}: InsightsPageProps) {
  const content = [
    "AQUATRACE AI",
    "MARINE PLASTIC INTELLIGENCE & ANALYTICS",
    "",
    "SUMMARY METRICS",
    "Total observations: 1,284",
    "Total detected objects: 3,742",
    "High-density zones: 8",
    "Predicted hotspots: 12",
    "",
    "ENVIRONMENTAL FACTORS",
    `Ocean current: ${liveCurrent.toFixed(1)} m/s NE / 42 km/day`,
    `Wind: ${liveWind.toFixed(1)} km/h ENE / 27 km/h gusts`,
    "Wave conditions: 1.4 m / 7.2 s / ENE",
    `Surface temperature: ${liveTemp.toFixed(1)} C / +0.6 C anomaly / Stable`,
    "",
    "DEBRIS CLASSIFICATION",
    ...classifications.map((item) => `${item.name}: ${item.value}%`),
    "",
    "PREDICTION SUMMARY (DEMO DATA)",
    `Current prediction: ${prediction.risk} / score ${prediction.score}`,
    "Peak predicted hotspot: Bay Convergence Zone",
    "Peak probability: 87% at +72 hours",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "aquatrace-intel-briefing.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export default function InsightsPage(props: InsightsPageProps) {
  const { liveTemp, liveWind, liveCurrent, prediction, predictionData, riskZones } = props;
  const detectionValues = detectionTrend.map((point) => point.detections);
  const hotspotValues = hotspotTrend.map((point) => point.probability);
  const maxDetection = Math.max(...detectionValues);
  const averageDetection = Math.round(detectionValues.reduce((sum, value) => sum + value, 0) / detectionValues.length);
  const highDensityZones = riskZones.filter((zone) => zone.level === "HIGH").length + 7;
  const forecastScore = predictionData["72H"].score;

  return (
    <div className="insights-page">
      <div className="insights-shell">
        <header className="insights-header">
          <div>
            <p className="insights-kicker">INSIGHTS</p>
            <h2>Marine Plastic Intelligence &amp; Analytics</h2>
            <p className="insights-intro">
              A consolidated view of debris observations, detection activity,
              environmental conditions, and predicted hotspot information.
            </p>
          </div>
          <button className="insights-export-button" onClick={() => downloadBriefing(props)}>
            EXPORT INTEL BRIEFING <span>↓</span>
          </button>
        </header>

        <section className="insights-kpi-grid" aria-label="Summary metrics">
          <article><span>TOTAL OBSERVATIONS</span><strong>1,284</strong><p>Across monitored ocean regions</p></article>
          <article><span>TOTAL DETECTED OBJECTS</span><strong>3,742</strong><p>91% average confidence</p></article>
          <article><span>HIGH-DENSITY ZONES</span><strong>{highDensityZones}</strong><p>Density threshold &gt; 70%</p></article>
          <article><span>PREDICTED HOTSPOTS</span><strong>12</strong><p>Forecast horizon: 72 hours</p></article>
        </section>

        <section className="insights-section">
          <div className="insights-section-heading"><div><p className="insights-kicker">DEMO ANALYTICS / HISTORICAL WINDOW</p><h3>TREND ANALYSIS</h3></div><span>SIMULATED SERIES</span></div>
          <div className="insights-chart-grid">
            <article className="insights-chart-card">
              <div className="insights-card-heading"><div><span>ACTIVITY SIGNAL</span><h4>Plastic Detection Trend</h4></div><strong>+{detectionValues[detectionValues.length - 1] - detectionValues[0]} OBJECTS</strong></div>
              <svg className="insights-chart" viewBox="0 0 700 260" role="img" aria-label="Plastic detection trend chart"><g className="insights-chart-gridlines"><path d="M0 0H700M0 65H700M0 130H700M0 195H700M0 260H700" /></g><polyline points={chartPoints(detectionValues, 700, 220, 100)} /><g className="insights-chart-points">{detectionValues.map((value, index) => <circle key={detectionTrend[index].period} cx={(index / 6) * 700} cy={220 - (value / 100) * 220} r="5" />)}</g></svg>
              <div className="insights-axis-labels">{detectionTrend.map((point) => <span key={point.period}>{point.period}</span>)}</div>
              <p className="insights-chart-summary">Detection activity increased across the selected period. Average activity: {averageDetection} objects per day; peak: {maxDetection}.</p>
            </article>
            <article className="insights-chart-card">
              <div className="insights-card-heading"><div><span>FORECAST SIGNAL</span><h4>Predicted Hotspot Trend</h4></div><strong>PEAK {Math.max(...hotspotValues)}% / NOW {prediction.score}</strong></div>
              <svg className="insights-chart hotspot-chart" viewBox="0 0 700 260" role="img" aria-label="Predicted hotspot probability chart"><g className="insights-chart-gridlines"><path d="M0 0H700M0 65H700M0 130H700M0 195H700M0 260H700" /></g><polyline points={chartPoints(hotspotValues, 700, 220, 100)} /><g className="insights-chart-points">{hotspotValues.map((value, index) => <circle key={hotspotTrend[index].period} cx={(index / 2) * 700} cy={220 - (value / 100) * 220} r="6" />)}</g></svg>
              <div className="insights-axis-labels">{hotspotTrend.map((point) => <span key={point.period}>{point.period} / {point.probability}%</span>)}</div>
              <p className="insights-chart-summary">Peak convergence: +72 hours. Projection uses the existing demo prediction horizon.</p>
            </article>
          </div>
        </section>

        <section className="insights-section">
          <div className="insights-section-heading"><div><p className="insights-kicker">LIVE TELEMETRY / DEMO READOUT</p><h3>ENVIRONMENTAL FACTORS</h3></div><span>APP STATE VALUES</span></div>
          <div className="insights-factor-grid">
            <article><span>OCEAN CURRENT</span><strong>{liveCurrent.toFixed(1)} m/s</strong><b>NE</b><small>42 km/day drift rate</small></article>
            <article><span>WIND</span><strong>{liveWind.toFixed(1)} km/h</strong><b>ENE</b><small>27 km/h gusts</small></article>
            <article><span>WAVE CONDITIONS</span><strong>1.4 m</strong><b>ENE</b><small>7.2 s wave period</small></article>
            <article><span>SURFACE TEMPERATURE</span><strong>{liveTemp.toFixed(1)} °C</strong><b>+0.6 °C</b><small>Stable environmental status</small></article>
          </div>
        </section>

        <section className="insights-classification insights-section">
          <div className="insights-section-heading"><div><p className="insights-kicker">DETECTION COMPOSITION / DEMO DATA</p><h3>DEBRIS POLYMER &amp; OBJECT CLASSIFICATION</h3></div><span>100% COMPOSITION</span></div>
          <div className="insights-classification-list">{classifications.map((item) => <div key={item.name}><span>{item.name}</span><div><i style={{ width: `${item.value}%` }} /></div><strong>{item.value}%</strong></div>)}</div>
        </section>

        <section className="insights-section insights-dispatch">
          <div className="insights-section-heading"><div><p className="insights-kicker">OPERATIONAL VIEW</p><h3>OPERATIONAL DISPATCH ADVISORY</h3><p>Predicted accumulation zones requiring monitoring or operational attention.</p></div><span>DEMO PROJECTION</span></div>
          <div className="insights-dispatch-grid">{riskZones.map((zone) => <article key={zone.title}><div><span>{zone.level}</span><strong>{zone.score}%</strong></div><h4>{zone.title}</h4><p>{zone.reason}</p><small>RECOMMENDED ACTION</small><b>{zone.recommendation}</b></article>)}</div>
        </section>

        <div className="insights-data-note">Insights values are application/demo data unless explicitly marked as live App telemetry. They do not represent a connected NASA API or production inference service.</div>
        <span className="insights-hidden-value">72H MODEL SCORE {forecastScore}</span>
      </div>
    </div>
  );
}
