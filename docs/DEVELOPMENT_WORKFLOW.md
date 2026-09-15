# ABC Bank Development Workflow

This documents the lightweight Git workflow for a 3-person hackathon team.

## Branch Strategy
Existing branches (already created on remote):
- `main` — stable, merged code
- `harsh/backend` — Harsh's backend work
- `lakshya/frontend` — Lakshya's frontend work
- `ubaid/ai` — Ubaid's AI/ML work

> [!NOTE]
> Do NOT use GitFlow. This is a hackathon — keep it simple.

## Commit Conventions
Format: `<type>(<scope>): <description>`

Types: feat, fix, docs, refactor, test, chore
Scopes: backend, frontend, ai, contracts, data, docs

Examples:
- `feat(backend): add experience composer endpoint`
- `fix(ai): correct DTI threshold in signal detector`
- `docs(contracts): update ExperienceConfig schema`
- `feat(frontend): implement adaptive hero card`

## Daily Workflow
1. Pull latest main: `git checkout main && git pull`
2. Switch to your branch: `git checkout harsh/backend`
3. Rebase on main: `git rebase main`
4. Work in YOUR ownership directory only
5. Commit frequently with conventional messages
6. Push your branch: `git push origin harsh/backend`
7. When feature is ready, create PR to main

## Pull Request Rules
- PRs should only touch files in YOUR ownership directory (except docs/)
- PR title follows commit convention
- Run tests before creating PR:
  - Harsh: `python apps/backend/tests/test_experience.py`
  - Lakshya: `cd apps/frontend && npx tsc --noEmit`
  - Ubaid: `python ai/intelligence/run.py --scenario normal && python ai/intelligence/run.py --scenario financial-stress`
- At least one other team member should review if touching shared files

## Merge Order
1. AI changes merge first (they produce the data contracts consume)
2. Backend changes merge second (they consume AI output and produce for frontend)
3. Frontend changes merge last (they consume backend output)

This order minimizes integration issues.

## When to Rebase vs Merge
- **Rebase**: When updating your branch with latest main
- **Merge**: When merging your PR into main (use squash merge if many commits)
- Never force-push to main

## Conflict Resolution
- If conflict is in YOUR directory: resolve it yourself
- If conflict is in contracts/ or data/: coordinate with the other team member
- If conflict is in a shared file: team lead (Harsh) makes final call

## Files That Should Rarely Be Edited Concurrently
- `contracts/*.schema.json`
- `data/seed/*.json`
- `data/scenarios/*.json`
- `docker-compose.yml`
- `.env.example`
- `README.md` (only Harsh should update)

## How to Test Before Merging
Full validation sequence:
```bash
# 1. Seed data check
python scripts/generate_seed_data.py

# 2. AI pipeline
python ai/intelligence/run.py --scenario normal
python ai/intelligence/run.py --scenario financial-stress

# 3. Voice intent
python ai/voice/run_voice.py --query "Pay Metro" --lang en

# 4. Backend tests
python apps/backend/tests/test_experience.py

# 5. Frontend type check
cd apps/frontend && npx tsc --noEmit
```

## Shared File Edit Protocol
When you need to edit a shared file (contracts, data, docs):
1. Announce on team chat what you're changing and why
2. Make the change on your branch
3. Create a PR with `[SHARED]` prefix in title
4. Get at least one other team member to review
5. Merge quickly to avoid blocking others
