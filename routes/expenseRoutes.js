const express = require('express');
const router = express.Router();
const {protect} = require('../controllers/authMiddleware');
const validate = require('../middleware/validate');
const { expenseSchema } = require('../routes/validationSchema');
const expenseController = require('../controllers/expenseControllers');

//any route that comes later will be protected
router.use(protect);

router.get('/summary', expenseController.getExpenses);

router.route('/')
.post(validate(expenseSchema),expenseController.addTransaction)
.get(expenseController.getMyTransactions);

router.route('/:id')
.delete(expenseController.deleteTransaction);

module.exports = router;