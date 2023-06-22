const express = require('express'),
  morgan = require('morgan');

const app = express();

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

app.get('/', (req, res) => {
  res.send('Hey there cool kids, welcome to Film Fanatic! The movie API that makes all your dreams come true! ;)');
});

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});