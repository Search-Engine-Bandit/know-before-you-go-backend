'use strict';

const express = require('express');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const mongoose = require('mongoose');
const axios = require('axios');
const EventModel = require('./models/events');
// const response = require('express');

const PORT = process.env.PORT || 3001;
const TICKETMASTERKEY = process.env.TICKETMASTER_API

const app = express();

app.use(cors());
app.use(express.json());

require('dotenv').config();


// all of this came from jsonwebtoken docs and will be EXACTLY THE SAME
// ---------------------------

var client = jwksClient({
  // EXCEPTION!  jwksUri comes from your single page application -> settings -> advanced settings -> endpoint -> the jwks one
  jwksUri: 'https://dev-vb6a1x5t.us.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
//---------------------------------

class Event {
  constructor (event) {
    this.name = event.name;
    this.id = event.id;
    this.localDate = event.dates.start.localDate;
    this.localTime = event.dates.start.localTime;
    this.image = event.images[1].url;
    this.priceRanges = event.priceRanges;
    this.city = event._embedded.venues[0].city.name;
    this.state = event._embedded.venues[0].state.stateCode;
    this.ticket = event.url
  }
}

mongoose.connect('mongodb://127.0.0.1:27017/event', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('Connected to DB');
  })

app.post('/dbevents', (req, res) => {

  try {
    let { name, city, localDate, localTime, image, state, ticket } = req.body
    let newEvent = new EventModel({ name, city, localDate, localTime, image, state, ticket });
    newEvent.save();
    console.log(newEvent)
    res.send(newEvent)
  } catch (err) {
    console.log('post failed', err)
  }
});
app.get('/dbevents', async (req, res) => {
  try {
    // const token = req.headers.authorization.split(' ')[1];
    //the second part is from jet docs
    // jwt.verify(token, getKey, {}, function (err, user) {
    //   if (err) {
    //     console.log('error')
    //     res.status(500).send('invlaid token');
    // } else {
    let eventsSaved = await EventModel.find({});
    res.status(200).send(eventsSaved)
    //     }
    //   })
  }
  catch (err) {
    res.status(500).send(`dbase error, ${err}`)
  }
})
app.delete('/dbevents/:id', async (req, res) => {
  try {
    let eventID = req.params.id
    await EventModel.findByIdAndDelete(eventID);
    res.send('sucessfully deleted')
  } catch (err) {
    console.log(err, 'deletion failed')
  }
})
app.put('/dbevents/:id', async (req, res) => {
  try {
    let eventID = req.params.id;
    console.log(req.body)
    let { prospect, mood, going } = req.body;
    let selectedEvent = req.body.selectedEvent
    let newEvent = { name: selectedEvent.name, prospect: prospect, mood: mood, city: selectedEvent.city, localDate: selectedEvent.localDate, localTime: selectedEvent.localTime, image: selectedEvent.image, state: selectedEvent.state, ticket: selectedEvent.ticket, going: going }
    const updatedEvent = await EventModel.findByIdAndUpdate(eventID, newEvent, { new: true, overwrite: true });

    res.status(200).send(updatedEvent);
  } catch (err) {
    res.status(500).send('unable to update the database')
  }
})

app.get('/events', async (req, res) => {
  try {

    let startYearMonthDay = req.query.startDate
    let endYearMonthDay = req.query.endDate

    let requestedCity = req.query.searchQuery
    let state = req.query.stateCode
    let activity = req.query.classificationName

    console.log(startYearMonthDay, endYearMonthDay, requestedCity, state, activity)
    let events = await axios.get(`https://app.ticketmaster.com/discovery/v2/events?apikey=MUVmpA0ibwqwo7mnSkoXvSgOiiJu88fB&locale=*&startDate=${startYearMonthDay}&searchQuery=${requestedCity}&countryCode=US&stateCode=${state}&classificationName=${activity}`)


    let eventsArray = events.data._embedded.events.map(event => {
      return new Event(event);
    });
    res.status(200).send(eventsArray);
  } catch (error) {
    console.log(error);
  }
  // res.status(200).send();
})



app.listen(PORT, () => console.log(`listening on ${PORT}`));
