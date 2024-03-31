import express from 'express';
import * as web_api from '../public/web/seca-web-api.mjs';
import passport from 'passport';
import session from 'express-session';
import * as local from '../strategies/local.mjs';

// Create the express app
const app = express();

// Configure passport session
const sessionMiddleware = session({
    secret: "ASDASDVSADSACDXASDZSAFAWD18729173192",
    resave: true,
    saveUninitialized: true,
});


// Configure passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session(undefined));

app.use('/api', web_api.apiRouter);
app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Listening on port 3000!');
});