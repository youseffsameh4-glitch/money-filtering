const Joi = require('joi');

const expenseSchema = Joi.object({
    amount: Joi.number().positive().required(),//the amount has to be positive number
    type: Joi.string().min(3).max(50).required(),//the title has to be not less that 3 letters
     category: Joi.string().optional(),
    customCategory: Joi.string().optional().allow(null, ''),
    date: Joi.date().iso().optional()//the date has to be a valid date
});

// داخل routes/validationSchema.js أضف هذا:
const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateSchema = Joi.object({
  name: Joi.string().min(3).optional(), // اختياري في التحديث
  email: Joi.string().email().optional()   // اختياري في التحديث
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

module.exports = {
   expenseSchema,
    userSchema,
   loginSchema,
    updateSchema,
    changePasswordSchema
  }; // تصدير الاثنين معاً
