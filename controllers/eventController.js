const {
  findAllPublished,
  findById,
  searchAndPaginate,
} = require("../services/eventService");
const { sendSuccess } = require("../utils/successResponse");

// Get All Events Controller
exports.getAllEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const events = await findAllPublished(page, limit);
    sendSuccess(res, 200, "Events fetched successfully.", events);
  } catch (error) {
    next(error);
  }
};

exports.getEventDetails = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await findById(eventId);
    sendSuccess(res, 200, "Event details fetched successfully.", { event });
  } catch (error) {
    next(error);
  }
};

exports.searchEvents = async (req, res, next) => {
  try {
    const query = req.query;
    const result = await searchAndPaginate(query);
    sendSuccess(res, 200, "Search results fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};
