'use strict';

function PollController() {

    function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
	    return next();
	} else {
	    res.redirect('/polls');
	}
    }

    function isOwner() {
    }

    this.index_for_user = function (req, res) {
        isLoggedIn();
        isOwner();
    }

    this.index = function(req, res) {
    }

    this.new_item = function(req, res) {
        isLoggedIn();
    }

    this.create = function(req, res) {
        isLoggedIn();
    }

    this.show = function(req, res) {
        isAuthenticated();// adding options
        isOwner();// deleting poll
        isAlreadyVoted();// grey button
    }

    this.register_vote = function(req, res) {
    }

    this.show_chart = function(req, res) {
    }

    this.update = function(req, res) {
        isLoggedIn();
    }

    this.destroy = function(req, res) {
        isLoggedIn();
        isOwner();
    }
}

module.exports = PollController;
