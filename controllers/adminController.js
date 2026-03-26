const Products = require('../models/ProductModel')
const path = require('path');

async function addproduct(req, res) {
    const { productName, desc, category, price, materialSpecifications, stock } = req.body
    if (!productName || !category || !desc || !price || !stock) {
        return res.status(400).json({ message: "all fields are required" })
    }
    let filenames = []
    req.files.forEach(item => {
        const filename = `${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(item.originalname)}`
        filenames.push(filename)
        //saving file to aws
        //image data is available in item.buffer
    });

    const product = await Products.create({
        productName:productName,
        desc:desc,
        category:category,
        price:price,
        materialSpecifications:materialSpecifications,
        stock:stock,
        productImages: filenames
    })
    res.status(201).json({ productid: product._id, message: "product added" })
}

module.exports = { addproduct }