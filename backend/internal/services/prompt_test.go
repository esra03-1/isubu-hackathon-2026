package services

import (
	"strings"
	"testing"
	"time"

	"onenext/backend/internal/models"
)

func TestBuildPromptWithContext_IncludesRelativeDatesAndCalendarEvents(t *testing.T) {
	now := time.Date(2026, time.May, 6, 13, 0, 0, 0, time.UTC)
	context := BuildPromptContext(now, "Europe/Istanbul", []models.CalendarEvent{
		{
			Date:  "2026-05-12",
			Time:  "09:00",
			Title: "Math quiz",
			Type:  "academic",
		},
	})

	prompt := BuildPromptWithContext("I have this coming up next Tuesday.", context)

	expectedSnippets := []string{
		"Current date: 2026-05-06, Wednesday",
		"Timezone: Europe/Istanbul",
		"next Tuesday = 2026-05-12, Tuesday",
		"2026-05-12 09:00: Math quiz (academic)",
		`"calendar_events": [`,
		`"date": "YYYY-MM-DD"`,
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
