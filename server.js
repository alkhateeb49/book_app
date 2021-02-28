'use strict';
const express = require('express');
const cors = require('cors');
const superAgent = require('superagent');
const { search } = require('superagent');


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
  // res.render('pages/searches/new');
  let searchQuery = req.body.search;
  let searchIn = req.body.title;
  let searchQueryAndIn = searchQuery + '+in' +searchIn;
  showData(searchQueryAndIn, res);
}

let arrayBook = [];
function showData(searchQueryAndIn, res) {
  const bookQuery = {
    q: searchQueryAndIn
  }
  superAgent.get(bookURL).query(bookQuery).then(data=>{
    // console.log(data);
    // res.status(200).send(data.publisher);
    // res.status(200).send(data.body.items);
    // console.log(data.body.items[0].volumeInfo.title);
    res.status(200).send(data.body.items[0]);
    // let authorsData = data.body.items[0].volumeInfo.authors[0];
    // data.body.items.map(valueData =>{
      for (let i = 0; i < 10; i++) {
        let bookConst = new Book (data.body.items[i].volumeInfo.title, data.body.items[i].volumeInfo.authors, data.body.items[i].volumeInfo.description);
        arrayBook.push(bookConst);

        
      }
      
    res.status(200).send(arrayBook);
    // res.status(200).send(data.body.items[0].volumeInfo.authors);
      // for (let i = 0; i < 20; i++) { 
      //   if ( data.body.items[i].volumeInfo.description != null) {
      //     console.log(data.body.items[i].volumeInfo.description);
      //   }
      // }
    // res.status(200).send(data.body.items[0].volumeInfo);
    // res.render('pages/searches/show', {arrayBook:arrayBook});

  });
}

function Book (title, authors, description) {
  this.title = title;
  this.authors = authors;
  this.description = description;
}

app.listen(PORT, () => {
  console.log('Server is running on port ', PORT);
});

