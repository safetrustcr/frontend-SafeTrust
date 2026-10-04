import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { useInView } from "./useInView";

describe("useInView", () => {
  let observerCallback: IntersectionObserverCallback;
  let disconnect: jest.Mock;
  let observe: jest.Mock;
  let originalObserver: typeof IntersectionObserver;

  function ObservedContent({
    onChange,
  }: {
    onChange: (isInView: boolean) => void;
  }) {
    const { ref, isInView } = useInView<HTMLDivElement>();

    useEffect(() => onChange(isInView), [isInView, onChange]);

    return <div ref={ref}>{isInView ? "visible" : "skeleton"}</div>;
  }

  beforeEach(() => {
    originalObserver = global.IntersectionObserver;
    disconnect = jest.fn();
    observe = jest.fn();
    global.IntersectionObserver = jest.fn(
      (callback: IntersectionObserverCallback) => {
        observerCallback = callback;
        return {
          observe,
          unobserve: jest.fn(),
          disconnect,
          takeRecords: jest.fn(),
          root: null,
          rootMargin: "0px",
          thresholds: [0],
        };
      },
    ) as unknown as typeof IntersectionObserver;
  });

  it("stays out of view until the element intersects, then disconnects", () => {
    const onChange = jest.fn();
    const { container } = render(<ObservedContent onChange={onChange} />);

    expect(screen.getByText("skeleton")).toBeInTheDocument();
    expect(observe).toHaveBeenCalledWith(container.firstChild);

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByText("visible")).toBeInTheDocument();
    expect(disconnect).toHaveBeenCalled();
  });

  it("renders content when IntersectionObserver is unavailable", () => {
    Object.defineProperty(global, "IntersectionObserver", {
      configurable: true,
      value: undefined,
    });
    render(<ObservedContent onChange={jest.fn()} />);

    expect(screen.getByText("visible")).toBeInTheDocument();
    global.IntersectionObserver = originalObserver;
  });

  afterEach(() => {
    global.IntersectionObserver = originalObserver;
  });
});
