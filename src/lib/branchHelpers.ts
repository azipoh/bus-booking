export const isMissingBranchesTableError = (error: unknown): boolean => {
  const message =
    (error as { message?: string } | null)?.message ||
    (error as { details?: string } | null)?.details ||
    '';

  return /could not find a table|relation .*branches.* does not exist|schema cache/i.test(message);
};
