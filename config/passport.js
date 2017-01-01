var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var Publisher = require('../models/publisher');
var Reader = require('../models/reader');



module.exports = function (passport) {

    /*  select user for session //start    */
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        /*
         if user in reader then get user from reader
         else find user in publisher
         */

        Reader.findById(user._id , function (err, r_user) {
            if (err) done(err);
            if (r_user) {
                done(null, r_user);
            } else {
                Publisher.findById(user._id, function (err, p_user) {
                    if (err) done(err);
                    if (p_user) {
                        done(null, p_user);
                    }
                });
            }
        })

    });
    /*  select user for session //end    */

    /*  sign up or register verification and create user //start    */
    passport.use('signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {

            process.nextTick(function() {
                /*
                if (req.body.roll===reader){
                find user from reader db and if not found then create one
                 } else{
                 find user from publisher db and if not found then create one
                 }

                 */
                if (req.body.roll==='Reader'){
                    //check and create
                    Reader.findOne({ email :  email }, function(err, r_user) {

                        if (err)
                            return done(err);
                        if (r_user) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        } else {
                            //create reader
                            var newRewader = new Reader();
                            newRewader.password = newRewader.generateHash(password);
                            newRewader.email = email;
                            newRewader.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newRewader);
                            });
                            if (req.body.password ===req.body.confirmPassword) {

                            } else {
                                return done(null, false, req.flash('loginMessage', 'The passwords doesn\'t match'));
                            }

                        }
                    });
                } else {
                    //cheak and create
                    Publisher.findOne({ email : email }, function(err, p_user) {
                        if (err)
                            return done(err);
                        if (p_user) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        } else {
                            //create publisher
                            if (req.body.password ===req.body.confirmPassword) {
                                var newPublisher = new Publisher();
                                newPublisher.password = newPublisher.generateHash(password);
                                newPublisher.email = email;
                                newPublisher.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, newPublisher);
                                });

                            } else {
                                return done(null, false, req.flash('loginMessage', 'The passwords doesn\'t match'));
                            }

                        }
                    });
                }
            }
            );
        }));
    /*  sign up or register verification and create user  //end     */

    /*  sign in verification    //start  */
    passport.use('login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, 
        function (req, email, password, done) {
            console.log(req.body);
            /*  search user in reader first     */
            Reader.findOne({email : email}, function (err, r_user) {
                if (err) {
                    done(err);
                } else if (!r_user) {
                    /*  if user not found in reader ten search in publisher   */
                    Publisher.findOne({email : email}, function (err, p_user) {
                       if (err){
                           done(err);
                       } else if (!p_user) {
                           /* if user also not in this collection then user doesn't exist*/
                           return done(null, false, req.flash('errorMessage', 'User doesn\'t exists'));
                       } else if (p_user){
                           /*if user in publisher then check password*/
                           if (!p_user.validPassword(password)) {
                               return done(null,false, req.flash('errorMessage', 'Wrong password'));
                           } else {
                               /*return the user in publisher   */
                               done(null,p_user);
                           }
                       }
                    });

                } else if (r_user){
                    /*  if user in reader then check password   */
                    if (!r_user.validPassword(password)) {
                        return done(null,false, req.flash('errorMessage', 'Wrong password'));
                    } else {
                        /*return the user in reader     */
                        done(null,r_user);
                    }
                }
            });
        }

    ));
    /*  log up verification    //end    */


};
