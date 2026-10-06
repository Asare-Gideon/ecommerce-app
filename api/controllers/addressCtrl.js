const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const Address = require("../models/addressModel");
const User = require("../models/userModels");

const normalizeDefaultAddress = async (userId, addressId) => {
    if (!userId) return;
    await Address.updateMany(
        { user: userId, _id: { $ne: addressId } },
        { $set: { default: false } }
    );
};

// CREATE NEW ADDRESS
const createAddress = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id || req.body.user;
        const newAddress = await Address.create({ ...req.body, user: userId });
        if (userId) {
            await User.findByIdAndUpdate(userId, { $addToSet: { addresses: newAddress._id } });
            if (newAddress.default) {
                await normalizeDefaultAddress(userId, newAddress._id);
            }
        }
        res.json(newAddress);
    } catch (err) {
        throw new Error(err);
    }
});

// GET ALL ADDRESSES
const getAllAddresses = asyncHandler(async (req, res) => {
    try {
        const filter = {};
        if (req.user?.role !== "admin") {
            filter.user = req.user?._id;
        } else if (req.query.user) {
            filter.user = req.query.user;
        }
        const addresses = await Address.find(filter).sort({ default: -1, createdAt: -1 });
        res.json(addresses);
    } catch (err) {
        throw new Error(err);
    }
});

// GET A SINGLE ADDRESS
const getSingleAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDb(id);
        const address = await Address.findById(id);
        res.json(address);
    } catch (err) {
        throw new Error(err);
    }
});

// UPDATE ADDRESS
const updateAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDb(id);
        const address = await Address.findByIdAndUpdate(id, req.body, { new: true });
        if (address?.default) {
            await normalizeDefaultAddress(address.user, address._id);
        }
        res.json(address);
    } catch (err) {
        throw new Error(err);
    }
});

// DELETE ADDRESS
const deleteAddress = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDb(id);
        const address = await Address.findByIdAndDelete(id);
        if (address?.user) {
            await User.findByIdAndUpdate(address.user, { $pull: { addresses: address._id } });
        }
        res.json(address);
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = { createAddress, getAllAddresses, getSingleAddress, updateAddress, deleteAddress };


