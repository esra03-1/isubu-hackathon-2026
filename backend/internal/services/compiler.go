package services

import (
	"context"
	"encoding/json"
	"log"

	"onenext/backend/internal/config"
	"onenext/backend/internal/models"
	"onenext/backend/internal/validation"
)

func CompileInput(ctx context.Context, cfg config.Config, rawInput string) (*models.CompiledPlan, error) {
	return CompileInputWithPromptContext(ctx, cfg, rawInput, PromptContext{})
}

func CompileInputWithPromptContext(ctx context.Context, cfg config.Config, rawInput string, promptContext PromptContext) (*models.CompiledPlan, error) {
	prompt := BuildPromptWithContext(rawInput, promptContext)

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

	normalizedPlan, err := validation.NormalizeAndValidateCompiledPlan(plan)
	if err != nil {
		log.Printf("Invalid compiled plan after normalization: %v\nOutput: %s", err, rawOutput)
		return nil, err
	}
	plan = normalizedPlan

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
