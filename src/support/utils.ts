export const awaiter = <T>(
  promise: () => Promise<T>,
  {
    successCallback,
    failureCallback,
  }: {
    successCallback?: (result: T) => unknown | undefined | null;
    failureCallback?: (e: Error) => unknown | undefined | null;
  } = {},
) => {
  promise().then(successCallback).catch(failureCallback);
};
