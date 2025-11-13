# OpenSpec Instructions

Instructions for AI coding assistants using OpenSpec for spec-driven development.

## TL;DR Quick Checklist

- Search existing work: `openspec spec list --long`, `openspec list` (use `rg` only for full-text search)
- Decide scope: new capability vs modify existing capability
- Pick a unique `change-id`: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
- Scaffold: `proposal.md`, `tasks.md`, `design.md` (only if needed), and delta specs per affected capability
- Write deltas: use `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`; include at least one `#### Scenario:` per requirement
- Validate: `openspec validate [change-id] --strict` and fix issues
- Request approval: Do not start implementation until proposal is approved

## Three-Stage Workflow

### Stage 1: Creating Changes

Create proposal when you need to:

- Add features or functionality
- Make breaking changes (API, schema)
- Change architecture or patterns
- Optimize performance (changes behavior)
- Update security patterns

Triggers (examples):

- "Help me create a change proposal"
- "Help me plan a change"
- "Help me create a proposal"
- "I want to create a spec proposal"
- "I want to create a spec"

Loose matching guidance:

- Contains one of: `proposal`, `change`, `spec`
- With one of: `create`, `plan`, `make`, `start`, `help`

Skip proposal for:

- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes
- Tests for existing behavior

**Workflow**

1. Review `openspec/project.md`, `openspec list`, and `openspec list --specs` to understand current context.
2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, optional `design.md`, and spec deltas under `openspec/changes/<id>/`.
3. Draft spec deltas using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement.
4. Run `openspec validate <id> --strict` and resolve any issues before sharing the proposal.

### Stage 2: Implementing Changes

**Upon Proposal Approval:**

1. **Create GitHub Issue** - Create an issue in GitHub with the proposal title and link to the proposal
2. **Create Feature Branch** - Create a new branch from main using format: `feature/[change-id]` or `feature/issue-[number]-[change-id]`
3. **Remember Issue Number** - Store the issue number to reference in the Pull Request when implementation is complete
4. **Switch to Branch** - Ensure all implementation work happens on the feature branch

**Implementation Workflow:**
Track these steps as TODOs and complete them one by one.

1. **Read proposal.md** - Understand what's being built
2. **Read design.md** (if exists) - Review technical decisions
3. **Read tasks.md** - Get implementation checklist
4. **Implement tasks sequentially** - Complete in order
5. **Update tasks.md IMMEDIATELY** - After EACH task completion, update the corresponding checkbox to `- [x]` in tasks.md
6. **Commit regularly** - Commit changes with meaningful messages referencing the issue number (e.g., "feat: implement X #123")
7. **Confirm completion** - Ensure every item in `tasks.md` is marked `- [x]` before creating PR
8. **Approval gate** - Do not start implementation until the proposal is reviewed and approved

**Creating Pull Request:**

1. **Push branch** - Push the feature branch to remote
2. **Create PR** - Create Pull Request with:
   - Title: Include issue number (e.g., "feat: Update sport venue card image selection #123")
   - Description: Link to the proposal and issue, summarize changes
   - Reference: Include "Closes #[issue-number]" in PR description
3. **Request review** - Assign reviewers and wait for approval

### Stage 3: Completing and Archiving Changes

**Upon Pull Request Approval and Merge:**

1. **Merge PR** - Merge the Pull Request into main branch
2. **Close Issue** - GitHub should auto-close the issue if "Closes #[number]" was in PR description
3. **Switch to main** - Switch back to main branch and pull latest changes
4. **Delete feature branch** - Delete the feature branch locally and remotely
5. **Archive the change** - Move the change to archive:
   - Move `changes/[name]/` → `changes/archive/YYYY-MM-DD-[name]/`
   - Update `specs/` if capabilities changed
   - Use `openspec archive <change-id> --skip-specs --yes` for tooling-only changes (always pass the change ID explicitly)
   - Run `openspec validate --strict` to confirm the archived change passes checks
6. **Commit archive** - Commit the archive changes to main (can be done directly or via quick PR)

## Before Any Task

**Context Checklist:**

- [ ] Read relevant specs in `specs/[capability]/spec.md`
- [ ] Check pending changes in `changes/` for conflicts
- [ ] Read `openspec/project.md` for conventions
- [ ] Run `openspec list` to see active changes
- [ ] Run `openspec list --specs` to see existing capabilities

**Before Creating Specs:**

- Always check if capability already exists
- Prefer modifying existing specs over creating duplicates
- Use `openspec show [spec]` to review current state
- If request is ambiguous, ask 1–2 clarifying questions before scaffolding

### Search Guidance

- Enumerate specs: `openspec spec list --long` (or `--json` for scripts)
- Enumerate changes: `openspec list` (or `openspec change list --json` - deprecated but available)
- Show details:
  - Spec: `openspec show <spec-id> --type spec` (use `--json` for filters)
  - Change: `openspec show <change-id> --json --deltas-only`
- Full-text search (use ripgrep): `rg -n "Requirement:|Scenario:" openspec/specs`

## Quick Start

### CLI Commands

```bash
# Essential commands
openspec list                  # List active changes
openspec list --specs          # List specifications
openspec show [item]           # Display change or spec
openspec validate [item]       # Validate changes or specs
openspec archive <change-id> [--yes|-y]   # Archive after deployment (add --yes for non-interactive runs)

# Project management
openspec init [path]           # Initialize OpenSpec
openspec update [path]         # Update instruction files

# Interactive mode
openspec show                  # Prompts for selection
openspec validate              # Bulk validation mode

# Debugging
openspec show [change] --json --deltas-only
openspec validate [change] --strict
```

### Command Flags

- `--json` - Machine-readable output
- `--type change|spec` - Disambiguate items
- `--strict` - Comprehensive validation
- `--no-interactive` - Disable prompts
- `--skip-specs` - Archive without spec updates
- `--yes`/`-y` - Skip confirmation prompts (non-interactive archive)

## Directory Structure

```
openspec/
├── project.md              # Project conventions
├── specs/                  # Current truth - what IS built
│   └── [capability]/       # Single focused capability
│       ├── spec.md         # Requirements and scenarios
│       └── design.md       # Technical patterns
├── changes/                # Proposals - what SHOULD change
│   ├── [change-name]/
│   │   ├── proposal.md     # Why, what, impact
│   │   ├── tasks.md        # Implementation checklist
│   │   ├── design.md       # Technical decisions (optional; see criteria)
│   │   └── specs/          # Delta changes
│   │       └── [capability]/
│   │           └── spec.md # ADDED/MODIFIED/REMOVED
│   └── archive/            # Completed changes
```

## Creating Change Proposals

### Decision Tree

```
New request?
├─ Bug fix restoring spec behavior? → Fix directly
├─ Typo/format/comment? → Fix directly
├─ New feature/capability? → Create proposal
├─ Breaking change? → Create proposal
├─ Architecture change? → Create proposal
└─ Unclear? → Create proposal (safer)
```

### Proposal Structure

1. **Create directory:** `changes/[change-id]/` (kebab-case, verb-led, unique)

2. **Write proposal.md:**

```markdown
## Why

[1-2 sentences on problem/opportunity]

## What Changes

- [Bullet list of changes]
- [Mark breaking changes with **BREAKING**]

## Impact

- Affected specs: [list capabilities]
- Affected code: [key files/systems]
```

3. **Create spec deltas:** `specs/[capability]/spec.md`

```markdown
## ADDED Requirements

### Requirement: New Feature

The system SHALL provide...

#### Scenario: Success case

- **WHEN** user performs action
- **THEN** expected result

## MODIFIED Requirements

### Requirement: Existing Feature

[Complete modified requirement]

## REMOVED Requirements

### Requirement: Old Feature

**Reason**: [Why removing]
**Migration**: [How to handle]
```

If multiple capabilities are affected, create multiple delta files under `changes/[change-id]/specs/<capability>/spec.md`—one per capability.

4. **Create tasks.md:**

```markdown
## 1. Implementation

- [ ] 1.1 Create database schema
- [ ] 1.2 Implement API endpoint
- [ ] 1.3 Add frontend component
- [ ] 1.4 Write tests
```

5. **Create design.md when needed:**
   Create `design.md` if any of the following apply; otherwise omit it:

- Cross-cutting change (multiple services/modules) or a new architectural pattern
- New external dependency or significant data model changes
- Security, performance, or migration complexity
- Ambiguity that benefits from technical decisions before coding

Minimal `design.md` skeleton:

```markdown
## Context

[Background, constraints, stakeholders]

## Goals / Non-Goals

- Goals: [...]
- Non-Goals: [...]

## Decisions

- Decision: [What and why]
- Alternatives considered: [Options + rationale]

## Risks / Trade-offs

- [Risk] → Mitigation

## Migration Plan

[Steps, rollback]

## Open Questions

- [...]
```

## Spec File Format

### Critical: Scenario Formatting

**CORRECT** (use #### headers):

```markdown
#### Scenario: User login success

- **WHEN** valid credentials provided
- **THEN** return JWT token
```

**WRONG** (don't use bullets or bold):

```markdown
- **Scenario: User login** ❌
  **Scenario**: User login ❌

### Scenario: User login ❌
```

Every requirement MUST have at least one scenario.

### Requirement Wording

- Use SHALL/MUST for normative requirements (avoid should/may unless intentionally non-normative)

### Delta Operations

- `## ADDED Requirements` - New capabilities
- `## MODIFIED Requirements` - Changed behavior
- `## REMOVED Requirements` - Deprecated features
- `## RENAMED Requirements` - Name changes

Headers matched with `trim(header)` - whitespace ignored.

#### When to use ADDED vs MODIFIED

- ADDED: Introduces a new capability or sub-capability that can stand alone as a requirement. Prefer ADDED when the change is orthogonal (e.g., adding "Slash Command Configuration") rather than altering the semantics of an existing requirement.
- MODIFIED: Changes the behavior, scope, or acceptance criteria of an existing requirement. Always paste the full, updated requirement content (header + all scenarios). The archiver will replace the entire requirement with what you provide here; partial deltas will drop previous details.
- RENAMED: Use when only the name changes. If you also change behavior, use RENAMED (name) plus MODIFIED (content) referencing the new name.

Common pitfall: Using MODIFIED to add a new concern without including the previous text. This causes loss of detail at archive time. If you aren’t explicitly changing the existing requirement, add a new requirement under ADDED instead.

Authoring a MODIFIED requirement correctly:

1. Locate the existing requirement in `openspec/specs/<capability>/spec.md`.
2. Copy the entire requirement block (from `### Requirement: ...` through its scenarios).
3. Paste it under `## MODIFIED Requirements` and edit to reflect the new behavior.
4. Ensure the header text matches exactly (whitespace-insensitive) and keep at least one `#### Scenario:`.

Example for RENAMED:

```markdown
## RENAMED Requirements

- FROM: `### Requirement: Login`
- TO: `### Requirement: User Authentication`
```

## Troubleshooting

### Common Errors

**"Change must have at least one delta"**

- Check `changes/[name]/specs/` exists with .md files
- Verify files have operation prefixes (## ADDED Requirements)

**"Requirement must have at least one scenario"**

- Check scenarios use `#### Scenario:` format (4 hashtags)
- Don't use bullet points or bold for scenario headers

**Silent scenario parsing failures**

- Exact format required: `#### Scenario: Name`
- Debug with: `openspec show [change] --json --deltas-only`

### Validation Tips

```bash
# Always use strict mode for comprehensive checks
openspec validate [change] --strict

# Debug delta parsing
openspec show [change] --json | jq '.deltas'

# Check specific requirement
openspec show [spec] --json -r 1
```

## Happy Path Script

```bash
# 1) Explore current state
openspec spec list --long
openspec list
# Optional full-text search:
# rg -n "Requirement:|Scenario:" openspec/specs
# rg -n "^#|Requirement:" openspec/changes

# 2) Choose change id and scaffold
CHANGE=add-two-factor-auth
mkdir -p openspec/changes/$CHANGE/{specs/auth}
printf "## Why\n...\n\n## What Changes\n- ...\n\n## Impact\n- ...\n" > openspec/changes/$CHANGE/proposal.md
printf "## 1. Implementation\n- [ ] 1.1 ...\n" > openspec/changes/$CHANGE/tasks.md

# 3) Add deltas (example)
cat > openspec/changes/$CHANGE/specs/auth/spec.md << 'EOF'
## ADDED Requirements
### Requirement: Two-Factor Authentication
Users MUST provide a second factor during login.

#### Scenario: OTP required
- **WHEN** valid credentials are provided
- **THEN** an OTP challenge is required
EOF

# 4) Validate
openspec validate $CHANGE --strict
```

## Multi-Capability Example

```
openspec/changes/add-2fa-notify/
├── proposal.md
├── tasks.md
└── specs/
    ├── auth/
    │   └── spec.md   # ADDED: Two-Factor Authentication
    └── notifications/
        └── spec.md   # ADDED: OTP email notification
```

auth/spec.md

```markdown
## ADDED Requirements

### Requirement: Two-Factor Authentication

...
```

notifications/spec.md

```markdown
## ADDED Requirements

### Requirement: OTP Email Notification

...
```

## GitHub Integration Workflow

### Complete Workflow Example

```bash
# 1. After proposal approval, create GitHub issue
# Use GitHub API or web interface to create issue with proposal details

# 2. Create and switch to feature branch
git checkout -b feature/update-sport-venue-card-image-selection

# 3. Implement changes, updating tasks.md after EACH completed task
# Edit files...
git add openspec/changes/update-sport-venue-card-image-selection/tasks.md
git commit -m "chore: mark task 1.1 complete"

# 4. Commit implementation changes
git add components/SportVenueCardItem.vue
git commit -m "feat: add sport-specific image selection #123"

# 5. Push branch and create PR
git push -u origin feature/update-sport-venue-card-image-selection
# Create PR via GitHub with "Closes #123" in description

# 6. After PR merge, cleanup and archive
git checkout main
git pull origin main
git branch -d feature/update-sport-venue-card-image-selection
git push origin --delete feature/update-sport-venue-card-image-selection

# 7. Archive the change
openspec archive update-sport-venue-card-image-selection --yes
git add openspec/
git commit -m "chore: archive update-sport-venue-card-image-selection"
git push origin main
```

### Task Management Rules

**CRITICAL: Update tasks.md immediately after completing each task**

- ✅ **DO**: Update `tasks.md` checkbox to `- [x]` right after completing a task
- ✅ **DO**: Commit the tasks.md update separately or with the implementation
- ✅ **DO**: Keep tasks.md as the single source of truth for progress
- ❌ **DON'T**: Wait until the end to update all checkboxes at once
- ❌ **DON'T**: Forget to commit tasks.md changes

Example commit flow:

```bash
# Complete task 1.1
# Edit types/data.ts to add SportsGallery interface
git add types/data.ts

# IMMEDIATELY update tasks.md
# Change: - [ ] 1.1 Add `SportsGallery` interface
# To:     - [x] 1.1 Add `SportsGallery` interface
git add openspec/changes/update-sport-venue-card-image-selection/tasks.md

git commit -m "feat: add SportsGallery interface #123"
```

## Best Practices

### Simplicity First

- Default to <100 lines of new code
- Single-file implementations until proven insufficient
- Avoid frameworks without clear justification
- Choose boring, proven patterns

### Complexity Triggers

Only add complexity with:

- Performance data showing current solution too slow
- Concrete scale requirements (>1000 users, >100MB data)
- Multiple proven use cases requiring abstraction

### Clear References

- Use `file.ts:42` format for code locations
- Reference specs as `specs/auth/spec.md`
- Link related changes and PRs

### Capability Naming

- Use verb-noun: `user-auth`, `payment-capture`
- Single purpose per capability
- 10-minute understandability rule
- Split if description needs "AND"

### Change ID Naming

- Use kebab-case, short and descriptive: `add-two-factor-auth`
- Prefer verb-led prefixes: `add-`, `update-`, `remove-`, `refactor-`
- Ensure uniqueness; if taken, append `-2`, `-3`, etc.

## Tool Selection Guide

| Task                  | Tool | Why                      |
| --------------------- | ---- | ------------------------ |
| Find files by pattern | Glob | Fast pattern matching    |
| Search code content   | Grep | Optimized regex search   |
| Read specific files   | Read | Direct file access       |
| Explore unknown scope | Task | Multi-step investigation |

## Error Recovery

### Change Conflicts

1. Run `openspec list` to see active changes
2. Check for overlapping specs
3. Coordinate with change owners
4. Consider combining proposals

### Validation Failures

1. Run with `--strict` flag
2. Check JSON output for details
3. Verify spec file format
4. Ensure scenarios properly formatted

### Missing Context

1. Read project.md first
2. Check related specs
3. Review recent archives
4. Ask for clarification

## Quick Reference

### Stage Indicators

- `changes/` - Proposed, not yet built
- `specs/` - Built and deployed
- `archive/` - Completed changes

### File Purposes

- `proposal.md` - Why and what
- `tasks.md` - Implementation steps (update IMMEDIATELY after each task)
- `design.md` - Technical decisions
- `spec.md` - Requirements and behavior

### Workflow Checklist

**On Approval:**

- [ ] Create GitHub issue with proposal details
- [ ] Create feature branch: `feature/[change-id]`
- [ ] Remember issue number for PR

**During Implementation:**

- [ ] Update tasks.md checkbox after EACH completed task
- [ ] Commit regularly with issue reference (#123)
- [ ] Keep tasks.md as source of truth

**On Completion:**

- [ ] Create PR with "Closes #[issue-number]"
- [ ] Merge PR into main
- [ ] Delete feature branch
- [ ] Archive change with `openspec archive`

### CLI Essentials

```bash
openspec list              # What's in progress?
openspec show [item]       # View details
openspec validate --strict # Is it correct?
openspec archive <change-id> [--yes|-y]  # Mark complete (add --yes for automation)
```

### Git Commands

```bash
# Start implementation
git checkout -b feature/[change-id]

# After each task
git add [files] openspec/changes/[change-id]/tasks.md
git commit -m "feat: description #[issue-number]"

# Create PR
git push -u origin feature/[change-id]

# After merge
git checkout main && git pull
git branch -d feature/[change-id]
openspec archive [change-id] --yes
```

Remember: Specs are truth. Changes are proposals. Keep them in sync. Update tasks.md immediately.
