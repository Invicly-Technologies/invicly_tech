import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Neon HTTP client. Dates are selected as ::text and numerics as ::float8 so rows hold plain strings/numbers.
 * The placeholder URL only exists so builds without DATABASE_URL succeed; any query would then fail loudly.
 */
export const sql = neon(process.env.DATABASE_URL || "postgresql://unset:unset@unset.invalid/unset");
