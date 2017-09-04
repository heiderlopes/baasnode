var Mongoose = require('Mongoose');

var express = require('express');

var bodyParser = require('body-parser');

var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org')

var app = express();

var db = Mongoose.connection;

var port = process.env.PORT || 8080;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//Entregar arquivos estaticos
app.use(express.static('public'));

// parse application/json
app.use(bodyParser.json())

db.on('error', console.error);
db.once('open', function() {
  console.log('Conectado ao MongoDB.')
});

var movieSchema = new Mongoose.Schema({
  title: { type: String },
  rating: String,
  releaseYear: Number,
  hasCreditCookie: Boolean
});

var Movie = Mongoose.model('Movie', movieSchema);

Mongoose.connect('mongodb://user:pass@ds121014.mlab.com:21014/baas');

// respond with "hello world" when a GET request is made to the homepage
app.post('/', function(req, res) {

  console.log(req.body);
  var movie = new Movie(req.body);
  movie.save(function(err, thor) {
	  if (err) return console.error(err);
	  console.log(thor);
	  console.log('Sucesso');
	});
	res.send(200);
});

app.get('/', function(req, res) {
	Movie.findOne({ title: 'Thor' }, function(err, movies) {
	  if (err) return console.error(err);
	  console.log(movies);
	  res.send(movies);
	});
});

client.on('connect', function() { // When connected
  //Subscribe
  client.subscribe('teste', function() {
    client.on('message', function(topic, message, packet) {
      console.log("Received '" + message + "' on '" + topic + "'");
    });
  });

  // publish a message to a topic
  client.publish('teste', 'my message', function() {
    console.log("Message is published");
  });
});

var server = app.listen(3000);
console.log('Servidor Express iniciado na porta %s', server.address().port);

/*
// Buscando um unico filme pelo nome
Movie.findOne({ title: 'Thor' }, function(err, thor) {
  if (err) return console.error(err);
  console.dir(thor);
});

// Buscando todos os filmes
Movie.find(function(err, movies) {
  if (err) return console.error(err);
  console.dir(movies);
});

// Buscando todos os filmes que possuem 'credit cookie'.
Movie.find({ hasCreditCookie: true }, function(err, movies) {
  if (err) return console.error(err);
  console.dir(movies);
});
*/