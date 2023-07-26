const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect')
const authRouter = require('./routers/authRouter')
const postsRouter = require('./routers/postsRouter')
const userRouter = require('./routers/userRouter')
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
dotenv.config('./.env');


const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CORS_FRONTEND_ORIGIN
}));

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);

const PORT = process.env.PORT || 4000;
dbConnect();
app.listen(PORT, ()=>{
    console.log(process.env.MONGO_URI);
    console.log(`Listening on port: ${PORT}`);
})