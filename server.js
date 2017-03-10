var express = require('express');
var morgan = require('morgan');
var path = require('path');
var pg = require('pg');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user: 'anurag899',
    database: 'anurag899',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json()); 
app.use(session({
	secret: 'randomValue',
	cookie: {maxAge: 1000*60*60*24*30}
}));

function sendLogout(info){
	var content="<html>"+
				"<head>"+
				"<style>"+
				".msg{"+
					"background-color:white;}"+
				"#link{"+
					"width:100px;"+
					"background-color: #008CBA;"+
					"height: 40px;"+
					"color: white;"+
					"box-shadow: 10px 5px 5px  #888888;"+
					"border-radius: 5px;"+
				"}"+
				"</style>"+
				"</head>"+
				"<body>"+
				"<script type='text/javascript'>"+
					"function home(){"+
						"location.href='/';"+
					"}"+
				"</script>"+
				"<div class='msg'>"+
				"<p style='padding:20px 0 20px 60px;font-size:15px;'>"+info+	
				"<input type='button' id='link' style='float:right;width:80px;'onclick='home()' value='close'>"+"</p>"+	
				"</div>"+
				"</body>"+
				"</html>";
	return content;
}

function createTemp(data){
	var title=data.title;	
	var heading=data.heading;
	var date=data.date;
	var content=data.content;
	var htmlTemp=
			"<!doctype html>"+
				"<html>"+
				    "<head>"+
				    	"<link href='/ui/style.css' rel='stylesheet' />"+
					        "<title>SocialPedia</title>"+
					          "<meta charset='utf-8'>"+
					          "<meta name='viewport' content='width=device-width, initial-scale=1'>"+
					          "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>"+
					          "<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>"+
					          "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script>"+
				    "</head>"+
				    "<body onload='checkLogin()'>"+
				    "<nav class='navbar navbar-default' style='margin-bottom:0;'>"+
				        "<div class='container'>"+
				          "<div class='navbar-header'>"+
				          "<a class='navbar-brand' href='/'>SocialPedia</a>"+
				      "</div>"+
				      "<div class='collapse navbar-collapse' id='myNavbar'>"+
				       "<ul class='nav navbar-nav navbar-right'>"+
				       "<li><a href='/'>Home</a></li>"+
				         "<li><a href='' data-toggle='modal' data-target='#myModal' id='login_area'><span class='glyphicon glyphicon-log-in'></span> </a></li>"+
				            "</ul>"+
				          "</div>"+
				        "</div>"+
				      "</nav>"+
				        "<div class='container' style='height:100%;margin-top:50px;'>"+		
				        	"<span class=' text-center' style='padding:0 30px 0 30px;'><h1>"+ heading +"</h1>"+
				        	"<div>"+ date.toDateString() +"</div>"+
				        	"<h5 ><span class='label label-primary'>"+title+"</span></h5><br></span>"+
				        	"<div style='font-size:22px;font-family:verdana;text-align:justify;margin-top:60px;padding:0 150px 300px 150px;font-size:18px; text-justify: inter-word;'>"	+
				        	 content +"</div>"+
				        "</div>"+
				        "<footer class='container-fluid text-center' style='margin-right:0;margin-left:0;background-color:#e7e7e7;color:black;'>"+
					          "<p>Copyright@ anur@g</p>"+
					     "</footer>"+
					     
					     "<script type='text/javascript' src='/ui/main.js'>"+
        				"</script>"+
        				"<div class='modal fade' id='myModal' role='dialog'>"+
    						"<div class='modal-dialog'>"+
      						"<!-- Modal content-->"+
      							"<div class='modal-content'>"+
        							"<div class='modal-header'>"+
          							"<button type='button' class='close' data-dismiss='modal'>&times;</button>"+
          							"<h4 class='modal-title'>Sign in/Sign out</h4>"+
       								 "</div>"+
							        "<div class='modal-body'>"+
							          "<h2>Login</h2>"+
							          "<form>"+
							            "Username:<br>"+
							            "<input type='text' id='username' placeholder='username'>"+
							            "<br>"+
							            "Password:<br>"+
							            "<input type='password' id='password' placeholder='password'>"+
							            "<br>"+
							            "<input type='submit' id='login_btn' Value='Login'>"+
							            "<input type='submit' id='register_btn' Value='register'>"
							            "<br>"+
							          "</form>"+
							        "</div>"+
					              "</div>"+
					             "</div>"+
				    "</body>"+
				"</html>";
	return htmlTemp;
}

function getArticle(title){
	var htmlTemp=
			"<!doctype html>"+
				"<html>"+
				    "<head>"+
				    	"<link href='/ui/style.css' rel='stylesheet' />"+
					        "<title>SocialPedia</title>"+
					          "<meta charset='utf-8'>"+
					          "<meta name='viewport' content='width=device-width, initial-scale=1'>"+
					          "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>"+
					          "<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>"+
					          "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script>"+
				    "</head>"+
				    "<body onload='writeStory()'>"+
				    "<script type='text/javascript' src='/ui/main.js'>"+
        			"</script>"+
				    "<nav class='navbar navbar-default' style='margin-bottom:0;'>"+
				        "<div class='container'>"+
				          "<div class='navbar-header'>"+
				          "<a class='navbar-brand' href='/'>SocialPedia</a>"+
				      "</div>"+
				      "<div class='collapse navbar-collapse' id='myNavbar'>"+
				       "<ul class='nav navbar-nav navbar-right'>"+
				       "<li><a href='/'>Home</a></li>"+
				         "<li><a href='' data-toggle='modal' data-target='#myModal' id='login_area'><span class='glyphicon glyphicon-log-in'></span> </a></li>"+
				            "</ul>"+
				          "</div>"+
				        "</div>"+
				      "</nav>"+
				        "<div class='container' style='height:100%;margin-top:50px;'>"+		
				    		"<h4>Author:   <span id='name' class='label label-primary' >"+title+"</span></h4>"+
				        	"<div class='form-group'>"+
							  "<label for='title'>Title:</label>"+
  								"<input type='text' class='form-control' id='title' placeholder='Write your title'>"+
							"</div>"+
				        	"<div class='form-group'>"+
							  "<label for='content'>Write Here:</label>"+
  								"<textarea class='form-control' rows='10' id='content' placeholder='Tell your story'></textarea>"+
							"</div>"+
							"<input type='submit' id='sub_article' value='submit'>"
				        "<footer class='container-fluid text-center' style='margin-right:0;margin-left:0;background-color:#e7e7e7;color:black;'>"+
					          "<p>Copyright@ anur@g</p>"+
					     "</footer>"+
					    "<div class='modal fade' id='myModal' role='dialog'>"+
    						"<div class='modal-dialog'>"+
      						"<!-- Modal content-->"+
      							"<div class='modal-content'>"+
        							"<div class='modal-header'>"+
          							"<button type='button' class='close' data-dismiss='modal'>&times;</button>"+
          							"<h4 class='modal-title'>Sign in/Sign out</h4>"+
       								 "</div>"+
							        "<div class='modal-body'>"+
							          "<h2>Login</h2>"+
							          "<form>"+
							            "Username:<br>"+
							            "<input type='text' id='username' placeholder='username'>"+
							            "<br>"+
							            "Password:<br>"+
							            "<input type='password' id='password' placeholder='password'>"+
							            "<br>"+
							            "<input type='submit' id='login_btn' Value='Login'>"+
							            "<input type='submit' id='register_btn' Value='register'>"
							            "<br>"+
							          "</form>"+
							        "</div>"+
					              "</div>"+
					             "</div>"+
				    "</body>"+
				"</html>";

	return htmlTemp;
}

app.get('/writeStory', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT username from "user" where id = $1', [req.session.auth.userId], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('User not found');
                } else {
                    var user = result.rows[0].username;
                    res.send(getArticle(user));
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can write');
    }
});

app.post('/submit-article', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT username from "user" where id = $1', [req.session.auth.userId], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var username = result.rows[0].username;
                    var date = new Date();
                    // Now insert the right comment for this article
                    pool.query(
                        'INSERT INTO "article" (title, heading,date, content) VALUES ($1, $2,$3,$4)',
                        [username,req.body.title,date,req.body.content],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.send('Article insterted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});


var names=[];
app.get('/submit',function(req,res){
	name=req.query.name;
	names.push(name);
	res.send(JSON.stringify(names));
});

function hash(input , salt){
	var hashed = crypto.pbkdf2Sync(input,salt, 10000, 512, 'sha512');
	return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function(req,res){
	var hashed = hash(req.params.input,'this-is-ramdom-string');
	res.send(hashed);
});

app.post('/create-user',function(req,res){
	var username=req.body.username;
	var password=req.body.password;

	var salt=crypto.randomBytes(128).toString('hex');
	var dbString = hash(password,salt);

	pool.query('INSERT INTO "user" (username,password) VALUES ($1,$2)',
		[username,dbString],function(err,result){
			if(err){
				res.status(500).send(err.toString());
			}
			else{
				res.send("user is succefull logged in");
			}
 	});
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        pool.query('SELECT * from article where heading = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query(
                        "INSERT INTO comment (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!')
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});


app.post('/login',function(req,res){
	var username=req.body.username;
	var password=req.body.password;

	pool.query('SELECT * FROM "user" WHERE username= $1',[username]
		,function(err,result){
			if(err){
				res.status(500).send(err.toString());
			}
			else{
				if(result.rows.length === 0){
					res.send(403).send("username/password is invalid");
				}
				else{
					
					var dbString=result.rows[0].password;
					var salt=dbString.split('$')[2];
					var hashed = hash(password,salt);
					if(hashed === dbString){
						req.session.auth={userId:result.rows[0].id};
						res.send("user is logged in");
					}
					else{
						res.send(403).send("username/password is invalid");
					}
				}
			}

		});
});

app.get('/check-login',function(req,res){
	if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);    
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout',function(req,res){
	delete req.session.auth;
	res.send(sendLogout('You are now logged out.Hope you enjoyed our service.'));
});

var counter=0;
app.get('/counter', function (req, res) {
  counter++;
  res.send(counter.toString());
});


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool= new pg.Pool(config);

app.get('/test-db',function(req,res){
	pool.query("SELECT * FROM article",function(err,result){
		if(err){
			res.status(500).send(err.toString());
		}
		else{
			res.send(JSON.stringify(result.rows[0].title));
		}
	});
});
app.get('/articles/:articleName',function(req,res){
	pool.query("SELECT * FROM article WHERE heading = '"+req.params.articleName+"'",
		function(err,result){
			if(err){
				res.status(500).send(err.toString());
			}
			else{
				if(result.rows.length === 0){
					res.status(404).send("Article not found");
				}
				else{
					var articleData = result.rows[0];
					res.send(createTemp(articleData));	
				}
			}
		});
});

app.get('/getArticle',function(req,res){
	pool.query("SELECT * FROM article ORDER BY id DESC limit 3",
		function(err,result){
			if(err){
				res.status(500).send(err.toString());
			}
			else{
				if(result.rows.length === 0){
					res.status(404).send("Article not found");
				}
				else{
					var articleData = result.rows;
					res.send(JSON.stringify(articleData));	
				}
			}
		});
});

app.get('/getList',function(req,res){
	pool.query("SELECT heading,title FROM article ORDER BY id DESC limit 10",
		function(err,result){
			if(err){
				res.status(500).send(err.toString());
			}
			else{
				if(result.rows.length === 0){
					res.status(404).send("Article not found");
				}
				else{
					var articleData = result.rows;
					res.send(JSON.stringify(articleData));	
				}
			}
		});
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/pic.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui','pic.jpg'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log('IMAD course app listening on port' +port+'!');
});
