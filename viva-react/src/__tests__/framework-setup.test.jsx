import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('React Testing Library Setup', () => {
  describe('DOM Rendering', () => {
    it('should render simple JSX element', () => {
      const { container } = render(<div data-testid="test-div">Test Content</div>);
      expect(container).toBeTruthy();
    });

    it('should query elements using getByTestId', () => {
      render(<div data-testid="greeting">Hello World</div>);
      const element = screen.getByTestId('greeting');
      expect(element).toBeTruthy();
      expect(element.textContent).toBe('Hello World');
    });

    it('should query elements using getByText', () => {
      render(<button>Click Me</button>);
      const button = screen.getByText('Click Me');
      expect(button).toBeInTheDocument();
    });

    it('should handle multiple renders', () => {
      const { rerender } = render(<div>Version 1</div>);
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      
      rerender(<div>Version 2</div>);
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });
  });

  describe('Component State', () => {
    it('should test functional component with props', () => {
      const TestComponent = ({ name }) => <h1>Hello {name}</h1>;
      render(<TestComponent name="NDSM" />);
      expect(screen.getByText('Hello NDSM')).toBeInTheDocument();
    });

    it('should render conditional content', () => {
      const ConditionalComponent = ({ show }) => (
        show ? <div>Visible</div> : <div>Hidden</div>
      );
      const { rerender } = render(<ConditionalComponent show={true} />);
      expect(screen.getByText('Visible')).toBeInTheDocument();
      
      rerender(<ConditionalComponent show={false} />);
      expect(screen.getByText('Hidden')).toBeInTheDocument();
    });
  });

  describe('Test Lifecycle', () => {
    let setupCalled = false;
    let teardownCalled = false;

    beforeEach(() => {
      setupCalled = true;
    });

    afterEach(() => {
      teardownCalled = true;
    });

    it('should call beforeEach', () => {
      expect(setupCalled).toBe(true);
    });

    it('should call afterEach cleanup', () => {
      expect(setupCalled).toBe(true);
    });
  });

  describe('Mocking and Spies', () => {
    it('should create mock functions', () => {
      const mockFn = vi.fn();
      mockFn('test');
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should spy on function calls', () => {
      const obj = {
        method: vi.fn((x) => x * 2)
      };
      const result = obj.method(5);
      expect(result).toBe(10);
      expect(obj.method).toHaveBeenCalledWith(5);
    });
  });
});
