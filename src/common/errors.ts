class LoadingError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'LoadingError';
    this.cause = cause;
  }
}

export { LoadingError };
