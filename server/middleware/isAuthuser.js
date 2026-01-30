import { verify_JWTtoken } from "cookie-string-parser";

const isAuthuser = (req, res, next) => {
  try {
    const tokenResult = verify_JWTtoken(
      req.cookies.uuid || req.cookies.cuid,
      process.env.USER_SECRET
    );
    if (tokenResult && tokenResult.data) {
      // Keep data structure as-is for compatibility with controllers
      // data structure: [username, email/identifier, image/url, role, isActive]
      req.userDetails = tokenResult;
      next();
    } else return res.status(401).json({ message: "Unauthorized Access" });
  } catch (e) {
    res.cookie("uuid", "", { maxAge: 1 });
    return res.status(401).json({ message: "Unauthorized Access" });
  }
};

export { isAuthuser };
