# Testing Structure for Job Tracker App

This folder contains the test suite for the Job Tracker application. The tests are organized into three main categories:

## Unit Tests

Located in the `unit/` directory, these tests focus on testing individual components, stores, and utilities in isolation. Unit tests use Vitest and Vue Test Utils to mount individual components and test their behavior.

### Running Unit Tests

```bash
# Run unit tests once
npm run test:unit

# Run unit tests in watch mode (useful during development)
npm run test:unit:watch

# Run unit tests with coverage report
npm run test:unit:coverage
```

## Integration Tests

Located in the `integration/` directory, these tests focus on testing how components interact with each other. Integration tests typically involve mounting a larger portion of the app and testing the interactions between components.

### Running Integration Tests

Integration tests use the same Vitest setup as unit tests, so you can run them with the same commands:

```bash
npm run test:unit  # Runs both unit and integration tests
```

## End-to-End Tests

Located in the `e2e/` directory, these tests use Cypress to test the application from a user's perspective. E2E tests interact with the app through a real browser and simulate real user behavior.

### Running E2E Tests

```bash
# Run E2E tests headlessly
npm run test:e2e

# Open Cypress UI for interactive testing
npm run test:e2e:open
```

## Test Setup

- `setup.ts`: Contains global test setup for Vitest, including mocking of external dependencies like Supabase.
- `e2e/support/commands.ts`: Contains custom Cypress commands for E2E testing.
- `e2e/support/e2e.ts`: Contains global test setup for Cypress, including mocking API responses.

## Test Structure Best Practices

1. **Naming Convention**: Test files should be named after the component they test, with a `.spec.ts` suffix for unit/integration tests and `.cy.ts` suffix for Cypress tests.

2. **Test Organization**: Use `describe` blocks to group related tests, and `it` blocks for individual test cases.

3. **Testing Hierarchy**:
   - Unit tests: Focus on individual functions and components in isolation
   - Integration tests: Focus on interactions between components
   - E2E tests: Focus on user flows and real-world scenarios

4. **Mocking**: Use mocks for external dependencies like Supabase, but avoid mocking internal components in integration tests.

5. **Coverage**: Aim for high test coverage, but prioritize critical paths and complex logic.

## Required Dependencies

To run the tests, you need to install the following dependencies:

```bash
npm install --save-dev vitest @vue/test-utils jsdom @testing-library/vue @testing-library/jest-dom cypress @pinia/testing
```

Remember to update your `package.json` scripts to run the tests. 