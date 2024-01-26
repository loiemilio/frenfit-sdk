export class FrenfitException extends Error {
  constructor(
    message: string,
    protected innerError?: Error,
    public details?: Record<string, number | object | string>,
  ) {
    super(message);
  }
}

export class FrenfitClientException extends FrenfitException {
  constructor(
    public request: RequestInfo | URL,
    public error: Error,
  ) {
    super(`It was not possible to send a request to Fenfit's servers`, error);
  }
}

export class FrenfitServerException extends FrenfitException {
  constructor(public response: Response) {
    super("An error occurred on Frenfit's servers");
  }
}

export class InvalidCredentialsException extends FrenfitException {
  constructor(message?: string, innerError?: Error) {
    super(message || 'Invalid credentials', innerError);
  }
}

export class NotImplementedException extends FrenfitException {
  constructor(message = 'Not implemented yet') {
    super(message);
  }
}

export class UnexpectedResponseException extends FrenfitException {
  constructor(
    public response: Response,
    public details: Record<string, number | object | string>,
  ) {
    super("Frenfit's servers returned an unexpected response", undefined, details);
  }
}
