const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));


app.get('/', (req, res) => {
    res.render('home', { activePage: 'home' });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('form', { activePage: 'register' });
});

app.get('/about', (req, res) => {
    res.render('aboutUs', { activePage: 'about' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});