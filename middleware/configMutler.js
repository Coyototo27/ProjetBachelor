const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads') // Répertoire où les fichiers téléchargés seront enregistrés
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname) // Nom de fichier unique pour éviter les collisions
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
