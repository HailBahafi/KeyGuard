# Contributing to KeyGuard

Thank you for your interest in contributing to KeyGuard! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/keyguard.git
   cd keyguard
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install

   # Frontend
   cd ../frontend && npm install

   # SDK
   cd ../packages/sdk && npm install
   ```

3. **Configure environment**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET_KEY
   ```

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run prisma:seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run start:dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/add-2fa`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `docs/` - Documentation (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(sdk): add custom storage adapter support
fix(backend): resolve JWT expiration handling
docs(readme): update installation instructions
```

### Code Style

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with project configuration
- **Formatting:** Prettier

Run before committing:
```bash
# Backend
cd backend && npm run lint && npm run format

# Frontend
cd frontend && npm run lint
```

## Pull Request Process

1. **Create a feature branch** from `dev`
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature
   ```

2. **Make your changes** with appropriate tests

3. **Run quality checks**
   ```bash
   npm run lint
   npm run build
   npm test  # when tests exist
   ```

4. **Push and create PR** against `dev` branch

5. **PR Requirements:**
   - Clear description of changes
   - Link to related issue (if applicable)
   - All CI checks passing
   - Code review approval

## What to Contribute

### Good First Issues

Look for issues labeled [`good first issue`](../../issues?q=label%3A%22good+first+issue%22) - these are beginner-friendly.

### Areas Needing Help

- **Tests:** Unit tests, integration tests, E2E tests
- **Documentation:** API docs, examples, tutorials
- **Translations:** New languages (currently EN, AR)
- **Security:** Code review, vulnerability reporting

### Feature Requests

Open an issue using the Feature Request template before implementing major features.

## Project Structure

```
keyguard/
├── backend/           # NestJS API
│   ├── src/
│   │   ├── core/      # Auth, database
│   │   ├── modules/   # Feature modules
│   │   └── common/    # Shared utilities
│   └── prisma/        # Database schema
├── frontend/          # Next.js Dashboard
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/
│       └── lib/
├── packages/sdk/      # TypeScript SDK
└── docs/              # Documentation
```

## Testing

### Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Backend E2E tests (requires DB)
cd backend && npm run test:e2e

# SDK tests
cd packages/sdk && npm test
```

### Writing Tests

- Place tests next to source files or in `__tests__/` directories
- Use descriptive test names
- Test edge cases and error conditions

## Questions?

- Check existing [issues](../../issues) and [discussions](../../discussions)
- Create a new issue with the Question template

---

Thank you for contributing to KeyGuard! 🔐
