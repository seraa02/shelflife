import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Reset between tests
beforeEach(() => {
  vi.clearAllMocks();
});
