Tests scaffold

- unit/: unit tests (React Testing Library / Vitest or Jest)
- e2e/: end-to-end tests (Playwright / Cypress)

Quick start (recommended):
1. Install Vitest + Testing Library for React:

   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

2. Add script to package.json:

   "test:unit": "vitest"

3. Run: `npm run test:unit`

Adjust configuration depending on your preferred runner.
