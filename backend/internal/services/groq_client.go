package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type GroqRequest struct {
	Model          string         `json:"model"`
	Messages       []GroqMessage  `json:"messages"`
	ResponseFormat map[string]any `json:"response_format"`
	Temperature    float64        `json:"temperature"`
}

type GroqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func CallGroq(ctx context.Context, apiKey string, model string, prompt string) (string, error) {
	if apiKey == "" {
		return "", fmt.Errorf("GROQ_API_KEY is missing")
	}

	reqBody := GroqRequest{
		Model: model,
		Messages: []GroqMessage{
			{Role: "user", Content: prompt},
		},
		ResponseFormat: map[string]any{"type": "json_object"},
		Temperature:    0.2,
	}

	reqBytes, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal groq request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewReader(reqBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create groq request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("groq api request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("groq api returned status %d: %s", resp.StatusCode, string(body))
	}

	var groqResp GroqResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return "", fmt.Errorf("failed to decode groq response: %w", err)
	}

	if len(groqResp.Choices) == 0 {
		return "", fmt.Errorf("groq returned no choices")
	}

	return groqResp.Choices[0].Message.Content, nil
}
