# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in `braveheart84/weather-starter`. Use the `gh` CLI with `--repo braveheart84/weather-starter` for all operations.

## Conventions

- **Create an issue**: `gh issue create --repo braveheart84/weather-starter --title "..." --body "..."`
- **Read an issue**: `gh issue view <number> --repo braveheart84/weather-starter --json number,title,body,labels,comments`
- **List issues**: `gh issue list --repo braveheart84/weather-starter --state open --json number,title,body,labels,comments`
- **Comment on an issue**: `gh issue comment <number> --repo braveheart84/weather-starter --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --repo braveheart84/weather-starter --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --repo braveheart84/weather-starter --comment "..."`

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue in `braveheart84/weather-starter`.

## When a skill says "fetch the relevant ticket"

Read the issue from `braveheart84/weather-starter`.
