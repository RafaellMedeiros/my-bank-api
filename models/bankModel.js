import mongoose from 'mongoose'

const dataSchema = mongoose.Schema({
  agencia: {
    type: Number,
    require: true
  },
  conta: {
    type: Number,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  balance: {
    type: Number,
    require: true,
    min: 0
  }
})

const dataModel = mongoose.model('accounts', dataSchema)

export { dataModel }