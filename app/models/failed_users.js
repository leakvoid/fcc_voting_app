'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var voteSchema = new Schema({
    _creator: [{ type: ObjectId, ref: 'Choice' }],
    ip_address: String,
    vote_owner: [{ type: ObjectId, ref: 'User'}]
});

var choiceSchema = new Schema({//CHECK fix this
    _creator: [{ type: ObjectId, ref: 'Poll' }],
    name: String,
    votes: [{ type: ObjectId, ref: 'Vote'}]
});

var pollSchema = new Schema({
    _creator: [{ type: ObjectId, ref: 'User' }],
    name: String,
    choices: [{ type: ObjectId, ref: 'Choice' }]
});

var userSchema = new Schema({
    github: {
	id: String,
	displayName: String,
	username: String,
        publicRepos: Number
    },
    polls: [{ type: ObjectId, ref: 'Poll' }]
});

module.exports = mongoose.model('Vote', voteSchema);
module.exports = mongoose.model('Choice' choiceSchema);
module.exports = mongoose.model('Poll', poolSchema);
module.exports = mongoose.model('User', userSchema);
