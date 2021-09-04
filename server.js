'use strict';


const express = require('express');
const cors = require('cors');

// const jwt = require('jsonwebtoken');
// const jwksClient = require('jwks-rsa');

const mongoose = require('mongoose');
const axios = require('axios');

let { TextEncoder, TextDecoder } = require("util");


const EventModel = require('./models/events');
// const { response } = require('express');

const PORT = process.env.PORT || 3001;
const TICKETMASTERKEY = process.env.TICKETMASTER_API

const app = express();

app.use(cors());
app.use(express.json());

require('dotenv').config();

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
  }
}

// DON BANDY BUILDING COVID CLASS
class Covid {
  constructor (covid) {
    this.postiveCases = covid.positive;
    this.hospitalizedCurrently = covid.hospitalizedCurrently;
    this.deaths = covid.death;
  }
};


mongoose.connect('mongodb://127.0.0.1:27017/event', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('Connected to DB');
  })

app.post('/dbevents', (req, res) => {
  let { name, city, localDate, localTime, image, state } = req.body
  let newEvent = new EventModel({ name, city, localDate, localTime, image, state });
  newEvent.save();
  console.log(newEvent)
  res.send(newEvent)
});

app.get('/dbevents', async (req, res) => {
  let eventsSaved = await EventModel.find({});
  res.status(200).sendStatus(eventsSaved)
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



    ///////////        COVID INFO       /////////////////
    let covidInformation = await axios.get(`https://api.covidtracking.com/v1/states/ca/current.json`)

    console.log('Covid Information:', covidInformation.data)

    // let covidArray = covidInformation.data.map(data => {
    //   return new Covid(data);
    // });
    // res.status(200).send(covidArray);

    let covidObj = new Covid (covidInformation.data)
    res.status(200).send(covidObj);
  
    ///////////        COVID INFO       /////////////////


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
