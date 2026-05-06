import type { CompileRequest, CompiledPlan, SavedPlan } from './types';

const CLIENT_ID_KEY = 'onenext_client_id';

export function getOneNextClientId(): string {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;

  const id = `client_${crypto.randomUUID()}`;
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

export interface PlanRequest extends CompileRequest {
  planning_date?: string; // YYYY-MM-DD, optional
}

/**
 * Main submit flow: POST /api/v1/plans
 * Saves the plan to SQLite and returns a SavedPlan.
 * Use response.compiled_plan for the result screen.
 */
export async function submitPlan(request: PlanRequest): Promise<CompiledPlan> {
  const clientId = getOneNextClientId();

  const response = await fetch('/api/v1/plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-OneNext-Client-ID': clientId,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Failed to submit plan');
  }

  const saved: SavedPlan = await response.json();
  return saved.compiled_plan;
}

/**
 * Legacy non-persistent compile (for testing only).
 * Prefer submitPlan() for the main UI flow.
 */
export async function compileDay(request: CompileRequest): Promise<CompiledPlan> {
  const response = await fetch('/api/v1/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to compile day');
  }

  return response.json();
}