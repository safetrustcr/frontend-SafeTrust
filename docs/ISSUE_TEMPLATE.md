# Issue Template — frontend-SafeTrust

## Title format

```text
feat(component): short description
fix(page): short description
refactor(hook): short description
docs(contributing): short description
```

## Required sections

### Issue Summary

What is missing or broken. Must include:

- Which route or component is affected
- Whether it is a build error (500), visual bug, or missing feature
- What the fix involves at a high level

### Type of Issue

- [ ] Bug
- [ ] Feature Request
- [ ] Documentation
- [ ] Performance

### Branch Strategy

```text
✅  feat/issue-N-short-description → develop
❌  feat/issue-N-short-description → main
```

### Current Behavior

Show the actual state — screenshot, error message, or current code.

### Expected Behavior

Show the complete desired state. Include full component code, not pseudocode.
A contributor must be able to implement from this section alone.

### Reproduction Steps

Numbered steps starting from `pnpm run dev`.

### Environment Details

```text
Project Version:   frontend-SafeTrust develop
Runtime:           Node.js 20+
Package Manager:   pnpm
Port:              3000
```

### Supporting Information

**Files to create/modify table:**

| File | Change |
|---|---|
| `src/components/X.tsx` | Create new component |
| `src/app/dashboard/X/page.tsx` | Update to use new component |

**Acceptance Criteria checklist** (reviewers use this to approve the PR — be specific and testable):

- [ ] `/route` returns 200 without build errors
- [ ] Component renders in dark mode
- [ ] No Apollo Client, Firebase Auth calls, or Hasura queries/imports added
- [ ] Loom video in PR description

**Contributing Guide links:**

- [Contributing Guide](./CONTRIBUTING.md)
- [Skeleton Architecture](./SKELETON_ARCHITECTURE.md)

## Points guide

| Complexity | Points | Example |
|---|---|---|
| Single CSS fix | 100 pts | Fix dark mode contrast |
| Small component | 150 pts | LogoutButton, NotificationItem |
| Medium shell | 200 pts | Guest dashboard, form page |
| Large feature | 400 - 600 pts | Messages system, escrow view |
| Architecture | 400 - 800 pts | Middleware, provider setup |
