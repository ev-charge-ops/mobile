import { Component, type ErrorInfo, type ReactNode } from 'react';

export type MapErrorBoundaryProps = {
  children: ReactNode;
  onError: (error: Error) => void;
};

type MapErrorBoundaryState = {
  hasError: boolean;
};

export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
