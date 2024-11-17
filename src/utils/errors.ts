export class AuthorizationError extends Error {
  static {
    this.prototype.name = 'AuthorizationError';
  }
}

export class InvalidStateError extends Error {
  static {
    this.prototype.name = 'InvalidStateError';
  }
}

export class UndefinedStorageItemError extends Error {
  static {
    this.prototype.name = 'UndefinedStorageItemError';
  }
}

export class UnexpectedError extends Error {
  static {
    this.prototype.name = 'UnexpectedError';
  }
}
