const mongoose = require('mongoose');

const dbConnection = async() => {
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongodb connected"))
    .catch((err) => console.log("Error occured while connecting to mongodb", err));
};

module.exports = dbConnection;