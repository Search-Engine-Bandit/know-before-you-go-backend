'use strict';

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  localDate: { type: String, required: true },
  localTime: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  prospect: { type: String },
  mood: { type: String }

})
const EventModel = mongoose.model('event', eventSchema)
module.exports = EventModel
