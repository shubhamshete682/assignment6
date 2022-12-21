const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    uuid: {

        type: String,
        require: true
    },
    pizza_name: {

        type: String,
        require: true,

    },
    unique_name: {
        unique: true,
        type: String,
        require: true,

    },
    pizza_price: {
        type: Number,
        require: true
    },
    count: {
        default:1,
        type: Number,
        require: true
    },
    amount: {
        type: Number,
        require: true
    }

});
module.exports = mongoose.model("cart", userSchema);