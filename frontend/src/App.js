// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip } from 'recharts';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [priceRange, setPriceRange] = useState([]);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState('March');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchPriceRange();
    fetchCategories();
  }, [month, page, search]);

  const fetchTransactions = async () => {
    const res = await axios.get(`/api/transactions`, { params: { month, page, search } });
    setTransactions(res.data.transactions);
  };

  const fetchStatistics = async () => {
    const res = await axios.get(`/api/statistics`, { params: { month } });
    setStatistics(res.data);
  };

  const fetchPriceRange = async () => {
    const res = await axios.get(`/api/price-range`, { params: { month } });
    setPriceRange(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get(`/api/categories`, { params: { month } });
    setCategories(res.data);
  };

  return (
    <div>
      <h1>Transaction Dashboard</h1>
      {/* Month Selection */}
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      
      {/* Search Box */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title, description, or price"
      />
      
      {/* Transactions Table */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Date of Sale</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t._id}>
              <td>{t.title}</td>
              <td>{t.description}</td>
              <td>{t.price}</td>
              <td>{t.category}</td>
              <td>{t.dateOfSale}</td>
              <td>{t.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
      <button onClick={() => setPage(page + 1)}>Next</button>

      {/* Statistics */}
      <div>
        <h3>Statistics</h3>
        <p>Total Sales: {statistics.totalAmount}</p>
        <p>Sold Items: {statistics.soldItems}</p>
        <p>Unsold Items: {statistics.unsoldItems}</p>
      </div>

      {/* Price Range Bar Chart */}
      <BarChart width={600} height={300} data={priceRange}>
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>

      {/* Categories Pie Chart */}
      <PieChart width={400} height={400}>
        <Pie
          data={categories}
          cx={200}
          cy={200}
          labelLine={false}
          label={({ name }) => name}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {categories.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0088FE' : '#00C49F'} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default App;
