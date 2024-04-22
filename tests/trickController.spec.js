const fs = require('fs');
const Trick = require('../models/trick');
const TrickController = require('../controllers/trickController');


jest.mock('fs');
jest.mock('../models/trick');


describe('createTrick', () => {
    it('devrait créer un trick avec succès', async () => {
        const req = {
            body: {
                nomFigure: 'Test Trick',
                description: 'Test description',
                difficulte: 1
            },
            file: {
                path: '/path/to/test/image.png'
            },
            user: {
                userId: 123,
                email: 'test@example.com'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            render: jest.fn(),
            send: jest.fn(),
            redirect: jest.fn()
        };

        const createMock = jest.spyOn(Trick, 'create').mockResolvedValue({ id: 456 });

        fs.readFileSync.mockReturnValue('fakeImageData');
        fs.unlinkSync.mockImplementation();

        await TrickController.createTrick(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.redirect).toHaveBeenCalledWith('/');
        expect(createMock).toHaveBeenCalledWith({
            nom: 'Test Trick',
            description: 'Test description',
            image: 'fakeImageData',
            id_level: 1,
            id_user: 123
        });

        expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/test/image.png');
        expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/test/image.png');

        createMock.mockRestore();
    });
});

