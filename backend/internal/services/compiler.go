package services

import (
	"context"
	"encoding/json"
	"log"

	"onenext/backend/internal/config"
	"onenext/backend/internal/models"
)

func CompileInput(ctx context.Context, cfg config.Config, rawInput string) (*models.CompiledPlan, error) {
	prompt := BuildPrompt(rawInput)

	rawOutput, err := CallGroq(ctx, cfg.GroqAPIKey, cfg.GroqModel, prompt)
	if err != nil {
		log.Printf("CallGroq failed: %v", err)
		return nil, err
	}

	var plan models.CompiledPlan
	if err := json.Unmarshal([]byte(rawOutput), &plan); err != nil {
		log.Printf("Failed to unmarshal Groq output: %v\nOutput: %s", err, rawOutput)
		return nil, err
	}

	// Basic validation
	if plan.Summary.Headline == "" && plan.Focus.Title == "" {
		log.Printf("Invalid compiled plan (missing headline and focus): %s", rawOutput)
	}

	plan.Debug = models.DebugInfo{
		Model:          cfg.GroqModel,
		RawModelOutput: rawOutput,
		FallbackUsed:   false,
		Warnings:       plan.Debug.Warnings,
	}
	if plan.Debug.Warnings == nil {
		plan.Debug.Warnings = []string{}
	}

	return &plan, nil
}
