import fs from "fs";

export const applicationMiddleware = (req, res, next) => {
    //create a separate file for wach user and whenever a user is making a request , it will create or append to that file with the request details and timestamp. This will help us to track the user activity and also to debug the issues.
    let data = req.userDetails?.data || ["unknown_user"];
    console.log(req.userDetails);
    const logFilePath = `./responses/${data[0] || "unknown_user"}.log`;
    // console.log(logFilePath);
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.originalUrl}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    next();
};