import express from 'express';
import itemRoutes from './routes/itemRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/api/items', itemRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Welcome to the Express API!');
}
);

export default app;
