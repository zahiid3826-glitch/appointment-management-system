const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    doctorid:String,
    days:[{
        day:String,
        timestart:String,
        timeend:String
    }]
  },
  { timestamps: true }
);


const Sale = mongoose.model("Availability", availabilitySchema);

module.exports = Sale;
