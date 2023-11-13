const express = require("express");
// const serverless = require('serverless-http');
const User = require("../Schema/User")
const Post = require("../Schema/Post")
const Category = require("../Schema/Category")
const JWT_SECRET = "habibisagoodb#oy";
const multer = require('multer')
// const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
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
    body("phoneno", "Phone no must be at least 11 char long").isLength({
      min: 11,
    }),
    body("message", "Enter your message here")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {name,email,schoolname,phoneno,message} = req.body
      
    const user = await User.create({
        name,
        email,
        schoolname,
        phoneno,
        message
      });

      res.json({user});
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error)
    }
  }
);

// post api start
router.post(
  "/createpost",
  [
    body("title", "Enter title"),
    body("title", "Enter category"),
    body("content", "Enter your content here")
  ],
  upload.single("image"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {title,content,category} = req.body
    const post = await Post.create({
        title,
        content,
        category,
      });


      res.json({post});
    } catch (error) {
      res.status(500).send("Internal error occured");
      console.log(error)
    }
  }
);
// post api end

// get post start
router.get("/getallposts", async(req,res) =>{
  try {
    const allposts = await Post.find({})
    res.json(allposts)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error")
  }
})
// get post end

// get post id start
router.get("/getpost/:id", async(req,res) =>{
  try {
    const post = await Post.findById(req.params.id)
  res.json(post)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error")
    
  }
})
// get post id end

// 
router.get("/getallusers", async (req, res) => {
  try {
    const allusers = await User.find({ });
    res.json(allusers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

// Route 1: create user using: api/auth/createadmin
router.post(
  '/createadmin',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters long').isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if the email and password match specific values
      if (email === 'technicmentors@gmail.com' && password === 'TechnicMentors2345') {
        // Authentication successful
        const authtoken = jwt.sign({ email }, JWT_SECRET);
        return res.json({ success: true, authtoken });
      } else {
        // Authentication failed
        return res.status(400).json({ success: false, error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal error occurred');
    }
  }
);

router.get("/getposts/:id", async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.delete("/delposts/:id", async (req, res) => {
  try {
    const posts = await Post.findByIdAndDelete(req.params.id)
    if(!posts){
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

router.put("/editposts/:id", async(req,res)=>{
  try {
    const {title,category,content} = req.body
  const newPosts = {}
  if(title){
    newPosts.title = title
  }
  if(category){
    newPosts.category = category
  }
  if(content){
    newPosts.content = content
  }
  let posts = Post.findById(req.params.id)
  if(!posts){
    res.status(404).send({message: "Posts not find"})
  }
  posts = await Post.findByIdAndUpdate(req.params.id, {$set: newPosts}, {new:true})
  res.json(posts)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})

// Category
router.post("/category",[
  body("category", "Enter category")
], async (req,res)=>{
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  const {category} = req.body;
  const Allategory = await Category.create({
    category
  })
  res.json(Allategory)
})

router.get("/getcategory", async(req,res)=>{
  try {
    const Getcategory = await Category.find({})
    res.json(Getcategory)
  } catch (error) {
    console.log(error.message)
    res.status(500).send("internal Server Error")
  }
})

router.get("/getcategory/:id", async(req,res)=>{
  try {
    const Getcategory = await Category.findById(req.params.id)
    if(!Getcategory){
      return res.status(404).json({message:"Dont find Category"})
    }
    res.json(Getcategory)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})

router.delete("/delcategory/:id", async(req,res)=>{
  try {
    const Getcategory = await Category.findByIdAndDelete(req.params.id)
    if(!Getcategory){
      return res.status(404).json({message:"Dont find Category"})
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})

router.put("/editcategory/:id", async(req,res)=>{
  try {
    const {category} = req.body
    const newCat = {}
    if(category){
      newCat.category = category
    }

    let cat = await Category.findById(req.params.id)
    if(!cat){
      res.status(404).json("Category not found")
    }

    cat = await Category.findByIdAndUpdate(req.params.id, {$set: newCat}, {new: true});
    res.json(cat)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
})
module.exports = router
