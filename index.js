const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let objId;
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

console.log("connected to db");


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const userSchema = new mongoose.Schema({
  username: String
});

const exerciseSchema = new mongoose.Schema({
  id: String,
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date
});

const Users = mongoose.model('Users', userSchema);
const Exercises = mongoose.model('Exercises', exerciseSchema);

//#1. user registration - PASSED
app.post('/api/users', urlencodedParser, async (req, res) => {
  console.log("username: " + req.body.username);

  /*  userName.save((err, userName) => {
     if(err) return console.log(err);
     res.status(200).json({username: userName.username, _id: userName._id});
   }); */
  try {
    let user01 = await Users.create({ username: req.body.username });
    //let user01 = await Users.findOne({ username: req.body.username })
    console.log("the userID is: " + user01._id);
    res.status(200).json({ username: user01.username, _id: user01._id });




  }
  catch (error) {
    console.log("an exception occured" + error);
    return;
  }
});

//#2. show all users - PASSED
app.get('/api/users', async (req, res) => {
  try {
    let data = await Users.find();
    console.log(data);
    res.status(200).send(data);

  } catch (error) {
    console.log(error);
  }
  /*  let data = await Users.find();
 
   Users.find({}, {username:1, _id:1}, (err,data)=> {
     if (err) return console.log(err);
     res.status(200).send(data);
   }); */
})

//#3. add exercises returning user and exercise data - NOT PASSED YET
app.post('/api/users/:_id/exercises', urlencodedParser, async (req, res) => {
  let objId = "";
  console.log("creating an exercise");
  /* onst exercises = new Exercises({id: req.params._id, description: req.body.description, duration: parseInt(req.body.duration), date: isNaN(new Date(req.body.date))?new Date():new Date(req.body.date)});
    exercises.save((err, data) => {
      if(err) return console.log(err);
      objId = mongoose.Types.ObjectId(req.params._id);
      Users.findOne({"_id": objId}, (err,user) => {
        if(err) return console.log(err);
        res.status(200).json({_id: user._id, username:user.username, date:data.date.toString().slice(0,15), duration:data.duration, description:data.description});
      })
      
    }); */
  try {

    const d = new Date();
    const df = new Date(req.body.date);
    console.log(df.toString())

    let exerciseF = await Exercises.create(
      {
        id: req.params._id,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: isNaN(new Date(req.body.date)) ? d : df
      })
    objId = new mongoose.Types.ObjectId(req.params._id);
    let user = await Users.findOne({ "_id": objId });

    // let exerciseF= await Exercises.findOne({ "id": req.params._id });
    console.log(exerciseF.date.toDateString());

    res.status(200).json({
      _id: user._id,
      username: user.username,
      date: exerciseF.date.toDateString(),
      duration: exerciseF.duration,
      description: exerciseF.description
    });


  } catch (error) {
    console.log(error)
    return;
  }
});

//#4-6. return exercise log - 4/5/6 PASSED
app.get('/api/users/:_id/logs?', async (req, res) => {
  let objId = "";
  objId = new mongoose.Types.ObjectId(req.params._id);
  console.log("in get logs " + objId);
  /*  Users.findOne({ "_id": objId }, (err, user) => {
     if (err) return console.log(err);
 
     const queryStr =
       (!isNaN(new Date(req.query.from)) && !isNaN(new Date(req.query.to))) ?
 
         {
           "id": req.params._id,
           "date": {
             "$gte": new Date(req.query.from),
             "$lte": new Date(req.query.to)
           }
         }
         :
         {
           "id": req.params._id
         }
 
     Exercises.find(queryStr, (err, data) => {
       if (err) return console.log(err);
 
       const excCount = data.reduce((acc, curr) => {
         return acc + 1
       }, 0)
 
       res.status(200).json({ _id: user._id, username: user.username, count: excCount, log: data });
     }).limit(parseInt(req.query.limit))
   }) */

  try {
    let userEx = await Users.findOne({ "_id": objId });
    console.log("the user found: " + userEx.username);

    const queryStr =
      (!isNaN(new Date(req.query.from)) && !isNaN(new Date(req.query.to))) ?

        {
          "id": req.params._id,
          "date": {
            "$gte": new Date(req.query.from),
            "$lte": new Date(req.query.to)
          }
        }
        :
        {
          "id": req.params._id
        }

    let data = await Exercises.find(queryStr).limit(parseInt(req.query.limit))

    console.log(typeof data);
    console.log(data.length);

    const updateData0 = { date: (data[0].date).toDateString() };
    console.log("before updating");
    console.log(updateData0);

    let dataDateString = data.map(ele => {
      return {
        id: ele.id,
        description: ele.description,
        duration: ele.duration,
        date: (ele.date).toDateString()
      };
    })
    console.log("beforeData String");
    console.log(dataDateString);



    const excCount = data.reduce((acc, curr) => {
      return acc + 1
    }, 0)


    res.status(200).json({ _id: userEx._id, username: userEx.username, count: excCount, log: dataDateString });


  } catch (error) {
    console.log(error);

  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

