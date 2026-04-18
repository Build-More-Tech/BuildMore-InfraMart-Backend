const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
require('dotenv').config({ path: envFile });

// ✅ ROUTES
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rfqRoutes = require('./routes/rfqRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const specsRoutes = require('./routes/specsRoutes');

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
app.use('/api/products', productRoutes);     // 🌐 Public product APIs
app.use('/api/admin', adminRoutes);          // 🔐 Admin product APIs
app.use('/api/orders', orderRoutes);         // 🛒 Order management
app.use('/api/rfqs', rfqRoutes);             // 📋 RFQ system
app.use('/api/shipments', shipmentRoutes);   // 📦 Logistics/shipment tracking
app.use('/api/compliance', complianceRoutes); // 📋 Compliance documents
app.use('/api/specs', specsRoutes);          // 📄 Technical spec sheets

// ==============================
// 🟢 SERVER
// ==============================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});