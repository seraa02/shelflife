import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = vi.fn();

// Reset between tests
beforeEach(() => {
  vi.clearAllMocks();
});
