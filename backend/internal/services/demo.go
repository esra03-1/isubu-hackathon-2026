package services

import "onenext/backend/internal/models"

func DemoPlan(model string) models.CompiledPlan {
	return models.CompiledPlan{
		Summary: models.Summary{
			Headline:              "Bugunun en iyi ilk hamlesi hackathon fikrini netlestirmek.",
			EstimatedSavedMinutes: 45,
			DominantPressure:      "mixed",
		},
		Focus: models.FocusAction{
			ID:       "focus-1",
			Title:    "Hackathon fikrini netlestir",
			Reason:   "Gun icindeki diger isler bunun etrafinda daha kolay siralanir.",
			Duration: "30 dakika",
			Urgency:  "high",
		},
		Timeline: []models.TimelineItem{
			{
				ID:       "timeline-1",
				Time:     "10:00",
				Title:    "Hackathon fikrini netlestir",
				Type:     "work",
				Duration: "30 dk",
			},
			{
				ID:       "timeline-2",
				Time:     "11:00",
				Title:    "Melda hocaya cevap anahtari guncellemesini tamamla",
				Type:     "academic",
				Duration: "45 dk",
			},
			{
				ID:       "timeline-3",
				Time:     "16:00",
				Title:    "Toplantiya katil",
				Type:     "meeting",
				Duration: "60 dk",
			},
		},
		CalendarEvents: []models.CompiledCalendarEvent{
			{
				Date:  "2026-05-07",
				Time:  "09:30",
				Title: "Quiz tekrari",
				Type:  "academic",
			},
			{
				Date:  "2026-05-12",
				Time:  "16:00",
				Title: "Hackathon demo kontrolu",
				Type:  "work",
			},
		},
		Replies: []models.ReplyDraft{
			{
				ID:        "reply-1",
				Recipient: "Ali",
				Context:   "Gecikme bilgisi",
				Draft:     "Biraz gecikecegim, haber vermek istedim. Uygun olur mu?",
			},
		},
		Insights: []models.Insight{
			{
				ID:       "insight-1",
				Type:     "risk",
				Message:  "Yarin quiz oldugu icin bugun kisa bir tekrar blogu ayirmak riski azaltir.",
				Severity: "medium",
			},
			{
				ID:       "insight-2",
				Type:     "prep",
				Message:  "Toplanti oncesi eksik sayfalari ve context lingo notunu tek listede toparla.",
				Severity: "low",
			},
		},
		Debug: models.DebugInfo{
			Model:          model,
			RawModelOutput: "",
			FallbackUsed:   true,
			Warnings:       []string{"demo fallback response used"},
		},
	}
}
