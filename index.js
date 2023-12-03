const express = require('express')
const app = express()
const authRouter = require('./routes/auth')
const fileManagerRouter = require('./routes/fileManager')
const { multerInstance } = require('./middlewares/multer')
app.use(express.json())
app.use( express.static('public'))
app.use(require('cors')())
app.use(require('morgan')('combined'))
app.get('/test', (req, res)=>{
    res.status(200).json({message : 'hare krishna'})
})

app.use("/api/auth", authRouter)

app.use('/api/fileManager',fileManagerRouter)



module.exports = app