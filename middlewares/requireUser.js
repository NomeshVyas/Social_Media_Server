const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    if (!req.headers ||
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer")
    ) {
        return res.status(401).send("Authorization is required");
    }
    const accessToken = req.headers.authorization.split(" ")[1];
    
    try {
        const verifiedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY);
        req._id = verifiedToken._id
    } catch (error) {
        return res.status(401).send("invalid authorization access key");
    }

    next();

}