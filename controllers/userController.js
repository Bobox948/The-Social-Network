const User = require("../models/user");
const Message = require("../models/message");
const multer  = require('multer')
const bcrypt = require('bcryptjs');
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


const storage = multer.diskStorage({ // storage for avatar uploads
    destination: function(req, file, cb) {
      cb(null, './public/images/')
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  
  const upload = multer({ storage: storage })


exports.index = asyncHandler(async (req, res, next) => {

    let messages_list;
    let user;
    let user2;
    let mymsg = []
    let notliked = []

    if (!req.user) { // if there is no user logged in 
        return res.render("index", {title:"The Social Network", user: req.user, message:"", messages_list:""})
    } else {
        try { // else if there is, try


            user = await User.findOne({ "_id": req.user.id}).exec() // find the current user in the db
          

            messages_list = await Message.find()
            .sort({ date: -1 })
            .populate({ // populate with comments and the comments infos like the author
              path: 'comments',
              populate: { path: 'author', model: 'User' }
            })
            .populate('author')
            .exec();

            user2 = await User.findOne({ "_id": req.user.id }).populate('requests').exec(); // find actual user with requests populated

            for (let i=0; i<messages_list.length; i++) // for all messages (loop)
            {

                if (user.friends.includes(messages_list[i].author._id)) // if the author of the message is in the actual user's friends
                {

                    mymsg.push(messages_list[i]) // push to the array mymsg

                }

               if (!messages_list[i].wholiked.includes(user.id)) // if the message has not in his "wholiked" array the actual user, then push it to notliked array
                {

                    notliked.push(messages_list[i]._id)                    
    
                }



            }

            






           



            res.render("index", {title:"The Social Network", notliked: notliked, requests: user2.requests, user: req.user, messages_list: mymsg, message:""})


        } catch(err) {
            return next(err);
        }
    }

});


  
exports.user_create_get = asyncHandler(async (req, res, next) => {
   
    res.render('sign-up-form', { title:"The Social Network", username: "", error:""});

  });
  
  
exports.user_create_post = [

    upload.single("image"),

    body('username').trim().escape().isLength({ min: 5 }),
    body('password').isLength({ min: 5 }),
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),

    asyncHandler(async (req, res, next) => {
        var error =""
        const errors = validationResult(req);
        var exists = await User.find({ "username": req.body.username }).exec()

        if (!errors.isEmpty()) {
            error = "Passwords do not match"
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('sign-up-form', { title:"The Social Network", username: req.body.username, error:error});
            return;
        }
        else if (exists.length > 0)
        {

            error = "Username already in use"
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('sign-up-form', {title:"The Social Network",username: req.body.username, error:error});
            return;
            
        }
        else {
            // Data from form is valid.
            next();
        }
    }),

    asyncHandler(async (req, res, next) => {


   

    try {
        
        // Hash the password
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if(err) {
                // Handle error here
                return next(err);
            }



            let imagePath;

            if (req.file) {
                imagePath = '/images/' + req.file.filename;
            } else {
                imagePath = '/images/empty.webp';
            }
            
            const user = new User({
                username: req.body.username,
                password: hashedPassword,
                image: imagePath,
            });


            const result = await user.save();
            res.redirect("/");
        });
    } catch(err) {
        return next(err);
    };
}),
];

exports.user_login_post = asyncHandler(async (req, res, next) => {



    passport.authenticate('local', (err, user, info) => {
        let messages_list;
        let user2;
        let user3;
        let mymsg = [];
        let notliked = []

        if (err) { 
            return next(err); 
        }

        // if user not authenticated
        if (!user) { 
            
            return res.render("index", {title:"The Social Network", message:'Bad credentials', messages_list:""})
        }

        req.logIn(user, async (err) => { // Mark this function as async
            if (err) { 
                return next(err); 
            }

            user = await User.findOne({ "_id": req.user.id}).exec()
       

            messages_list = await Message.find()
            .sort({ date: -1 })
            .populate({
              path: 'comments',
              populate: { path: 'author', model: 'User' }
            })
            .populate('author')
            .exec();
            
            user2 = await User.findOne({ "_id": req.user.id }).populate('requests').exec();
            user3 = await User.findOne({ "_id": req.user.id }).populate('friends').exec();

            for (let i=0; i<messages_list.length; i++)
            {

                if (user.friends.includes(messages_list[i].author._id))
                {

                    mymsg.push(messages_list[i]) // comments like in the index page above

                }
                if (!messages_list[i].wholiked.includes(user.id))
                {

                    notliked.push(messages_list[i]._id)                    
    
                }

            }



            res.render("index", {title:"The Social Network", notliked: notliked, friends: user3.friends, requests: user2.requests, user: req.user, messages_list: mymsg, message:""})
        });

    })(req, res, next); 
});


exports.user_logout_get = asyncHandler((req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
});


exports.user_detail = asyncHandler(async (req, res, next) => {

    const user1 = await User.findById(req.params.id) // find the user that is passed in the params (link of user profile)

    const actual_user = await User.findOne({ "_id": req.user.id}).exec() // actual user
    const id2 = req.params.id

    var id_str = actual_user._id.toString(); // because it was object type so we could not == in the ejs view with the id params string

    let messages_list;
    let user3;
    let notliked = []
    let friends = false // false by default, if they are friends it will be changed to true, same for request
    let request = false


    if (user1.friends.includes(actual_user.id)) { // if the "friends" array of the model of the user includes the actual user, friends will become true

        friends = user1.friends.includes(actual_user.id);
    }
    
    if (user1.requests.includes(actual_user.id))
    {

        request = user1.requests.includes(actual_user.id); // will become true

    }

    if (id2 === id_str) // if the profile visited is the actual user

    {
  

    messages_list = await Message.find({ author: actual_user._id }) // the messages will be the ones of the actual user
    .sort({ date: -1 })
    .populate({
      path: 'comments',
      populate: { path: 'author', model: 'User' }
    })
    .populate('author')
    .exec();

}

    else
    {

        messages_list = await Message.find({ author: user1._id }) // or another user
        .sort({ date: -1 })
        .populate({
          path: 'comments',
          populate: { path: 'author', model: 'User' }
        })
        .populate('author')
        .exec();
    }
    
    user3 = await User.findOne({ "_id": req.params.id }).populate('friends').exec(); // find actual user with friends populated


    for (let i=0; i<messages_list.length; i++)
    {

        if (!messages_list[i].wholiked.includes(actual_user.id))
        {

            notliked.push(messages_list[i]._id)                    

        }

    }
    


 

    res.render("user_detail", {
      user1: user1,
      actual_user: actual_user,
      friends: friends,
      request: request,
      messages_list: messages_list,
      id:id2,
      id_str:id_str,
      title: "User detail",
      notliked: notliked,
      friends_list: user3.friends
    });
  }); 
  

exports.user_search_get = asyncHandler(async (req, res, next) => { 

    
    try {
        const user = await User.findOne({"username": req.query.search}).exec(); // user typed in the search bar is passed in the "query"
        if (user) {
            res.render("search", {

                user: user,
                title: "Results"
          
              });
                
            } else {
                res.redirect('/?user_not_found=true'); // this will trigger the alert, see the JS code in the index.ejs

        }
    } catch(err) {
        next(err);
    }
});

exports.add_friend_post = asyncHandler(async (req, res, next) => {
    const actual_user = await User.findOne({ "_id": req.user.id}).exec()
    const user_to_add = await User.findById(req.body.itemid) // the user to add in the "add friend" button which id is "itemid"

    user_to_add.requests.push(actual_user.id); // the request is sent, they will become friend if the user accepts the request
    await user_to_add.save(); 

    // Send response to the client
    res.redirect("/");


});






exports.accept_friend_post = asyncHandler(async (req, res, next) => {

    const actual_user = await User.findOne({ "_id": req.user.id}).exec()
    const user_to_add = await User.findById(req.body.itemid)


    user_to_add.friends.push(actual_user.id); // add the actuel user to the friend's array

    await user_to_add.save();

    actual_user.friends.push(user_to_add.id); // add the user to the actual user friend's array of the model

    await actual_user.save();

    let index = actual_user.requests.indexOf(user_to_add.id);

    if(index !== -1) {
        actual_user.requests.splice(index, 1); // delete the request of the actual user (not all requests, only the one of the user to add)
    }

    await actual_user.save();


    // Send response to the client
    res.redirect("/");
});

exports.decline_friend_post = asyncHandler(async (req, res, next) => {

    const actual_user = await User.findOne({ "_id": req.user.id}).exec()

    const user_to_add = await User.findById(req.body.itemid)

   
    let index = actual_user.requests.indexOf(user_to_add.id);

    if(index !== -1) {
        actual_user.requests.splice(index, 1); // delete the request of the actual user (not all requests, only the one of the user to add)
    }

    await actual_user.save();

    res.redirect("/");



});
