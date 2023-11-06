const express = require("express");
const User = require("../Schema/User");
const Post = require("../Schema/Post");
// const JWT_CRET = "habibisagoodb#oy";
const router = express.Router();
const JWT_SECRET = "habibisagoodb#oy";
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const multer = require("multer");
const { put } = require('@vercel/blob');

const upload = multer({ storage });

// post api start
router.post('/createpost', upload.single('image'), async (req, res) => {
  // Extract post data and uploaded image file
  const { title, content, category } = req.body;
  const imageFile = req.file;

  try {
    // Check if an image was uploaded
    if (!imageFile) {
      console.log('No image file provided'); // Log if no image file is provided
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload the image to Vercel Blob
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const imageKey = `images/${uniqueSuffix}-${imageFile.originalname}`;
    console.log('Image key:', imageKey); // Log the image key

    // Use the @vercel/blob package to upload the image
    console.log('Uploading image to Vercel Blob...'); // Log the start of the upload process
    const { url } = await put(imageKey, imageFile.buffer, { access: 'public' });
    console.log('Image uploaded to Vercel Blob'); // Log when the image is successfully uploaded

    // Save the Vercel Blob URL in the database or use it in your posts
    const post = await Post.create({
      title,
      content,
      category,
      image: url, // Use the actual URL obtained from Vercel Blob
    });

    console.log('Post saved in the database'); // Log when the post is saved in the database

    res.json({ post });
  } catch (error) {
    console.error('Error occurred:', error); // Log any errors that occur
    res.status(500).send('Internal error occurred');
  }
});
// post api end

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
