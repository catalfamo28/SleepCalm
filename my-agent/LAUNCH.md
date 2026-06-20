# LAUNCH.md — eBay Stale Listing Refresher

Run these steps in order from any terminal with your API key available.
Each step checks IDS.env and skips if the object already exists — safe to re-run after a failure.

---

## Setup

```bash
cd /home/user/SleepCalm/my-agent

# Load API key
set -a; source .env; set +a

# Load any existing IDs
[ -f IDS.env ] && source IDS.env

BASE=https://api.anthropic.com/v1
H=(-H "x-api-key: $ANTHROPIC_API_KEY" \
   -H "anthropic-version: 2023-06-01" \
   -H "anthropic-beta: managed-agents-2026-04-01" \
   -H "content-type: application/json")
```

---

## Step 1 — Pick the model

```bash
curl -sS "$BASE/models" "${H[@]:0:4}" | python3 -c "
import json,sys
models = json.load(sys.stdin)['data']
opus = [m['id'] for m in models if 'opus' in m['id'].lower()]
print('Latest Opus-class:', opus[0] if opus else 'check manually')
"
```

Update `agent.json` — replace `PICKED-AT-LAUNCH` with the model ID returned above.

---

## Step 2 — Create environment (skip if ENV_ID already set)

```bash
if [ -z "$ENV_ID" ]; then
  curl -sS --fail-with-body "$BASE/environments" "${H[@]}" \
    -d @environment.json -o /tmp/env.json -w '%{http_code}\n'
  ENV_ID=$(python3 -c "import json,sys; print(json.JSONDecoder(strict=False).decode(open('/tmp/env.json').read())['id'])")
  echo "ENV_ID=$ENV_ID" >> IDS.env
  echo "✅ 📦 environment $ENV_ID"
else
  echo "⏭️  environment already exists: $ENV_ID"
fi
```

---

## Step 3 — Create agent (skip if AGENT_ID already set)

```bash
if [ -z "$AGENT_ID" ]; then
  curl -sS --fail-with-body "$BASE/agents" "${H[@]}" \
    -d @agent.json -o /tmp/agent.json -w '%{http_code}\n'
  AGENT_ID=$(python3 -c "import json,sys; d=json.JSONDecoder(strict=False).decode(open('/tmp/agent.json').read()); print(d['id'])")
  AGENT_VERSION=$(python3 -c "import json,sys; d=json.JSONDecoder(strict=False).decode(open('/tmp/agent.json').read()); print(d['version'])")
  echo "AGENT_ID=$AGENT_ID" >> IDS.env
  echo "AGENT_VERSION=$AGENT_VERSION" >> IDS.env
  echo "✅ 🤖 agent $AGENT_ID (v$AGENT_VERSION)"
else
  echo "⏭️  agent already exists: $AGENT_ID"
fi
```

---

## Step 4 — Create vault and add eBay credentials

```bash
# Create vault
VAULT_ID=$(curl -sS "$BASE/vaults" "${H[@]}" \
  -d '{"display_name":"eBay Seller Credentials"}' | \
  python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
echo "VAULT_ID=$VAULT_ID" >> IDS.env
echo "✅ 🔐 vault $VAULT_ID"

# Add each credential (paste values when prompted, or set as env vars first)
# EBAY_APP_ID
curl -sS "$BASE/vaults/$VAULT_ID/credentials" "${H[@]}" -d "{
  \"display_name\": \"eBay App ID\",
  \"auth\": {\"type\": \"environment_variable\", \"secret_name\": \"EBAY_APP_ID\", \"secret_value\": \"$EBAY_APP_ID\",
             \"networking\": {\"type\": \"limited\", \"allowed_hosts\": [\"api.ebay.com\", \"api.sandbox.ebay.com\"]}}
}"

# EBAY_CERT_ID
curl -sS "$BASE/vaults/$VAULT_ID/credentials" "${H[@]}" -d "{
  \"display_name\": \"eBay Cert ID\",
  \"auth\": {\"type\": \"environment_variable\", \"secret_name\": \"EBAY_CERT_ID\", \"secret_value\": \"$EBAY_CERT_ID\",
             \"networking\": {\"type\": \"limited\", \"allowed_hosts\": [\"api.ebay.com\"]}}
}"

# EBAY_USER_TOKEN
curl -sS "$BASE/vaults/$VAULT_ID/credentials" "${H[@]}" -d "{
  \"display_name\": \"eBay User OAuth Token\",
  \"auth\": {\"type\": \"environment_variable\", \"secret_name\": \"EBAY_USER_TOKEN\", \"secret_value\": \"$EBAY_USER_TOKEN\",
             \"networking\": {\"type\": \"limited\", \"allowed_hosts\": [\"api.ebay.com\"]}}
}"
echo "✅ 🔐 vault credentials added"
```

---

## Step 5 — Create session and kick off first run

```bash
SESSION_ID=$(curl -sS --fail-with-body "$BASE/sessions" "${H[@]}" -d "{
  \"agent\": \"$AGENT_ID\",
  \"environment_id\": \"$ENV_ID\",
  \"vault_ids\": [\"$VAULT_ID\"],
  \"title\": \"first run — stale listing refresh\"
}" | python3 -c "import json,sys; print(json.JSONDecoder(strict=False).decode(sys.stdin.read())['id'])")
echo "SESSION_ID=$SESSION_ID" >> IDS.env
echo "✅ ▶️  session $SESSION_ID"

# Kick off with outcome
EVT=$(python3 -c "
import json
task = open('first_prompt.txt').read()
rubric = open('outcome.md').read()
print(json.dumps({'type':'user.define_outcome','description':task,'rubric':{'type':'text','content':rubric},'max_iterations':3}))
")
curl -sS --fail-with-body "$BASE/sessions/$SESSION_ID/events" "${H[@]}" \
  -d "{\"events\":[$EVT]}" -o /tmp/kick.json -w '%{http_code}\n'
echo "✅ ▶️  run started — https://platform.claude.com/workspaces/default/sessions/$SESSION_ID"
```

---

## Step 6 — Poll until done

```bash
while true; do
  curl -sS "$BASE/sessions/$SESSION_ID" "${H[@]}" -o /tmp/sess.json
  STATUS=$(python3 -c "import json; d=json.JSONDecoder(strict=False).decode(open('/tmp/sess.json').read()); print(d['status'])")
  echo "$(date '+%H:%M:%S') status: $STATUS"
  if [ "$STATUS" = "idle" ]; then
    python3 -c "
import json
d = json.JSONDecoder(strict=False).decode(open('/tmp/sess.json').read())
for e in d.get('outcome_evaluations', []):
    print('Verdict:', e.get('result'), '—', e.get('explanation','')[:120])
"
    break
  fi
  sleep 30
done
```

---

## Step 7 — Fetch the report

```bash
curl -sS "$BASE/files?scope_id=$SESSION_ID" "${H[@]}" | python3 -c "
import json,sys
files = json.load(sys.stdin).get('data', [])
for f in files: print(f['id'], f['filename'])
"
# Then: curl -sS "$BASE/files/<FILE_ID>/content" "${H[@]}" -o relisting_report.md
```

---

## Step 8 — Create scheduled deployment

Once the first run passes:

```bash
source IDS.env

KICKOFF=$(python3 -c "
import json
task = open('first_prompt.txt').read()
rubric = open('outcome.md').read()
print(json.dumps({'type':'user.define_outcome','description':task,'rubric':{'type':'text','content':rubric},'max_iterations':3}))
")

curl -sS --fail-with-body "$BASE/deployments?beta=true" "${H[@]}" -d "{
  \"name\": \"ebay-stale-listing-refresher-weekly\",
  \"agent\": \"$AGENT_ID\",
  \"environment_id\": \"$ENV_ID\",
  \"vault_ids\": [\"$VAULT_ID\"],
  \"initial_events\": [$KICKOFF],
  \"schedule\": {\"type\": \"cron\", \"expression\": \"0 6 * * 1\", \"timezone\": \"America/New_York\"}
}" -o /tmp/deploy.json -w '%{http_code}\n'

DEPLOYMENT_ID=$(python3 -c "import json; d=json.JSONDecoder(strict=False).decode(open('/tmp/deploy.json').read()); print(d['id'])")
echo "DEPLOYMENT_ID=$DEPLOYMENT_ID" >> IDS.env
echo "✅ 🗓️  deployment $DEPLOYMENT_ID — runs every Monday 6AM Eastern"

# Confirm next run times
python3 -c "
import json
d = json.JSONDecoder(strict=False).decode(open('/tmp/deploy.json').read())
for t in d.get('schedule', {}).get('upcoming_runs_at', [])[:3]:
    print(' next run:', t)
"

# Trigger a manual test run now
curl -sS -X POST "$BASE/deployments/$DEPLOYMENT_ID/run?beta=true" "${H[@]}" -d '{}'
echo "✅ ▶️  manual test run triggered"
```
