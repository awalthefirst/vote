var express = require('express');
var router = express.Router();

var User = require('../model/users');
var polls = require('../model/polls');


/*all polls*/
router.get('/', function(req, res, next) {
	polls.find({}, function(err, polls) {

		if (err) {
			res.setHeader('Content-Type', 'application/json');
			res.status(404).send('some went wrong');
		} else {
			var Arr = []
			polls.forEach(function(val) {
				Arr.push(val.polls)
			})
			res.setHeader('Content-Type', 'application/json');
			res.json(Arr)
		}

	});
});


/*user polls*/
router.get('/user/:name', function(req, res, next) {


	polls.find({
		username: req.params.name
	}, function(err, polls) {

		if (err) {
			res.status(404).send('some went wrong');
		} else {
			/* just give me user created polls*/
			var Arr = []
			polls.forEach(function(val) {
				Arr.push(val.polls)
			})

			res.setHeader('Content-Type', 'application/json');
			res.json(Arr)

		}

	});

});


/*specific user polls*/
router.get('/votes/:name', function(req, res, next) {
	console.log("work")
	polls.find({
		username: req.params.name,
		pollName: req.query.id
	}, 'polls', function(err, polls) {

		if (err) {
			res.status(404).send('some went wrong');
		} else {

			try {
				res.setHeader('Content-Type', 'application/json');
				res.json(polls[0].polls);
			} catch (err) {
				res.status(404).send('some went wrong');
			}
		}

	});

});


/*vote on a poll*/
router.get('/votes/:pollname/:choice', function(req, res, next) {

	function addVote(opt) {

		var obj = {};
		var name = "polls.choice." + req.params.choice;
		obj[name] = 1;

		polls.update({
			"pollName": req.params.pollname
		}, {
			$inc: obj
		}, function(err, data) {
			if (err) {
				res.status(404).send("failed")
			} else {

				if (opt && opt.cookies) {

					req.Voted[opt.pollid] = opt.pollid;
					res.send("voted")
				} else {
					res.send("vote added")
				}
			}
		})

	}


	if (req.votesession && req.votesession.user) {
		User.findOne({
			username: req.votesession.user.username
		}, function(err, user) {
			if (err) {
				return res.status(404).send('something went wrong');
			} else {

				polls.findOne({
					pollName: req.params.pollname
				}, 'polls', function(err, poll) {
					if (err) {
						return res.status(404).send('Hmm something is wrong')
					};
					var pollid = poll._id;

					if (user.votes.indexOf(pollid) >= 0) {
							return res.status(404).send('Already voted')
					} else {

						User.findOneAndUpdate({ username: req.votesession.user.username}, 
							{ $push: {votes: pollid }	}, {
								safe: true,
								upsert: true
							}, function(err, user) {
         			
								if(err){
									return res.status(404).send('Hmm something is wrong')
								}else{	
									addVote();
								}
							
						})

					}


				});

			}

		})


	} else {
		/*if user is not loged in */
		polls.findOne({
			pollName: req.params.pollname
		}, 'polls', function(err, poll) {

			if (err) {
				return res.status(404).send('Hmm something is wrong')
			};

			var pollid = poll._id;

			/*check if poll is private*/
			if (poll.polls.state === "private") {
				return res.status(404).send("only signed users can vote");
			}

			/* check if they have any vote cookie*/
			if (req.Voted && req.Voted[pollid]) {

				if (req.Voted[pollid] == pollid) {
					res.status(404).send('Already Voted')
				} else {
					addVote({
						"cookies": true,
						"pollid": pollid
					});

				}

			} else { /* they don't have any cookie*/
				addVote({
					"cookies": true,
					"pollid": pollid
				}); /*save their vote*/
			}



		});


	}


});



/*delete poll*/
router.get('/delete/:pollname', function(req, res, next) {

	if (req.votesession && req.votesession.user) {

		/*check if it's a real user*/
		User.findOne({
				email: req.votesession.user.email
			},
			/* if session no fake user*/
			function(err, user) {
				if (!user) {
					req.votesession.reset();
					res.status(404).send("something went wrong");
				} /*if there it's real delete mypolls*/
				else {

					/*find the specific poll and delete*/
					polls.findOneAndRemove({
						username: req.votesession.user.username,
						pollName: req.params.pollname
					}, 'polls', function(err, polls) {

						if (err) {
							res.status(404).send('Some went wrong');
						} else {
							res.send('Deleted');
						}

					});
				}
			})

		/*no session send err*/
	} else {
		req.votesession.reset();
		res.status(404).send("something went wrong");
	}

});



module.exports = router;