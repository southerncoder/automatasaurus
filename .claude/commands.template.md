# Project Commands

This file defines the common commands for this project. Copy this template to your target project and customize the commands for your specific setup.

## Quick Reference

| Action | Command |
|--------|---------|
| Install dependencies | `{{install}}` |
| Start development server | `{{dev}}` |
| Run all tests | `{{test}}` |
| Run E2E tests | `{{test:e2e}}` |
| Build for production | `{{build}}` |
| Lint code | `{{lint}}` |
| Format code | `{{format}}` |

## Development

### Install Dependencies
```bash
{{install}}
```

### Start Development Server
```bash
{{dev}}
```
**Access URL**: {{dev_url}}

### Build for Production
```bash
{{build}}
```

## Testing

### Run All Tests
```bash
{{test}}
```

### Run Unit Tests Only
```bash
{{test:unit}}
```

### Run Integration Tests
```bash
{{test:integration}}
```

### Run E2E Tests
```bash
{{test:e2e}}
```

### Run Tests with Coverage
```bash
{{test:coverage}}
```

### Run Tests in Watch Mode
```bash
{{test:watch}}
```

## Code Quality

### Lint Code
```bash
{{lint}}
```

### Fix Lint Issues
```bash
{{lint:fix}}
```

### Format Code
```bash
{{format}}
```

### Type Check
```bash
{{typecheck}}
```

## Database (if applicable)

### Run Migrations
```bash
{{db:migrate}}
```

### Seed Database
```bash
{{db:seed}}
```

### Reset Database
```bash
{{db:reset}}
```

## Deployment

### Deploy to Staging
```bash
{{deploy:staging}}
```

### Deploy to Production
```bash
{{deploy:production}}
```

## Docker (if applicable)

### Start Services
```bash
{{docker:up}}
```

### Stop Services
```bash
{{docker:down}}
```

### View Logs
```bash
{{docker:logs}}
```

---

## Template Variables

Replace these placeholders with your actual commands:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{install}}` | Install dependencies | `npm install` |
| `{{dev}}` | Start dev server | `npm run dev` |
| `{{dev_url}}` | Local dev URL | `http://localhost:3000` |
| `{{test}}` | Run all tests | `npm test` |
| `{{test:unit}}` | Unit tests only | `npm run test:unit` |
| `{{test:integration}}` | Integration tests | `npm run test:integration` |
| `{{test:e2e}}` | E2E tests | `npm run test:e2e` |
| `{{test:coverage}}` | Tests with coverage | `npm run test:coverage` |
| `{{test:watch}}` | Tests in watch mode | `npm run test -- --watch` |
| `{{build}}` | Production build | `npm run build` |
| `{{lint}}` | Lint code | `npm run lint` |
| `{{lint:fix}}` | Fix lint issues | `npm run lint -- --fix` |
| `{{format}}` | Format code | `npm run format` |
| `{{typecheck}}` | Type checking | `npm run typecheck` |