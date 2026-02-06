export const applicationMiddleware = (req, res, next) => {
  req.requestedAt = new Date().toISOString();
  console.log(
    `[${req.requestedAt}] ${req.method} ${req.originalUrl} - ${req.ip || "unknown-ip"}`
  );
  next();
};
