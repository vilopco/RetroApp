const mongoose = require('mongoose');
const express = require('express');
const http = require('http')
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const CommentDB = require('./commentDB');
const CategoriesDB = require('./categoriesDB');
const CardDB = require('./cardDB');
const socketIO = require('socket.io')


const API_PORT = 3001;
const app = express();
const server = http.createServer(app)
const io = socketIO(server)

app.use(cors());
const router = express.Router();

// this is our MongoDB database
const dbRoute = 'mongodb://localhost:27017/appdb';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true,useUnifiedTopology: true });
let db = mongoose.connection;
mongoose.set('useFindAndModify', false);
db.once('open', () => console.log('connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));


/* Comentarios */

//Seleccionar Comentarios
router.post('/getComments', (req, res) => {
	const query={
		id_card:req.body.params.id
	}
	CommentDB.find(query,(err, data) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, comments: data });
	});
});

//Agregar
router.post('/addComment', (req, res) => {
	let data = new CommentDB();	
	data.id_card=req.body.id_card;
	data.content=req.body.content;
	
	data.save((err) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data });
	});
});
/* Cards */

//ADD
router.post('/addCard', (req, res) => {
	let data = new CardDB();
	
	data.category=req.body.category;
	data.name=req.body.name;
	
	data.save((err) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	});
});




/* GET */
router.post('/getCards', (req, res) => {
	CardDB.aggregate([ {$match:{category:req.body.category}},{ "$project": { "_id": { "$toString": "$_id" }, "totalLikes":"$totalLikes", "category":"$category", "name":"$name" } }, { $lookup: {  from: "comments",  localField: "_id",  foreignField: "id_card",  as: "totalComments"  }  }, { $addFields: {  "totalComments": { $size: "$totalComments" }  } } ],(err,data) =>{
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	} )
});
/*
//GET
router.post('/getCards', (req, res) => {
	const query={
		category:req.body.category
	}
	CardDB.find(query,(err,data) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data: data });
	});
});
*/

//Actualizar Like
router.post('/updateCardLike', (req, res) => {
	const filter={
		_id:req.body._id
	}
	const update={
		$inc: { totalLikes: 1 } 
	}
	CardDB.findOneAndUpdate(filter,update,(err,data) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	});
});

//Actualizar
router.post('/updateCard', (req, res) => {
	const filter={
		_id:req.body._id
	}
	const update={
		category:req.body.category
	}
	CardDB.findOneAndUpdate(filter,update,(err,data) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	});
});



//Actualizar
router.post('/removeCard', (req, res) => {
	const filter={
		_id:req.body._id
	}
	CardDB.findOneAndRemove(filter,(err,data) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	});
});



/* Categorias */
//ADD

router.post('/addCategory', (req, res) => {
	let data = new CategoriesDB();

	data.name=req.body.name;
	data.bgColor=req.body.bgColor;
	
	data.save((err) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	});
});

//Update Categoria
router.post('/updateCategory', (req, res) => {
	const filter={
		_id:req.body._id
	}
	const update={
		name:req.body.name
	}
	CategoriesDB.findOneAndUpdate(filter,update,(err,data) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	});
});


//Obtener Categorias
router.get('/getCategories', (req, res) => {
	CategoriesDB.find((err, data) => {
	  if (err) return res.json({ success: false, error: err });
	  return res.json({ success: true, data: data });
	});
});

router.post('/updateCategoryColor', (req, res) => {
	const filter={
		_id:req.body.category
	}
	const update={
		bgColor:req.body.colorID
	}
	CategoriesDB.findOneAndUpdate(filter,update,(err,data) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data:data });
	});
});

// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
//app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));


io.on('connection', socket => {
	
	socket.on('updateCards', ({cards,catid}) => {
		io.sockets.emit('updateCards', ({cards,catid}))
	})
	socket.on('updateColor', ({cards,catid}) => {
		io.sockets.emit('updateColor', ({cards,catid}))
	})
	socket.on('updateCategory', ({cards,catid}) => {
		io.sockets.emit('updateCategory', ({cards,catid}))
	})
	socket.on('updateComments', ({comments,id_card}) => {
		io.sockets.emit('updateComments', ({comments,id_card}))
	})
	socket.on('updateCategories', (categories) => {
		io.sockets.emit('updateCategories', (categories))
	})
	socket.on('disconnect', () => {
	  console.log('user disconnected')
	})
})
  
server.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`))