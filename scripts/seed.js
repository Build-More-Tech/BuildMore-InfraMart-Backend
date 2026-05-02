/**
 * Seed Script — BuildMore InfraMart Backend
 * Run: node scripts/seed.js
 *
 * Clears and re-populates all collections:
 *   users, products, orders, rfqs, shipments, compliancedocs, specsheets
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const User           = require('../models/userModel');
const Category       = require('../models/CategoryModel');
const Product        = require('../models/ProductModel');
const Order          = require('../models/OrderModel');
const RFQ            = require('../models/RFQModel');
const Shipment       = require('../models/ShipmentModel');
const ComplianceDoc  = require('../models/ComplianceDocModel');
const SpecSheet      = require('../models/SpecSheetModel');
const Banner         = require('../models/BannerModel');
const Offer          = require('../models/OfferModel');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function daysFromNow(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}

// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────

async function buildUsers() {
    const hash = (pw) => bcrypt.hash(pw, 10);

    return [
        {
            name: 'Admin User',
            email: 'admin@inframart.com',
            password: await hash('Admin@1234'),
            role: 'ADMIN',
            phone: '9876543210',
            address: [
                {
                    building: 'HQ Tower, Floor 5',
                    area: 'Bandra Kurla Complex',
                    landmark: 'Near HDFC Bank',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400051',
                    country: 'India',
                    alternatephone: '9876543211',
                }
            ]
        },
        {
            name: 'Rajesh Sharma',
            email: 'rajesh.sharma@buildcorp.in',
            password: await hash('User@1234'),
            role: 'USER',
            phone: '9812345670',
            address: [
                {
                    building: 'Plot 12, Sector 18',
                    area: 'Noida Sector 18',
                    landmark: 'Near Atta Market',
                    city: 'Noida',
                    state: 'Uttar Pradesh',
                    pincode: '201301',
                    country: 'India',
                }
            ]
        },
        {
            name: 'Priya Nair',
            email: 'priya.nair@infralogix.com',
            password: await hash('User@1234'),
            role: 'USER',
            phone: '9945678901',
            address: [
                {
                    building: 'Technopark Phase 2',
                    area: 'Technopark',
                    landmark: 'Near Leela Hotel',
                    city: 'Thiruvananthapuram',
                    state: 'Kerala',
                    pincode: '695581',
                    country: 'India',
                }
            ]
        },
        {
            name: 'Arjun Mehta',
            email: 'arjun.mehta@constructpro.co',
            password: await hash('User@1234'),
            role: 'USER',
            phone: '9023456789',
            address: [
                {
                    building: 'Fortune Business Hub',
                    area: 'Science City Road',
                    landmark: 'Opposite Science City',
                    city: 'Ahmedabad',
                    state: 'Gujarat',
                    pincode: '380060',
                    country: 'India',
                }
            ]
        },
    ];
}

const PRODUCTS = [
    {
        productName: 'TMT Steel Bar Fe500 (12mm)',
        desc: 'High-strength thermo-mechanically treated steel bar used in RCC construction. Offers superior ductility and weldability.',
        category: 'Steel & Metals',
        subcategory: 'TMT Bars',
        price: 6200,
        originalPrice: 6800,
        productImages: [
            'https://res.cloudinary.com/inframart/image/upload/v1/products/tmt-12mm-1.jpg',
            'https://res.cloudinary.com/inframart/image/upload/v1/products/tmt-12mm-2.jpg',
        ],
        materialSpecifications: 'Grade: Fe500D | Length: 12m | Weight: 8.86 kg/m | BIS: IS 1786:2008',
        stock: 2500,
        availability: true,
        tier: 'Bulk Distribution',
        bulkInfo: 'Minimum order: 10 MT. Bundle pricing available above 50 MT.',
        rating: 4.6,
        reviews: 134,
    },
    {
        productName: 'OPC 53 Grade Cement (50 kg bag)',
        desc: 'Ordinary Portland Cement ideal for high-strength concrete structures, bridges, and industrial flooring.',
        category: 'Cement & Concrete',
        subcategory: 'OPC Cement',
        price: 380,
        originalPrice: 420,
        productImages: [
            'https://res.cloudinary.com/inframart/image/upload/v1/products/opc53-1.jpg',
        ],
        materialSpecifications: 'Grade: 53 | Standard: IS 12269 | Initial Set: 30 min | Final Set: 600 min',
        stock: 8000,
        availability: true,
        tier: 'Standard Export',
        bulkInfo: 'Pallet orders (50 bags/pallet) attract 3% discount.',
        rating: 4.4,
        reviews: 210,
    },
    {
        productName: 'HDPE Pipe 110mm PN10',
        desc: 'High-density polyethylene pipe suitable for water supply, drainage, and industrial fluid transfer.',
        category: 'Pipes & Fittings',
        subcategory: 'HDPE Pipes',
        price: 1850,
        originalPrice: 2100,
        productImages: [
            'https://res.cloudinary.com/inframart/image/upload/v1/products/hdpe-pipe-1.jpg',
            'https://res.cloudinary.com/inframart/image/upload/v1/products/hdpe-pipe-2.jpg',
        ],
        materialSpecifications: 'OD: 110mm | Wall thickness: 10mm | Pressure: PN10 | Standard: IS 4984',
        stock: 600,
        availability: true,
        tier: 'LTL Freight Only',
        bulkInfo: 'Available in 6m and 12m lengths. Full container load (FCL) pricing on request.',
        rating: 4.3,
        reviews: 87,
    },
    {
        productName: 'Structural Steel I-Beam ISMB 250',
        desc: 'Indian Standard Medium Weight Beam used in structural steel frameworks, bridges, and industrial sheds.',
        category: 'Steel & Metals',
        subcategory: 'Structural Sections',
        price: 74000,
        originalPrice: 78500,
        productImages: [
            'https://res.cloudinary.com/inframart/image/upload/v1/products/ismb250-1.jpg',
        ],
        materialSpecifications: 'Section: ISMB 250 | Depth: 250mm | Flange: 125mm | Web thickness: 6.9mm | Per MT price',
        stock: 180,
        availability: true,
        tier: 'Custom Fab',
        bulkInfo: 'Custom cutting and fabrication available. Minimum order: 5 MT.',
        rating: 4.7,
        reviews: 56,
    },
    {
        productName: 'Waterproofing Membrane (SBS Modified)',
        desc: 'Styrene-Butadiene-Styrene modified bituminous waterproofing membrane for roofs, basements, and tunnels.',
        category: 'Waterproofing',
        subcategory: 'Bituminous Membranes',
        price: 2800,
        originalPrice: 3200,
        productImages: [
            'https://res.cloudinary.com/inframart/image/upload/v1/products/sbs-membrane-1.jpg',
            'https://res.cloudinary.com/inframart/image/upload/v1/products/sbs-membrane-2.jpg',
        ],
        materialSpecifications: 'Thickness: 4mm | Width: 1m | Roll length: 10m | Tensile: >600 N/50mm | IS 16098',
        stock: 450,
        availability: true,
        tier: 'Standard Export',
        bulkInfo: 'Pallet of 20 rolls. Special pricing for 100+ rolls.',
        rating: 4.5,
        reviews: 43,
    },
    {
        productName: 'AAC Block 600x200x150mm',
        desc: 'Autoclaved Aerated Concrete blocks offering excellent thermal insulation and lightweight construction.',
        category: 'Masonry & Blocks',
        subcategory: 'AAC Blocks',
        price: 42,
        originalPrice: 48,
        productImages: [
            'https://res.cloudinary.com/inframart/image/upload/v1/products/aac-block-1.jpg',
        ],
        materialSpecifications: 'Size: 600x200x150mm | Density: 550-650 kg/m³ | Compressive: 3.5 N/mm² | IS 2185 Part 3',
        stock: 15000,
        availability: true,
        tier: 'Bulk Distribution',
        bulkInfo: 'Pallet: 80 blocks. Truck load: ~2400 blocks.',
        rating: 4.2,
        reviews: 318,
    },
    {
        productName: 'Stainless Steel Pipe 304 (2 inch SCH40)',
        desc: 'Seamless stainless steel pipe suitable for chemical, food-grade, and pharmaceutical applications.',
        category: 'Pipes & Fittings',
        subcategory: 'SS Pipes',
        price: 4200,
        originalPrice: null,
        productImages: [
            'https://res.cloudinary.com/inframart/image/upload/v1/products/ss-pipe-304-1.jpg',
        ],
        materialSpecifications: 'Grade: AISI 304 | OD: 60.3mm | Wall: 3.91mm | Length: 6m | ASTM A312',
        stock: 320,
        availability: true,
        tier: 'Custom Fab',
        bulkInfo: 'Custom lengths and end finishes available.',
        rating: null,
        reviews: 0,
    },
];

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function seed() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not found in .env.local');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // ── Clear ──────────────────────────────────
    await Promise.all([
        User.deleteMany({}),
        Product.deleteMany({}),
        Order.deleteMany({}),
        RFQ.deleteMany({}),
        Shipment.deleteMany({}),
        ComplianceDoc.deleteMany({}),
        SpecSheet.deleteMany({}),
        Banner.deleteMany({}),
        Offer.deleteMany({}),
        Category.deleteMany({}),
    ]);
    console.log('Cleared all collections');

    // ── Users ──────────────────────────────────
    const usersData = await buildUsers();
    const users = await User.insertMany(usersData);
    const [admin, userRajesh, userPriya, userArjun] = users;
    console.log(`Seeded ${users.length} users`);

    // ── Categories ─────────────────────────────
    const categories = await Category.create([
        { name: 'Steel & Metals' },
        { name: 'Cement & Concrete' },
        { name: 'Pipes & Fittings' },
        { name: 'Waterproofing' },
        { name: 'Masonry & Blocks' }
    ]);
    console.log(`Seeded ${categories.length} categories`);

    const catMap = {};
    categories.forEach(c => catMap[c.name] = c._id);

    // ── Products ───────────────────────────────
    const productsToSeed = PRODUCTS.map(p => ({
        ...p,
        category: catMap[p.category]
    }));
    const products = await Product.insertMany(productsToSeed);
    const [tmtBar, cement, hdpePipe, iBeam, waterproofing, aacBlock, ssPipe] = products;
    console.log(`Seeded ${products.length} products`);

    // ── Orders ─────────────────────────────────
    const shippingAddr = {
        building: 'Plot 12, Sector 18',
        area: 'Noida Sector 18',
        landmark: 'Near Atta Market',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        country: 'India',
    };

    const orders = await Order.create([
        {
            orderNumber: 'BM-000001',
            user: userRajesh._id,
            items: [
                { product: tmtBar._id, productName: tmtBar.productName, price: tmtBar.price, quantity: 10 },
                { product: cement._id, productName: cement.productName, price: cement.price, quantity: 50 },
            ],
            totalAmount: (tmtBar.price * 10) + (cement.price * 50),
            status: 'DELIVERED',
            shippingAddress: shippingAddr,
            notes: 'Please deliver before 9 AM.',
        },
        {
            orderNumber: 'BM-000002',
            user: userRajesh._id,
            items: [
                { product: hdpePipe._id, productName: hdpePipe.productName, price: hdpePipe.price, quantity: 20 },
            ],
            totalAmount: hdpePipe.price * 20,
            status: 'SHIPPED',
            shippingAddress: shippingAddr,
        },
        {
            orderNumber: 'BM-000003',
            user: userPriya._id,
            items: [
                { product: iBeam._id, productName: iBeam.productName, price: iBeam.price, quantity: 5 },
                { product: waterproofing._id, productName: waterproofing.productName, price: waterproofing.price, quantity: 30 },
            ],
            totalAmount: (iBeam.price * 5) + (waterproofing.price * 30),
            status: 'PROCESSING',
            shippingAddress: {
                building: 'Technopark Phase 2',
                area: 'Technopark',
                city: 'Thiruvananthapuram',
                state: 'Kerala',
                pincode: '695581',
                country: 'India',
            },
            notes: 'Fragile items — handle with care.',
        },
        {
            orderNumber: 'BM-000004',
            user: userArjun._id,
            items: [
                { product: aacBlock._id, productName: aacBlock.productName, price: aacBlock.price, quantity: 2400 },
            ],
            totalAmount: aacBlock.price * 2400,
            status: 'CONFIRMED',
            shippingAddress: {
                building: 'Fortune Business Hub',
                area: 'Science City Road',
                city: 'Ahmedabad',
                state: 'Gujarat',
                pincode: '380060',
                country: 'India',
            },
        },
        {
            orderNumber: 'BM-000005',
            user: userPriya._id,
            items: [
                { product: ssPipe._id, productName: ssPipe.productName, price: ssPipe.price, quantity: 15 },
            ],
            totalAmount: ssPipe.price * 15,
            status: 'PENDING',
            shippingAddress: {
                building: 'Technopark Phase 2',
                area: 'Technopark',
                city: 'Thiruvananthapuram',
                state: 'Kerala',
                pincode: '695581',
                country: 'India',
            },
        },
    ]);
    console.log(`Seeded ${orders.length} orders`);

    // ── RFQs ───────────────────────────────────
    const rfqs = await RFQ.create([
        {
            rfqNumber: 'RFQ-00001',
            user: userArjun._id,
            items: [
                {
                    product: tmtBar._id,
                    productName: tmtBar.productName,
                    quantity: 100,
                    targetPrice: 5900,
                    notes: 'Need Fe500D grade only.',
                },
                {
                    product: cement._id,
                    productName: cement.productName,
                    quantity: 500,
                    targetPrice: 360,
                },
            ],
            status: 'QUOTED',
            notes: 'Project: Residential complex, Ahmedabad. Need delivery in 3 weeks.',
            adminNotes: 'Quoted at ₹5950/unit for TMT and ₹370/bag for cement.',
            expiresAt: daysFromNow(15),
        },
        {
            rfqNumber: 'RFQ-00002',
            user: userPriya._id,
            items: [
                {
                    product: ssPipe._id,
                    productName: ssPipe.productName,
                    quantity: 50,
                    targetPrice: 4000,
                    notes: 'Food-grade application — need mill test certificates.',
                },
            ],
            status: 'UNDER_REVIEW',
            notes: 'Pharmaceutical plant piping project.',
            expiresAt: daysFromNow(10),
        },
        {
            rfqNumber: 'RFQ-00003',
            user: userRajesh._id,
            items: [
                {
                    product: iBeam._id,
                    productName: iBeam.productName,
                    quantity: 20,
                    targetPrice: 72000,
                },
            ],
            status: 'SUBMITTED',
            notes: 'Steel framework for warehouse expansion.',
            expiresAt: daysFromNow(20),
        },
        {
            rfqNumber: 'RFQ-00004',
            user: userArjun._id,
            items: [
                {
                    product: waterproofing._id,
                    productName: waterproofing.productName,
                    quantity: 200,
                    targetPrice: 2600,
                },
            ],
            status: 'DRAFT',
            expiresAt: daysFromNow(30),
        },
    ]);
    console.log(`Seeded ${rfqs.length} RFQs`);

    // ── Shipments ──────────────────────────────
    const [orderDelivered, orderShipped, orderProcessing] = orders;

    const shipments = await Shipment.create([
        {
            trackingNumber: 'BM-TRK-A1B2C3D4',
            order: orderDelivered._id,
            user: userRajesh._id,
            carrier: 'BlueDart Logistics',
            status: 'DELIVERED',
            origin: 'Raipur, Chhattisgarh',
            destination: 'Noida, Uttar Pradesh',
            estimatedDelivery: daysAgo(2),
            deliveredAt: daysAgo(1),
            freightClass: 'Class 85',
            weight: 950,
            dimensions: { length: 1200, width: 80, height: 80 },
            events: [
                { status: 'PREPARING', location: 'Raipur Warehouse', description: 'Shipment picked up from supplier', timestamp: daysAgo(8) },
                { status: 'PICKED_UP', location: 'Raipur Hub', description: 'Loaded onto truck', timestamp: daysAgo(7) },
                { status: 'IN_TRANSIT', location: 'Nagpur Transit Hub', description: 'In transit to destination', timestamp: daysAgo(5) },
                { status: 'IN_TRANSIT', location: 'Agra Hub', description: 'Approaching delivery city', timestamp: daysAgo(3) },
                { status: 'OUT_FOR_DELIVERY', location: 'Noida Delivery Hub', description: 'Out for final delivery', timestamp: daysAgo(1) },
                { status: 'DELIVERED', location: 'Noida Sector 18', description: 'Delivered and signed off', timestamp: daysAgo(1) },
            ],
        },
        {
            trackingNumber: 'BM-TRK-E5F6G7H8',
            order: orderShipped._id,
            user: userRajesh._id,
            carrier: 'TCI Freight',
            status: 'IN_TRANSIT',
            origin: 'Hyderabad, Telangana',
            destination: 'Noida, Uttar Pradesh',
            estimatedDelivery: daysFromNow(3),
            freightClass: 'Class 70',
            weight: 440,
            dimensions: { length: 600, width: 110, height: 110 },
            events: [
                { status: 'PREPARING', location: 'Hyderabad Warehouse', description: 'Consolidated with other shipments', timestamp: daysAgo(4) },
                { status: 'PICKED_UP', location: 'Hyderabad Hub', description: 'Picked up by carrier', timestamp: daysAgo(3) },
                { status: 'IN_TRANSIT', location: 'Nagpur Transit Hub', description: 'En route to Noida', timestamp: daysAgo(1) },
            ],
        },
        {
            trackingNumber: 'BM-TRK-I9J0K1L2',
            order: orderProcessing._id,
            user: userPriya._id,
            carrier: 'VRL Logistics',
            status: 'PREPARING',
            origin: 'Mumbai, Maharashtra',
            destination: 'Thiruvananthapuram, Kerala',
            estimatedDelivery: daysFromNow(6),
            freightClass: 'Class 92.5',
            weight: 780,
            dimensions: { length: 800, width: 200, height: 150 },
            events: [
                { status: 'PREPARING', location: 'Mumbai Warehouse', description: 'Packing and documentation in progress', timestamp: new Date() },
            ],
        },
    ]);
    console.log(`Seeded ${shipments.length} shipments`);

    // ── Compliance Docs ────────────────────────
    const complianceDocs = await ComplianceDoc.create([
        {
            user: admin._id,
            product: tmtBar._id,
            title: 'BIS Certification — TMT Steel Bar Fe500D',
            type: 'ISO',
            documentUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/docs/bis-tmt-fe500d.pdf',
            issuedBy: 'Bureau of Indian Standards',
            issuedAt: daysAgo(365),
            expiresAt: daysFromNow(365),
            notes: 'Covers IS 1786:2008 compliance for Fe500D grade.',
        },
        {
            user: admin._id,
            product: cement._id,
            title: 'ISO 9001:2015 — Quality Management Certificate',
            type: 'ISO',
            documentUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/docs/iso9001-cement.pdf',
            issuedBy: 'DNV Business Assurance',
            issuedAt: daysAgo(180),
            expiresAt: daysFromNow(545),
            notes: 'Scope: Manufacturing and supply of OPC 53 Grade cement.',
        },
        {
            user: admin._id,
            product: ssPipe._id,
            title: 'RoHS Compliance Declaration — SS 304 Pipe',
            type: 'RoHS',
            documentUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/docs/rohs-ss304.pdf',
            issuedBy: 'SGS India Pvt Ltd',
            issuedAt: daysAgo(90),
            expiresAt: daysFromNow(275),
            notes: 'Restriction of Hazardous Substances declaration for EU export.',
        },
        {
            user: admin._id,
            product: waterproofing._id,
            title: 'Safety Data Sheet — SBS Waterproofing Membrane',
            type: 'SDS',
            documentUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/docs/sds-sbs-membrane.pdf',
            issuedBy: 'InfraMart Safety Team',
            issuedAt: daysAgo(60),
            expiresAt: daysFromNow(700),
            notes: 'GHS-compliant SDS for bituminous membrane product.',
        },
        {
            user: admin._id,
            product: hdpePipe._id,
            title: 'CE Marking Certificate — HDPE Pipe PN10',
            type: 'CE',
            documentUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/docs/ce-hdpe-pn10.pdf',
            issuedBy: 'TUV SUD',
            issuedAt: daysAgo(400),
            expiresAt: daysAgo(35),
            notes: 'CE marking for European market. Certificate has expired.',
        },
        {
            user: admin._id,
            product: aacBlock._id,
            title: 'Factory Audit Report — AAC Block Plant',
            type: 'AUDIT',
            documentUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/docs/audit-aac-plant.pdf',
            issuedBy: 'Bureau Veritas',
            issuedAt: daysAgo(120),
            expiresAt: daysFromNow(245),
            notes: 'Annual factory audit covering quality and safety compliance.',
        },
    ]);
    console.log(`Seeded ${complianceDocs.length} compliance docs`);

    // ── Spec Sheets ────────────────────────────
    const specSheets = await SpecSheet.create([
        {
            product: tmtBar._id,
            title: 'Technical Data Sheet — TMT Bar Fe500D (12mm)',
            fileUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/specs/tds-tmt-12mm.pdf',
            fileType: 'PDF',
            fileSize: '1.2 MB',
            version: '2.1',
            uploadedBy: admin._id,
            description: 'Mechanical properties, chemical composition, and dimensional tolerances for Fe500D grade.',
        },
        {
            product: iBeam._id,
            title: 'Section Properties — ISMB 250',
            fileUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/specs/ismb250-section.pdf',
            fileType: 'PDF',
            fileSize: '856 KB',
            version: '1.0',
            uploadedBy: admin._id,
            description: 'Cross-section dimensions, moment of inertia, section modulus, and radius of gyration.',
        },
        {
            product: iBeam._id,
            title: 'AutoCAD Drawing — ISMB 250 Cross Section',
            fileUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/specs/ismb250.dwg',
            fileType: 'DWG',
            fileSize: '340 KB',
            version: '1.0',
            uploadedBy: admin._id,
            description: 'DWG file for structural design integration.',
        },
        {
            product: hdpePipe._id,
            title: 'Installation & Jointing Guide — HDPE Pipe',
            fileUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/specs/hdpe-installation.pdf',
            fileType: 'PDF',
            fileSize: '3.4 MB',
            version: '1.3',
            uploadedBy: admin._id,
            description: 'Butt fusion, electrofusion, and mechanical jointing procedures.',
        },
        {
            product: waterproofing._id,
            title: 'Application Datasheet — SBS Modified Membrane',
            fileUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/specs/sbs-app-sheet.pdf',
            fileType: 'PDF',
            fileSize: '2.1 MB',
            version: '3.0',
            uploadedBy: admin._id,
            description: 'Surface preparation, torching method, and overlap specifications.',
        },
        {
            product: ssPipe._id,
            title: 'Mill Test Certificate — SS 304 Seamless Pipe',
            fileUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/specs/mtc-ss304.xlsx',
            fileType: 'XLSX',
            fileSize: '210 KB',
            version: '1.0',
            uploadedBy: admin._id,
            description: 'Heat-wise chemical analysis and mechanical test results per ASTM A312.',
        },
        {
            product: aacBlock._id,
            title: 'Structural Design Guide — AAC Block Masonry',
            fileUrl: 'https://res.cloudinary.com/inframart/raw/upload/v1/specs/aac-design-guide.pdf',
            fileType: 'PDF',
            fileSize: '5.7 MB',
            version: '2.0',
            uploadedBy: admin._id,
            description: 'Detailing for load-bearing and non-load-bearing AAC masonry as per IS 2185 Part 3.',
        },
    ]);
    console.log(`Seeded ${specSheets.length} spec sheets`);

    // ── Banners ───────────────────────────────
    const banners = await Banner.create([
        {
            image: '/images/buildhero.jpg',
            tag: 'Enterprise Procurement',
            headline: 'Build Better.',
            headlineAccent: 'Buy Smarter.',
            sub: 'Your one-stop destination for high-quality construction materials — reliable delivery and competitive pricing for any project size.',
            cta: 'Shop Now',
            ctaTo: '/products',
            order: 1
        },
        {
            image: 'https://images.unsplash.com/photo-1581094120973-10d9be8a1290?q=80&w=2000&auto=format&fit=crop',
            tag: 'Bulk Orders',
            headline: 'More Volume.',
            headlineAccent: 'Better Pricing.',
            sub: 'Submit RFQs for bulk procurement and get competitive quotes from verified suppliers across 15+ material categories.',
            cta: 'Request Quote',
            ctaTo: '/rfqs',
            order: 2
        },
        {
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop',
            tag: '15+ Categories',
            headline: 'Everything',
            headlineAccent: 'On One Platform.',
            sub: 'From cement and tiles to electrical and plumbing — source all your construction materials from a single trusted marketplace.',
            cta: 'Browse Categories',
            ctaTo: '/products/categories',
            order: 3
        },
        {
            image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000&auto=format&fit=crop',
            tag: 'Fast Delivery',
            headline: 'Order Today.',
            headlineAccent: 'Deliver Tomorrow.',
            sub: 'Real-time shipment tracking and priority logistics ensure your materials arrive on time, every time.',
            cta: 'View Products',
            ctaTo: '/products',
            order: 4
        }
    ]);
    console.log(`Seeded ${banners.length} banners`);

    // ── Offers ────────────────────────────────
    const offers = await Offer.create([
        {
            title: 'Weekend Construction Bumper',
            tag: 'Limited Time',
            discount: 'Extra 15% OFF',
            desc: 'Get an additional discount on all structural steel and power tools over ₹40,000.',
            color: 'from-orange-600 to-red-700',
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop',
            order: 1
        },
        {
            title: 'Bulk Infrastructure Blowout',
            tag: 'Bumper Offer',
            discount: 'Buy 5, Get 1 FREE',
            desc: 'On all safety equipment and sitewide hardware kits. Stock up for your next project.',
            color: 'from-blue-700 to-indigo-900',
            image: 'https://images.unsplash.com/photo-1581094120973-10d9be8a1290?q=80&w=2000&auto=format&fit=crop',
            order: 2
        },
        {
            title: 'Premium Project Pack',
            tag: 'Flash Deal',
            discount: 'Flat ₹40,000 Cashback',
            desc: 'When you finalize your first procurement order over ₹400,000 this month.',
            color: 'from-emerald-700 to-teal-900',
            image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000&auto=format&fit=crop',
            order: 3
        }
    ]);
    console.log(`Seeded ${offers.length} offers`);

    // ── Summary ────────────────────────────────
    console.log('\nSeed complete.');
    console.log('─────────────────────────────────');
    console.log(`  Users          : ${users.length}`);
    console.log(`  Products       : ${products.length}`);
    console.log(`  Orders         : ${orders.length}`);
    console.log(`  RFQs           : ${rfqs.length}`);
    console.log(`  Shipments      : ${shipments.length}`);
    console.log(`  Compliance Docs: ${complianceDocs.length}
  Spec Sheets    : ${specSheets.length}
  Banners        : ${banners.length}
  Offers         : ${offers.length}
  Categories     : ${categories.length}
`);
    console.log('─────────────────────────────────');
    console.log('\nAdmin credentials:');
    console.log('  Email   : admin@inframart.com');
    console.log('  Password: Admin@1234');
    console.log('\nUser credentials (all three):');
    console.log('  Password: User@1234');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
