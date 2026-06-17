const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
    const prisma = require('../db');

const protect = catchAsync(async (req, res, next) => {
    

    let token;

    // 3) الحصول على التوكين
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'You are not logged in! Please log in to get access.' });
    }

    // 4) Verification
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("data after decoding", decoded);

        // 5) التحقق من وجود المستخدم
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!currentUser) {
            return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
        }

        // 6) حذف كلمة السر من الكائن قبل تمريره
        delete currentUser.password;

        // 7) منح الوصول
        req.user = currentUser;
        next();
    } catch (error) {
        console.log("jwt error", error.message);
        return res.status(401).json({ message: 'your token is not valid!' });
    }
});

module.exports = { protect };