import express from 'express'
import { dataModel } from '../models/bankModel.js'

const app = express()

//Mostrar todos os Clientes
app.get('/bank-accounts', async (_, res) => {
  try {
    const account = await dataModel.find({}, { _id: 0, })
    res.send(account)
  } catch (error) {
    res.status(500).send(error)
  }
})
//Consulta o Saldo
app.get('/bank-accounts/query', async (req, res) => {
  try {
    const { agencia } = req.query
    const { conta } = req.query
    const currentData = await dataModel.findOne({ agencia, conta })
    res.send({ name: currentData.name, balance: currentData.balance })
  } catch (error) {
    res.status(404).send(error)
  }
})
//Excluir Contas e Mostrar Numero de contas Ativas para essa Agencia
app.delete('/bank-accounts', async (req, res) => {
  try {
    const data = req.query
    const currentData = await dataModel.deleteOne({ agencia: data.agencia, conta: data.conta })
    const numberAgencia = await dataModel.find({ agencia: data.agencia })
    console.log(numberAgencia)

    res.send(`Numero de Contas Ativas na Agencia  ${numberAgencia.length}`)

  } catch (error) {
    res.status(500).send(error)
  }
})
//Faz um Deposito
app.patch('/bank-accounts/deposit', async (req, res) => {
  try {
    const data = req.body

    const currentData = await dataModel.findOne({ agencia: data.agencia, conta: data.conta })
    const newTotal = deposit(data.deposit, currentData.balance)
    const chanceBalance = await dataModel.updateOne({ agencia: data.agencia, conta: data.conta }, { $set: { balance: newTotal } })
    res.send(`Seu Novo Saldo É de ${newTotal}`)
  } catch (error) {
    res.status(404).send("Conta Não Encontrada")
  }
})
//Faz uma Retirada
app.patch('/bank-accounts/take', async (req, res) => {
  try {
    const data = req.body

    const currentData = await dataModel.findOne({ agencia: data.agencia, conta: data.conta })
    const newTotal = take(data.take, currentData.balance)
    if (newTotal >= 0) {
      const chanceBalance = await dataModel.updateOne({ agencia: data.agencia, conta: data.conta }, { $set: { balance: newTotal } })
      res.send(`Seu Novo Saldo É de ${newTotal}`)
    }
    else {
      res.send('Saldo Insuficiente')
    }
  } catch (error) {
    res.status(404).send("Conta Não Encontrada")
  }
})
//Transferencias
app.patch('/bank-accounts/transfer', async (req, res) => {
  try {
    const data = req.body
    const dataOrigin = await dataModel.findOne({ conta: data.contaOrigin })
    const dataRecipient = await dataModel.findOne({ conta: data.contaRecipient })
    const infoTransferOrigin = transferOrigin(dataOrigin, dataRecipient, data)
    const infoTransferRecipient = transferRecipient(dataRecipient, data)

    if (infoTransferOrigin >= 0) {
      const chanceBalanceOrigin = await dataModel.updateOne({ conta: data.contaOrigin }, { $set: { balance: infoTransferOrigin } })
      const chanceBalanceRecipient = await dataModel.updateOne({ conta: data.contaRecipient }, { $set: { balance: infoTransferRecipient } })
      res.send(`Saldo Atual  R$${infoTransferOrigin}`)
    }
    else {
      res.send('Saldo Insuficiente')
    }
  } catch (error) {
    res.status(404).send("Conta Não Encontrada")
  }
})
//Media do saldo de uma agencia
app.get('/bank-accounts/averageAgencia', async (req, res) => {
  const balances = []
  let count = 0
  const data = req.body
  const accounts = await dataModel.find({ agencia: data.agencia }, { _id: 0, agencia: 0, name: 0, conta: 0 })
  accounts.map(account => { count = balances.push(account.balance) })
  const sum = balances.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  const median = sum / count

  res.send(`Media da Agencia(${data.agencia}) ------- ${median}`)
})
//Filtrar os menos valores
app.get('/bank-accounts/minFilter', async (req, res) => {
  const data = req.body
  const filterBalance = await dataModel.find({}, { _id: 0, name: 0 }).sort({ balance: 1 }).limit(data.count)
  res.send(filterBalance)
})
//Filtrar os maiores valores
app.get('/bank-accounts/maxFilter', async (req, res) => {
  const data = req.body
  const accountsBalance = await dataModel.find({}, { _id: 0 }).sort({ name: 1, balance: -1 }).limit(data.count)

  res.send(accountsBalance)
})
//Criar uma Agencia Privada
app.get('/bank-account/privati', async (_, res) => {
  let agencias = []
  const allAgencias = await dataModel.find({}, { _id: 0, conta: 0, name: 0, balance: 0 })
  allAgencias.map(agencia => { agencias.push(agencia.agencia) })
  const filterAgencias = agencias.filter((este, i) => agencias.indexOf(este) === i)
  const privati = maxAccounts(filterAgencias)

  res.send(privati)
})


//Funções para Auxiliar 
function deposit(add, current) {
  return add + current
}

function take(withdrawal, current) {
  return current - withdrawal - 1
}
function transferOrigin(origin, recipient, data) {
  if (origin.agencia === recipient.agencia) {
    return origin.balance - data.transfer
  }
  else {
    return origin.balance - data.transfer - 8
  }
}
function transferRecipient(recipient, data) {
  return recipient.balance + data.transfer
}
async function maxAccounts(filterAgencias) {
  const privati = []

  await filterAgencias.forEach(async (agencia) => {
    const accountsPrivati = await dataModel.findOne({ agencia: agencia }, {}).sort({ balance: -1 })
    privati.push(accountsPrivati)
    console.log(privati)
  })

  return privati
}


export { app as bankRoutes }