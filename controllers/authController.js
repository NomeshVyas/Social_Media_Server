const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.send(error(400, "All fields are required"));
        }

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.send(error(409, "Sorry, a user with this email is already registered"));
        }

        //// saving user credentials with encrypted password
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashPassword
        })
        //// generating authToken for user
        const authToken = generateAccessToken({
            _id: user._id,
        });
        //// generating refreshToken for user
        const refreshToken = generateRefreshToken({
            _id: user._id,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true
        })

        return res.send(success(201, { message: "user created successfully", authToken }));

    } catch (err) {
        console.log(error(500, err.message));
    }
}

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.send(error(400, "All fields are required."));
        }

        //// checking the email is registered or not.
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.send(error(404, "User is not registered."));
        }

        //// comparing the password
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            return res.send(error(401, "Incorrect Password"))
        }

        //// generating authToken for user
        const authToken = generateAccessToken({
            _id: user._id,
        });
        //// generating refreshToken for user
        const refreshToken = generateRefreshToken({
            _id: user._id,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true
        })
        return res.send(success(200, { authToken }));
    } catch (err) {
        console.log(error(500, err.message));
    }
}

const logOutController = (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        })

        return res.send(success(200, 'User logged out'))

    } catch (err) {
        res.send(error(500, err.message))
    }
}

//// here we check the refreshToken's validity and if it's expire then generate another one
const refreshAccessTokenConteroller = (req, res) => {
    const cookies = req.cookies;
    if (!cookies.refreshToken) {
        return res.send(error(401, "RefreshToken in cookie is required."));
    }

    const refreshToken = cookies.refreshToken;
    try {
        const verifiedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY);

        const _id = verifiedToken._id;
        const authToken = generateAccessToken({ _id });

        return res.send(success(201, { authToken }));
    } catch (err) {
        console.log(error(500, err.message));
    }
}

//// internal functions
const generateAccessToken = (credential) => {
    const token = jwt.sign(credential, process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY, {
        expiresIn: "1d"
    });
    return token;
}
const generateRefreshToken = (credential) => {
    const token = jwt.sign(credential, process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY, {
        expiresIn: "1y"
    });
    return token;
}

module.exports = {
    signupController,
    loginController,
    logOutController,
    refreshAccessTokenConteroller
}