var express    = require('express');
var path = require('path');
var app        = express();

app.set('port', (process.env.PORT || 5000));
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

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
