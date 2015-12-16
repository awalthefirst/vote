var express = require('express');
var router = express.Router();

var User = require('../model/users');
var polls = require('../model/polls');


/* GET mypolls. */
router.get('/', function(req, res, next) {

	/* check for session*/
	if (req.votesession && req.votesession.user) {
		User.findOne({
				email: req.votesession.user.email
			},
			/* if session no ! render home*/
			function(err, user) {
				if (!user) {
					req.votesession.reset();
					res.redirect('/');
				}
				/*if there is a session render mypolls*/
				else {

					polls.find({
						username: req.votesession.user.username
					}, function(err, user) {

						var userPolls = false;
						if(user !== null && user.length > 0){
								var userPolls = true;
						}
					  res.locals.user = user.username;
						res.render('mypolls', {
							title: 'mypolls',
							login: true,
							username:req.votesession.user.username,
							userPolls: userPolls
						});
					})

				}

			})
	} else {
		req.votesession.reset();
		res.redirect('/');
	}

});



module.exports = router;