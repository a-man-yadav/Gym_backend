const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes')
const userRoutes = require('./src/routes/userRoutes')
const exerciseRoutes = require('./src/routes/exerciseRoutes')
const programRoutes = require('./src/routes/programRoutes')
const adminRoutes = require('./src/routes/adminRoutes')

dotenv.config()

const app = express()
PORT = process.env.PORT || 5000

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MONGODB CONNECTED")
    } catch (error) {
        console.log("Error:", error.message)
    }
}
 
//bhai smha de ye
app.use(cors({
    origin: true,
    credentials: true
}));


app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/exercises', exerciseRoutes)
app.use('/api/programs', programRoutes)
app.use('/api/admin', adminRoutes)


app.get('/', (req, res) => {
    res.send('Gym backend server is running!');
});

connectDB()
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});