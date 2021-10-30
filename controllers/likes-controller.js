const mysql = require("mysql");
const uuid = require("uuid");

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

let postid1 = "";

const addLike = async (req, res, next) => {
  let { postId, userId } = req.body;
  // console.log(count);
  postid1 = postId;
  db.query(
    "INSERT INTO likes (id, postId, userId) VALUES (?,?,?)",
    [uuid.v4(), postId, userId],
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        db.query(
          `SELECT userId FROM likes WHERE postId='${postId}'`,
          (error, result) => {
            if (error) {
              console.log(error);
            } else {
              res.status(201).json({ res: result.length });
            }
          }
        );
        // res.status(201).json({ like: result[0] });
      }
    }
  );
};

// The following method is used to hanlde the delete request for a specific post (journal).
const deletelike = (req, res, next) => {
  // Extract post id
  // const userId = req.params.id;
  const { userId, postId } = req.body;

  // Delete like when user click the unlike button from frontend
  db.query("DELETE FROM likes WHERE userId = ?", [userId], (error, result) => {
    if (error) {
      console.log(error);
    } else {
      db.query(
        `SELECT userId FROM likes WHERE postId='${postId}'`,
        (error, result) => {
          if (error) {
            console.log(error);
          } else {
            // console.log(result, "result");
            res.status(201).json({ res: result.length });
          }
        }
      );
      // res.status(200).json({ like: result });
    }
  });
};

// this check weather the specific user has liked already a specific post

const checklike = async (req, res, next) => {
  let userId = req.params.id;
  let postId = req.params.postid;
  db.query(
    "SELECT id FROM likes WHERE userId LIKE ? AND postId LIKE ?",
    [userId, postId],
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        if (result.length == 0) {
          res.status(201).json({ disable: false });
        } else {
          res.status(201).json({ disable: true });
        }
      }
    }
  );
};

// it returns the count of all likes of the specific post

const getLikes = async (req, res, next) => {
  const postId = req.params.postid;
  console.log(postId);
  await db.query(
    "SELECT userId  FROM likes WHERE postId=?",
    [postId],
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.status(201).json({ likeslength: result.length });
      }
    }
  );
};

exports.addLike = addLike;
exports.checklike = checklike;
exports.getLikes = getLikes;
exports.deletelike = deletelike;
