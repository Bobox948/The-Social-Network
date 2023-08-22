const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;


var CommentSchema = new Schema({
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  

});
  
CommentSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_MED);
});
// Export model
module.exports = mongoose.model("Comment", CommentSchema);


