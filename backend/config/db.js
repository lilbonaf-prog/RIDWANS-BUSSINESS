import mongoose from "mongoose"

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://lilbonaf_db_user:1905Bona1705@cluster0.1mguqkv.mongodb.net/ridwan-business').then(()=>console.log("DB Connected"));
}