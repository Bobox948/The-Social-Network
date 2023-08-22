const User = require("../models/user");
const Message = require("../models/message");
const Comment = require("../models/comment");
const Dm = require("../models/dm");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");





exports.create_message_get = asyncHandler(async (req, res, next) => {
   
 
    res.render('create-message', {user: req.user, title: "Create message"})

  });
  
  
exports.create_message_post = asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
    
        const user = await User.findOne({ "_id": req.user.id}).exec() 

        const message = new Message({
          title: req.body.title,
          content: req.body.content,  
          author: user._id, // actual user
        });
    
        if (!errors.isEmpty()) {

          // if there are errors with render the create message form again with some populated fields
    
        
          res.render("create-message", {
            title: title,
            content: content,
            errors: errors.array(),
          });
        } else { // else redirect to index

          await message.save();
          res.redirect(`/user/${user.url}`);

        }
      })



exports.update_message_get = asyncHandler(async (req, res, next) => {



  const message = await Message.findOne({"_id": req.query.itemid}).exec();

  

    
        res.render("update", {title: message.title, content: message.content});
    })
    

exports.update_message_post = asyncHandler(async (req, res, next) => {

 // only owner can update, add this, it's already added in front but not in back

 const user = await User.findOne({ "_id": req.user.id}).exec()



  await Message.findByIdAndUpdate(req.query.itemid, {

title: req.body.title,
content: req.body.content
        }, {new: true});

        res.redirect(`/user/${user.url}`);


      })


exports.delete_message_post = asyncHandler(async (req, res, next) => {
        const user = await User.findOne({ "_id": req.user.id }).exec();
        const message = await Message.findById(req.body.itemid);
      
        // back end validation, ensures that the message exists and that the logged user is the owner of the message in order to delete it
        if (!message || message.author.toString() !== user._id.toString()) {
          return res.status(403).send('You are not authorized to delete this message.');
        }
      
        await Comment.deleteMany({ _id: { $in: message.comments } }); // delete associated comments
        await Message.findByIdAndRemove(req.body.itemid);
      
        res.redirect(`/user/${user.url}`);
      });

exports.like_message_post = asyncHandler(async (req, res, next) => {


const message = await Message.findOne({ "_id": req.body.itemid}).exec()

  await Message.findByIdAndUpdate(req.body.itemid, { $inc: { likes: 1 } }, { new: true }).exec(); // increment the likes of the message by one

  const actual_user = await User.findOne({ "_id": req.user.id}).exec()

  message.wholiked.push(actual_user.id); // push to "wholiked" array of the model so that one user can only like a specific message once and then the like button disappears

  await message.save();

  const user2 = await User.findOne({ "_id": message.author}).exec()


  
  if (req.body.fromPage === "index") { // if the like is from index, redirect to index, else, redirect to user profile

    res.redirect('/');
    
  } else 
  {

    res.redirect(`/user/${user2.url}`);

  }


  
        })

  exports.unlike_message_post = asyncHandler(async (req, res, next) => {
          const message = await Message.findOne({ "_id": req.body.itemid }).exec();
        
          // Decrement the likes of the message by one
          await Message.findByIdAndUpdate(req.body.itemid, { $inc: { likes: -1 } }, { new: true }).exec(); 
        
          const actual_user = await User.findOne({ "_id": req.user.id }).exec();
        
          // Find the index of the user in the "wholiked" array and remove it
          const index = message.wholiked.indexOf(actual_user.id);
          if (index > -1) {
            message.wholiked.splice(index, 1);
          }
        
          await message.save();
          const user2 = await User.findOne({ "_id": message.author}).exec()


  
  if (req.body.fromPage === "index") {

    res.redirect('/');
    
  } else 
  {

    res.redirect(`/user/${user2.url}`);

  }
        });


exports.comment_message_post = asyncHandler(async (req, res, next) => {


          const message = await Message.findOne({ "_id": req.body.itemid}).exec()
          

          const user = await User.findOne({ "_id": req.user.id}).exec()
          const user2 = await User.findOne({ "_id": message.author}).exec()

          const comment = new Comment({
            content: req.body.comment,  
            author: user._id, // actual user
          });
          await comment.save();

          message.comments.push(comment._id);

          await message.save();
          
          if (req.body.fromPage === "index") {

            res.redirect('/');
            
          } else 
          {

            res.redirect(`/user/${user2.url}`);

          }


            
            })
      
exports.messages_get = asyncHandler(async (req, res, next) => { // get the DM's


  const user = await User.findOne({"_id": req.user.id}).populate('friends').exec();

  const dms = await Dm.find({ "destination": req.user.id }).populate('author').exec(); // filter by destination == current user, so the DM's aimed to the current user

  

    
        res.render("messages", {user:user, title:"Send message", dms:dms});
    })


  
exports.messages_post = asyncHandler(async (req, res, next) => {



    
      const user = await User.findOne({ "_id": req.user.id}).exec()

        const dm = new Dm({
          content: req.body.content,  
          author: user._id, 
          destination: req.body.destination 
        });
    
        await dm.save();

        
      res.redirect("/messages");
    })
