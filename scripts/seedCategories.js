/**
 * Category Seed Script — BuildMore InfraMart Backend
 * Run: node scripts/seedCategories.js
 *
 * Upserts all 14 platform categories with subcategories and descriptions
 * that exactly match the frontend category metadata (categories.ts).
 * Safe to re-run — existing categories are updated, not duplicated.
 */

const mongoose = require('mongoose');
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
});

const Category = require('../models/CategoryModel');

// ─────────────────────────────────────────────
// SOURCE OF TRUTH — mirrors frontend categories.ts
// ─────────────────────────────────────────────

const CATEGORIES = [
    {
        name: 'Cement & Concrete',
        description: 'Cement, blocks & structural base',
        subcategories: [
            { name: 'Cement' },
            { name: 'Ready Mix Concrete' },
            { name: 'AAC Blocks' },
            { name: 'Concrete Blocks' },
            { name: 'Plasters' },
            { name: 'Wall Reinforcement' },
        ],
    },
    {
        name: 'Tiles & Flooring',
        description: 'Tiles, marble, granite & adhesives',
        subcategories: [
            { name: 'Floor Tiles' },
            { name: 'Wall Tiles' },
            { name: 'Vitrified Tiles' },
            { name: 'Ceramic Tiles' },
            { name: 'Marble' },
            { name: 'Granite' },
            { name: 'Tile Adhesives' },
            { name: 'Tile Grouts' },
            { name: 'Tile Cleaners' },
            { name: 'Tiling Tools' },
        ],
    },
    {
        name: 'Paints & Finishes',
        description: 'Interior, exterior & specialty coatings',
        subcategories: [
            { name: 'Interior Paints' },
            { name: 'Exterior Paints' },
            { name: 'Primers' },
            { name: 'Putty' },
            { name: 'Wood Coatings' },
            { name: 'Enamels' },
            { name: 'Texture Finishes' },
            { name: 'Waterproof Primers' },
            { name: 'Damp Proofing' },
            { name: 'Brushes' },
            { name: 'Rollers' },
            { name: 'Masking Tape' },
        ],
    },
    {
        name: 'Construction Chemicals',
        description: 'Adhesives, sealants & waterproofing',
        subcategories: [
            { name: 'Tile Adhesives' },
            { name: 'Wood Adhesives' },
            { name: 'Epoxy Adhesives' },
            { name: 'Sealants' },
            { name: 'Grouts' },
            { name: 'SBR Latex' },
            { name: 'Crack Fillers' },
            { name: 'Waterproof Coatings' },
        ],
    },
    {
        name: 'Plywood, Laminates & Boards',
        description: 'Plywood, MDF, laminates & veneers',
        subcategories: [
            { name: 'Plywood' },
            { name: 'MDF Boards' },
            { name: 'HDHMR Boards' },
            { name: 'Block Boards' },
            { name: 'Particle Boards' },
            { name: 'Boiling Water Resistant Boards' },
            { name: 'Laminates' },
            { name: 'Veneers' },
        ],
    },
    {
        name: 'Doors & Windows',
        description: 'Flush doors, UPVC & aluminium windows',
        subcategories: [
            { name: 'Flush Doors' },
            { name: 'Panel Doors' },
            { name: 'UPVC Windows' },
            { name: 'Aluminium Windows' },
            { name: 'Glass Panels' },
        ],
    },
    {
        name: 'Hardware & Fittings',
        description: 'Door hardware, locks & fasteners',
        subcategories: [
            { name: 'Door Hardware' },
            { name: 'Cabinet Hardware' },
            { name: 'Hinges' },
            { name: 'Drawer Slides' },
            { name: 'Telescopic Channels' },
            { name: 'Handles' },
            { name: 'Locks' },
            { name: 'Fasteners' },
            { name: 'General Hardware' },
        ],
    },
    {
        name: 'Kitchen & Wardrobe Solutions',
        description: 'Modular cabinet & storage systems',
        subcategories: [
            { name: 'Cabinet Hardware' },
            { name: 'Drawer Systems' },
            { name: 'Door Systems' },
            { name: 'Sliding Systems' },
            { name: 'Wardrobe Accessories' },
            { name: 'Wardrobe Rails' },
            { name: 'Pantry Units' },
            { name: 'Pullout Systems' },
            { name: 'Storage Systems' },
            { name: 'Waste Management' },
            { name: 'Gas Lifts' },
        ],
    },
    {
        name: 'Tools & Equipment',
        description: 'Hand tools, power tools & PPE',
        subcategories: [
            { name: 'Hand Tools' },
            { name: 'Power Tools' },
            { name: 'Measurement Tools' },
            { name: 'Protective Equipment' },
            { name: 'Mounting Accessories' },
            { name: 'Maintenance Products' },
        ],
    },
    {
        name: 'Electrical',
        description: 'Wires, switches & distribution boards',
        subcategories: [
            { name: 'Wires & Cables' },
            { name: 'Switches' },
            { name: 'Sockets' },
            { name: 'Plates & Frames' },
            { name: 'Distribution Boards' },
            { name: 'Circuit Breakers' },
            { name: 'Regulators' },
            { name: 'Electrical Accessories' },
        ],
    },
    {
        name: 'Lighting & Fans',
        description: 'LED lighting & ventilation fans',
        subcategories: [
            { name: 'Downlights' },
            { name: 'COB Lights' },
            { name: 'Strip Lights' },
            { name: 'Surface Lights' },
            { name: 'Tube Lights' },
            { name: 'Ceiling Fans' },
            { name: 'Exhaust Fans' },
        ],
    },
    {
        name: 'Electrical Infrastructure',
        description: 'Conduits, boxes & cable accessories',
        subcategories: [
            { name: 'Conduit Pipes' },
            { name: 'Conduit Fittings' },
            { name: 'Casing & Capping' },
            { name: 'Junction Boxes' },
            { name: 'Back Boxes' },
            { name: 'GI Boxes' },
            { name: 'Cable Accessories' },
        ],
    },
    {
        name: 'Plumbing',
        description: 'Pipes, fittings, valves & tanks',
        subcategories: [
            { name: 'CPVC Pipes' },
            { name: 'UPVC Pipes' },
            { name: 'Pipe Fittings' },
            { name: 'Valves' },
            { name: 'Water Tanks' },
            { name: 'Drainage Systems' },
        ],
    },
    {
        name: 'Sanitary & Bath',
        description: 'Faucets, sanitary ware & bath fittings',
        subcategories: [
            { name: 'Faucets & Taps' },
            { name: 'Sanitary Ware' },
            { name: 'Bathroom Fittings' },
        ],
    },
];

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function seed() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not found in env file');
        process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    let inserted = 0;
    let updated = 0;

    for (const cat of CATEGORIES) {
        const existing = await Category.findOne({ name: cat.name });

        if (existing) {
            existing.description = cat.description;
            existing.subcategories = cat.subcategories;
            await existing.save();
            console.log(`  UPDATE — "${cat.name}" (${cat.subcategories.length} subcategories)`);
            updated++;
        } else {
            await Category.create(cat);
            console.log(`  INSERT — "${cat.name}" (${cat.subcategories.length} subcategories)`);
            inserted++;
        }
    }

    console.log('\n─────────────────────────────────');
    console.log(`  Inserted : ${inserted}`);
    console.log(`  Updated  : ${updated}`);
    console.log(`  Total    : ${CATEGORIES.length}`);
    console.log('─────────────────────────────────');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('Category seed failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
