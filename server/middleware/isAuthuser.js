import { verify_JWTtoken } from "cookie-string-parser";

const isAuthuser = (req, res, next) => {
  try {
    const isAuth = verify_JWTtoken(
      req.cookies.uuid || req.cookies.cuid,
      process.env.USER_SECRET
    );
    if (isAuth) {
      req.userDetails = isAuth;
      next();
    } else return res.status(401).json({ message: "Unauthorized Access" });
  } catch (e) {
    res.cookie("uuid", "", { maxAge: 1 });
    return res.status(401).json({ message: "Unauthorized Access" });
  }
};

export { isAuthuser };
