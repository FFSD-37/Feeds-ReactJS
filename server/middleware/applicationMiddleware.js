import fs from "fs";

export const applicationMiddleware = (req, res, next) => {
    let data = req.userDetails?.data || ["unknown_user"];
    console.log(req.userDetails);
    const logFilePath = `./responses/${data[0] || "unknown_user"}.log`;
    // console.log(logFilePath);
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    next();
};