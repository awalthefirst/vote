var express = require('express');
var router = express.Router();


/* GET voting page. */
router.get('/', function(req, res, next) {

	if (req.query.id === undefined || req.query.id === null) {

		res.redirect('/');

	} else {

		if (req.votesession && req.votesession.user) {
			res.render('votes', {
				title: 'Vote_it',
				login: true
			});

		} else {
			res.render('votes', {
				title: 'Vote_it',
				login: false
			});
		}

	}

});


module.exports = router;