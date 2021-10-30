const express = require("express");
// import the check method only from the express-validator
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const usersControllers = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersControllers.getUsers);

// post router for the signup
router.post(
  "/signup",
  [
    // Validation for the sign up
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  usersControllers.signup
);

// post router for the signin
router.post(
  "/signin",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  usersControllers.signin
);
// get only user name
router.get("/:id", usersControllers.getUserName);
// get only user status so that we can check the status and perform some action according to it
router.patch("/:id", usersControllers.changeStatus);
// this route for change the password and image of user

router.post(
  "/edit/:id",
  fileUpload.single("image"),
  usersControllers.changeProfile
);

// get only user role so that we can check the status and perform some action according to it
router.get("/role/:id", usersControllers.getUserRole);

// Export router
module.exports = router;
