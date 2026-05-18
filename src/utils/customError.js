class CustomAPIError extends Error {
  constructor(functionName, message, statusCode, data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.functionName = functionName;
    this.data = data;
  }
}

const errorHandler = (err, req, res, next) => {
  const { statusCode: status, message, data } = err;
  if (err instanceof CustomAPIError) {
    res.status(status).json({ status, message, data });
  } else {
    res.status(status).json(err);
  }
};

module.exports = { CustomAPIError, errorHandler };
