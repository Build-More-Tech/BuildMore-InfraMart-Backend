const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
});

// ✅ ROUTES
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rfqRoutes = require('./routes/rfqRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const specsRoutes = require('./routes/specsRoutes');
const feeRoutes = require('./routes/feeRoutes');
const marketingRoutes = require('./routes/marketingRoutes');

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
app.use(helmet());

app.use(cors({
    origin: [
        process.env.ALLOWED_ORIGIN,
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:5173',
        'https://buildmoreinframart.com',
        'https://www.buildmoreinframart.com',
        'https://buildmore-frontend.vercel.app'
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Strip $ and . from user-supplied keys to prevent MongoDB operator injection
app.use(mongoSanitize());

// ==============================
// 🚀 ROUTES
// ==============================
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);     // 🌐 Public product APIs
app.use('/api/categories', categoryRoutes);  // 🗂️ Public category APIs
app.use('/api/admin', adminRoutes);          // 🔐 Admin APIs
app.use('/api/orders', orderRoutes);         // 🛒 Order management
app.use('/api/rfqs', rfqRoutes);             // 📋 RFQ system
app.use('/api/shipments', shipmentRoutes);   // 📦 Logistics/shipment tracking
app.use('/api/compliance', complianceRoutes); // 📋 Compliance documents
app.use('/api/specs', specsRoutes);          // 📄 Technical spec sheets
app.use('/api/fees', feeRoutes);             // 💰 Public fees (Cart/Checkout)
app.use('/api/marketing', marketingRoutes);    // 📢 Banners & Offers

// ==============================
// 🔴 404 HANDLER
// ==============================
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ==============================
// 🔴 GLOBAL ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message || 'Internal server error' });
});

// ==============================
// 🟢 SERVER
// ==============================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
