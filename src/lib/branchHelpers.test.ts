import { describe, expect, it } from 'vitest';
import { isMissingBranchesTableError } from './branchHelpers';

describe('isMissingBranchesTableError', () => {
  it('detects Supabase missing branches table errors', () => {
    expect(
      isMissingBranchesTableError({
        message: "Could not find a table 'public.branches' in the schema cache",
      }),
    ).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isMissingBranchesTableError({ message: 'Permission denied for table branches' })).toBe(false);
  });
});
