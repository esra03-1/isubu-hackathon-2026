package services

import (
	"strings"
	"testing"
	"time"

	"onenext/backend/internal/models"
)

func TestBuildPromptWithContext_IncludesRelativeDatesAndCalendarEvents(t *testing.T) {
	now := time.Date(2026, time.May, 6, 13, 0, 0, 0, time.UTC)
	context := BuildPromptContext(now, "2026-05-12", "Europe/Istanbul", []models.CalendarEvent{
		{
			Date:  "2026-05-12",
			Time:  "09:00",
			Title: "Math quiz",
			Type:  "academic",
		},
	})

	prompt := BuildPromptWithContext("I have this coming up next Tuesday.", context)

	expectedSnippets := []string{
		"Real current date: 2026-05-06, Wednesday",
		"Planning date: 2026-05-12, Tuesday",
		"Timezone: Europe/Istanbul",
		"today = 2026-05-12, Tuesday",
		"tomorrow = 2026-05-13, Wednesday",
		"next Wednesday = 2026-05-13, Wednesday",
		"be mindful of short breaks, meals, and context-switching",
		"infer the best realistic slot and include them in timeline instead of dropping them",
		"place the untimed tasks around that event in the most sensible order",
		"keep it out of timeline and put it in calendar_events instead",
		`Never use "full-day", "all-day", or other vague placeholders.`,
		"estimated_saved_minutes must be a realistic positive integer",
		"2026-05-12 09:00: Math quiz (academic)",
		`"calendar_events": [`,
		`"date": "YYYY-MM-DD"`,
		`"duration": "string"`,
		"I have this coming up next Tuesday.",
	}

	for _, snippet := range expectedSnippets {
		if !strings.Contains(prompt, snippet) {
			t.Fatalf("Expected prompt to contain %q.\nPrompt:\n%s", snippet, prompt)
		}
	}
}

func TestBuildPrompt_NoContextKeepsCompatibility(t *testing.T) {
	prompt := BuildPrompt("buy milk")

	if !strings.Contains(prompt, "Calendar context: none provided.") {
		t.Fatalf("Expected no-context prompt marker")
	}
	if !strings.Contains(prompt, "Here is the daily input:\nbuy milk") {
		t.Fatalf("Expected raw input in prompt")
	}
}
