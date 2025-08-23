import React from "react";
import { useErrorV2 } from "./ErrorProvider";

class InnerBoundary extends React.Component<React.PropsWithChildren<{ onError: (msg: string) => void }>, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children as React.ReactElement;
  }
}

export const ErrorBoundaryV2: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { pushError } = useErrorV2();
  return (
    <InnerBoundary onError={(msg) => pushError({ message: msg })}>
      {children}
    </InnerBoundary>
  );
};


