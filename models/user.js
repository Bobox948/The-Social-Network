const mongoose = require("mongoose");

const Schema = mongoose.Schema;




const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  requests: [{ type: Schema.Types.ObjectId, ref: 'User' }], // array
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }], // array
  image: {type: String, default: "/images/empty.webp"} // if there user doesn't choose an avatar, the default one applies

  
});


UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `${this._id}`;
});

  

// Export model
module.exports = mongoose.model("User", UserSchema);



