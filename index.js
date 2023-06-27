const express = require('express'),
  app = express(),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json());

let users = [
  {
  id: 1,
  name: "Kim",
  favoriteMovies: ["Avatar"]
  }
];

let movies = [
  {
    "Title": "Avatar",
    "Description": "Blue People",
    "Genre": {
      "Name": "Drama",
      "Description": "Dramatic"
    },
    "Director": {
      "Name": "James Cameron",
      "Bio": "Made Titanic and Avatar.",
      "Birth": 1969.0
    },
    "ImageURL": "https://i.insider.com/6395e788c4e31900185d2bd7?width=2000&format=jpeg&auto=webp",
    "Featured":false
  },
];

let topTenMovies = [
    {
        title: 'Scott Pilgrim vs. the World',
        director: 'Edgar Wright',
        rank: 1
    },
    {
        title: 'Baby Driver',
        director: 'Edgar Wright',
        rank: 2
    },
    {
        title: 'Sherlock Holmes',
        director: 'Guy Ritchie',
        rank: 3
    },
    {
        title: 'Avatar',
        director: 'James Cameron',
        rank: 4
    },
    {
        title: 'Inglorious Basterds',
        director: 'Quentin Tarantino',
        rank: 5
    },
    {
        title: 'The Grand Budapest Hotel',
        director: 'Wes Anderson',
        rank: 6
    },
    {
        title: 'Last Night in Soho',
        director: 'Edgar Wright',
        rank: 7
    },
    {
        title: 'Everything, Everywhere, All at Once',
        director: 'The Daniels',
        rank: 8
    },
    {
        title: 'Inception',
        director: 'Chritopher Nolan',
        rank: 9
    },
    {
        title: 'Moulin Rouge',
        director: 'Baz Luhrman',
        rank: 10
    }
  ];

app.use(morgan('common'));

app.use(express.static('public'));

// CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('users need names')
  }
});

// UPDATE
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }
});

// CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send("${movieTitle} has been added to user ${id}'s array");
  } else {
    res.status(400).send('no such user')
  }
});

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send("${movieTitle} has been removed from user ${id}'s array");
  } else {
    res.status(400).send('no such user')
  }
});

// DELETE
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user = users.filter( user => user.id != id);
    res.status(200).send("user ${id} has been deleted");
  } else {
    res.status(400).send('no such user')
  }
});

// READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// READ
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie')
  }

});

// READ
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre')
  }
  
});

// READ
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director')
  }
  
});

app.get('/', (req, res) => {
  res.send('Hey there cool kids, welcome to Film Fanatic! The movie API that makes all your dreams come true! ;)');
});

app.get('/favoritemovies', (req, res) => {
  res.json(topTenMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});