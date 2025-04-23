# Testing Documentation for QuadLearning Backend

This directory contains the test suite for the QuadLearning backend application, including both greybox and whitebox testing approaches.

## Testing Approaches

### Greybox Testing
Greybox testing is a combination of blackbox and whitebox testing. It involves testing with partial knowledge of the internal workings of the application.

- Tests API endpoints with limited knowledge of internal implementation
- Focuses on data flow and integration points
- Mocks external dependencies while testing real functionality

We've implemented greybox tests in `tests/greybox/`:
- `auth.test.js`: Tests authentication functionality using mocked dependencies
- `admin.test.js`: Tests admin routes using a simplified router with mocked middleware

### Whitebox Testing
Whitebox testing involves testing with complete knowledge of the internal design, code, and logic. It focuses on:

- Code paths and branches
- Error handling
- Internal functions and utility methods
- Edge cases based on implementation details

## Running Tests on Windows

### Prerequisites
- Node.js v14+ and npm installed
- MongoDB running (or properly mocked)

### Setup
1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.test` file with test configuration:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/quadlearning_test
   JWT_SECRET=test_jwt_secret
   NODE_ENV=test
   VITE_ENCRYPTION_KEY=test_encryption_key
   ```

### Running Tests
- Run all tests:
  ```
  npm test
  ```

- Run a specific test file:
  ```
  npx vitest run tests/greybox/auth.test.js
  ```

- Run only greybox tests:
  ```
  npm run test:greybox
  ```

- Run only whitebox tests:
  ```
  npm run test:whitebox
  ```

## Lessons Learned

1. **Mocking Dependencies**: For proper greybox testing, it's important to mock external dependencies like databases and authentication.

2. **Simplify Test Scope**: We found it most effective to create simplified versions of routes specifically for testing rather than mocking every function used in the actual routes.

3. **Testing HTTP Responses**: Focus on testing the HTTP status codes and response bodies rather than implementation details when doing greybox testing.

4. **Avoiding Over-Mocking**: Trying to mock too many internal components can lead to brittle tests. Focus on what matters for the test.

## Adding New Tests

### Greybox Tests
Add new greybox tests in `tests/greybox/` directory. Follow these guidelines:
- Test API endpoints and responses
- Use supertest for API testing
- Create simplified versions of routes for testing
- Focus on request/response validation

### Whitebox Tests
Add new whitebox tests in `tests/whitebox/` directory. Follow these guidelines:
- Focus on internal methods, utility functions, middleware
- Test edge cases and error handling
- Mock all external dependencies
- Test specific code paths and logic branches

## Test Structure
- `greybox/` - Contains greybox tests focusing on API behavior
- `whitebox/` - Contains whitebox tests focusing on internal implementation 

## Best Practices
1. Keep tests isolated and independent
2. Properly mock external dependencies
3. Clean up test data after each test
4. Use descriptive test and assertion names
5. Maintain a balance between greybox and whitebox tests 