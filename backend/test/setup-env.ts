// Setup environment variables for E2E tests
process.env.NODE_ENV = 'TEST';
process.env.PORT = '3000';

// Use regular PostgreSQL URL for tests (not Accelerate)
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('prisma://')) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/keyguard_test';
}

process.env.JWT_SECRET_KEY = 'testSuperSecretJWTKeyThatIsAtLeast32CharactersLongForTestingPurposes123';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.OPTIMIZE_API_KEY = '';
