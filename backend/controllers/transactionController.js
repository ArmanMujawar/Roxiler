// controllers/transactionController.js
const axios = require('axios');
const Transaction = require('../models/Transaction');

// Seed database by fetching data from third-party API
exports.seedDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Clear existing records and insert new ones
    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);
    
    res.status(200).json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions with pagination and search
exports.getTransactions = async (req, res) => {
  const { month, page = 1, per_page = 10, search = '' } = req.query;

  try {
    const searchQuery = {
      dateOfSale: { $regex: new RegExp(month, 'i') },
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } }
      ]
    };

    const transactions = await Transaction.find(searchQuery)
      .skip((page - 1) * per_page)
      .limit(parseInt(per_page));

    const total = await Transaction.countDocuments(searchQuery);

    res.status(200).json({ transactions, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get statistics for selected month
exports.getStatistics = async (req, res) => {
  const { month } = req.query;
  try {
    const stats = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: month, $options: 'i' } } },
      { $group: { _id: null, totalAmount: { $sum: "$price" }, soldItems: { $sum: { $cond: ["$sold", 1, 0] } }, unsoldItems: { $sum: { $cond: ["$sold", 0, 1] } } } }
    ]);

    res.status(200).json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get price range data for bar chart
exports.getPriceRange = async (req, res) => {
  const { month } = req.query;
  try {
    const priceRanges = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: month, $options: 'i' } } },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: "901+",
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.status(200).json(priceRanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category distribution for pie chart
exports.getCategories = async (req, res) => {
  const { month } = req.query;
  try {
    const categories = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: month, $options: 'i' } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Combine all APIs data
exports.getCombinedData = async (req, res) => {
  try {
    const statistics = await exports.getStatistics(req, res);
    const priceRange = await exports.getPriceRange(req, res);
    const categories = await exports.getCategories(req, res);

    res.status(200).json({ statistics, priceRange, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
