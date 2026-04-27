const mongoose = require('mongoose');

function toSlug(str) {
    return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String }
}, { _id: true });

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, trim: true },
    image: { type: String }, // Cloudinary URL
    subcategories: [subcategorySchema]
}, { timestamps: true });

categorySchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = toSlug(this.name);
    }
    this.subcategories.forEach(sub => {
        if (!sub.slug) sub.slug = toSlug(sub.name);
    });
    next();
});

module.exports = mongoose.model('Category', categorySchema);
