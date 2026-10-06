const router = require("express").Router();
const { createAddress, getAllAddresses, getSingleAddress, updateAddress, deleteAddress } = require("../controllers/addressCtrl");
const { authorizeUser } = require("../middleware/authMiddleware");


router.post("/create", authorizeUser, createAddress);
router.get("/get-all", authorizeUser, getAllAddresses);
router.get("/get-one/:id", authorizeUser, getSingleAddress);
router.put("/update/:id", authorizeUser, updateAddress);
router.delete("/delete/:id", authorizeUser, deleteAddress);

module.exports = router;
