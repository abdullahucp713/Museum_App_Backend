const ErrorResponse = require('../utils/errorResponse.js')

const errroHandler = (err, req, res, next) => {

    let error = { ...err };

    error.message = err.message;

    // Handle payload too large error
    if (err.type === 'entity.too.large' || err.status === 413 || err.message.includes('too large')) {
        const message = 'Request entity too large. Please reduce the size of your request.';
        error = new ErrorResponse(message, 413);
        return res.status(413).json({
            success: false,
            error: message,
        });
    }

    if (err.name === 'CastError') {
        const message = `Resource not found.Invalid ID:${err.value}`;
        error = new ErrorResponse(message, 404)
    }

    if (err.code === 11000) {
        const message = `Duplicate field value entered:${Object.keys(err.keyValue)} already exists`;
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message.join(', '), 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
    })


}

module.exports = errroHandler;