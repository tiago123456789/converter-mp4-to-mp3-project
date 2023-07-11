const axios = require("axios")

module.exports = async (req, res, next) => {
    let accessToken = await req.headers.authorization;
    if (!accessToken) {
        return res.sendStatus(401);
    }

    accessToken = accessToken.replace('Bearer ', '');
    if (accessToken.length === 0) {
        return res.sendStatus(401);
    }

    try {
        await axios.get(process.env.URL_AUTH_VALID_TOKEN, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        next();
    } catch (error) {
        error = error?.response?.data;
        return res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal server error",
        });
    }
}