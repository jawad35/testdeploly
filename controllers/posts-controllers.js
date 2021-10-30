const mysql = require("mysql");
const uuid = require("uuid");
const fs = require("fs");
const { validationResult } = require("express-validator");

// Create the database connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

// Connect to the database
db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySql Connected...");
  }
});

// The following method is used to load all the posts in the database
const getAllPosts = (req, res, next) => {
  // Get all posts from db
  db.query("SELECT * FROM posts ORDER BY publishDate DESC", (error, result) => {
    if (error) {
      console.log(error);
    } else {
      // Check if there are no posts and return an error message
      if (result.length === 0) {
        res.status(404).json({
          message: "No Avalible Journals To Display. Please Try Again Later.",
        });
      } else {
        // Send a response with all avalible journals
        res.status(200).json({ posts: result });
      }
    }
  });
};

// The following method is used to handle get post request for a specific post.
const getPostById = (req, res, next) => {
  // Extract the post id from the url
  const postId = req.params.pid;

  // Search for the required post
  db.query("SELECT * FROM posts WHERE id = ?", [postId], (error, result) => {
    if (error) {
      console.log(error);
    } else {
      // Check if there are no posts and return an error message
      if (result.length === 0) {
        res
          .status(404)
          .json({ mssage: "Could Not Find a Journal For The Provided ID." });
      } else {
        // Send a response with required post (journal)
        res.status(200).json({ post: result });
      }
    }
  });
};

// The following method is used to handle get posts request for a specific user.
const getPostsByUserId = (req, res, next) => {
  // Extract the user id from the url
  const userId = req.params.uid;

  // Search for the required user's posts
  db.query(
    "SELECT * FROM posts WHERE userId = ? ORDER BY publishDate DESC",
    [userId],
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        // Check if there are no posts and return an error message
        if (result.length === 0) {
          res.status(404).json({
            message: "Could Not Find Journals For The Provided User ID.",
          });
        } else {
          // Send a response with required posts (journals)
          res.status(200).json({ posts: result });
        }
      }
    }
  );
};

// The following method is used to handle post request to add a new post (journal).
const createPost = (req, res, next) => {
  // Validate user inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res
      .status(422)
      .json({ message: "Invalid Inputs Passed. Please Check Your Data." });
  } else {
    // Extract user inputs
    let { title, content, userId, image, username } = req.body;
    image = req.file.path;
    if (!image) {
      image = null;
    }
    // Insert the new post to the database
    db.query(
      "INSERT INTO posts (id, title, content, userId,username, publishDate, imageUrl) VALUES (?, ?, ?, ?, ?, ?,?)",
      [uuid.v4(), title, content, userId, username, new Date(), image],
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          // Send back a success response
          res.status(201).json({ post: result[0] });
        }
      }
    );
  }
};

// The following method is used to hanlde the patch request to update an existing post (journal).
const updatePost = (req, res, next) => {
  // Validate user inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res
      .status(422)
      .json({ message: "Invalid Inputs Passed. Please Check Your Data." });
  } else {
    // Extract user inputs
    const { title, content } = req.body;
    const postId = req.params.pid;

    // Update post
    db.query(
      "UPDATE posts SET title = ?, content = ? WHERE id = ?",
      [title, content, postId],
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          // Send back a responce by the new updated post
          res.status(200).json({ post: result[0] });
        }
      }
    );
  }
};

// The following method is used to hanlde the delete request for a specific post (journal).
const deletePost = (req, res, next) => {
  // Extract post id
  const postId = req.params.pid;

  // Get the image path to delete it from the local storage
  let imagePath;
  db.query("SELECT * FROM posts WHERE id = ?", [postId], (error, result) => {
    if (error) {
      console.log(error);
    } else {
      imagePath = result[0].imageUrl;
    }
  });
  // Delete post
  db.query("DELETE FROM posts WHERE id = ?", [postId], (error, result) => {
    if (error) {
      console.log(error);
    } else {
      // Send back a success response
      res.status(200).json({ post: postId });
    }
  });

  // Remove the image from the images file
  setTimeout(() => {
    fs.unlink(imagePath, (err) => {
      console.log(err);
    });
  }, 1000);
};

// Export all the methods
exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.getPostsByUserId = getPostsByUserId;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
