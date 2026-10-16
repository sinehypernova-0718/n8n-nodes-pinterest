import type { IDataObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

/**
 * Execution context used to associate a mapped error with the input item that
 * produced it. Values are only applied when the incoming error does not already
 * carry them.
 */
export interface PinterestApiErrorContext {
	itemIndex?: number;
	runIndex?: number;
}

type MappedPinterestError = NodeApiError | NodeOperationError;

/**
 * Transport-level codes that axios (used by n8n's authenticated request helper)
 * attaches to an error when no HTTP response could be obtained. n8n's
 * `NodeApiError` constructor derives `httpCode` from the wrapped error's `code`,
 * so for these failures the transport code ends up in `httpCode`. They describe
 * a network failure and are never a valid HTTP status, so they are removed from
 * `httpCode` and kept as diagnostic metadata instead.
 *
 * The list is intentionally limited to explicitly supported transport codes;
 * anything else (including non-HTTP axios configuration codes such as
 * `ERR_INVALID_URL`) is left untouched.
 */
const TRANSPORT_ERROR_CODES = new Set([
	'ECONNREFUSED',
	'ECONNRESET',
	'ENOTFOUND',
	'ETIMEDOUT',
	'EHOSTUNREACH',
	'EAI_AGAIN',
	'ECONNABORTED',
	'ERR_NETWORK',
]);

/**
 * Returns true when the value is a plain, non-array data object, i.e. a shape
 * that `context.network` metadata can be safely read from and written to.
 */
function isDataObject(value: unknown): value is IDataObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Repairs a `NodeApiError` produced upstream by n8n's HTTP helper whose
 * `httpCode` holds a transport error code instead of an HTTP status (for
 * example `ECONNREFUSED` for a refused connection).
 *
 * The instance is mutated in place so its identity, HTTP status (when
 * legitimate), message, description, response data and context are preserved.
 * Only a recognised transport code is removed from `httpCode`; any other value,
 * including a real HTTP status, is left untouched.
 *
 * The transport code is retained as diagnostic metadata on `context.network`.
 * Existing metadata is never overwritten: `code` is only added when that slot
 * is absent, and an incompatible `context.network` value is left as-is. When
 * the metadata cannot be stored (for example because the object is frozen), the
 * code is dropped rather than replaced by a speculative property, and - because
 * mutating an error must never mask the original failure - the failure to
 * store the diagnostic is swallowed. `context.network.code` is this project's
 * only transport-diagnostic slot; no second slot is introduced because neither
 * the installed runtime nor an existing convention defines one.
 */
function sanitizeNodeApiError(error: NodeApiError): NodeApiError {
	const httpCode = error.httpCode;

	if (typeof httpCode !== 'string' || !TRANSPORT_ERROR_CODES.has(httpCode)) {
		return error;
	}

	// A transport code is never a valid HTTP status, so always clear it first.
	// If even this cannot be written (a frozen error), keep the original error
	// rather than replacing it with a mutation error.
	try {
		error.httpCode = null;
	} catch {
		// Non-writable `httpCode`: leave the error untouched.
		return error;
	}

	try {
		const network = error.context.network;

		if (network === undefined) {
			error.context.network = { code: httpCode };
		} else if (isDataObject(network) && network.code === undefined) {
			network.code = httpCode;
		}
	} catch {
		// Context metadata is not writable; retain the mapped error and accept
		// that the diagnostic code could not be stored.
	}

	return error;
}

/**
 * Maps an error thrown by `httpRequestWithAuthentication()` into an n8n error.
 *
 * n8n's authenticated request helper already wraps request failures in a
 * `NodeApiError` before they reach the node, so the default behaviour is to
 * preserve that instance rather than build a replacement:
 *
 * - An existing `NodeApiError` is returned unchanged, except that a transport
 *   code incorrectly stored in `httpCode` is moved to `context.network`, and a
 *   missing `itemIndex`/`runIndex` is filled in from the execution context.
 * - An existing `NodeOperationError` (for example a locally detected validation
 *   failure) is returned unchanged and is never reclassified as an API failure.
 * - Any other value is propagated unchanged so unexpected programming errors are
 *   not disguised as Pinterest API failures.
 */
export function mapPinterestApiError(
	error: unknown,
	context: PinterestApiErrorContext = {},
): MappedPinterestError {
	if (error instanceof NodeApiError) {
		const sanitized = sanitizeNodeApiError(error);

		try {
			if (context.itemIndex !== undefined && sanitized.context.itemIndex === undefined) {
				sanitized.context.itemIndex = context.itemIndex;
			}
			if (context.runIndex !== undefined && sanitized.context.runIndex === undefined) {
				sanitized.context.runIndex = context.runIndex;
			}
		} catch {
			// Execution metadata is not writable; keep the mapped error rather than
			// replacing it with a mutation error.
		}

		return sanitized;
	}

	if (error instanceof NodeOperationError) {
		return error;
	}

	throw error;
}
