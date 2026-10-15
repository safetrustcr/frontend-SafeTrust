"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { clientEnv } from "@/config/env";

interface Props {
  name: string;
  children: ReactNode;
  fallback?: ReactNode | ((reset: () => void) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `WidgetBoundary [${this.props.name}] error:`,
      error,
      errorInfo,
    );
    if (clientEnv.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          widget: this.props.name,
        },
        extra: { componentStack: errorInfo.componentStack },
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.handleReset);
        }
        return (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
            {this.props.fallback}
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={this.handleReset}>
                Retry
              </Button>
            </div>
          </div>
        );
      }
      return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
          <p className="text-xs font-medium text-destructive mb-1">
            Failed to load {this.props.name}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button size="sm" variant="outline" onClick={this.handleReset}>
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
