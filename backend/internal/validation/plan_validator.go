package validation

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"onenext/backend/internal/models"
)

var ErrInvalidCompiledPlan = errors.New("compiled plan failed validation")

var validTimelineTypes = map[string]struct{}{
	"work":     {},
	"errand":   {},
	"meeting":  {},
	"academic": {},
	"personal": {},
}

var validUrgencies = map[string]struct{}{
	"high":   {},
	"medium": {},
	"low":    {},
}

var validInsightTypes = map[string]struct{}{
	"prep": {},
	"risk": {},
}

func NormalizeAndValidateCompiledPlan(plan models.CompiledPlan) (models.CompiledPlan, error) {
	warnings := append([]string{}, plan.Debug.Warnings...)

	plan.Summary.Headline = strings.TrimSpace(plan.Summary.Headline)
	plan.Focus.ID = strings.TrimSpace(plan.Focus.ID)
	plan.Focus.Title = strings.TrimSpace(plan.Focus.Title)
	plan.Focus.Reason = strings.TrimSpace(plan.Focus.Reason)
	plan.Focus.Duration = strings.TrimSpace(plan.Focus.Duration)
	plan.Focus.Urgency = normalizeUrgency(strings.TrimSpace(plan.Focus.Urgency))
	if plan.Focus.ID == "" {
		plan.Focus.ID = "focus-1"
		warnings = append(warnings, "focus id was missing and was normalized")
	}

	plan.Timeline, warnings = normalizeTimeline(plan.Timeline, warnings)
	plan.CalendarEvents, warnings = normalizeCalendarEvents(plan.CalendarEvents, warnings)
	plan.Replies, warnings = normalizeReplies(plan.Replies, warnings)
	plan.Insights, warnings = normalizeInsights(plan.Insights, warnings)

	if plan.Timeline == nil {
		plan.Timeline = []models.TimelineItem{}
	}
	if plan.CalendarEvents == nil {
		plan.CalendarEvents = []models.CompiledCalendarEvent{}
	}
	if plan.Replies == nil {
		plan.Replies = []models.ReplyDraft{}
	}
	if plan.Insights == nil {
		plan.Insights = []models.Insight{}
	}

	plan.Debug.Warnings = warnings

	if len(plan.Timeline) == 0 {
		return plan, ErrInvalidCompiledPlan
	}

	plan.Focus, warnings = syncFocusWithTimeline(plan.Focus, plan.Timeline[0], warnings)
	plan.Debug.Warnings = warnings

	if plan.Summary.Headline == "" || plan.Focus.Title == "" {
		return plan, ErrInvalidCompiledPlan
	}

	return plan, nil
}

func normalizeTimeline(items []models.TimelineItem, warnings []string) ([]models.TimelineItem, []string) {
	normalized := make([]models.TimelineItem, 0, len(items))
	seenIDs := map[string]struct{}{}

	for _, item := range items {
		item.ID = strings.TrimSpace(item.ID)
		item.Time = strings.TrimSpace(item.Time)
		item.Title = strings.TrimSpace(item.Title)
		item.Type = strings.TrimSpace(item.Type)
		item.Duration = strings.TrimSpace(item.Duration)

		if !validTime(item.Time) || item.Title == "" {
			warnings = append(warnings, "invalid timeline item was skipped")
			continue
		}
		if _, ok := validTimelineTypes[item.Type]; !ok {
			item.Type = "personal"
			warnings = append(warnings, "invalid timeline item type was normalized to personal")
		}
		if item.Duration == "" {
			item.Duration = "30 dk"
			warnings = append(warnings, "timeline item duration was missing and was normalized to 30 dk")
		}

		item.ID, warnings = normalizeUniqueID(item.ID, "timeline", len(normalized)+1, seenIDs, warnings, "timeline item")
		normalized = append(normalized, item)
	}

	return normalized, warnings
}

func normalizeCalendarEvents(items []models.CompiledCalendarEvent, warnings []string) ([]models.CompiledCalendarEvent, []string) {
	normalized := make([]models.CompiledCalendarEvent, 0, len(items))

	for _, item := range items {
		item.Date = strings.TrimSpace(item.Date)
		item.Time = strings.TrimSpace(item.Time)
		item.Title = strings.TrimSpace(item.Title)
		item.Type = strings.TrimSpace(item.Type)

		if !validDate(item.Date) || !validTime(item.Time) || item.Title == "" {
			warnings = append(warnings, "invalid calendar event was skipped")
			continue
		}
		if _, ok := validTimelineTypes[item.Type]; !ok {
			item.Type = "personal"
			warnings = append(warnings, "invalid calendar event type was normalized to personal")
		}

		normalized = append(normalized, item)
	}

	return normalized, warnings
}

func normalizeReplies(items []models.ReplyDraft, warnings []string) ([]models.ReplyDraft, []string) {
	normalized := make([]models.ReplyDraft, 0, len(items))
	seenIDs := map[string]struct{}{}

	for _, item := range items {
		item.ID = strings.TrimSpace(item.ID)
		item.Recipient = strings.TrimSpace(item.Recipient)
		item.Context = strings.TrimSpace(item.Context)
		item.Draft = strings.TrimSpace(item.Draft)

		if item.Recipient == "" || item.Draft == "" {
			warnings = append(warnings, "invalid reply draft was skipped")
			continue
		}

		item.ID, warnings = normalizeUniqueID(item.ID, "reply", len(normalized)+1, seenIDs, warnings, "reply")
		normalized = append(normalized, item)
	}

	return normalized, warnings
}

func normalizeInsights(items []models.Insight, warnings []string) ([]models.Insight, []string) {
	normalized := make([]models.Insight, 0, len(items))
	seenIDs := map[string]struct{}{}

	for _, item := range items {
		item.ID = strings.TrimSpace(item.ID)
		item.Type = strings.TrimSpace(item.Type)
		item.Message = strings.TrimSpace(item.Message)
		item.Severity = normalizeUrgency(strings.TrimSpace(item.Severity))

		if item.Message == "" {
			warnings = append(warnings, "invalid insight was skipped")
			continue
		}
		if _, ok := validInsightTypes[item.Type]; !ok {
			item.Type = "risk"
			warnings = append(warnings, "invalid insight type was normalized to risk")
		}

		item.ID, warnings = normalizeUniqueID(item.ID, "insight", len(normalized)+1, seenIDs, warnings, "insight")
		normalized = append(normalized, item)
	}

	return normalized, warnings
}

func normalizeUrgency(value string) string {
	if _, ok := validUrgencies[value]; ok {
		return value
	}
	return "medium"
}

func syncFocusWithTimeline(focus models.FocusAction, firstTimeline models.TimelineItem, warnings []string) (models.FocusAction, []string) {
	if focus.ID == "" {
		focus.ID = "focus-1"
	}
	if focus.Title != firstTimeline.Title {
		warnings = append(warnings, "focus title was synchronized with the first timeline item")
	}
	if focus.Duration != firstTimeline.Duration {
		warnings = append(warnings, "focus duration was synchronized with the first timeline item")
	}

	focus.Title = firstTimeline.Title
	focus.Duration = firstTimeline.Duration
	focus.Urgency = normalizeUrgency(focus.Urgency)
	if strings.TrimSpace(focus.Reason) == "" {
		focus.Reason = "Zaman akisinin ilk adimi oldugu icin once buna odaklan."
		warnings = append(warnings, "focus reason was missing and was normalized")
	}

	return focus, warnings
}

func normalizeUniqueID(current string, prefix string, index int, seenIDs map[string]struct{}, warnings []string, label string) (string, []string) {
	if current != "" {
		if _, exists := seenIDs[current]; !exists {
			seenIDs[current] = struct{}{}
			return current, warnings
		}
		warnings = append(warnings, label+" id was duplicated and was normalized")
	} else {
		warnings = append(warnings, label+" id was missing and was normalized")
	}

	normalized := prefix + "-" + strconv.Itoa(index)
	for {
		if _, exists := seenIDs[normalized]; !exists {
			seenIDs[normalized] = struct{}{}
			return normalized, warnings
		}
		index++
		normalized = prefix + "-" + strconv.Itoa(index)
	}
}

func validDate(value string) bool {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return false
	}
	return parsed.Format("2006-01-02") == value
}

func validTime(value string) bool {
	parsed, err := time.Parse("15:04", value)
	if err != nil {
		return false
	}
	return parsed.Format("15:04") == value
}
