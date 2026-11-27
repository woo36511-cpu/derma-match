// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Vercel Analytics for tests - this ensures tests don't fail due to module resolution
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}), { virtual: true });
