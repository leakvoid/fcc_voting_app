'use strict';

var Users = require('../models/users.js');

function PollController() {

    function check_authentication(req, res, next) {
	if (req.isAuthenticated()) {
	    return next();
	}
        else {
            console.log('User is not authenticated.');
	    res.redirect('/polls');
	}
    }

    function check_ownership(req, res, next) {
        if(req.user) {
            console.log(JSON.stringify(req.user));
            return next();
        }
        else {
            console.log('User "X" is not authorised to access url "Y"');
        }
    }

    this.index_for_user = [
        check_authentication,
        check_ownership,
        function(req, res) {
            Users
                .find({ '_id': req.params.user_id }, { '_id': false })//CHECK param
                .exec( function(err, user) {
                    if(err) throw err;

                    res.render('index_for_user', { polls: user.polls });
                });
        }
    ];

    this.index = function(req, res) {
        Users
            .find({}, { '_id': false })
            .exec( function(err, users) {
                if(err) throw err;

                var all_polls = users.reduce(function(prev, next) { prev.concat(next.polls); }, []);
                res.render('index', { polls: all_polls });
            });
    };

    this.new_item = [
        check_authentication,
        function(req, res) {
            res.render('new_item');
        }
    ];

    this.create = [
        check_authentication,
        function(req, res) {
            Users.findById( req.user, function(err, user) {//CHECK what is id
                if(err) throw err;

                var new_poll = { name: req.poll_data.name,
                                 choices: req.poll_data.choices };

                user.polls.push( new_poll );
                user.save( function(err, doc) {
                    if(err) throw err;

                    var added_poll_id = doc.polls.find(function(e) { return (e === new_poll); })._id;
                    res.redirect('/polls/' + added_poll_id);
                });
            });
        }
    ];

    //CHECK REFACTOR everything with :poll_id
    function find_poll(poll_id, callback) {
        Users
            .findOne({ 'polls._id': poll_id }, { '_id': false })
            .exec( function(err, user) {
                if(err)
                    return callback(err);

                var poll = user.polls.find(function(e) { return (e === poll_id); });// WTF
                callback(null, poll);
            });
    }

    this.show = function(req, res) {
        find_poll( req.params.poll_id, function(err, poll) {
            if(err) throw err;

            res.render('show', 
                       { auth_status: is_authenticated(),
                         owner_status: is_owner(),
                         poll: poll });
        });
        //isAuthenticated();// adding options
        //isOwner();// deleting poll
        //isAlreadyVoted();// grey button
    };

    this.register_vote = function(req, res) {
        find_poll( req.params.poll_id, function(err, poll) {
            if(err) throw err;

            // CHECK add logic

            res.redirect('/polls/' + req.params.poll_id + '/chart');
        });
        //isAlreadyVoted();
    };

    this.show_chart = function(req, res) {
        find_poll( req.params.poll_id, function(err, poll) {
            if(err) throw err;

            res.render('show_chart', { poll: poll });
        }
    };

    this.update = [
        check_authentication,
        function(req, res) {
            find_poll( req.params.poll_id, function(err, poll) {
                if(err) throw err;

                res.redirect('/polls/' + req.params.poll_id, '/chart');
            });
        }
    ];

    this.destroy = [
        check_authentication,
        check_ownership,
        function(req, res) {
            find_poll( req.params.poll_id, function(err, poll) {
                if(err) throw err;

                res.redirect('/polls');
            });
        }
    ];
}

module.exports = PollController;
