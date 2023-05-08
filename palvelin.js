const express = require('express');
const { port, host } = require('./config.json');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// EJS asettaminen
app.set('views', path.join(__dirname, 'sivupohjat'));
app.set('view engine', 'ejs');

// Articles
app.get('/articles', (req, res, next) => {
  Article.all((err, articles) => {
    if (err) return next(err)

    res.format({
      html: () => {
        res.render('articles', { articles: articles })
      },
      json: () => {
        res.send(articles)
      }
    });
  });
});

// Luo tietokantayhteys
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "autot"
});
connection.connect((error) => {
  if (error) {
    console.error('Virhe tietokantayhteydessä: ', error);
    return;
  }
  console.log('Tietokantayhteys luotu');
});

// hae kaikki autot
app.get('/autot', (req, res) => {
  const sql = 'SELECT * FROM auto';
  connection.query(sql, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// hae auto id:llä
app.get('/autot/:id', (req, res) => {
  const haettava = req.params.id;
  const sql = `SELECT * FROM auto WHERE id = ${haettava}`;
  connection.query(sql, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Autoa ei löydy');
    }
  });
});

// lisää auto
app.post('/autot/uusi', (req, res) => {
  const uusiauto = req.body;
  const sql = `INSERT INTO auto SET ?`;
  connection.query(sql, uusiauto, (error, result) => {
    if (error) throw error;
    uusiauto.id = result.insertId;
    res.json(uusiauto);
  });
});

// muokkaa autoa id:llä
app.put('/autot/muokkaa/:id', (req, res) => {
  const id = req.params.id;
  const auto = autot.find(h => h.id == id);
  if (auto) {
    Object.assign(auto, req.body);
    const sql = `UPDATE auto SET ? WHERE id = ?`;
    connection.query(sql, [req.body, id], (error) => {
      if (error) throw error;
      res.json(auto);
    });
  } else {
    res.status(404).send('Autoa ei löydy');
  }
});

// poista auto id:llä
app.delete('/autot/poista/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM auto WHERE id = ?`;
  connection.query(sql, id, (error, result) => {
    if (error) throw error;
    if (result.affectedRows > 0) {
      res.sendStatus(204);
    } else {
      res.status(404).send('Autoa ei löydy');
    }
  });
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
