const jwt = require("jsonwebtoken");

/** Mirrors flask_jwt_extended's create_access_token(identity=email). */
function createAccessToken(config, identity) {
  const expiresInSeconds = config.JWT_EXPIRES_DAYS * 24 * 60 * 60;
  return jwt.sign({ sub: identity }, config.JWT_SECRET_KEY, { expiresIn: expiresInSeconds });
}

function decodeToken(config, token) {
  return jwt.verify(token, config.JWT_SECRET_KEY);
}

/** Express middleware mirroring flask_jwt_extended's @jwt_required(). */
function jwtRequired(config) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid authorization header." });
    }

    try {
      const decoded = decodeToken(config, token);
      req.jwtIdentity = decoded.sub;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  };
}

module.exports = { createAccessToken, decodeToken, jwtRequired };
