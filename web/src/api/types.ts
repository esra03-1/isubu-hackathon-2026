export type Urgency = "high" | "medium" | "low";
export type TimelineType = "work" | "errand" | "meeting" | "academic" | "personal";
export type InsightType = "prep" | "risk";
export type DominantPressure = "deadline" | "social" | "errand" | "academic" | "work" | "mixed";

export interface CompileRequest {
  raw_input: string;
}

export interface Summary {
  headline: string;
  estimated_saved_minutes: number;
  dominant_pressure: DominantPressure;
}

export interface FocusAction {
  id: string;
  title: string;
  reason: string;
  duration: string;
  urgency: Urgency;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  type: TimelineType;
}

export interface ReplyDraft {
  id: string;
  recipient: string;
  context: string;
  draft: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  message: string;
  severity: Urgency;
}

export interface DebugInfo {
  model: string;
  raw_model_output: string;
  fallback_used: boolean;
  warnings: string[];
}

export interface CompiledPlan {
  summary: Summary;
  focus: FocusAction;
  timeline: TimelineItem[];
  replies: ReplyDraft[];
  insights: Insight[];
  debug: DebugInfo;
}
