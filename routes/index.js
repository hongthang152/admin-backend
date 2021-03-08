var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var Business = require('../models/business');
var Visit = require('../models/visit');

var authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, 'static-secret', (err, user) => {
          if (err) {
              return res.sendStatus(403);
          }
          req.user = user;
          next();
      });
  } else {
      res.sendStatus(401);
  }
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'yuss.cc backend server' });
});


router.post('/login', async (req, res, next) => {
  var user = await User.findOne({ username : req.body.username });
  if (user === null) { 
    return res.status(400).send({ 
        message : "User not found."
    }); 
  }

  if (user.validPassword(req.body.password)) { 
    var token = jwt.sign({userID: user.id}, 'static-secret', {expiresIn: '2h'});
    return res.status(201).send({ token });
  } else { 
    return res.status(400).send({ 
        message : "Wrong Password"
    });
  }
})

router.get('/business', authMiddleware, async (req, res, next) => {
  try {
    var businesses = [];
    if(req.query._id) {
      businesses = await Business.find({ _id: req.query._id });
    } else {
      businesses = await Business.find({});
    }
    return res.status(200).send(JSON.stringify(businesses));
  } catch(e) {
    return res.status(500);
  }
})

router.post('/business', authMiddleware, async (req, res, next) => {
  try {
    await Business.create(req.body);
    return res.status(201).json({ message: 'Business created '});
  } catch (e) {
    return res.status(500);
  }  
})


router.put('/business/:id', authMiddleware, async (req, res, next) => {
  try {
    var id = req.params.id;
    var business = await Business.findById(id);
    if(!business) return res.status(404);
    var body = req.body;
    business.name = body.name;
    business.email = body.email;
    business.location = body.location;

    await business.save();
    return res.status(204).json({ message: 'Business updated '});
  } catch(e) {
    return res.status(500);
  }
})

router.delete('/business/:id', authMiddleware, async (req, res, next) => {
  try {
    var id = req.params.id;
    await Business.remove({ _id: id });
    return res.status(200).json({ message: 'Business deleted '});
  } catch(e) {
    return res.status(500);
  }
})

router.post('/visit', async(req, res, next) => {
  try {
    await Visit.create({ location: { type: 'Point', coordinates: [ req.body.latitude, req.body.longitude ] } });
    return res.status(200).json({ message: 'Visit recorded '});
  } catch(e) {
    return res.status(500);
  }
})

router.get('/visit',  async(req, res, next) => {
  try {
    var visits = await Visit.find({ });
    return res.status(200).send(JSON.stringify(visits));
  } catch(e) {
    return res.status(500);
  }
})

module.exports = router;
