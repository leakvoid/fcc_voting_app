'use strict';

var path = process.cwd();
var PollController = require(path + '/app/controllers/poll_controller.js');

module.exports = function (app, passport) {

    // GET show all polls for user
    app.route('/users/:user_id/polls')
        .get(poll_controller.index_for_user);

    // GET show all polls
    app.route('/polls')
        .get(poll_contorller.index);

    // GET new poll form
    app.route('/polls/new')
        .get(poll_controller.new_item);

    // POST add new poll
    app.route('/polls')
        .post(poll_controller.create);

    // GET show voting for poll, MIGHT handle EDIT and DELETE cases
    app.route('/polls/:poll_id')
        .get(poll_controller.show);

    // POST vote for item
    app.route('/polls/:poll_id/vote')
        .post(poll_controller.register_vote);

    // GET show graph for poll
    app.route('/polls/:poll_id/chart')
        .get(poll_controller.show_chart);

    // PATCH update poll by adding new option
    app.route('/polls/:poll_id')
        .patch(poll_controller.update);

    // DELETE poll
    app.route('polls/:poll_id')
        .delete(poll_controller.destroy);








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
