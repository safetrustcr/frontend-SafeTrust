# CI/CD Pipeline and Development Setup Guide

This guide covers everything you need to know about our testing, code quality, environment setup, and deployment processes to help you get started quickly.

## Testing Setup

Our project uses Jest and React Testing Library for unit and integration tests in a Next.js environment.

### Running Tests Locally

```bash
# Run all tests (watch mode)
npm run test

# Run tests with coverage
npm run test:ci
```

## Code Quality Checks

We use the following tools to ensure code quality:

- **ESLint**: Lints JavaScript and TypeScript code
- **TypeScript**: Ensures type safety
- **Prettier**: Maintains consistent formatting

### Running Checks Locally

```bash
# Lint code
npm run lint

# Check types
npm run typecheck

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Best Practices

- Run checks regularly before committing
- Consider setting up pre-commit hooks with Husky
- Keep dependencies updated using `npm outdated`

## Environment Variables

We manage environment variables across development, staging, and production environments:

- `.env.example`: Template in repository (no sensitive values)
- **GitHub Secrets**: Stores sensitive variables for CI/CD
- **Vercel**: Manages runtime variables for deployments

Follow the `.env.example` file to set up your local environment.

## Deployment Pipeline

### Environments and Triggers

- **Dev**: Auto-deploys on push to main or manual trigger
- **Staging**: Manual trigger only
- **Prod**: Manual trigger from main branch only
- **Preview**: Auto-deploys for every PR to main

### Triggering Manual Deployments

1. Go to Actions tab in GitHub
2. Select Next.js CI/CD Pipeline workflow
3. Click Run workflow
4. Choose target environment (dev, staging, or prod)
5. Click Run workflow

### Pipeline Workflow

1. **Quality Checks**: Linting, type checking, formatting, tests
2. **Security Scans**: CodeQL, npm audit, Snyk, TruffleHog
3. **E2E Tests**: Cypress tests against local build
4. **Performance Tests**: Lighthouse CI
5. **Build**: Environment-specific build
6. **Deploy**: Vercel deployment
7. **Security Testing**: OWASP ZAP for DAST
8. **Release**: Creates GitHub release (production only)
9. **Monitoring**: Sets up health checks

## Development Workflow

1. Create feature branch from main
2. Make changes and open PR to trigger preview deployment
3. Test using preview URL
4. After approval, merge to main (auto-deploys to dev)
5. Manually deploy to staging for additional testing
6. Manually deploy to prod when ready

## Monitoring and Alerts

### Alert Configuration

- **Notifications**: Email alerts for failures
- **Status Checks**: Required for PRs
- **Health Monitoring**: Checks `/api/health` endpoint every 15 minutes

### Responding to Alerts

1. Check GitHub Actions and Vercel logs
2. Verify health endpoint
3. Roll back if necessary (via Vercel dashboard)
4. Notify the team
5. Track issues in GitHub

## Container Usage

- **Local Development**: Use `docker-compose up` to run locally
- **CI Process**: Builds and scans Docker image for security
- **Deployment**: Vercel handles deployment (Docker not used)

## Release Management

We use Semantic Versioning (major.minor.patch) and automated release processes:

- Conventional commits (e.g., `feat:`, `fix:`) determine version bumps
- Automated changelog generation
- Git tagging and GitHub releases

## Troubleshooting

- Check GitHub Actions logs for build/test failures
- Verify environment variables in GitHub Secrets
- Ensure branches are up to date
- For deployment issues, check Vercel dashboard

## Getting Help

For further assistance, reach out to the DevOps team or check configurations in `.github/workflows/`.