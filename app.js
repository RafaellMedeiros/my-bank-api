import express from 'express'
import mongoose from 'mongoose'
import { bankRoutes } from './routes/bankRoutes.js'

(async () => {
  await mongoose.connect("mongodb+srv://Antipam:663034as@cluster.ubgqm.mongodb.net/my-bank-api?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  ),
    console.log('Conectado')
})()

const app = express()

app.use(express.json())
app.use(bankRoutes)
app.set("port", PORT)

app.listen( process.env.PORT || 3001, () => console.log('API INICIADA'))