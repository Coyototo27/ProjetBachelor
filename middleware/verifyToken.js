const jwt = require('jsonwebtoken');

//fonction de vérification de cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    console.log('Aucun cookie trouvé');
    return next();
  }

  jwt.verify(token, 'votre_secret', (err, decoded) => {
    if (err) {
      req.user = null;
      console.log('Erreur lors du décryptage du token :', err);
      return next();
    }
    console.log('Informations de l\'utilisateur décryptées :', decoded);
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
