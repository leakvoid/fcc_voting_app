'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({
    ip_address: String
});

var choiceSchema = new Schema({
    name: String,
    votes: [voteSchema]
});

var pollSchema = new Schema({
    name: String,
    choices: [choiceSchema]
});

var userSchema = new Schema({
    github: {
	id: String,
	displayName: String,
	username: String,
        publicRepos: Number
    },
    polls: [pollSchema]
});

//module.exports = mongoose.model('Vote', voteSchema);
//module.exports = mongoose.model('Choice' choiceSchema);
//module.exports = mongoose.model('Poll', poolSchema);
module.exports = mongoose.model('User', userSchema);
