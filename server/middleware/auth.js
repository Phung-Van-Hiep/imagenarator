import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized. Login again.' });
        }

        const token = authHeader.split(' ')[1];
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        if (tokenDecode.id) {
            req.user = { id: tokenDecode.id };
        }
        else {
            return res.json({ success: false, message: "Not Authorized. Login Again" })
        }
        next();
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export default userAuth