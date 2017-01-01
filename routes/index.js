var express = require('express');
var passport = require('passport');
var router = express.Router();
var Publisher = require('../models/publisher');
var Reader = require('../models/reader');
var Book = require('../models/book');
var formidable = require('formidable');
var fs = require('fs-extra');
var path = require('path');

//mongoose setup
var mongoose = require('mongoose');
// var configDB = require('../config/database');
// mongoose.connect(configDB.url);


/* GET home page. */
router.get('/', function (req, res, next) {
    //get all the books from db and display them on the homepage
    Book.find(function (err, all_books) {
        var book_chunks = [];
        var chunk_size = 3;
        for (var i = 0; i < all_books.length; i += chunk_size) {
            book_chunks.push(all_books.slice(i, i + chunk_size));
        }
        res.render('index', {books: book_chunks});
    });

});

/* get dashboard page */
router.get('/dashboard', isLoggedIn, function (req, res) {
    /*if user is publisher then send his book list,
     else user is reader, send his book list
     */
    if (req.user.roll === 'Reader') {
        res.render('dashboard',
            {
                user: req.user
            }
        );
    } else {
        Book.find({'publisher._id': req.user._id}, function (err, book_list) {
            if (err) {
                console.log('cannot get publishers book list');
                res.render('dashboard',
                    {
                        user: req.user
                    }
                );
            } else {
                res.render('dashboard',
                    {
                        user: req.user,
                        booklist: book_list
                    }
                );

            }

        });
    }
});

/*  get profile page    */
router.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile', {user: req.user});
});

/*  update from profile page  need update */
router.post('/profile', isLoggedIn, function (req, res) {
    //get all the form data of profile page and parse
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log('fields: ', fields);
        console.log('files: ', files);
        //then first, detect the user, publisher or reader
        if (req.user.roll === 'Reader') {
            //then update the info in reader db
            /*if user change profile picture*/
            if (files.profilePicture.name!=''){
                var profilePictureSP = files.profilePicture.path;
                var profilePictureDP = path.join(__dirname, "../public/images/");
                fs.move(profilePictureSP, profilePictureDP+req.user._id+path.extname(files.profilePicture.name),{clobber: true} ,function (err) {
                    if (err){
                        console.error(err);
                    } else {
                        console.log(profilePictureDP+req.user._id+path.extname(files.profilePicture.name));
                        Reader.findOneAndUpdate(
                            {_id: req.user._id},             //query or conditions to search
                            {
                                name : fields.name,
                                address : fields.address,
                                mobile : fields.mobile,
                                imagePath : '/images/'+req.user._id+path.extname(files.profilePicture.name)

                            },             //doc, that is to be updated
                            function () {   //callback
                                //get updated infor and render
                                Reader.findOne({_id : req.user._id}, function (err, u_user) {
                                    res.render('profile', {user: u_user});
                                });
                            }
                        );
                    }

                });
            } else {
                /* user does not change profile picture*/
                Reader.findOneAndUpdate(
                    {_id: req.user._id},             //query or conditions to search
                    {
                        name : fields.name,
                        address : fields.address,
                        mobile : fields.mobile

                    },             //doc, that is to be updated
                    function () {   //callback
                        //get updated info and render
                        Reader.findOne({_id : req.user._id}, function (err, u_user) {
                            res.render('profile', {user: u_user});
                        });
                    }
                );
            }
        } else {
            //update the info in publisher db, and also update publishers info in book db
            //http://stackoverflow.com/questions/6694507/how-can-i-update-multiple-documents-in-mongoose
            if (files.profilePicture.name!=''){
                var profilePictureSP = files.profilePicture.path;
                var profilePictureDP = path.join(__dirname, "../public/images/");
                fs.move(profilePictureSP, profilePictureDP+req.user._id+path.extname(files.profilePicture.name),{clobber: true} ,function (err) {
                    if (err){
                        console.error(err);
                    } else {
                        console.log(profilePictureDP+req.user._id+path.extname(files.profilePicture.name));
                        Publisher.findOneAndUpdate(
                            {_id: req.user._id},             //query or conditions to search
                            {
                                name : fields.name,
                                address : fields.address,
                                contact : fields.contact,
                                imagePath : '/images/'+req.user._id+path.extname(files.profilePicture.name)

                            },             //doc, that is to be updated
                            function () {   //callback
                                //also update books db publisher information
                                Book.update(
                                    {"publisher._id" : req.user._id},
                                    {
                                        "publisher.name" : fields.name,
                                        "publisher.address" : fields.address,
                                        "publisher.contact" : fields.contact
                                    },
                                    {multi: true},
                                    function (err, row) {
                                        Publisher.findOne({_id : req.user._id}, function (err, u_user) {
                                            res.render('profile', {user: u_user});
                                        });
                                    }
                                );
                            }
                        );
                    }

                });
            } else {
                /* user does not change profile picture*/
                Publisher.findOneAndUpdate(
                    {_id: req.user._id},             //query or conditions to search
                    {
                        name : fields.name,
                        address : fields.address,
                        contact : fields.contact

                    },             //doc, that is to be updated
                    function () {   //callback
                        Book.update(
                            {"publisher._id" : req.user._id},
                            {
                                "publisher.name" : fields.name,
                                "publisher.address" : fields.address,
                                "publisher.contact" : fields.contact
                            },
                            {multi: true},
                            function (err, row) {
                                Publisher.findOne({_id : req.user._id}, function (err, u_user) {
                                    res.render('profile', {user: u_user});
                                });
                            }
                        );
                    }
                );
            }
        }
    });

});


/*  get the book upload page  */
router.get('/bookupload', isLoggedIn, function (req, res) {
    res.render('uploadBook', {user: req.user});
});

router.get('/loginRegister', function (req, res) {
    res.render('loginRegister', {title: 'Boook Shop', message: req.flash('loginMessage')});
});

/*  process log in form*/
router.post('/login', passport.authenticate('login', {
        //successRedirect: '/profile',
        failureRedirect: '/loginRegister',
        failureFlash: true
    }),
    function (req, res) {
        if (req.body.remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
            req.session.cookie.expires = false; // Cookie expires at end of session
        }
        res.redirect('/dashboard');
    }
);


//##############################################################
//publisher click books to view or change details
//beed to be logged in
//http://stackoverflow.com/questions/25623041/how-to-configure-dynamic-routes-with-express-js
router.get('/publisher/books/:id?', function (req, res) {
    console.log('book passed to new page ', req.params.id);

    //find book from db and send it to page
    Book.findOne({_id: req.params.id}, function (err, singleBook) {
        if (err) {
            console.log('invalid book id');
        } else {
            console.log(singleBook);
            res.render('partials/publisher/singleBook', {singleBook: singleBook});
        }
    });

});
//##############################################################

//##############################################################
//without login , book details can be viewed
router.get('/books/:id?', function (req, res) {
    console.log('book passed to new page ', req.params.id);

    //find book from db and send it to page
    Book.findOne({_id: req.params.id}, function (err, singleBook) {
        if (err) {
            console.log('invalid book id');
        } else {
            console.log(singleBook);
            res.render('bookDisplayWithoutLogin', {singleBook: singleBook});
        }
    });
});

//##############################################################
/*  logged in user can view all books  */
router.get('/allbooks', isLoggedIn, function (req, res) {
    Book.find(function (err, all_books) {
        var book_chunks = [];
        var chunk_size = 3;
        for (var i = 0; i < all_books.length; i += chunk_size) {
            book_chunks.push(all_books.slice(i, i + chunk_size));
        }
        res.render('allBooks', {books: book_chunks});
    });
});

/*  process registration form   */
router.post('/register', passport.authenticate('signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/loginRegister',
    failureFlash: true
}));

/*  process book upload     */
router.post('/bookupload', function (req, res, next) {

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        var newBook = new Book();
        var id = mongoose.Types.ObjectId();
        newBook._id = id;
        var coverImageSourceDir = files.coverImage.path;
        var bookSampleSourceDir = files.sampleBookPath.path;
        var bookMainSourceDir = files.bookpath.path;
        var nameStr = "" + id;
        var CIDestinationPath = path.join(__dirname, "../public/bookCover/");
        var BMDestinationPath = path.join(__dirname, "../public/bookMain/");
        var BSDestinationPath = path.join(__dirname, "../public/bookSample/");

        fs.move(coverImageSourceDir, CIDestinationPath + nameStr + path.extname(files.coverImage.name), function (err) {
            if (err) {
                console.error('cover image problem');
            } else {
                newBook.coverImage = '/bookCover/' + nameStr + path.extname(files.coverImage.name);   // set path to book cover in newBook
                fs.move(bookSampleSourceDir, BSDestinationPath + nameStr + path.extname(files.coverImage.name), function (err) {
                    if (err) {
                        console.log('book sample problem ');
                    } else {
                        newBook.samplePath = '/bookSample/' + nameStr + path.extname(files.sampleBookPath.name);
                        fs.move(bookMainSourceDir, BMDestinationPath + nameStr + path.extname(files.bookpath.name), function (err) {
                            if (err) {
                                console.log('book main problem');
                            } else {
                                newBook.bookPath = '/bookMain/' + nameStr + path.extname(files.bookpath.name);
                                newBook.title = fields.title;
                                newBook.ISBN = fields.isbn;
                                newBook.author = fields.author;
                                newBook.unitPrice = parseFloat(fields.price);
                                if (fields.pupublishDate) newBook.publishDate = Date(fields.publishDate);
                                var tags = fields.genre_tags.split(',');
                                newBook.genre_tags.push(tags);
                                newBook.publisher._id = req.user._id;
                                newBook.publisher.name = req.user.name;
                                newBook.publisher.address = req.user.address;
                                newBook.publisher.contact = req.user.contact;
                                newBook.save(function (err) {
                                    if (err) {
                                        console.log('book not saved');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });


        if (err) {
            console.error(err);
        } else {
            res.redirect('/dashboard');
        }

    });
    //test ends
});


/* log out*/
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
