const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

// ✅ ROUTES (consistent lowercase naming)
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');


const app = express();

// ==============================
// 🌍 ENV
// ==============================
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

// ==============================
// 🛢️ DB CONNECTION
// ==============================
if (!MONGO_URI) {
    console.error("❌ MONGO_URI missing in .env");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => {
        console.error("❌ MongoDB error:", err);
        process.exit(1);
    });

// ==============================
// 🔧 MIDDLEWARE
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// 🚀 ROUTES
// ==============================
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes); // 🌐 Public APIs
app.use('/api/admin', adminRoutes);      // 🔐 Admin APIs
app.use('/api/orders', orderRoutes);     // Order APIs

// ==============================
// 🟢 SERVER
// ==============================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});