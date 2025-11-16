// types/database-errors.ts
export type PostgresError = {
  length: number;
  severity: string;
  code: string;
  detail?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
  file?: string;
  line?: string;
  routine?: string;
};

export type DrizzleError = Error & {
  query?: string;
  params?: unknown[];
  cause?: PostgresError;
};

export function isDrizzleError(error: unknown): error is DrizzleError {
  return (
    error instanceof Error &&
    "cause" in error &&
    typeof error.cause === "object" &&
    error.cause !== null
  );
}

export function isForeignKeyError(
  error: unknown
): error is DrizzleError & { cause: PostgresError } {
  if (!isDrizzleError(error)) return false;

  const cause = error.cause as PostgresError;
  return cause?.code === "23503";
}
