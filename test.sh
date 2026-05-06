#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"
CLIENT_ID="${CLIENT_ID:-onenext-e2e-test}"
TODAY="$(date +%F)"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

request() {
  method="$1"
  path="$2"
  body="${3:-}"

  if [ -n "$body" ]; then
    curl -sS -X "$method" "$BASE_URL$path" \
      -H "Content-Type: application/json" \
      -H "X-OneNext-Client-ID: $CLIENT_ID" \
      -d "$body"
  else
    curl -sS -X "$method" "$BASE_URL$path" \
      -H "X-OneNext-Client-ID: $CLIENT_ID"
  fi
}

assert_json() {
  file="$1"
  filter="$2"

  if ! jq -e "$filter" "$file" >/dev/null; then
    echo "Assertion failed: $filter" >&2
    echo "Response body:" >&2
    cat "$file" >&2
    echo >&2
    exit 1
  fi
}

assert_json_arg() {
  file="$1"
  name="$2"
  value="$3"
  filter="$4"

  if ! jq -e --arg "$name" "$value" "$filter" "$file" >/dev/null; then
    echo "Assertion failed: $filter" >&2
    echo "Response body:" >&2
    cat "$file" >&2
    echo >&2
    exit 1
  fi
}

require_command curl
require_command jq

echo "1. health"
curl -sS "$BASE_URL/api/v1/health" > /tmp/onenext-health.json
assert_json /tmp/onenext-health.json '.status == "ok"'

echo "2. empty compile returns an error"
empty_status="$(
  curl -sS -o /tmp/onenext-empty-compile.json -w "%{http_code}" \
    -X POST "$BASE_URL/api/v1/compile" \
    -H "Content-Type: application/json" \
    -d '{"raw_input":"   "}'
)"
test "$empty_status" = "400"
assert_json /tmp/onenext-empty-compile.json '.error.code == "empty_raw_input"'

echo "3. compile returns a valid plan"
request POST "/api/v1/compile" '{"raw_input":"Tomorrow I have a quiz and need to reply to Ali."}' > /tmp/onenext-compile.json
assert_json /tmp/onenext-compile.json '.focus.title and (.timeline | length > 0)'

echo "4. save plan"
request POST "/api/v1/plans" '{"raw_input":"Tomorrow I have a quiz and need to reply to Ali."}' > /tmp/onenext-saved-plan.json
plan_id="$(jq -r '.id' /tmp/onenext-saved-plan.json)"
test "$plan_id" != "null"
test -n "$plan_id"
assert_json /tmp/onenext-saved-plan.json '.compiled_plan.focus.title and (.compiled_plan.timeline | length > 0)'
assert_json /tmp/onenext-saved-plan.json '.compiled_plan.calendar_events | length > 0'

echo "5. list plans includes saved plan"
request GET "/api/v1/plans" > /tmp/onenext-plans.json
assert_json_arg /tmp/onenext-plans.json plan_id "$plan_id" '.plans | map(.id) | index($plan_id)'

echo "6. get plan by id"
request GET "/api/v1/plans/$plan_id" > /tmp/onenext-plan.json
assert_json_arg /tmp/onenext-plan.json plan_id "$plan_id" '.id == $plan_id and .compiled_plan.focus.title'

echo "7. calendar returns derived events"
request GET "/api/v1/calendar?start=$TODAY&end=$TODAY" > /tmp/onenext-calendar-today.json
assert_json_arg /tmp/onenext-calendar-today.json plan_id "$plan_id" '.events | map(select(.plan_id == $plan_id)) | length > 0'

echo "8. calendar returns backend-id events from AI dated output"
future_date="$(jq -r '.compiled_plan.calendar_events[0].date' /tmp/onenext-saved-plan.json)"
request GET "/api/v1/calendar?start=$future_date&end=$future_date" > /tmp/onenext-calendar-future.json
assert_json_arg /tmp/onenext-calendar-future.json plan_id "$plan_id" '.events | map(select(.plan_id == $plan_id and .id != null and .source == "ai_calendar_event")) | length > 0'

echo "All e2e checks passed."
