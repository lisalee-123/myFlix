const express = require("express"),
  morgan = require("morgan");
(fs = require("fs")), // import built in node module
  (path = require("path")); // import built in node module

const app = express();

const top10Movies = [
  {
    title: "Movie1",
    year: 2020,
  },
  {
    title: "Movie 2",
    year: 2019,
  },
  {
    title: "Movie3",
    year: 2020,
  },
  {
    title: "Movie4",
    year: 2019,
  },
  {
    title: "Movie5",
    year: 2020,
  },
  {
    title: "Movie6",
    year: 2019,
  },
  {
    title: "Movie7",
    year: 2020,
  },
  {
    title: "Movie8",
    year: 2019,
  },
  {
    title: "Movie9",
    year: 2020,
  },
  {
    title: "Movie10",
    year: 2019,
  },
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  // creates a write stream
  flags: "a", //log.txt file created, path.join appends text stream to to the file
});

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

app.get("/", (req, res) => {
  res.send("Welcome to myFlix Movie App!");
});

app.get("/movies", (req, res) => {
  res.json(top10Movies);
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
