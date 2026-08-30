import '@testing-library/jest-dom';

// Mock IntersectionObserver for framer-motion and viewport animations
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock SVGPathElement methods for JSDOM
if (typeof SVGPathElement !== 'undefined') {
  SVGPathElement.prototype.getTotalLength = () => 1000;
  SVGPathElement.prototype.getPointAtLength = () => ({ x: 0, y: 0 } as DOMPoint);
}
