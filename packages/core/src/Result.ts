export class Result<T, E> {
  public isSuccess: boolean;
  private value?: T;
  private error?: E;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    this.isSuccess = isSuccess;
    this.error = error;
    this.value = value;
  }

  public static ok<T, E>(value?: T): Result<T, E> {
    return new Result<T, E>(true, undefined, value);
  }

  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, error);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Cannot get the value of a failed result.");
    }
    return this.value as T;
  }

  public getErrorValue(): E {
    if (this.isSuccess) {
      throw new Error("Cannot get the error of a successful result.");
    }
    return this.error as E;
  }
}
