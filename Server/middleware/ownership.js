// middleware/ownership.js

const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    const resourceUserId = await getResourceUserId(req);

    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  };
};

module.exports = checkOwnership;