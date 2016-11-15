'use strict';

var Users = require('../models/users.js');

function PollController() {

    function check_authentication(req, res, next) {
	if (req.isAuthenticated()) {
	    return next();
	}
        else {
            console.log('User is not authenticated');
	    res.redirect('/polls');
	}
    }

    function check_ownership(req, res, next) {
        if(req.user) {
            console.log(JSON.stringify(req.user));
            return next();
        }
        else {
            console.log('User <' + req.user + '> is not authorised to access <' + req.originalUrl + '>');
            res.redirect('/polls');
        }
    }

    this.index_for_user = [
        check_authentication,
        check_ownership,
        function(req, res) {
            Users
                .findOne({ '_id': req.params.user_id })
                .populate('polls')
                .exec( function(err, user) {
                    if(err) throw err;

                    res.render('index_for_user', { polls: user.polls });
                });
        }
    ];

    this.index = function(req, res) {
        Polls
            .find({})
            .exec( function(err, polls) {
                if(err) throw err;

                //var all_polls = users.reduce(function(prev, next) { prev.concat(next.polls); }, []);
                res.render('index', { polls: polls });
            });
    };

    this.new_item = [
        check_authentication,
        function(req, res) {
            res.render('new_item');
        }
    ];

    /*
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
    */

    function create_poll(data, callback) {
        var new_poll = Poll();
        new_poll._creator = get_user_id(req);
        new_poll.name = data.name;
        new_poll.choices = req.poll_data.choices;//CHECK huh

        new_poll.save( function(err, save_res) {
            if(err)
                return callback(err);

            callback(null, save_res);
        });
    }

    this.create = [
        check_authentication,
        function(req, res) {
            create_poll( req.poll_data, function(err, poll) {
                console.log('New Poll <'+ poll + '> created for User <' + poll._creator + '>');

                res.redirect('/polls/' + poll._id);// last insert id
            });
        }
    ];

    /*
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
    */

    function find_poll(poll_id, callback) {
        Polls
            .findOne({ '_id' : poll_id })
            .exec( function(err, poll) {
                if(err)
                    return callback(err);

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

    function find_existing_vote(req, callback) {
        var user_id = get_user_id(req);
        if( !user_id )
            return callback(null, null);

        Votes
            .findOne({
                $and: [
                    { 'vote_owner': user_id },
                    { '_creator._creator': poll_id }
                ]
            })
            .populate('_creator')
            .populate('_creator._creator')
            .exec( function(err, vote) {
                if(err)
                    return callback(err);

                callback(null, vote);
            });
    }

    this.register_vote = function(req, res) {
        find_existing_vote(req, function(err, vote) {
            if(err) throw err;

            if(vote) {
                console.log('User <' + JSON.stringify(req.user) + '> already voted for Poll <' + vote._creator._creator + '>');//CHECK anon user case
                redirect('/polls/' + req.params.poll_id + '/chart');//CHECK flash message
            } else {
                var new_vote = new Vote();
                new_vote._creator = req.vote_data.choice_id;
                new_vote.ip_address = get_ip_address(req);
                new_vote.user_id = get_user_id(req);//CHECK auth

                new_vote
                    .save()
                    .populate('_creator')
                    .populate('_creator._creator')
                    .exec( function(err, save_res) {
                        console.log('User <' + req.user +
                                    '> voted for Poll <' + save_res._creator._creator +
                                    '> with Choice <' + save_res._creator '>');

                        res.redirect('/polls/' + save_res._creator._creator._id + '/chart');
                    });
            }
        }
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

                var new_choice = { name: req.update_data.choice_name, votes: [] };// CHECK new Choice ();
                poll.choices.push( new_choice );

                poll.save(function(err, save_res) {
                    if(err) throw err;

                    var db_new_choice = save_res.choices.find(function(e) { return (e.name === new_choice.name); });
                    console.log('Added new Choice <' + JSON.stringify(db_new_choice) +
                                '> to the Poll <' + req.params.poll_id + '>');

                    req.vote_data.choice_id = db_new_choice._id;
                    this.register_vote(req, res);
                });
            });
        }
    ];

    this.destroy = [
        check_authentication,
        check_ownership,
        function(req, res) {
            Polls
                .remove({ _id: req.params.poll_id }, function(err) {
                    if(err) throw err;

                    console.log('Removed Poll <' + req.params.poll_id + '>');// CHECK remove secondary shit (votes, choices)

                    res.redirect('/polls');// CHECK flash message
                });
        }
    ];
}

module.exports = PollController;
