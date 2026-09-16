export const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    code,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
