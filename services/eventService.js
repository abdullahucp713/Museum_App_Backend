const {countPublished,findAndPaginate,findById} = require("../repositories/eventRepository");
const ErrorResponse = require("../utils/errorResponse");

exports.findAllPublished = async (page, limit) => {
  const skip = (page - 1) * limit;

  const totalCount = await countPublished();

  const events = await findAndPaginate(skip, limit);

  return {
    events,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
};

exports.findById = async (eventId) => {
  const event = await findById(eventId);

  if (!event || !event.isPublished || !event.isActive) {
    throw new ErrorResponse("Event not found or not currently available.", 404);
  }
  return event;
};

exports.searchAndPaginate = async (params) => {
  const Event = require("../models/EventModel");
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 100; // Use higher limit for search
  const skip = (page - 1) * limit;

  // Build search query - only published events
  let query = { isPublished: true };

  // Add keyword search if provided
  if (params.keyword) {
    const regex = new RegExp(params.keyword, "i");
    query.$or = [
      { title: regex }, 
      { description: regex },
      { location: regex },
      { eventType: regex }
    ];
  }

  // Add date filter if provided
  if (params.date) {
    const startOfDay = new Date(params.date);
    startOfDay.setHours(0, 0, 0, 0);
    query.startTime = { $gte: startOfDay };
  }

  // Add price filter if provided
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    query.price = {};
    
    if (params.minPrice !== undefined) {
      const minPrice = parseFloat(params.minPrice);
      if (!isNaN(minPrice) && minPrice >= 0) {
        query.price.$gte = minPrice;
      }
    }
    
    if (params.maxPrice !== undefined) {
      const maxPrice = parseFloat(params.maxPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        query.price.$lte = maxPrice;
      }
    }
  }

  // Count total matching documents
  const totalCount = await Event.countDocuments(query);

  // Find events with the query
  const events = await Event.find(query)
    .select("-seatsBooked -__v -updatedAt")
    .sort({ startTime: 1 })
    .skip(skip)
    .limit(limit);

  return {
    events,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
};
