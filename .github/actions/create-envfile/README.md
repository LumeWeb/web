# create-envfile

Writes a `.env` file and prints an audit of which keys were found vs missing.

## Usage

```yaml
- uses: ./.github/actions/create-envfile
  with:
    directory: apps/pinner.xyz
    env-keys: |
      {
        "PUBLIC_PORTAL_API_URL": "${{ vars.PINNER_PORTAL_API_URL }}",
        "PUBLIC_POSTHOG_PROJECT_TOKEN": "${{ secrets.PINNER_POSTHOG_PROJECT_TOKEN }}"
      }
    fail-on-empty: "PUBLIC_POSTHOG_PROJECT_TOKEN,PUBLIC_POSTHOG_HOST"
```

## Inputs

| Name | Required | Description |
|------|----------|-------------|
| `directory` | yes | Target directory for `.env` |
| `env-keys` | yes | JSON object of env var names → values |
| `fail-on-empty` | no | Comma-separated keys that must be non-empty |

## Output

The step prints an audit block:

```
=== Env Audit ===
Found (3):
  - PUBLIC_PORTAL_API_URL
  - PUBLIC_LISTMONK_URL
  - PUBLIC_POSTHOG_HOST
Missing/empty (2):
  - PUBLIC_LISTMONK_LIST_UUID
  - PUBLIC_POSTHOG_PROJECT_TOKEN
=================
```

Values are **never** printed. Only keys are echoed.
