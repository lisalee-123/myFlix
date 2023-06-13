const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node module
  path = require("path"), // import built in node module
  uuid = require("uuid"),
  bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect("mongodb://localhost:27017/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  // creates a write stream
  flags: "a", //log.txt file created, path.join appends text stream to to the file
});

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

app.get("/", (req, res) => {
  res.send("Welcome to myFlix Movie App!");
});

app.use(bodyParser.json());

// Return a list of ALL movies to the user
// READ - Get all movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
// READ - Get a movie info by title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Return data about a genre (description) by name/title (e.g., “Thriller”)
//READ - get the genre info by genre name
app.get("/genre/:Name", (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name })
    .then((movie) => {
      if (movie) {
        res.json(movie.Genre);
      } else {
        res.status(404).send("Genre not found.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Return data about a director (bio, birth year, death year) by name
//READ - get the director info by director name
app.get("/director/:Name", (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name })
    .then((movie) => {
      if (movie) {
        res.json(movie.Director);
      } else {
        res.status(404).send("Director not found.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Allow new users to register
//CREATE - Allow new users to register
app.post("/users", (req, res) => {
  Users.findOne({ UserName: req.body.UserName }) //to check if a user already exists
    .then((user) => {
      if (user) {
        // = if user exists
        return res.status(400).send(req.body.UserName + "already exists"); //error-message, because user exists already
      } else {
        Users.create({
          //create the user
          UserName: req.body.UserName,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          }) //CALLBACK
          .catch((error) => {
            // catch schedules a function to be called when the promise is rejected
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

//Allow users to update their data
//PUT
app.put("/users/:UserName", (req, res) => {
  Users.findOneAndUpdate(
    { UserName: req.params.UserName },
    {
      $set: {
        UserName: req.body.UserName,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Allow users to add a movie to their list of favorites
app.post("/users/:UserName/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { UserName: req.params.UserName },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Allow users to delete a movie from their list of favorites
app.delete("/users/:UserName/Movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { UserName: req.params.UserName },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//Allow existing users to deregister
app.delete("/users/:UserName", (req, res) => {
  Users.findOneAndRemove({ UserName: req.params.UserName })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.UserName + " was not found");
      } else {
        res.status(200).send(req.params.UserName + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ - Get all users
app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ - Get a user by name
app.get("/users/:UserName", (req, res) => {
  Users.findOne({ UserName: req.params.UserName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.use(express.static("public"));

//error handler, place last in a chain, but before app.listen
app.use((err, req, res, next) => {
  console.error(err.stack); //err.stack logs the error in the terminal
  res.status(500).send("Ooops, something went wrong");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
