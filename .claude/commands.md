# Project Commands

This file defines the common commands for this project. All agents should reference this file for running project-specific commands.

## Quick Reference

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start development server | `npm run dev` |
| Run all tests | `npm test` |
| Run E2E tests | `npm run test:e2e` |
| Build for production | `npm run build` |
| Lint code | `npm run lint` |
| Format code | `npm run format` |

## Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
**Access URL**: http://localhost:3000

### Build for Production
```bash
npm run build
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests
```bash
npm run test:integration
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test -- --watch
```

## Code Quality

### Lint Code
```bash
npm run lint
```

### Fix Lint Issues
```bash
npm run lint -- --fix
```

### Format Code
```bash
npm run format
```

### Type Check
```bash
npm run typecheck
```

## Browser Testing with Playwright

### Install Playwright Browsers
```bash
npx playwright install
```

### Run Playwright Tests
```bash
npx playwright test
```

### Run Playwright Tests with UI
```bash
npx playwright test --ui
```

### Generate Playwright Test from Recording
```bash
npx playwright codegen [url]
```

## Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/issue-[number]-[description]
```

### Create Fix Branch
```bash
git checkout -b fix/issue-[number]-[description]
```

### Push and Create PR
```bash
git push -u origin [branch-name]
gh pr create
```

---

**Note**: Update these commands to match your project's actual configuration. This file is read by all agents to ensure consistent command usage.