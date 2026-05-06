export type Urgency = "high" | "medium" | "low";
export type TimelineType = "work" | "errand" | "meeting" | "academic" | "personal";
export type InsightType = "prep" | "risk";
export type DominantPressure = "deadline" | "social" | "errand" | "academic" | "work" | "mixed";
export type CalendarEventSource = "compiled_plan" | "ai_calendar_event";

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
  duration: string;
}

export interface CompiledCalendarEvent {
  date: string;
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
  calendar_events: CompiledCalendarEvent[];
  replies: ReplyDraft[];
  insights: Insight[];
  debug: DebugInfo;
}

export interface SavedPlan {
  id: string;
  client_id: string;
  raw_input: string;
  planning_date: string;
  compiled_plan: CompiledPlan;
  created_at: string;
}

export interface PlanSummary {
  id: string;
  headline: string;
  focus: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  client_id: string;
  plan_id: string;
  date: string;
  time: string;
  title: string;
  type: TimelineType;
  source: CalendarEventSource;
  created_at: string;
}
