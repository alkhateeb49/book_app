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
//
let pg = require('pg');
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false } });
//

//
const override = require('method-override');
app.use(override('_method'));
//

app.get('/', favRender);
app.get('/searches/new', handleSearch);
app.post('/searches', handleShow);

app.post('/books', favBook);
app.get('/books/:id', detailsButton);
app.delete('/books/:delete_id', deleteBook);
app.put('/books/:update_id', updateBook);


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
    maxResults: 10
  }
  superAgent.get(bookURL).query(bookQuery).then(data => {
    let arrayBook = data.body.items.map(ogj => {
      var des, auth, image, isbn;
      if (ogj.volumeInfo.description === undefined) {
        des = 'No description provided';
      } else { des = ogj.volumeInfo.description; }
      if (ogj.volumeInfo.authors === undefined) {
        auth = 'No authors provided';
      } else { auth = ogj.volumeInfo.authors; }
      if (ogj.volumeInfo.imageLinks === undefined) {
        image = 'styles/NOTAV.jpg';
      } else { image = ogj.volumeInfo.imageLinks.thumbnail; }
      image = image.replace(/^http:\/\//i, 'https://');
      if (ogj.volumeInfo.industryIdentifiers === undefined) {
        isbn = 'No ISBN provided';
      } else { isbn = ogj.volumeInfo.industryIdentifiers[0].type + ' ' + ogj.volumeInfo.industryIdentifiers[0].identifier; }
      return new Book(ogj.volumeInfo.title, auth, des, image, isbn);
    });
    res.render('pages/searches/show', { arrayBook: arrayBook });
  });
}

function Book(title, authors, description, image, isbn) {
  this.title = title;
  this.authors = authors;
  this.description = description;
  this.image = image;
  this.isbn = isbn;
}

client.connect().then((data) => {
  app.listen(PORT, () => {
    console.log('the app is listening to ' + PORT);
  });
}).catch(error => {
  console.log('error in connect to database ' + error);
});





function favBook(req, res) {
  let image_url = req.body.image;
  let title = req.body.title;
  let authors = req.body.authors;
  let description = req.body.description;
  let isbn = req.body.isbn;

  let insertQuery = 'INSERT INTO books(author,title,isbn,image_url,description) VALUES($1, $2, $3, $4, $5)';
  let value = [authors, title, isbn, image_url, description];
  client.query(insertQuery, value).then(data => {

    console.log('data returned back from db ', data);
    let idQuery = 'SELECT * FROM books ORDER BY id DESC LIMIT 1';
    client.query(idQuery).then(data => {
      res.redirect('/books/' + data.rows[0].id);
    });

  }).catch(error => { console.log(error); });



}


function favRender(req, res) {
  client.query(`SELECT * FROM books`).then(data => {
    res.render('pages/index', { savedBook: data });
  });
}

function detailsButton(req, res) {
  let id = req.params.id;
  client.query(`SELECT * FROM books WHERE id = ${id}`).then(data => {

    res.render('pages/books/show', { bookDetails: data.rows });
  })
}


function deleteBook(req, res) {
  let id = req.params.delete_id;
  client.query(`DELETE FROM books WHERE id = ${id};`).then(data => {
    res.redirect(`/`);
  });
}

function updateBook(req, res) {
  let id = req.params.update_id;
  let authors = req.body.authors;
  let title = req.body.title;
  let isbn = req.body.isbn;
  let image = req.body.image;
  let description = req.body.description;

  let SQL = `UPDATE books SET author =$1 ,title = $2 ,isbn= $3 ,image_url=$4 ,description=$5 WHERE id = $6;`;
  let value = [authors, title, isbn, image, description, id];
  console.log(value);
  client.query(SQL, value);
  res.redirect(`/books/${id}`)
}
