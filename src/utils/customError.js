class CustomAPIError extends Error {
  constructor(functionName, message, statusCode, data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.functionName = functionName;
    this.data = data;
  }
}

module.exports = { CustomAPIError };
