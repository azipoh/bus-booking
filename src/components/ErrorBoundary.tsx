/**
 * App-wide error boundary. Catches render-time errors anywhere in the tree
 * and shows a friendly fallback instead of a blank white screen.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log for debugging; in production this could report to a monitoring service.
    console.error('ErrorBoundary caught an error:', error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              An unexpected error occurred. You can try again or reload the page.
            </p>
          </div>
          {this.state.error?.message && (
            <pre className="max-w-md overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={this.handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Reload page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
