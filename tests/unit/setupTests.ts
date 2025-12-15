import '@testing-library/jest-dom';

// Global mocks or helpers for testing can be placed here.
// Example: mock randomUUID for deterministic ids
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = { randomUUID: () => 'test-uuid' };
}
