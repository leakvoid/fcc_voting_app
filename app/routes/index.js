'use strict';

var path = process.cwd();
var PollController = require(path + '/app/controllers/poll_controller.js');

module.exports = function (app, passport) {

    var poll_controller = new PollController();

    app.route('/')
        .get(function(req, res) {
            res.redirect('/polls');
        });

    // GET show all polls for user
    app.route('/users/:user_id/polls')
        .get(poll_controller.index_for_user);

    // GET show all polls
    app.route('/polls')
        .get(poll_controller.index);

    // GET new poll form
    app.route('/polls/new')
        .get(poll_controller.new_item);

    // POST add new poll
    app.route('/polls')
        .post(poll_controller.create);

    // GET show voting for poll, MIGHT handle EDIT and DELETE cases
    app.route('/polls/:poll_id')
        .get(poll_controller.show);

    // GET show graph for poll
    app.route('/polls/:poll_id/chart')
        .get(poll_controller.show_chart);

    // PATCH update poll by adding new option
    app.route('/polls/:poll_id/patch')
        .post(poll_controller.update);

    // DELETE poll
    app.route('/polls/:poll_id/delete')
        .post(poll_controller.destroy);

    // POST add new vote
    app.route('/votes')
        .post(poll_controller.register_vote);

    app.route('/logout')
	.get(function (req, res) {
	    req.logout();
	    res.redirect('/polls');
	});

    app.route('/auth/github')
	.get(passport.authenticate('github'));

    app.route('/auth/github/callback')
	.get(passport.authenticate('github', {
	    successRedirect: '/polls',
	    failureRedirect: '/polls'
	}));



    /*
	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});


	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});


	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
    */
};
