const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
// custom middleware for handling embedding of twitch clips
const { videoOrigin, repeatURLParams, convertTwitchClip } = require('../middleware/customFunctions')

module.exports = {
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post });
    } catch (err) {
      console.log(err);
    }
  },
  randomPost: async (req, res) => {
    try {
      const postCount = await Post.find().then((data) => data.length);
      const randomNum = Math.floor(Math.random() * postCount);
      const post = await Post.find().skip(randomNum).limit(1);
      console.log(post[0]);
      res.render("randomPost.ejs", { post: post[0] });
    } catch (err) {
      console.log(err);
    }
  },
  addPost: (req, res) => {
    res.render("addPost.ejs");
  },
  createPost: async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);

      const post = await req.body;

      let videoClip;         
        if (videoOrigin(req.body.clip) === 'clips.twitch.tv' || videoOrigin(req.body.clip) === 'www.twitch.tv' ) {

          videoClip = convertTwitchClip(post.clip, 'www.thenungram.herokuapp.com', 'thenungram.herokuapp.com');    

        } else if ( videoOrigin(req.body.clip) === 'youtu.be' || videoOrigin(req.body.clip) === "www.youtube.com") {

          // for youtube videos 
          videoClip = req.body.clip;

        } else {
          videoClip = null;
        };
      
      await Post.create({
        caption: post.caption,
        image: result.secure_url,
        clip: videoClip(),
        author: req.user.displayName,
      });
      console.log("Post has been added");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
};
