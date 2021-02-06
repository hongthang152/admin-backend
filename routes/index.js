var express = require('express');
var router = express.Router();
var multer = require('multer');
var File = require('../models/file');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/files/')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`) //Appending extension
  }
});
var upload = multer({
  storage: storage
}); 


const FILES_DIR = 'public/files';

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'yuss.cc backend server' });
});

router.get('/files/get', async (req, res ,next) => {
  var code = req.query.code;
  if(!code) {
    return res.status(400).send({
      message: "Code cannot be empty"
    })
  }
  var file = await File.findOne({ pin: code });
  return res.status(200).send(file.toJSON());
})

router.post('/files/create', upload.single('file'), async (req, res, next) => {
  var code = req.query.code;
  if(!code) {
    return res.status(400).send({
      message: "Code cannot be empty"
    })
  }

  var host = process.env.MODE == 'development' ? `http://${process.env.HOST}:${process.env.PORT}` : `https://${process.env.HOST}`;
  var url = `${host}/files/${req.file.originalname}`;
  try {
    var file = await File.find({ 
      pin: code
    })
    if(file.length) {
      return res.status(400).send({
        message: "File ID already exists"
      })
    }
    file = await File.find({
      name: req.file.originalname
    })
    if(file.length) {
      return res.status(400).send({
        message: "File name already exists"
      })
    }

    var file = await File.create({
      name: req.file.originalname,
      pin: code,
      url: url
    });
    return res.status(200).send(file.toJSON())
  } catch(err) {
    console.error(err);
    return next(err);
  }
})

module.exports = router;
