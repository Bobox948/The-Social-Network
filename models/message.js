const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;


var MessageSchema = new Schema({ // messages are truly "Posts"
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: Number, default: 0 },
  wholiked: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  

});
  
MessageSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_MED);
}); // formatted date for better/cleaner rendering

// Export model
module.exports = mongoose.model("Message", MessageSchema);


