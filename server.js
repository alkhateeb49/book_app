'use strict';
const express = require('express');
const cors = require('cors');
const superAgent = require('superagent');
// const { search } = require('superagent');


let app = express();
app.use(cors());
app.set('view engine', 'ejs');
require('dotenv').config();
const PORT = process.env.PORT;

//
// app.use('/public', express.static('./public'));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
//

app.get('/', handleHome);
app.get('/searches/new', handleSearch);
app.post('/searches', handleShow);

function handleHome(req, res) {
  res.render('pages/index');
}

function handleSearch(req, res) {
  res.render('pages/searches/new');
}

const bookURL = 'https://www.googleapis.com/books/v1/volumes';

function handleShow(req, res) {
  try {
    let searchQuery = req.body.search;
    let searchIn = req.body.title;
    let searchQueryAndIn = searchQuery + '+in+' + searchIn;
    showData(searchQueryAndIn, res);
  } catch (error) {
    res.render('pages/error', { error: error });
  }
}


function showData(searchQueryAndIn, res) {

  const bookQuery = {
    q: searchQueryAndIn,
    maxResults:10
  }
  superAgent.get(bookURL).query(bookQuery).then(data => {
    let arrayBook = data.body.items.map(ogj => {
      var des, auth, image;
      if (ogj.volumeInfo.description === undefined) {
        des = 'undefined';
      } else { des = ogj.volumeInfo.description; }
      if (ogj.volumeInfo.authors === undefined) {
        auth = 'undefined';
      } else { auth = ogj.volumeInfo.authors; }
      if (ogj.volumeInfo.imageLinks === undefined) {
        image = './public/styles/NOTAV.jpg';
      } else { image = ogj.volumeInfo.imageLinks.thumbnail; }
      image = image.replace(/^http:\/\//i, 'https://');
      return new Book(ogj.volumeInfo.title, auth, des, image);
    });
    res.render('pages/searches/show', { arrayBook: arrayBook });
  });
}

function Book(title, authors, description, image) {
  this.title = title;
  this.authors = authors;
  this.description = description;
  this.image = image;
}

app.listen(PORT, () => {
  console.log('Server is running on port ', PORT);
});

