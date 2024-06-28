const verifyAdmin = (req, res, next) => {
    // Vérifie si l'utilisateur est connecté
    if (!req.user) {
      console.log('Utilisateur non connecté');
      return res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource.' });
    }
    // Vérifie si l'utilisateur est un administrateur
    if (!req.user.admin) {
      console.log('L\'utilisateur n\'est pas un administrateur');
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accéder à cette ressource.' });
    }
  
    next();
  };
  
  module.exports = verifyAdmin;
  