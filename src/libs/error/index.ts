import ErrorCode from '@libs/error/interfaces/enums';

/**
 * Represents a specific type of error with an associated error code.
 * Extends the built-in Error class to provide additional context through the error code property.
 */
export default class KnownError extends Error {
  public readonly code: ErrorCode;

  /**
   * Constructs a new instance of the class with the specified error code and optional message.
   * @param {ErrorCode} code - The specific error code associated with the error.
   * @param {string} [message] - An optional detailed message describing the error.
   */
  constructor(code: ErrorCode, message?: string) {
    super(message);
    this.code = code;
  }
}
