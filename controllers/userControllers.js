const catchAsync = require('../utils/catchAsync');
const  prisma = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//-----------------------------------------------------------------------------

// 1. get all the users from the db
const getAllUsers = catchAsync(async (req, res, next) => {
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    res.json({ message: "hello from secure route", data: allUsers });
  });

// 2. create a new user and add them to the db
const signup = catchAsync(async (req, res, next) => {
  const { email, name, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "يرجى ملء جميع الحقول المطلوبة" });
}
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    });
    delete newUser.password;
    res.json({ message: "user created successfully", user: newUser });
});


// 3. update basic user info (put)
const updateUser = catchAsync(async (req, res, next) => {
  const  userId  = req.user.id;
  const { email, name } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email, name }
    });
    res.json({ message: "user updated successfully", user: updatedUser });
});

// 4. change user password with validation (patch)
const changePassword = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;
  const { oldPassword, newPassword } = req.body;


  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "please provide old and new password" });
  }

    const user = await prisma.user.findUnique({
      where: { email: identifier }
    });

    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "wrong password!" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
   await prisma.user.update({
      where: { email: identifier },
      data: { password: hashedNewPassword }
    });

    // // delete sensitive data from memory immediately
  delete req.body.oldPassword;
  delete req.body.newPassword;

    res.json({ message: "password changed successfully" });
});

// 5. delete a user from the db
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "user deleted successfully", user: deletedUser });
});


//6. login user and send JWT token
const login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;
  //make sure that the user has provided email, password

  if(!email || !password) {
    return res.status(400).json({message: "برجاء كتابة البريد الالكتروني والباسورد معاً!"});
  }

  //check if the user exists on our db
  const user = await prisma.user.findUnique({
    where: {email}
  });

  if(!user) {
    return res.status(401).json({message: "البريد الالكتروني او الباسرود غير صحيح"});
  }

  // and like we did in changing pass we compare the pass he provided with the one we already have in the db hashed
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({message: "البريد الالكتروني او الباسرود غير صحيح"});
  }

  // if the user is authenticated we create a JWT token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "90d"
  });

  //return the token to the user with his primary data
  delete user.password; // so the pass doesn't appear to the user
  res.json({message: "تم تسجيل الدخول بنجاح", token, user});
  });


//btw this is a free server and i made a tunnel from my labtop so the only way to see the website i have to open the labtob and server if u want to inform me other than that u can check the physical code on github.



// Export the module to make functions accessible in other files

module.exports = {
  getAllUsers,
  signup,
  updateUser,
  changePassword,
  deleteUser,
  login
};

