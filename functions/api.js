const express = require("express");
const User = require("../Schema/User");
const Post = require("../Schema/Post");
// const JWT_CRET = "habibisagoodb#oy";
const multer = require("multer");
const router = express.Router();
const JWT_SECRET = "habibisagoodb#oy";
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Define the destination folder where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Define the filename for the uploaded file
  },
});

const upload = multer({ storage });

// Route 1: create user using: api/auth/createuser
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("schoolname", "Enter a valid School name").isLength({ min: 3 }),
    body("phoneno", "Phone no must 11 char long").isLength({ min: 11 }),
    body("message", "Enter your message here"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, schoolname, phoneno, message } = req.body;
      const user = await User.create({
        name,
        email,
        schoolname,
        phoneno,
        message,
      });
      res.json({ user });
    } catch (error) {
      res.status(500).send("Internal error occurred");
      console.log(error);
    }
  }
);

// post api start
router.post("/createpost", upload.single("image"), async (req, res) => {
  // Extract post data and uploaded image file
  const { title, content, category } = req.body;
  const image = req.file ? req.file.filename : null; // Get the filename of the uploaded image

  try {
    const post = await Post.create({
      title,
      content,
      category,
      image, // Save the image URL in the database
    });

    res.json({ post });
  } catch (error) {
    res.status(500).send("Internal error occurred");
    console.log(error);
  }
});
// post api end

// get post start
router.get("/getallposts", async (req, res) => {
  try {
    const allposts = await Post.find({});
    res.json(allposts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
  }
});
// get post end

// get post id start
router.get("/getpost/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});
// get post id end
router.get("/getallusers", async (req, res) => {
  try {
    const allusers = await User.find({});
    res.json(allusers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.get("/getnow", (req, res) => {
  res.json({
    name: "Working",
    email: "working properly",
  });
});

// Route 1: create user using: api/auth/createadmin
router.post(
  "/createadmin",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if the email and password match specific values
      if (
        email === "capobrainofficial@gmail.com" &&
        password === "Capobrain2345"
      ) {
        // Authentication successful
        const authtoken = jwt.sign({ email }, JWT_SECRET);
        return res.json({ success: true, authtoken });
      } else {
        // Authentication failed
        return res.status(400).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal error occurred");
    }
  }
);

router.get("/getusers/:id", async (req, res) => {
  try {
    const allusers = await User.findById(req.params.id);
    res.json(allusers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

module.exports = router;
