import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import MeetupsCreatedController from './app/controllers/MeetupsCreatedController';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.post('/files', upload.single('file'), FileController.store);

routes.put('/users', UserController.update);

routes.get('/meetups', MeetupController.index);
// example-> url preview: http://localhost:3434/meetups?date=2019-07-01&page=2
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.get('/meetupscreated', MeetupsCreatedController.index);

routes.get('/subscriptions', SubscriptionController.index);
routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);

export default routes;
