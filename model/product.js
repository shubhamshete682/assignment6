const { default: mongoose } = require('mongoose')
const model = require('mongoose')

const productModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("product", productModel)