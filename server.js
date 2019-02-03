const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var sch = new mongoose.Schema({
  _id: Number,
  Username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      dt: {type: Date, Default: Date.now},
    }
  ],
});
var db = mongoose.model('Exc-data',sch);
app.post("/api/exercise/new-user", function(req,res,done){
  var unm = req.body.username;
  var id;
  //console.log('logging here');
  //res.send('Hi I am called');
  db.fine({}).sort({ $natural: -1}).limit(1).exec(function(err,data){
    id = data._id+1;
  });
  db.findOne({Username: unm},function(err,data){
    if (err) done(err);
    if(data == null)
    {
      var document = new db({_id: id,Username: unm, count: 0});
      document.save(function(err,data){
        if(err) done(err);
        done(null,data);
      });
      res.send({Username: req.body.username, _id: id});
    }
    else
    {
     res.send('username already taken'); 
    }
    done(null,data);
  });
});

app.get("/api/exercise/users",function(req,res,done){
  var n;
  db.find({}).sort({ $natural: -1 }).limit(1).exec(function(err,data){
      if(err) {done(err);}
      n = data[0]._id;
    done(null,data);
    });
  db.find({},function(err,data){
    if (err) done(err);
    var obj;
    obj = [{
        '_id': data[0]._id,
        'Username': data[0].Username,
      },];
    for(var i=1;i<n;i++)
        obj[i] = ({'_id': data[i]._id,'Username': data[i].Username});
    res.send(obj);
    done(null,data);
  })
});

// Not found middleware



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

