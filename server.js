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
app.use('/public', express.static('./public'));
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

let arrayBook = [];
function showData(searchQueryAndIn, res) {
  arrayBook = [];
  const bookQuery = {
    q: searchQueryAndIn
  }
  superAgent.get(bookURL).query(bookQuery).then(data => {
    for (let i = 0; i < 10; i++) {
      var des, auth,image;
      if (data.body.items[i].volumeInfo.description === undefined) {
        des = 'undefined';
      } else { des = data.body.items[i].volumeInfo.description; }
      if (data.body.items[i].volumeInfo.authors === undefined) {
        auth = 'undefined';
      } else { auth = data.body.items[i].volumeInfo.authors; }
      if (data.body.items[i].volumeInfo.imageLinks === undefined) {
        image = './public/styles/NOTAV.jpg';
      } else { image = data.body.items[i].volumeInfo.imageLinks.thumbnail; }
      image = image.replace(/^http:\/\//i, 'https://');
      let bookConst = new Book(data.body.items[i].volumeInfo.title, auth, des,image);
      arrayBook.push(bookConst);
    }
    res.render('pages/searches/show', { arrayBook: arrayBook });

  });
}

function Book(title, authors, description,image) {
  this.title = title;
  this.authors = authors;
  this.description = description;
  this.image=image;
}

app.listen(PORT, () => {
  console.log('Server is running on port ', PORT);
});

