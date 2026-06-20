/**
 * Reusable error state for data-fetching pages. Shows a message and a retry button.
 */
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}
const QueryError = ({ message, onRetry }: QueryErrorProps) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
      <AlertCircle className="h-7 w-7 text-destructive" />
    </div>
    <div>
      <p className="font-heading text-lg font-semibold text-foreground">Failed to load data</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {message || 'Something went wrong while fetching. Please try again.'}
      </p>
    </div>
    {onRetry && (
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RotateCcw className="h-4 w-4" /> Retry
      </Button>
    )}
  </div>
);
export default QueryError;