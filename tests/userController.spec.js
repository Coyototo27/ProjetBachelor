// Importez le contrôleur à tester
const User = require('../models/user');
const userController = require('../controllers/userController');
const bcrypt = require('bcrypt');


// Importez Jest pour les assertions
//const { expect } = require('jest');
const { validationResult } = require('express-validator'); // Importez validationResult

// Mock des modules requis pour la fonction createUser
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({ isEmpty: jest.fn(() => true) })),
}));
jest.mock('bcrypt', () => ({
    hash: jest.fn(() => 'hashedPassword'),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'jwtToken'),
}));

// jest.mock('../models/user', () => ({
//     init: jest.fn(),
//     findOne: jest.fn(),
//     findAll: jest.fn(),
//   }));
  


// Décrivez les tests pour la fonction createUser du UserController
describe('Test de la fonction createUser du UserController', () => {
    // Test de la création d'un utilisateur

    it('devrait créer un nouvel utilisateur avec succès', async () => {
        // Simulez une demande HTTP POST contenant les données d'un nouvel utilisateur
        const req = {
            body: {
                nom: 'John',
                prenom: 'Doe',
                email: 'john.doe@example.com',
                password: 'Azerty123',
            },
        };

        // Mock de la fonction User.create
        const mockCreate = jest.fn(() => ({
            id: 1,
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
        }));
        User.create = mockCreate; // Utilisation de la définition de User importée

        // Simulez une réponse HTTP
        const res = {
            status: jest.fn(() => res),
            render: jest.fn(),
            cookie: jest.fn(),
            send: jest.fn(),
            redirect: jest.fn(),
        };

        // Appelez la fonction createUser du contrôleur
        await userController.createUser(req, res);

        // Vérifiez si la fonction User.create a été appelée avec les bonnes données
        expect(mockCreate).toHaveBeenCalledWith({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            password: 'hashedPassword', // Vérifie le mot de passe hashé
        });

        // Vérifiez si la fonction jwt.sign a été appelée avec les bonnes données
        expect(require('jsonwebtoken').sign).toHaveBeenCalledWith({
            userId: 1,
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
        }, 'votre_secret', { expiresIn: '1h' });

        // Vérifiez si la fonction res.cookie a été appelée avec le bon token
        expect(res.cookie).toHaveBeenCalledWith('token', 'jwtToken', { httpOnly: true });
        expect(res.status).toHaveBeenCalledWith(201);
        //User créer
        expect(User.create).toHaveBeenCalled();
        // Vérifiez si la redirection a été effectuée avec succès
        expect(res.redirect).toHaveBeenCalledWith('/'); // Assurez-vous de rediriger vers la bonne page
    });

    // Test de la gestion des erreurs lors de la création d'un utilisateur avec des données invalides
    it('devrait renvoyer les erreurs de validation en cas de données invalides', async () => {
        // Simulez une demande HTTP POST contenant des données d'utilisateur invalides
        const req = {
            body: {
                nom: 'John',
                prenom: 'Doe',
                email: 'john.doe.example.com', //Adresse invalide
                password: 'Azerty123',
            },
        };

        // Simulez une réponse HTTP
        const res = {
            status: jest.fn(() => res),
            render: jest.fn(),
        };

        // Mock de la fonction validationResult pour simuler des erreurs de validation
        const mockValidationResult = {
            isEmpty: () => false, // Simuler que des erreurs existent
            array: jest.fn(() => [{ msg: 'Adresse e-mail invalide' }]), // Simuler un message d'erreur
        };
        validationResult.mockReturnValue(mockValidationResult);

        // Appelez la fonction createUser du contrôleur
        await userController.createUser(req, res);

        expect(res.render).toHaveBeenCalledWith('register', {
            errors: [{ msg: 'Adresse e-mail invalide' }], // Vérifiez si le message d'erreur est correct
            user: null, // L'utilisateur n'est pas créé en cas d'erreur
            visiteur: { nom: 'John', prenom: 'Doe', email: 'john.doe.example.com' }, // Données d'entrée renvoyaient
        });
        expect(res.status).toHaveBeenCalledWith(400);
    });
});


//Décrivez les tests pour la fonction login du UserController
describe('Test de la fonction login du UserController', () => {


    // it('should login successfully', async () => {
    //     // Mock pour simuler un utilisateur dans la base de données
    //     const mockedUser = {
    //       id: 1,
    //       nom: 'John',
    //       prenom: 'Doe',
    //       email: 'john.doe@example.com',
    //       password: '$2b$10$Y/8wd9lBxliNUubVu7jLx.7.KuMy5cAKYxUy/KSRc/Yv9XLO/VoGm', // Mot de passe hashé
    //     };
    
    //     // Définition du comportement du mock User.findOne
    //     User.findOne.mockResolvedValue(mockedUser);
    
    //     // Les données d'entrée pour le test
    //     const req = {
    //       body: {
    //         email: 'john.doe@example.com',
    //         password: 'password', // Mot de passe en clair
    //       },
    //     };
    
    //     // Mock pour res object
    //     const res = {
    //       cookie: jest.fn(),
    //       redirect: jest.fn(),
    //     };
    
    //     await userController.login(req, res);
    
    //     // Vérifier que User.findOne a été appelé avec l'email fourni
    //     expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
    
    //     // Vérifier le comportement attendu
    //   });


    

    // Test de la gestion des erreurs lors de la connexion avec un utilisateur introuvable
    it('devrait renvoyer une erreur si l\'utilisateur n\'existe pas', async () => {
        // Simulez une demande HTTP POST contenant les données de connexion
        const req = {
            body: {
                email: 'john.doe@example.com',
                password: 'Azerty123',
            },
        };
        // Mock de la fonction User.findOne pour simuler un utilisateur inexistant
        User.findOne = jest.fn().mockResolvedValue(null);

        // Simulez une réponse HTTP
        const res = {
            status: jest.fn(() => res),
            render: jest.fn(),
        };

        // Appelez la fonction login du contrôleur
        await userController.login(req, res);

        // Vérifiez si la fonction User.findOne a été appelée avec les bonnes données
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
        expect(res.render).toHaveBeenCalledWith('login', { //renvoie à la page de connexion
            error: 'Cet utilisateur n\'existe pas', //message d'erreur
            user: null, //utiilsateur non connecté
        });
        expect(res.status).toHaveBeenCalledWith(401);
    });
});