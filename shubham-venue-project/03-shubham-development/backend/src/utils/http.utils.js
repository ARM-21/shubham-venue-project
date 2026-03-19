export function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
export function success(res, data = {}, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ message, ...data });
}