'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {

    function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
	    return next();
	} else {
	    res.redirect('/polls');
	}
    }

    function isOwner() {
    }

    // GET show all polls for user
    app.route('/users/:user_id/polls')
        .get(isLoggedIn, function (req, res) {
            isOwner();
        });

    // GET show all polls
    app.route('/polls')
        .get(function(req, res) {
        });

    // GET new poll form
    app.route('/polls/new')
        .get(isLoggedIn, function(req, res) {
        });

    // POST add new poll
    app.route('/polls')
        .post(isLoggedIn, function(req, res) {
        });

    // GET show voting for poll
    app.route('/polls/:poll_id')
        .get(function(req, res) {
            isAuthenticated();// adding options
            isOwner();// deleting poll
            isAlreadyVoted();// grey button
        });

    // POST vote for item
    app.route('/polls/:poll_id/vote')
        .post(function(req, res) {
        });

    // GET show graph for poll
    app.route('/polls/:poll_id/chart')
        .get(function(req, res) {
        });

    // PATCH update poll by adding new option
    app.route('/polls/:poll_id')
        .patch(isLoggedIn, function(req, res) {
        });

    // DELETE poll
    app.route('polls/:poll_id')
        .delete(isLoggedIn, function(req, res) {
            isOwner();
        });









	var clickHandler = new ClickHandler();

	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
