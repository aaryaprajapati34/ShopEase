const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access Denied. No Token Provided"
        });
    }

    // Expected format:
    // Authorization: Bearer TOKEN

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            message: "Invalid Authorization Format"
        });
    }

    const token = parts[1];

    try {

        const decoded = jwt.verify(token, "mySecretKey");

        req.user = decoded;

        next();

    } catch (err) {

        console.log("JWT ERROR:", err.message);

        return res.status(401).json({
            message: "Invalid Token"
        });

    }
}

module.exports = verifyToken;