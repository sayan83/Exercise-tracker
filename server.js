const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

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
var data = mongoose.model('Exc-data',sch);
var id=1;
app.post('api/exercise/new-user', function(req,res,done){
  data.findOne({Username: req.body.username},function(err,data){
    if (err) done(err);
    if(data == null)
    {
      var document = new data({_id: id,Username: req.body.username, count: 0});
      document.save(function(err,data){
        if(err) done(err);
        done(null,data);
      });
      res.send({Username: req.body.username, _id: id});
      id++;
    }
    else
    {
     res.send('username already taken'); 
    }
  });
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

