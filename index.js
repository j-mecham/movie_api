const express = require('express'),
  cors = require('cors'),
  passport = require('passport'),
  app = express(),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js');
const { check, validationResult } = require('express-validator');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors())

require('./passport.js');
let auth = require('./auth.js')(app);

const Movies = Models.Movie;
const Users = Models.User;
//mongoose.connect('mongodb://127.0.0.1:27017/filmFanDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan('common'));
app.use(express.static('public'));

/** 
 * @function
 * Creates a new User with the Post Method
 * Query Parameters: None
 * Request body: JSON object of new user
 * Example:
 * {
 *  "Username": String,
 *  "Password": String,
 *  "Email": String,
 *  "Birthday": Date
 * }
 * Response Data: Object of new User with ID
 */ 
app.post('/users', [
  check('Username', 'Username must be at least 5 characters in length').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/** 
 * @function
 * Gets all movies with the Get method
 * Query Parameters: None
 * Request body: None
 * Response Data: Array of JSON Movie Objects
 */ 
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Gets all movies with a certain actor by name via the Get Method
 * Query Parameters: :Name
 * Request body: None
 * Response Data: Array of JSON Movie Objects with specified actor
 */ 
app.get('/movies/actors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ Actors: req.params.Name })
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Gets a movie by Title with the Get Method
 * Query Parameters: :Title
 * Request body: None
 * Response Data: JSON Movie Object
 */ 
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        res.status(400).send(req.params.Title + ' was not found');
      } else {
        res.status(200).json(movie);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Gets a genre by name with the Get Method
 * Query Parameters: :Name
 * Request body: None
 * Response Data: JSON object of specified Genre
 */ 
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((Name) => {
      if (!Name) {
        res.status(400).send(req.params.Name + ' was not found');
      } else {
        res.status(200).json(Name.Genre);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Gets a director by Name
 * Query Parameters: :Name
 * Request body: None
 * Response Data: JSON object of specified Director
 */ 
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((Name) => {
      if (!Name) {
        res.status(400).send(req.params.Name + ' was not found');
      } else {
        res.status(200).json(Name.Director);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Gets a user by Username
 * Query Parameters: :Username
 * Request body: None
 * Response Data: A JSON Object of the Specified User
 */ 
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Updates a user's info by username with the Put Method
 * Query Parameters: :id
 * Request body: JSON object with new info to be updated
 * Example: 
 * {
 *  "Username": String,
 *  "Password": String,
 *  "Email": String,
 *  "Birthday": Date
 * }
 * Response Data: JSON Object of the updated User
 */ 
app.put('/users/:Username', [
  check('Username', 'Username must be at least 5 characters in length').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], passport.authenticate('jwt', { session: false }), (req, res) => {
  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Adds a movie to the Users' Favorites list via Post Method
 * Query Parameters: :Username, :MovieID
 * Request body: None
 * Response Data: JSON Object of the user with movieID in FavoriteMovies Array
 */ 
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Deletes a movie from the Users' Favorites list via Delete Method
 * Query Parameters: :Username, :MovieID
 * Request body: None
 * Response Data: JSON Object of the user with movieID removed from FavoriteMovies Array
 */ 
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * @function
 * Deletes a user by ID with the Delete Method
 * Query Parameters: :Username
 * Request body: None
 * Response Data: Text saying the user has been deleted
 */ 
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/', (req, res) => {
  res.send('Hey there cool kids, welcome to Film Fanatic! The movie API that makes all your dreams come true! ;)');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port ' + port);
});