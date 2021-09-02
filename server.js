'use strict';

const express = require('express');
const cors = require('cors');

// const jwt = require('jsonwebtoken');
// const jwksClient = require('jwks-rsa');

const mongoose = require('mongoose');
const { default: axios } = require('axios');

const PORT = process.env.PORT || 3001;
const TICKETMASTERKEY = process.env.TICKETMASTER_API

const app = express();

app.use(cors());
app.use(express.json());

require('dotenv').config();

class Event {
  constructor(event) {
    this.name = event.name;
    this.id = event.id;
    this.localDate = event.dates.start.localDate;
    this.localTime = event.dates.start.localTime;
    this.image = event.images[1].url;
    this.priceRanges = event.priceRanges[0].min;
    this.city = event._embedded.venues[0].city.name;
    this.state = event._embedded.venues[0].state.stateCode;
  }
}
// // all of this came from jsonwebtoken docs and will be EXACTLY THE SAME
// // ---------------------------

// var client = jwksClient({
//   // EXCEPTION!  jwksUri comes from your single page application -> settings -> advanced settings -> endpoint -> the jwks one
//   jwksUri: 'https://dev-vb6a1x5t.us.auth0.com/.well-known/jwks.json'
// });

// function getKey(header, callback) {
//   client.getSigningKey(header.kid, function (err, key) {
//     var signingKey = key.publicKey || key.rsaPublicKey;
//     callback(null, signingKey);
//   });
// }
// //---------------------------------

app.get('/', (req, res) => {
  try {

  } catch {

  }

  res.status(200).send();
});

app.get('/crimes', (req, res) => {
  try {

  } catch {

  }

  res.status(200).send();
})

app.get('/covid', (req, res) => {
  try {

  } catch {

  }

  res.status(200).send();
})

app.get('/events', async (req, res) => {
  try {

    let startYearMonthDay = req.query.startDate
    let endYearMonthDay = req.query.endDate
    let requestedCity = req.query.city
    let state = req.query.state

    let events = await axios.get('https://app.ticketmaster.com/discovery/v2/events?apikey=MUVmpA0ibwqwo7mnSkoXvSgOiiJu88fB&locale=*&startDate=2021-08-31&endDate=2021-09-01&city=orlando&countryCode=US&stateCode=fl&classificationName=music')

    let eventsArray = events.data._embedded.events.map(event => {
        return new Event(event);
      });

    res.status(200).send(eventsArray);
  } catch (error){
    console.log(error);
  }

  // res.status(200).send();
})



app.listen(PORT, () => console.log(`listening on ${PORT}`));
