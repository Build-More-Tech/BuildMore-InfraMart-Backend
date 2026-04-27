/**
 * Fix Categories Migration Script
 * Run: node scripts/fixCategories.js
 *
 * Normalizes all product category values in the DB to exactly match
 * the 14 valid category strings used by the frontend.
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const Product = require('../models/ProductModel');

const VALID_CATEGORIES = [
  'Cement & Concrete',
  'Tiles & Flooring',
  'Paints & Finishes',
  'Construction Chemicals',
  'Plywood, Laminates & Boards',
  'Doors & Windows',
  'Hardware & Fittings',
  'Kitchen & Wardrobe Solutions',
  'Tools & Equipment',
  'Electrical',
  'Lighting & Fans',
  'Electrical Infrastructure',
  'Plumbing',
  'Sanitary & Bath',
];

// Build a lowercase lookup map for matching
const categoryMap = new Map(
  VALID_CATEGORIES.map(c => [c.toLowerCase().trim(), c])
);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({});
  console.log(`Found ${products.length} products`);

  let fixed = 0;
  let unmatched = [];

  for (const p of products) {
    const canonical = categoryMap.get(p.category?.toLowerCase().trim());

    if (!canonical) {
      unmatched.push({ id: p._id, name: p.productName, category: p.category });
      continue;
    }

    if (p.category !== canonical) {
      await Product.findByIdAndUpdate(p._id, { category: canonical });
      console.log(`Fixed: "${p.category}" -> "${canonical}" (${p.productName})`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} products.`);

  if (unmatched.length > 0) {
    console.log(`\nUnmatched (could not auto-fix — update manually via admin):`);
    unmatched.forEach(p => console.log(`  - [${p.id}] "${p.name}" | category: "${p.category}"`));
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
