const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authMiddleware');
const validate = require('../middleware/validate');
const { userSchema, loginSchema, updateSchema, changePasswordSchema } = require('../routes/validationSchema');
const userController = require('../controllers/userControllers');


router.post('/signup', validate(userSchema), userController.signup); //signup
router.post('/login', validate(loginSchema),userController.login); //login

//وبكده اي راوت بعد السطر ده هيعدي على protectالاول
router.use(protect);

router.patch('/:identifier/change-password', validate(changePasswordSchema),userController.changePassword); //change a user's password

router.route('/')
.get(userController.getAllUsers); //fitch all users

router.route('/:id')
.put(validate(updateSchema),userController.updateUser) //update a user
.delete(userController.deleteUser); //delete a user

// Export the router to be used in server.js

module.exports = router;