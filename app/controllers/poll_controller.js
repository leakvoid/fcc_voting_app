'use strict';

var Users = require('../models/users.js');
var mongoose = require('mongoose');

function PollController() {
    
    /* utility methods */

    function is_owner(req, owner_id) {
        if(req.user)
            return (req.user._id.toString() == owner_id.toString());
        else
            return false;
    }

    function get_user_id(req) {
        if(req.user)
            return req.user._id;
        else
            return null;
    }

    function parse_param_choices(p_data) {
        var result = [];

        for(var key in p_data) {
            if( !p_data.hasOwnProperty(key) ||
                key.indexOf('choice-') === -1 )
                continue;

            var arr = /choice-([0-9]+)/.exec(key);
            var index = parseInt(arr[1],10);

            if(p_data[key] !== '')
                result.push({ 'name': p_data[key], 'votes': [] });
        }

        return result;
    }

    /* middleware authentication methods */

    function check_authentication(req, res, next) {
	if(req.isAuthenticated()) {
	    return next();
	}
        else {
            console.log('User is not authenticated');
	    res.redirect('/polls');
	}
    }


    function check_ownership(req, res, next) {
        if( is_owner(req, req.params.user_id) ) {
            return next();
        }
        else {
            console.log('User <' + req.user + '> is not authorised to access <' + req.originalUrl + '>');
            res.redirect('/polls');
        }
    }

    function check_poll_ownership(req, res, next) {
        find_poll( req.params.poll_id, function(err, fp_res) {
            if(err) {
                console.log(err);
                res.redirect('/polls');
            } else {
                req.params.user_id = fp_res.user._id;
                check_ownership(req, res, next);
            }
        });
    }

    /* middleware validation methods */

    function validate_params(type) {//CHECK finish
        var params = Array.from(arguments).slice(1, arguments.length);

        return function(req, res, next) {
            params.forEach( function(p) {
                switch(p) {
                case 'user_id':
                    break;
                case 'poll_id':
                    break;
                case 'poll.name':
                    break;
                case 'poll.choices':
                    break;
                case 'choice.name':
                    break;
                case 'vote.choice_id':
                }
            });

            return next();

            //if( !mongoose.Types.ObjectId.isValid(poll_id) )
            //    return callback('Invalid poll_id');
        }
    }

    /* db access methods */

    function find_user( user_id, callback ) {
        Users
            .findById( user_id )
            .exec( function(err, user) {
                if(err)
                    return callback(err);

                if(!user)
                    return callback( new Error('User { \'_id\': ' + user_id + ' } not found') );

                callback(null, { 'user': user });
            });
    }

    function find_poll(poll_id, callback) {
        Users
            .findOne({ 'polls._id': poll_id })
            .exec( function(err, user) {
                if(err)
                    return callback(err);

                if(!user)
                    return callback( new Error('User with Poll { \'_id\': ' + poll_id + ' } not found') );

                var poll = user.polls.find(function(e) { return (e._id.toString() === poll_id); });
                callback(null, { 'user': user, 'poll': poll });
            });
    }

    function find_all_polls( callback ) {
        Users
            .find({})
            .exec( function(err, users) {
                if(err)
                    return callback(err);

                var all_polls = users.reduce(function(prev, next) { return prev.concat(next.polls); }, []);
                callback(null, { 'users': users, 'polls': all_polls });
            });
    }

    function save_poll( relations, new_poll, callback ) {
        relations.user.polls.push( new_poll );
        relations.user.save( function(err, save_res) {
            if(err)
                return callback(err);

            var last_insert_poll = save_res.polls[save_res.polls.length - 1];
            callback(null, { 'user': save_res, 'poll': last_insert_poll });
        });
    }

    function delete_poll( poll_id, callback ) {
        find_poll( poll_id, function(err, fp_res) {
            if(err)
                return callback(err);

            fp_res.user.polls.pull( poll_id );
            fp_res.user.save(function(err) {
                if(err)
                    return callback(err);

                callback(null);
            });
        });
    }

    function find_choice( choice_id, callback ) {
        Users
            .findOne({ 'polls.choices._id': choice_id })
            .exec( function(err, user) {
                if(err)
                    return callback(err);

                if(!user)
                    return callback( new Error('Poll with Choice { \'_id\': ' + choice_id + ' } not found') );

                var choice = undefined;
                var poll = user.polls.find(function(p) {
                    choice = p.choices.find(function(ch) { return (ch._id.toString() === choice_id); });
                    return (choice !== undefined);
                });

                callback(null, { 'user': user, 'poll': poll, 'choice': choice });
            });
    }

    function save_choice( relations, new_choice, callback ) {
        relations.poll.choices.push( new_choice );

        relations.user.save(function(err, save_res) {
            if(err)
                return callback(err);

            var updated_poll = save_res.polls.id( relations.poll._id );
            var last_insert_choice = updated_poll.choices[updated_poll.choices.length - 1];

            callback(null, { 'user': save_res, 'poll': updated_poll, 'choice': last_insert_choice });
        });
    }

    function save_vote( relations, new_vote, callback ) {
        relations.choice.votes.push( new_vote );

        relations.user.save(function(err, save_res) {
            if(err)
                return callback(err);

            var updated_poll = save_res.polls.id( relations.poll._id );
            var updated_choice = updated_poll.choices.id( relations.choice._id );
            var last_insert_vote = updated_choice.votes[updated_choice.votes.length - 1];

            callback(null, { 'user': save_res, 'poll': updated_poll, 'choice': updated_choice, 'vote': last_insert_vote });
        });
    }

    /* controller action methods */

    this.index_for_user = [
        validate_params('GET', 'user_id'),
        check_authentication,
        check_ownership,
        function(req, res) {
            find_user( req.params.user_id, function(err, fu_res) {
                if(err) throw err;

                res.render('polls/index',
                           { 'auth_status': req.isAuthenticated(),
                             'user': fu_res.user,
                             'polls': fu_res.user.polls });
            });
        }
    ];

    this.index = function(req, res) {
        find_all_polls( function(err, fap_res) {
            if(err) throw err;

            res.render('polls/index',
                       { 'auth_status': req.isAuthenticated(),
                         'user': req.user,//CHECK 
                         'polls': fap_res.polls });
        });
    };

    this.new_item = [
        check_authentication,
        function(req, res) {
            res.render('polls/new_item',
                       { 'auth_status': req.isAuthenticated(),
                         'user': req.user });//CHECK
        }
    ];

    this.create = [
        validate_params('POST', 'poll.name', 'poll.choices'),
        check_authentication,
        function(req, res) {
            find_user( get_user_id(req), function(err, fu_res) {
                if(err) throw err;

                var new_poll = { 'name': req.body.poll.name,
                                 'choices': parse_param_choices(req.body.poll) };

                save_poll( fu_res, new_poll, function(err, sp_res) {
                    if(err) throw err;

                    console.log('New Poll <' + JSON.stringify(sp_res.poll) + '> created for User <' + JSON.stringify(fu_res.user) + '>');

                    res.redirect('/polls/' + sp_res.poll._id);
                });
            });
        }
    ];

    this.show = [
        validate_params('GET', 'poll_id'),
        function(req, res) {
            find_poll( req.params.poll_id, function(err, fp_res) {
                if(err) throw err;

                res.render('polls/show', 
                           { 'auth_status': req.isAuthenticated(),
                             'user': fp_res.user,
                             'owner_status': is_owner(req, fp_res.user._id),
                             'poll': fp_res.poll });
            });
            //isAuthenticated();// adding options
            //isOwner();// deleting poll
            //isAlreadyVoted();// grey button
        }
    ];

    function is_already_voted(poll, user_id, ip_address) {//CHECK fix
        poll.choices.forEach( function(choice) {
            choice.votes.forEach( function(vote) {
                if( vote.vote_owner === user_id || vote.ip_address === ip_address )
                    return true;
            });
        });

        return false;
    }

    this.register_vote = [//CHECK adopt for anon
        validate_params('POST', 'vote.choice_id'),
        function(req, res) {
            find_choice( req.body.vote.choice_id, function(err, fch_res) {
                if(err) throw(err);

                var vote_status = is_already_voted(fch_res.poll, get_user_id(req), req.ip);

                if(vote_status) {
                    console.log( 'User <' + JSON.stringify(req.user) + '> already voted for Poll <' + JSON.stringify(fch_res.poll) + '>');

                    redirect('/polls/' + fch_res.poll._id + '/chart');//CHECK flash message
                } else {
                    var new_vote = {
                        'ip_address': req.ip,
                        'vote_owner': get_user_id(req)
                    };

                    save_vote( fch_res, new_vote, function(err, sv_res) {
                        console.log('User <' + JSON.stringify(req.user) +
                                    '> voted for Poll <' + JSON.stringify(sv_res.poll) +
                                    '> with Choice <' + JSON.stringify(sv_res.choice) + '>');

                        res.redirect('/polls/' + sv_res.poll._id + '/chart');
                    });
                }
            });
        }
    ];

    this.show_chart = [
        validate_params('GET', 'poll_id'),
        function(req, res) {
            find_poll( req.params.poll_id, function(err, fp_res) {
                if(err) throw err;

                res.render('polls/show_chart',
                           { 'auth_status': req.isAuthenticated(),
                             'user': fp_res.user,
                             'poll': fp_res.poll });
            });
        }
    ];

    this.update = [
        validate_params('GET', 'poll_id'),
        validate_params('PATCH', 'choice.name'),
        check_authentication,
        function(req, res) {
            find_poll( req.params.poll_id, function(err, fp_res) {
                if(err) throw err;

                var new_choice = { 'name': req.body.choice.name, 'votes': [] };

                save_choice( fp_res, new_choice, function(err, sch_res) {
                    if(err) throw err;

                    console.log('Added new Choice <' + JSON.stringify(sch_res.choice) +
                                '> to the Poll <' + JSON.stringify(sch_res.poll) + '>');

                    req.body.vote = { choice_id: sch_res.choice._id.toString() };
                    this.register_vote[1](req, res);//CHECK
                }.bind(this));
            }.bind(this));
        }.bind(this)
    ];

    this.destroy = [
        validate_params('GET', 'poll_id'),
        check_authentication,
        check_poll_ownership,
        function(req, res) {
            delete_poll( req.params.poll_id, function(err) {
                if(err) throw err;

                console.log('Removed Poll <' + req.params.poll_id + '>');

                res.redirect('/polls');//CHECK flash message
            });
        }
    ];
}

module.exports = PollController;
