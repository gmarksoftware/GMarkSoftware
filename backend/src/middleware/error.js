export const globalErrorHandler = (err, req, res, next) => {
  console.error('[API Error]', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : err.name || 'Error',
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
