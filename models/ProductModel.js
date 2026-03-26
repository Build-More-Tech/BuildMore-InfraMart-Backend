const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description too long']
    },
    category:{
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    productImages:[
        {
            type:String
        }
    ],
    materialSpecifications:{
        type: String,
    },
    stock:{
        type:Number,
        required: true,
    },
    availability:{
        type:Boolean,
        default: true
    }
})

module.exports = mongoose.model('product', productSchema)