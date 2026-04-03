const mongoose = require('mongoose');

const mongooseURI = "mongodb://localhost:27017/iNotebook";

const connectToMongo = async () => {  
    // mongoose.connect(mongooseURI, () =>{
    //     console.error(" Connected to MongoDB Successfull");
    // });
    try {  
        await mongoose.connect(mongooseURI);
        console.log("✅ Connected to MongoDB Successfully");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectToMongo;