var express    = require('express');
var path = require('path');
var app        = express();
app.use(express.static(path.join(__dirname, 'public')));

var router = express.Router();
router.use(function(req, res, next) {
	console.log('Something is happening.');
	next();
});
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

app.use('/', router);

app.listen(6767);
console.log('Listening on 6767');
