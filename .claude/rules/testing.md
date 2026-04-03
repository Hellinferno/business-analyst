# Testing Standards

## Requirements
- All new features must have tests
- Bug fixes must include a regression test
- Target minimum 80% code coverage

## Unit Tests
- Test one thing per test
- Use descriptive test names: `should <do X> when <condition Y>`
- Mock external dependencies (APIs, databases) at boundaries

## Integration Tests
- Test critical user flows end-to-end
- Use real database/services where practical (avoid mock divergence)

## Running Tests
```bash
npm test          # run all tests
npm run test:unit # unit tests only
npm run test:e2e  # end-to-end tests
```
