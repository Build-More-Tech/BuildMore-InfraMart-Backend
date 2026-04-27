const { getUser } = require("./auth")

function isAuthorized(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).json({ err: "No authorization token" })
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).json({ err: "Not Authorized ", message: "No token available" })
    }
    const user = getUser(token)
    if (!user) {
        return res.status(401).json({ err: "Not Authorized", message: "No invalid token" })
    }
    req.user = user
    next()
}

function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ err: "Not Authorized", message: "Authentication required" });
    }
    const role = req.user.role;
    if (!role || role.toLowerCase() !== 'admin') {
        return res.status(403).json({ err: "Not Authorized", message: "No admin access" });
    }
    next();
}

module.exports = { isAdmin, isAuthorized }