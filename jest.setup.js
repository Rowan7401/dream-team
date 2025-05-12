import '@testing-library/jest-dom';

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));


// Optional: mock matchMedia if used in styled components or responsive designs
window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  };
};
