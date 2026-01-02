#!/bin/bash
# Automatasaurus Stop Hook
# Called when Claude finishes a response

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NOTIFY="$SCRIPT_DIR/notify.sh"

# Read the stop context from stdin (passed by Claude Code)
CONTEXT=$(cat)

# Check if this looks like a completion, question, or stuck state
# The context contains Claude's last response

if echo "$CONTEXT" | grep -qi "question\|asking\|need your input\|please confirm\|should I\|would you like\|which option"; then
  "$NOTIFY" "Automatasaurus" "A question needs your answer" "question"
  exit 0
fi

if echo "$CONTEXT" | grep -qi "approval\|approve\|confirm\|permission\|authorize"; then
  "$NOTIFY" "Automatasaurus" "Approval is required to proceed" "approval"
  exit 0
fi

if echo "$CONTEXT" | grep -qi "stuck\|blocked\|cannot proceed\|unable to\|failed\|error"; then
  "$NOTIFY" "Automatasaurus" "Agent encountered an issue" "stuck"
  exit 0
fi

if echo "$CONTEXT" | grep -qi "completed\|finished\|done\|all tasks\|ready for"; then
  "$NOTIFY" "Automatasaurus" "Work is complete - ready for more tasks" "complete"
  exit 0
fi

# Default: just log that we stopped
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Agent stopped" >> "${AUTOMATASAURUS_LOG:-/tmp/automatasaurus.log}"

exit 0