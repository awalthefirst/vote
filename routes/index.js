var express = require('express');
var router = express.Router();
var User = require('../model/users');
var polls = require('../model/polls');
var bcrypt = require("bcryptjs");


/* GET home page. */
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
          res.render('index', {
            title: 'VoteBook',
            login: false
            
          });
        }
        /*if there is a session render home*/
        else {
          res.locals.user = user;
          res.render('index', {
            title: 'VoteBook',
            login: true
   
          });
        }
      })
  } else {
    req.votesession.reset();
    res.render('index', {
      title: 'VoteBook',
      login: false
    });
  }

});


/* login */
router.post('/login', function(req, res, next) {

  User.findOne({
    email: req.body.email
  }, function(err, user) {

    /*wrong email*/
    if (!user) {
      res.render('index', {
        title: 'VoteBook',
        login: false,
        loginError: 'Invalid login or password'
      });
    } else {

      if (bcrypt.compareSync(req.body.password, user.password)) {
        /*log user in*/
        /*create a cookie session */
        req.votesession.user = user;
        res.redirect('/mypolls')

        /*wrong password*/
      } else {
        res.render('index', {
          title: 'VoteBook',
          login: false,
          loginError: 'Invalid login or password'
        });
      }
    }
  })

});


/*logouts */

router.get('/logout', function(req, res, next) {
  req.votesession.reset();
  res.render('index', {
    title: 'VoteBook',
    login: false
  });
})


/* =post new polls*/

router.post('/polls', function(req, res, next) {

  /* check for session*/
  if (req.votesession && req.votesession.user) {

    /*check for user existance*/
    User.findOne({
        email: req.votesession.user.email
      }, function(err, user) {
        /*fake user render home*/
        if (!user) {
          req.votesession.reset();
          res.render('index', {
            title: 'VoteBook',
            login: false
          });

          /* user exit validate poll post*/
        } else {

          /* check if new poll alredy exit*/
          polls.findOne({
            pollName: req.body.pollName.toLowerCase()
          }, function(err, user) {

            if (user == null) {
              /*try and save poll*/
              var choice = {};
              req.body.choice.forEach(function(val){
                choice[val] = 1;
              });
              var poll = new polls({
                username: req.votesession.user.username,
                pollName: req.body.pollName.toLowerCase(),
                polls: {
                  name: req.body.pollName.toLowerCase(),
                  choice:choice,
                  state: req.body.state,
                  username: req.votesession.user.username
                }
              })

              poll.save(function(err, user) {
                if (err) {
                  res.locals.user = user;
                  res.render('mypolls', {
                    title: 'Mypolls',
                    login: true,
                    username:user.username,
                    error: 'Oops something went wrong try again'
                  });

                  /* everything is working*/
                } else {
                   res.redirect('/mypolls')
                }
              })

              /* poll alredy exit send err*/
            } else {
              res.locals.user = user;
              res.render('mypolls', {
                title: 'Mypolls',
                login: true,
                username:user.username,                
                error: 'Poll name exit'
              });

            }

          });
        }
      }) /* findOne func ends*/
      /*no session render home*/
  } else {
    req.votesession.reset();
    res.render('index', {
      title: 'VoteBook',
      login: false
    });
  }
});


/*sign up*/
router.post('/signup', function(req, res, next) {

  /*check if username exits*/
  User.findOne({
    username: req.body.username.toLowerCase()
  }, function(err, user) {

    /* if username exits throw err*/
    if (user !== null && user.username === req.body.username.toLowerCase()) {
      res.render('index', {
        title: 'VoteBook',
        login: false,
        signupError: 'Username Taken'
      });
    }

    /* if username don't exits check if email exits*/
    else {
      User.findOne({
        email: req.body.email.toLowerCase() /*  nested findOne*/
      }, function(err, user) {

        /* if email exits throw err*/
        if (user !== null && user.email === req.body.email.toLowerCase()) {
          res.render('index', {
            title: 'VoteBook',
            login: false,
            signupError: 'Email exist'
          });
        }

        /* if emial and username don't exits store user*/
        else {
          var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
          
          var user = new User({
            username: req.body.username.toLowerCase(),
            email: req.body.email.toLowerCase(),
            password: hash
          })

          /* if err occure when storing user throw err*/
          user.save(function(err, user) {
            if (err) {
              res.render('index', {
                title: 'VoteBook',
                login: false,
                signupError: 'Oops Try Again'
              });
            }

            /* if every is working send user to dash*/
            else {
              req.votesession.user = user;
              res.redirect('/mypolls')
            }
          })
        } /*tring to store data ends*/

      }) /*  nested findOne ends*/

    }
  }) /*first  find one ends*/

});

module.exports = router;