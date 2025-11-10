// Success response
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

// Error response
exports.errorResponse = (res, message = 'Error', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: {
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

// Paginated response
exports.paginatedResponse = (res, data, pagination, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
    message
  });
};