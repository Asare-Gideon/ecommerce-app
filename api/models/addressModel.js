const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        address: {
            type: String,
            required: true,
        },
        default: {
            type: Boolean,
            default: false,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        latitude: {
            type: Number,
            default: null,
        },
        longitude: {
            type: Number,
            default: null,
        },
        phoneNumber: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            default: "",
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
