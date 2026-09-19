export type TimeRange = "LIVE" | "24H" | "48H" | "72H";

export type PredictionData = {
  score: number;
  risk: string;
  trend: string;
  description: string;
};

export type RiskZoneData = {
  title: string;
  level: string;
  score: number;
  reason: string;
  recommendation: string;
};

export const predictionData: Record<TimeRange, PredictionData> = {
  LIVE: {
    score: 64,
    risk: "MODERATE",
    trend: "Risk increasing",
    description:
      "Current ocean conditions indicate moderate maritime risk.",
  },
  "24H": {
    score: 64,
    risk: "MODERATE",
    trend: "Risk increasing",
    description:
      "AI predicts a moderate increase in maritime risk over the next 24 hours.",
  },
  "48H": {
    score: 71,
    risk: "HIGH",
    trend: "Risk elevated",
    description:
      "AI predicts elevated maritime risk based on projected ocean conditions.",
  },
  "72H": {
    score: 58,
    risk: "MODERATE",
    trend: "Risk decreasing",
    description:
      "Projected conditions indicate a gradual reduction in maritime risk.",
  },
};

export const riskZones: RiskZoneData[] = [
  {
    title: "WESTERN RISK ZONE",
    level: "MODERATE",
    score: 62,
    reason:
      "Increased wind activity and changing surface currents detected.",
    recommendation:
      "Maintain normal navigation speed and monitor changing conditions.",
  },
  {
    title: "EASTERN RISK ZONE",
    level: "HIGH",
    score: 78,
    reason:
      "Strong current movement combined with elevated wind conditions.",
    recommendation:
      "Exercise caution and consider an alternative route.",
  },
  {
    title: "NORTHERN RISK ZONE",
    level: "MODERATE",
    score: 56,
    reason:
      "Localized ocean temperature variation detected by the AI model.",
    recommendation:
      "Continue monitoring the zone during navigation.",
  },
];
