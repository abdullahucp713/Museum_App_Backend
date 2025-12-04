const Event = require("../models/EventModel");

exports.countPublished = async () => {
  return await Event.countDocuments({
    isPublished: true,
  });
};

exports.findAndPaginate = async (skip, limit) => {
  return await Event.find({
    isPublished: true,
  })
    .select("-seatsBooked -__v -updatedAt")
    .sort({ startTime: 1 })
    .skip(skip)
    .limit(limit);
};

exports.findById = async (eventId) => {
  return await Event.findById(eventId);
};

exports.createEvent = async (eventData)=>{
  return await Event.create(eventData);
}

exports.updateEvent = async (eventId,updateData)=>{
  return await Event.findByIdAndUpdate(eventId,updateData,{new:true,runValidators:true});
}

exports.deleteEvent = async (id) => {
    return await Event.findByIdAndDelete(id); 
};

exports.getTotalEvents = async () => {
  return await Event.countDocuments({ isActive: true });
};

exports.findAllPaginated = async (skip, limit) => {
  return await Event.find({})
    .select("-__v")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

exports.countAll = async () => {
  return await Event.countDocuments();
};

exports.findUpcomingEvents = async (limit = 10) => {
  const now = new Date();
  
  // Get all events
  const allEvents = await Event.find({})
    .select("-__v");
  
  // Filter events that have upcoming dates in dailySchedule or upcoming startTime
  const upcomingEvents = allEvents.filter(event => {
    // If event has dailySchedule, check if any scheduled day is in the future
    if (event.dailySchedule && event.dailySchedule.length > 0) {
      return event.dailySchedule.some(day => {
        try {
          // Combine date and startTime to create a full datetime
          const dayStartDateTime = new Date(`${day.date}T${day.startTime}`);
          // Check if this datetime is in the future
          return dayStartDateTime >= now;
        } catch (error) {
          // If date parsing fails, skip this day
          return false;
        }
      });
    }
    // If no dailySchedule, check the main startTime
    return event.startTime && new Date(event.startTime) >= now;
  });
  
  // Sort by earliest upcoming date/time
  upcomingEvents.sort((a, b) => {
    // Get earliest upcoming datetime for each event
    const getEarliestDateTime = (event) => {
      if (event.dailySchedule && event.dailySchedule.length > 0) {
        const upcomingDateTimes = event.dailySchedule
          .map(day => {
            try {
              return new Date(`${day.date}T${day.startTime}`);
            } catch {
              return null;
            }
          })
          .filter(date => date && date >= now)
          .sort((a, b) => a - b);
        return upcomingDateTimes.length > 0 ? upcomingDateTimes[0] : new Date(event.startTime || 0);
      }
      return new Date(event.startTime || 0);
    };
    
    const dateTimeA = getEarliestDateTime(a);
    const dateTimeB = getEarliestDateTime(b);
    return dateTimeA - dateTimeB;
  });
  
  // Return limited results
  return upcomingEvents.slice(0, limit);
};


