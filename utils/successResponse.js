exports.sendSuccess = (
  res,
  statusCode,
  message = "Success",
  data = null,
  token = null
) => {
  const response = {
    success: true,
    message: message,
  };

  if (token) {
    response.token = token;
  }

  if (data) {
    response.data = data;
  }

  if ((token && statusCode === 200) || statusCode === 201) {
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    res.cookie("token", token, options);
  }

  res.status(statusCode).json(response);
};
