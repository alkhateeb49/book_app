'use strict';
const express = require('express');
const cors = require('cors');
const superAgent = require('superagent');

let app = express();
app.use(cors());
app.set('view engine','ejs');
require('dotenv').config();
const PORT = process.env.PORT;

//
app.use('/public', express.static('./public'));
//

app.get('/',handleHome);
app.get('/search',handleSearch);

function handleHome(req,res){
  res.render('pages/index');
}

function handleSearch(req,res){
  res.render('pages/index');
}


app.listen(PORT, () => {
  console.log('Server is running on port ', PORT);
});
