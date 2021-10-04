const jwt = require("jsonwebtoken");
const User = require('../models/user');

const jwtMiddleware = async (ctx, next) => {
    const token = ctx.cookies.get("access_token");
    if(!token) {
        return next();
    }

    try {
        // eslint-disable-next-line no-undef
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ctx.state.user = {
            _id : decoded._id,
            userId : decoded.userId
        };
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp - now < 60 * 60 * 24 * 7) {
            const user = await User.findByUserId(decoded._id);
            const token = user.generateToken();

            ctx.cookies.set('access_token', token, {
                httpOnly : true,
                maxAge : 1000 * 60 * 60 * 24 * 30
            })
        }

    } catch(e) {
        ctx.state.user = null;
    }

    return next();

};

module.exports = jwtMiddleware;
