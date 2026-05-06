package validation

import (
	"errors"
	"testing"

	"onenext/backend/internal/models"
)

func TestNormalizeAndValidateCompiledPlan_NormalizesIDsAndCalendarEventTypes(t *testing.T) {
	plan := models.CompiledPlan{
		Summary: models.Summary{
			Headline: "Bugunun plani",
		},
		Focus: models.FocusAction{
			Title:   "Derse basla",
			Urgency: "urgent",
		},
		Timeline: []models.TimelineItem{
			{ID: "", Time: "09:00", Title: "Derse basla", Type: "deep-work", Duration: "45 dk"},
			{ID: "", Time: "10:00", Title: "Mola", Type: "personal", Duration: ""},
		},
		CalendarEvents: []models.CompiledCalendarEvent{
			{Date: "2026-05-12", Time: "11:00", Title: "Aile aramasi", Type: "family"},
			{Date: "(tomorrow)", Time: "", Title: "Gecersiz", Type: "academic"},
		},
		Replies: []models.ReplyDraft{
			{ID: "dup", Recipient: "Ali", Draft: "Tamamdir"},
			{ID: "dup", Recipient: "Ayse", Draft: "Sonra donecegim"},
		},
		Insights: []models.Insight{
			{ID: "", Type: "warning", Message: "Hazirlik yap", Severity: "urgent"},
		},
	}

	normalized, err := NormalizeAndValidateCompiledPlan(plan)
	if err != nil {
		t.Fatalf("Expected plan to normalize successfully, got %v", err)
	}

	if normalized.Focus.ID == "" {
		t.Fatalf("Expected missing focus id to be normalized")
	}
	if normalized.Focus.Urgency != "medium" {
		t.Fatalf("Expected invalid focus urgency to default to medium, got %s", normalized.Focus.Urgency)
	}
	if normalized.Timeline[0].ID == "" || normalized.Timeline[1].ID == "" || normalized.Timeline[0].ID == normalized.Timeline[1].ID {
		t.Fatalf("Expected timeline ids to be unique after normalization: %+v", normalized.Timeline)
	}
	if normalized.Timeline[0].Type != "personal" {
		t.Fatalf("Expected invalid timeline type to normalize to personal, got %s", normalized.Timeline[0].Type)
	}
	if normalized.Timeline[0].Duration != "45 dk" {
		t.Fatalf("Expected timeline duration to be preserved, got %s", normalized.Timeline[0].Duration)
	}
	if len(normalized.CalendarEvents) != 1 {
		t.Fatalf("Expected invalid calendar event to be skipped, got %+v", normalized.CalendarEvents)
	}
	if normalized.CalendarEvents[0].Type != "personal" {
		t.Fatalf("Expected invalid calendar event type to normalize to personal, got %s", normalized.CalendarEvents[0].Type)
	}
	if normalized.Replies[0].ID == normalized.Replies[1].ID {
		t.Fatalf("Expected duplicate reply ids to be normalized: %+v", normalized.Replies)
	}
	if normalized.Insights[0].ID == "" || normalized.Insights[0].Type != "risk" || normalized.Insights[0].Severity != "medium" {
		t.Fatalf("Expected insight normalization, got %+v", normalized.Insights[0])
	}
	if len(normalized.Debug.Warnings) == 0 {
		t.Fatalf("Expected normalization warnings to be added")
	}
}

func TestNormalizeAndValidateCompiledPlan_ReturnsErrorForMissingMinimumContract(t *testing.T) {
	plan := models.CompiledPlan{
		Summary: models.Summary{
			Headline: "Eksik plan",
		},
		Focus: models.FocusAction{
			Title: "Sadece odak",
		},
		Timeline: []models.TimelineItem{},
	}

	_, err := NormalizeAndValidateCompiledPlan(plan)
	if !errors.Is(err, ErrInvalidCompiledPlan) {
		t.Fatalf("Expected ErrInvalidCompiledPlan, got %v", err)
	}
}
