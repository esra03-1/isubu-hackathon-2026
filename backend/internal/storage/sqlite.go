package storage

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"onenext/backend/internal/models"

	_ "modernc.org/sqlite"
)

const calendarEventSourceCompiledPlan = "compiled_plan"
const calendarEventSourceAI = "ai_calendar_event"

var ErrNotFound = errors.New("not found")

type Store struct {
	db *sql.DB
}

func Open(path string) (*Store, error) {
	if path != ":memory:" {
		dir := filepath.Dir(path)
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, fmt.Errorf("create database directory: %w", err)
		}
	}

	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("open sqlite database: %w", err)
	}

	db.SetMaxOpenConns(1)

	store := &Store{db: db}
	if err := store.migrate(context.Background()); err != nil {
		_ = db.Close()
		return nil, err
	}

	return store, nil
}

func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

func (s *Store) SavePlan(ctx context.Context, clientID string, rawInput string, plan models.CompiledPlan, planningDate string) (*models.SavedPlan, error) {
	if err := validateClientID(clientID); err != nil {
		return nil, err
	}

	planID, err := newID("plan")
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC().Format(time.RFC3339)
	planJSON, err := json.Marshal(plan)
	if err != nil {
		return nil, fmt.Errorf("marshal compiled plan: %w", err)
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
		INSERT OR IGNORE INTO clients (id, created_at)
		VALUES (?, ?)
	`, clientID, now); err != nil {
		return nil, fmt.Errorf("ensure client: %w", err)
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO plans (id, client_id, raw_input, planning_date, compiled_plan_json, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, planID, clientID, rawInput, planningDate, string(planJSON), now); err != nil {
		return nil, fmt.Errorf("insert plan: %w", err)
	}

	for _, item := range plan.Timeline {
		eventID, err := newID("event")
		if err != nil {
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, `
			INSERT INTO calendar_events (id, client_id, plan_id, date, time, title, type, source, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, eventID, clientID, planID, planningDate, item.Time, item.Title, item.Type, calendarEventSourceCompiledPlan, now); err != nil {
			return nil, fmt.Errorf("insert calendar event: %w", err)
		}
	}

	for _, item := range plan.CalendarEvents {
		date := strings.TrimSpace(item.Date)
		eventTime := strings.TrimSpace(item.Time)
		title := strings.TrimSpace(item.Title)
		eventType := strings.TrimSpace(item.Type)
		if !validDate(date) || !validTime(eventTime) || title == "" {
			continue
		}
		if eventType == "" {
			eventType = "personal"
		}

		eventID, err := newID("event")
		if err != nil {
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, `
			INSERT INTO calendar_events (id, client_id, plan_id, date, time, title, type, source, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, eventID, clientID, planID, date, eventTime, title, eventType, calendarEventSourceAI, now); err != nil {
			return nil, fmt.Errorf("insert ai calendar event: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit plan: %w", err)
	}

	return &models.SavedPlan{
		ID:           planID,
		ClientID:     clientID,
		RawInput:     rawInput,
		PlanningDate: planningDate,
		CompiledPlan: plan,
		CreatedAt:    now,
	}, nil
}

func (s *Store) ListPlans(ctx context.Context, clientID string) ([]models.PlanSummary, error) {
	if err := validateClientID(clientID); err != nil {
		return nil, err
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, compiled_plan_json, created_at
		FROM plans
		WHERE client_id = ?
		ORDER BY created_at DESC
	`, clientID)
	if err != nil {
		return nil, fmt.Errorf("list plans: %w", err)
	}
	defer rows.Close()

	var plans []models.PlanSummary
	for rows.Next() {
		var id string
		var planJSON string
		var createdAt string
		if err := rows.Scan(&id, &planJSON, &createdAt); err != nil {
			return nil, fmt.Errorf("scan plan summary: %w", err)
		}

		var plan models.CompiledPlan
		if err := json.Unmarshal([]byte(planJSON), &plan); err != nil {
			return nil, fmt.Errorf("unmarshal stored plan: %w", err)
		}

		plans = append(plans, models.PlanSummary{
			ID:        id,
			Headline:  plan.Summary.Headline,
			Focus:     plan.Focus.Title,
			CreatedAt: createdAt,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate plans: %w", err)
	}

	if plans == nil {
		plans = []models.PlanSummary{}
	}

	return plans, nil
}

func (s *Store) GetPlan(ctx context.Context, clientID string, planID string) (*models.SavedPlan, error) {
	if err := validateClientID(clientID); err != nil {
		return nil, err
	}

	var rawInput string
	var planJSON string
	var planningDate string
	var createdAt string
	err := s.db.QueryRowContext(ctx, `
		SELECT raw_input, planning_date, compiled_plan_json, created_at
		FROM plans
		WHERE client_id = ? AND id = ?
	`, clientID, planID).Scan(&rawInput, &planningDate, &planJSON, &createdAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get plan: %w", err)
	}

	var plan models.CompiledPlan
	if err := json.Unmarshal([]byte(planJSON), &plan); err != nil {
		return nil, fmt.Errorf("unmarshal stored plan: %w", err)
	}

	return &models.SavedPlan{
		ID:           planID,
		ClientID:     clientID,
		RawInput:     rawInput,
		PlanningDate: planningDate,
		CompiledPlan: plan,
		CreatedAt:    createdAt,
	}, nil
}

func (s *Store) ListCalendarEvents(ctx context.Context, clientID string, startDate string, endDate string) ([]models.CalendarEvent, error) {
	if err := validateClientID(clientID); err != nil {
		return nil, err
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, client_id, plan_id, date, time, title, type, source, created_at
		FROM calendar_events
		WHERE client_id = ? AND date >= ? AND date <= ?
		ORDER BY date ASC, time ASC, created_at ASC
	`, clientID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("list calendar events: %w", err)
	}
	defer rows.Close()

	var events []models.CalendarEvent
	for rows.Next() {
		var event models.CalendarEvent
		if err := rows.Scan(
			&event.ID,
			&event.ClientID,
			&event.PlanID,
			&event.Date,
			&event.Time,
			&event.Title,
			&event.Type,
			&event.Source,
			&event.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan calendar event: %w", err)
		}
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate calendar events: %w", err)
	}

	if events == nil {
		events = []models.CalendarEvent{}
	}

	return events, nil
}

func (s *Store) migrate(ctx context.Context) error {
	statements := []string{
		`PRAGMA foreign_keys = ON`,
		`CREATE TABLE IF NOT EXISTS clients (
			id TEXT PRIMARY KEY,
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS plans (
			id TEXT PRIMARY KEY,
			client_id TEXT NOT NULL,
			raw_input TEXT NOT NULL,
			planning_date TEXT NOT NULL,
			compiled_plan_json TEXT NOT NULL,
			created_at TEXT NOT NULL,
			FOREIGN KEY (client_id) REFERENCES clients(id)
		)`,
		`CREATE TABLE IF NOT EXISTS calendar_events (
			id TEXT PRIMARY KEY,
			client_id TEXT NOT NULL,
			plan_id TEXT NOT NULL,
			date TEXT NOT NULL,
			time TEXT NOT NULL,
			title TEXT NOT NULL,
			type TEXT NOT NULL,
			source TEXT NOT NULL,
			created_at TEXT NOT NULL,
			FOREIGN KEY (client_id) REFERENCES clients(id),
			FOREIGN KEY (plan_id) REFERENCES plans(id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_plans_client_created_at
			ON plans (client_id, created_at)`,
		`CREATE INDEX IF NOT EXISTS idx_calendar_events_client_date_time
			ON calendar_events (client_id, date, time)`,
	}

	for _, statement := range statements {
		if _, err := s.db.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("run migration: %w", err)
		}
	}

	if err := ensureColumn(ctx, s.db, "plans", "planning_date", `ALTER TABLE plans ADD COLUMN planning_date TEXT NOT NULL DEFAULT ''`); err != nil {
		return err
	}

	return nil
}

func ensureColumn(ctx context.Context, db *sql.DB, table string, column string, statement string) error {
	rows, err := db.QueryContext(ctx, "PRAGMA table_info("+table+")")
	if err != nil {
		return fmt.Errorf("inspect table %s: %w", table, err)
	}
	defer rows.Close()

	for rows.Next() {
		var cid int
		var name string
		var columnType string
		var notNull int
		var defaultValue sql.NullString
		var pk int
		if err := rows.Scan(&cid, &name, &columnType, &notNull, &defaultValue, &pk); err != nil {
			return fmt.Errorf("scan table info %s: %w", table, err)
		}
		if name == column {
			return nil
		}
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("iterate table info %s: %w", table, err)
	}

	if _, err := db.ExecContext(ctx, statement); err != nil {
		return fmt.Errorf("add column %s.%s: %w", table, column, err)
	}

	return nil
}

func validateClientID(clientID string) error {
	clientID = strings.TrimSpace(clientID)
	if clientID == "" {
		return errors.New("client id is required")
	}
	if len(clientID) > 120 {
		return errors.New("client id is too long")
	}
	for _, r := range clientID {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			continue
		}
		return errors.New("client id may only contain letters, numbers, dash, and underscore")
	}
	return nil
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

func newID(prefix string) (string, error) {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "", fmt.Errorf("generate id: %w", err)
	}
	return prefix + "_" + hex.EncodeToString(bytes[:]), nil
}
