# KeyGuard Backend Tests

## Overview

Comprehensive E2E (End-to-End) test suite for the KeyGuard Backend API. All tests are written using Jest and Supertest.

## Test Coverage

### 1. Authentication Tests (`auth.e2e-spec.ts`)
- ✅ Login with valid credentials
- ✅ Login failure scenarios (invalid email, password, format)
- ✅ Token refresh functionality
- ✅ Invalid token handling
- ✅ Validation errors

**Total Test Cases**: 8

### 2. API Keys Tests (`api-keys.e2e-spec.ts`)
- ✅ List API keys with pagination
- ✅ Filter by status, provider, environment
- ✅ Search functionality
- ✅ Create API key with all scenarios
- ✅ Validation (name length, provider, environment, expiration)
- ✅ Revoke API key
- ✅ Error handling (duplicates, non-existent IDs)
- ✅ Authentication requirements

**Total Test Cases**: 17

### 3. Devices Tests (`devices.e2e-spec.ts`)
- ✅ List devices with filtering and sorting
- ✅ Device statistics calculation
- ✅ Generate enrollment codes
- ✅ Approve pending devices
- ✅ Suspend active devices
- ✅ Revoke devices
- ✅ State transition validation
- ✅ Error handling

**Total Test Cases**: 16

### 4. Audit Logs Tests (`audit-logs.e2e-spec.ts`)
- ✅ List audit logs with comprehensive filtering
- ✅ Filter by event type, status, severity
- ✅ Date range filtering
- ✅ Search functionality
- ✅ Pagination with limits
- ✅ Export to CSV and JSON
- ✅ Export with filters
- ✅ Validation and error handling

**Total Test Cases**: 13

### 5. Settings Tests (`settings.e2e-spec.ts`)
- ✅ Get all settings
- ✅ Update general settings
- ✅ Update security settings (with IP whitelist)
- ✅ Update notification settings
- ✅ Test SMTP connection
- ✅ Generate admin API keys
- ✅ Revoke admin API keys
- ✅ Download backups
- ✅ Comprehensive validation
- ✅ Error handling

**Total Test Cases**: 21

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Generate Coverage Report
```bash
npm run test:cov
```

## Test Structure

Each test file follows this pattern:

```typescript
describe('Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    // Setup test app and database
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('Endpoint (METHOD)', () => {
    it('should handle success case', async () => {
      // Test success scenario
    });

    it('should handle error case', async () => {
      // Test error scenario
    });
  });
});
```

## Test Data Management

- Tests create their own test data in `beforeAll`
- All test data is cleaned up in `afterAll`
- Tests use unique identifiers to avoid conflicts
- Database transactions ensure isolation

## Authentication

- Most endpoints require JWT authentication
- Tests login before testing protected endpoints
- Auth tokens are reused across test cases
- Public endpoints are tested without authentication

## Assertions

Tests verify:
- ✅ HTTP status codes
- ✅ Response structure
- ✅ Data types and formats
- ✅ Business logic correctness
- ✅ Error messages and codes
- ✅ Validation rules
- ✅ Edge cases

## Best Practices

1. **Isolation**: Each test is independent
2. **Cleanup**: All test data is removed
3. **Descriptive**: Test names clearly describe what they test
4. **Comprehensive**: Cover success, error, and edge cases
5. **Fast**: Tests run in parallel when possible
6. **Reliable**: No flaky tests

## Total Test Coverage

- **Total Test Suites**: 5
- **Total Test Cases**: 75+
- **Coverage**: All endpoints and modules
- **Edge Cases**: Validation, errors, authentication, authorization

## Continuous Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Troubleshooting

### Database Connection Issues
Ensure `DATABASE_URL` is set in your `.env` file and the database is accessible.

### Port Already in Use
Kill any running instances:
```bash
pkill -f "nest start"
```

### Test Timeouts
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 30000
```

---

**Last Updated**: December 2, 2025
**Status**: ✅ All tests passing
