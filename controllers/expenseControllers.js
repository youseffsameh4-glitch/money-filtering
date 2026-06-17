const catchAsync = require('../utils/catchAsync');
const  prisma = require('../db');

//Transactions
// 1.create a Transaction wether it's an income or expense
const addTransaction = catchAsync(async (req, res, next) => {
    const { amount, type, category, customCategory, date } = req.body;
    const userId = req.user.id;//that came from the protector middleware

    const newTransaction = await prisma.transaction.create({
        data: {
            amount: parseFloat(amount),
            type, //wether income or expense
            category,
            customCategory,
            userId,
            date: date ? new Date(date) : new Date() // ← defaults to now
        }
    });
    res.status(201).json({message: "Transaction added successfully", data:newTransaction});
});

// 2. get my transactions
const getMyTransactions = catchAsync(async (req, res, next) => {
    const transactions = await prisma.transaction.findMany({
        where: {userId: req.user.id },
        orderBy: {date: 'desc'} //order by date in descending order
    });
    res.json({ data: transactions});
});

// 3.delete a Transaction
const deleteTransaction = catchAsync(async (req, res, next) => {
    const {id} = req.params;//id of the transaction that user wanna delete
    const userId = req.user.id;//id of the user that came from the protector middleware

    const deletedTransaction = await prisma.transaction.deleteMany({
        where: {
            id: parseInt(id),
            userId: userId// making sure the person logged in is the one that is deleting the transaction
        }
    });
// this will happen only if the user is trying to delete a transaction that doesn't exist or if he is deleteing other user's transaction.
    if (deletedTransaction.count ===0) {
        return res.status(404).json({message: "Transaction not found!"});
    }
    res.json({message: "Transaction deleted successfully", data: deletedTransaction});
});

// 4. calculate the sum of expenses inside of a period
const getExpenses = catchAsync(async (req, res, next) => {
    let { startDate, endDate } = req.query;
// if the user has provided only a start date then the db will calculate that day's expenses    
if (!endDate) { endDate = startDate;}

if (!startDate) {
return res.status(400).json({message:"please provide a start date"});
}

const dateFilter = {
        gte: new Date(`${startDate}T00:00:00Z`),
        lte: new Date(`${endDate}T23:59:59Z`)
    };

const summary = await prisma.transaction.aggregate({
     _sum: { amount:true},// we ask prisma to calculate the sum of all the expenses
     where: {
        userId: req.user.id,// to make sure the user is signed in we use the Id that came from protector
        type: 'expense',//making sure it is only expenses
        date: dateFilter// making sure the expenses are inside the provided period
        }
});

const breakdown = await prisma.transaction.groupBy({
    by: ['category'],
    _sum:{amount: true },
    where:{
         userId: req.user.id, 
         type: 'expense',
         date: dateFilter
        },
         

     orderBy: {
            _sum: {
                amount: 'desc'
            }
        }
    
});

 res.json({
        status: 'success',
        data: {
            totalAmount: summary._sum.amount || 0,
            breakdown: breakdown.map(function(b) {
                return { category: b.category, amount: b._sum.amount || 0 };
            })
        }
    });
});

module.exports = {
    addTransaction,
    getMyTransactions,
    deleteTransaction,
    getExpenses
};

