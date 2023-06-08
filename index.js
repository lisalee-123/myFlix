const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node module
  path = require("path"), // import built in node module
  uuid = require("uuid"),
  bodyParser = require("body-parser");

const app = express();
const movies = require("./public/movies.js");
const users = require("./public/users.js");

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

//CREATE - POST - Allow new users to register
app.post("/users", (req, res) => {
  const newUser = req.body; //only possible because of the body-parser
  if (newUser.userName) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

//UPDATE - PUT - Allow users to update their user info (username)
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.userName = updatedUser.userName;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

//CREATE POST - Allow users to add a movie to their list of favorites (showing only a text that a movie has been added)
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array!`);
  } else {
    res.status(400).send("no such user");
  }
});

//DELETE - Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed)
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    ); //means we only want titles, that arent removed
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array!`);
  } else {
    res.status(400).send("no such user");
  }
});

//DELETE - Allow users to deregister showing only a text that a user email has been removed
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id); //means we only want users, that arent removed (id)
    res.json(users);
    // res.status(200).send(`user ${id} has been deleted from user array!`);
  } else {
    res.status(400).send("no such user");
  }
});

//READ Endpoint - return a list of ALL movies to the user
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//READ Endpoint - movie by title
app.get("/movies/:title", (req, res) => {
  //const title = req.params.title; //title corresponds to what is hardcoded into the url by the user
  const { title } = req.params; //new way of writing above code => object-destructuring
  const movie = movies.find((movie) => movie.title === title); //find-method takes a function as an argument

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("this movie does not exist in the myFlix data base!");
  }
});

//READ Endpoint - Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("this genre does not exist in the myFlix data base!");
  }
});

//READ Endpoint - Return data about a director (bio, birth year, death year) by name
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.director.name === directorName
  ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("this genre does not exist in the myFlix data base!");
  }
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
