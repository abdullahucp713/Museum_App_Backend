const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    imageURL:{
      type:String,
      required:true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "Museum Tour",
        "Workshop",
        "Special Exhibition",
        "Guided Walk",
        "other",
      ],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    dailySchedule: {
      type: [
        {
          date: {
            type: String,
            required: true,
          },
          startTime: {
            type: String,
            required: true,
          },
          endTime: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    durationMinutes: {
      type: Number,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    seatsBooked: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// virtual field: seats Remainig
eventSchema.virtual("seatsRemanig").get(function () {
  return this.capacity - this.seatsBooked;
});

eventSchema.pre('save', function (next) {
    if (this.startTime >= this.endTime) {
        const error = new Error('Event end time must be after the start time.');
        return next(error);
    }

    if (this.seatsBooked > this.capacity) {
        const error = new Error('Seats booked cannot exceed event capacity.');
        return next(error);
    }
    if (this.startTime && this.endTime && !this.durationMinutes) {
        const diffMs = this.endTime.getTime() - this.startTime.getTime();
        this.durationMinutes = Math.round(diffMs / 60000);
    }

    next();
});


const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
