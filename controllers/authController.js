const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signupController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("All fields are required");
        }

        //// checking the email is already registered or not.
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).send("Sorry, a user with this email is already registered");
        }

        //// saving user credentials with encrypted password
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashPassword
        })

        res.status(201).send(newUser);

    } catch (error) {
        console.log("error in signupController");
    }
}

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("All fields are required.");
        }

        //// checking the email is registered or not.
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User is not registered.");
        }

        //// comparing the password
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            return res.status(401).send("Incorrect Password");
        }

        //// generating authToken for user
        const authToken = generateAccessToken({
            _id: user._id,
        });
        //// generating authToken for user
        const refreshToken = generateRefreshToken({
            _id: user._id,
        });
        res.send({ authToken, refreshToken });
    } catch (error) {
        console.log("error in loginController");
    }
}

//// here we check the refreshToken's validity and if it's expire then generate another one
const refreshAccessTokenConteroller = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send("RefreshToken is required");
    }

    try {
        const verifiedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_PRIVATE_KEY);

        const _id = verifiedToken._id;
        const accessToken = generateAccessToken({ _id });

        return res.status(201).json({ accessToken })
    } catch (error) {
        return res.status(401).send("invalid authorization refresh key");
    }
}

//// internal functions
const generateAccessToken = (credential) => {
    const token = jwt.sign(credential, process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY, {
        expiresIn: "60m"
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
    refreshAccessTokenConteroller
}