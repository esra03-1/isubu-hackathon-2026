package services

import (
	"fmt"
	"strings"
	"time"

	"onenext/backend/internal/models"
)

type PromptContext struct {
	RealCurrentDate    string
	RealCurrentWeekday string
	PlanningDate       string
	PlanningWeekday    string
	Timezone           string
	RelativeDateHints  []RelativeDateHint
	CalendarEvents     []CalendarEventPromptContext
}

type RelativeDateHint struct {
	Label   string
	Date    string
	Weekday string
}

type CalendarEventPromptContext struct {
	Date  string
	Time  string
	Title string
	Type  string
}

func BuildPrompt(rawInput string) string {
	return BuildPromptWithContext(rawInput, PromptContext{})
}

func BuildPromptWithContext(rawInput string, promptContext PromptContext) string {
	contextBlock := formatPromptContext(promptContext)

	return `You are OneNext, an AI-assisted daily planning system.
Your job is to read the user's scattered notes, messages, reminders, and deadlines, and compile them into a structured JSON plan.

Requirements:
- Accept Turkish, English, or mixed input.
- Return ONLY valid JSON, adhering exactly to the structure requested.
- No markdown, no comments, no conversational text.
- Produce Turkish UI-facing text.
- Infer realistic times only when needed.
- Prefer the most concrete urgent action as focus.
- Create a timeline from known times first, then inferred order.
- Space demanding tasks realistically and be mindful of short breaks, meals, and context-switching so the day plan does not become an uninterrupted wall of tasks.
- Put the planning date's executable plan in timeline.
- Put future or explicitly dated obligations in calendar_events.
- Do not include ids inside calendar_events; the backend generates those ids.
- Use the provided planning date, real current date, and internal calendar context when resolving relative dates or scheduling around known OneNext events.
- Draft short, natural Turkish replies if the input implies a message needs a response.
- Flag missing information or deadline risks in insights.
- Never invent important facts not present in input.
- Use debug.warnings when assumptions are made.

EXPECTED JSON SCHEMA:
{
  "summary": {
    "headline": "string",
    "estimated_saved_minutes": 45,
    "dominant_pressure": "deadline|social|errand|academic|work|mixed"
  },
  "focus": {
    "id": "string",
    "title": "string",
    "reason": "string",
    "duration": "string",
    "urgency": "high|medium|low"
  },
  "timeline": [
    {
      "id": "string",
      "time": "HH:MM",
      "title": "string",
      "type": "work|errand|meeting|academic|personal",
      "duration": "string"
    }
  ],
  "calendar_events": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "title": "string",
      "type": "work|errand|meeting|academic|personal"
    }
  ],
  "replies": [
    {
      "id": "string",
      "recipient": "string",
      "context": "string",
      "draft": "string"
    }
  ],
  "insights": [
    {
      "id": "string",
      "type": "prep|risk",
      "message": "string",
      "severity": "high|medium|low"
    }
  ],
  "debug": {
    "warnings": ["string"]
  }
}

` + contextBlock + `

Here is the daily input:
` + rawInput
}

func BuildPromptContext(now time.Time, planningDate string, timezone string, events []models.CalendarEvent) PromptContext {
	weekdayNames := map[time.Weekday]string{
		time.Sunday:    "Sunday",
		time.Monday:    "Monday",
		time.Tuesday:   "Tuesday",
		time.Wednesday: "Wednesday",
		time.Thursday:  "Thursday",
		time.Friday:    "Friday",
		time.Saturday:  "Saturday",
	}

	planningDay := now
	if planningDate != "" {
		if parsed, err := time.ParseInLocation("2006-01-02", planningDate, now.Location()); err == nil {
			planningDay = parsed
		}
	}

	hints := []RelativeDateHint{
		{
			Label:   "today",
			Date:    planningDay.Format("2006-01-02"),
			Weekday: weekdayNames[planningDay.Weekday()],
		},
		{
			Label:   "tomorrow",
			Date:    planningDay.AddDate(0, 0, 1).Format("2006-01-02"),
			Weekday: weekdayNames[planningDay.AddDate(0, 0, 1).Weekday()],
		},
	}

	for _, weekday := range []time.Weekday{
		time.Monday,
		time.Tuesday,
		time.Wednesday,
		time.Thursday,
		time.Friday,
		time.Saturday,
		time.Sunday,
	} {
		date := nextWeekday(planningDay, weekday)
		hints = append(hints, RelativeDateHint{
			Label:   "next " + weekdayNames[weekday],
			Date:    date.Format("2006-01-02"),
			Weekday: weekdayNames[date.Weekday()],
		})
	}

	calendarEvents := make([]CalendarEventPromptContext, 0, len(events))
	for _, event := range events {
		calendarEvents = append(calendarEvents, CalendarEventPromptContext{
			Date:  event.Date,
			Time:  event.Time,
			Title: event.Title,
			Type:  event.Type,
		})
	}

	return PromptContext{
		RealCurrentDate:    now.Format("2006-01-02"),
		RealCurrentWeekday: weekdayNames[now.Weekday()],
		PlanningDate:       planningDay.Format("2006-01-02"),
		PlanningWeekday:    weekdayNames[planningDay.Weekday()],
		Timezone:           timezone,
		RelativeDateHints:  hints,
		CalendarEvents:     calendarEvents,
	}
}

func formatPromptContext(promptContext PromptContext) string {
	if promptContext.RealCurrentDate == "" && promptContext.PlanningDate == "" && len(promptContext.CalendarEvents) == 0 {
		return "Calendar context: none provided."
	}

	var builder strings.Builder
	builder.WriteString("Calendar context:\n")
	if promptContext.RealCurrentDate != "" {
		builder.WriteString(fmt.Sprintf("- Real current date: %s", promptContext.RealCurrentDate))
		if promptContext.RealCurrentWeekday != "" {
			builder.WriteString(", " + promptContext.RealCurrentWeekday)
		}
		builder.WriteString("\n")
	}
	if promptContext.PlanningDate != "" {
		builder.WriteString(fmt.Sprintf("- Planning date: %s", promptContext.PlanningDate))
		if promptContext.PlanningWeekday != "" {
			builder.WriteString(", " + promptContext.PlanningWeekday)
		}
		builder.WriteString("\n")
	}
	if promptContext.Timezone != "" {
		builder.WriteString("- Timezone: " + promptContext.Timezone + "\n")
	}

	if len(promptContext.RelativeDateHints) > 0 {
		builder.WriteString("- Relative date hints:\n")
		for _, hint := range promptContext.RelativeDateHints {
			builder.WriteString(fmt.Sprintf("  - %s = %s", hint.Label, hint.Date))
			if hint.Weekday != "" {
				builder.WriteString(", " + hint.Weekday)
			}
			builder.WriteString("\n")
		}
	}

	builder.WriteString("- Existing OneNext calendar events:\n")
	if len(promptContext.CalendarEvents) == 0 {
		builder.WriteString("  - none\n")
		return builder.String()
	}

	const maxPromptEvents = 12
	for index, event := range promptContext.CalendarEvents {
		if index >= maxPromptEvents {
			builder.WriteString(fmt.Sprintf("  - ...and %d more events\n", len(promptContext.CalendarEvents)-maxPromptEvents))
			break
		}
		builder.WriteString(fmt.Sprintf("  - %s %s: %s (%s)\n", event.Date, event.Time, event.Title, event.Type))
	}

	return builder.String()
}

func nextWeekday(now time.Time, weekday time.Weekday) time.Time {
	daysUntil := (int(weekday) - int(now.Weekday()) + 7) % 7
	if daysUntil == 0 {
		daysUntil = 7
	}
	return now.AddDate(0, 0, daysUntil)
}
