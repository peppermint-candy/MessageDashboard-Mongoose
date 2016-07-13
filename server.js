
// ------------------- game plan ------------------
// create single page message board that allows users to create messages, and comment on existing messages.


// GET '/' Displays all posts and comments if any

//-------------------- end plan -------------------

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/basic_mongoose')

app.use(bodyParser.urlencoded({ extended: true}));

var path = require('path');

app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

//------------------setting schema for post and comment here -------------------
var postSchema = new mongoose.Schema({ 
	
	name : {type: String, required: true},
	text : {type: String, required: true},
	_comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true});

mongoose.model('Post', postSchema);
var Post = mongoose.model('Post')

// --------------------------

var commentSchema = new mongoose.Schema({ 

	name : {type: String, required: true},
	text: {type: String, required: true},
	_post: [{type: Schema.Types.ObjectId, ref:'Post'}]
}, {timestamps: true});

mongoose.model("Comment", commentSchema);
var Comment = mongoose.model('Comment')


// --------------- first page ------------------------------------------
app.get('/', function( req, res) {
	Post.find({})
	.populate('_comments')
	.exec(function (err, post) {
		if(err) {
			console.log(err);
			console.log('oh no! it does not work!');
		}else{
			console.log('showing all post');
			console.log(post);
			res.render('index', { posts: post })
		}
	})
})

//----------------adding new post -------------------------------
app.post('/posting', function( req,res) {
	var post = new Post({name: req.body.poster, text: req.body.post_message});
	post.save(function (err) {
		if(err) {
			console.log('something went wrong when trying to post!!');
		}else{
			console.log('successfuly added a new post!')
			res.redirect('/')
		}
	})
})

// --------------- adding new comment ----------------------
app.post('/commenting/:id', function ( req, res) {
	Post.findOne({ _id : req.params.id }, function (err, on_post ) {

		console.log(req.params.id);
		console.log(on_post);

		if(req.body.commenter && req.body.comment_message) {
			var comment = new Comment();
			
			comment.name = req.body.commenter
			comment.text = req.body.comment_message
			comment._post = on_post._id
			comment.save(function(err){
				
				console.log(comment);
				on_post._comments.push(comment);
				on_post.save(function (err) {
					if(err){
						console.log(err);
						console.log('something went wrong with adding comment to the post');
					}else{
						console.log('successfuly add new comment');
						res.redirect('/')
					}		
				})
			})			
		}
	})
})

	
// ************************ routing ****************************************

app.listen(8000, function() {

	console.log("listening on port 8000");

})

