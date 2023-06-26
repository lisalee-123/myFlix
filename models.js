const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
  //defining the Schema
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Year: { type: String, required: true },
  Genre: {
    //subdocument
    Name: String,
    Description: String,
  },
  Director: {
    //subdocument
    Name: String,
    Birth: String,
    Death: String,
    Bio: String,
  },
  ImagePath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
}); //reference format, to link the users collection to the movie collection, outputs an array

//creation of the models
let Movie = mongoose.model("Movie", movieSchema); //creates collection called db.movies
let User = mongoose.model("User", userSchema); //creates collection called db.users

//exporting the models
module.exports.Movie = Movie;
module.exports.User = User;
