const express = require('express');
const router = express.Router();

//bring in article Models
let Article = require('../models/article');

//bring article model
let User = require('../models/user');


//add route
router.get('/add',ensureAuthentication,(req, res)=>{
	res.render('add-article', {
		title:'Add Article'
	});
});

//Add submit post route
router.post('/add',(req,res)=>{

	req.checkBody('title','Title is required').notEmpty();
	//req.checkBody('author','Author is required').notEmpty();
	req.checkBody('body','Body is required').notEmpty();

	let errors = req.validationErrors();

	if(errors){
		res.render('add-article',{
			title:'AddArticle',
			errors:errors
		});
	}
	else{
		let article = new Article();
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body;

		article.save(function(err){
		if(err){
			console.log('err');
			return;
		} else {
			req.flash('success','Article Added');
			res.redirect('/');
		}
	});
	}
	
});

//load edit form
router.get('/edit/:id',ensureAuthentication, function(req, res){
	Article.findById(req.params.id, function(err, article){
		if(article.author != req.user._id){
			req.flash('danger', 'Not Authorized');
			res.redirect('/');
		}
		res.render('edit_article', {
		title:'Edit Article',
		article:article
		});
	});
	
});

//update submit post route
router.post('/edit/:id',(req,res)=>{
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id:req.params.id}

	Article.update(query, article, function(err){
		if(err){
			console.log('err');
			return;
		} else {
			req.flash('success','Article Updated');
			res.redirect('/');
		}
	});
	
});

//delete article
router.delete('/:id',(req, res)=>{
	if(!req.user._id){
		res.status(500).send();
	}
	let query = {_id:req.params.id}

	article.findById(req.params.id, function(err, article){
		if(article.author != req.user._id){
		res.status(500).send();	
		} else {
			Article.remove(query, function(err){
		if(err){
			console.log(err);
		}
		res.send('Success');
		});
		}	
	});

	
});

//get single article
router.get('/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		User.findById(article.author, function(err, user){
		res.render('article', {
		article:article,
		author: user.name
		});	
		})
		
	});
	
});

//access control
function ensureAuthentication(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}	else {
		req.flash('danger', 'please login');
		res.redirect('/user/login');
	}
}


module.exports = router;