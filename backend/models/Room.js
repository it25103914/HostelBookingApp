const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  roomType: { type: String, enum: ['Single', 'Double', 'Triple'], required: true }, //
  pricePerMonth: { type: Number, required: true }, //[cite: 1]
  capacity: { type: Number, required: true }, //[cite: 1]
  currentOccupancy: { type: Number, default: 0 }, //[cite: 1]
  description: { type: String }, //[cite: 1]
  image: { type: String }, //[cite: 1]
  availabilityStatus: { type: String, enum: ['Available', 'Full'], default: 'Available' } //[cite: 1]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);