require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

app.get('/', (req, res) => res.json({ status: 'ok', app: 'trimtime-backend' }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`TrimTime backend listening on port ${PORT}`);
});
