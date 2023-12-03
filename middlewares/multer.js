const multer = require('multer')
const {S3} = require('aws-sdk')
const multerS3 = require('multer-s3')


const s3 = new S3({
    credentials : {
        accessKeyId : 'AKIA27EJ5WER65PMHVVG',
        secretAccessKey : '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'
    },
    region : 'ap-south-1'
})

const storageS3 = multerS3({
    s3, bucket : 'file-manager', acl :'public-read', contentType :multerS3.AUTO_CONTENT_TYPE ,
    key :(req, file, cb) => {
        cb(null, Date.now().toString() + '-' + file.originalname)
    }
})

const storage = multer.diskStorage({
    destination : (req, file, cb)=>{
        cb(null, 'public')
    },
    filename :(req, file, cb) =>{
        console.log(file, "here we have file")
        cb(null, Date.now() + '-' + file.originalname)
    }
})


const multerInstance = multer({
    storage :storage,
    fileFilter : (req, file, cb) => {
        console.log(file, 'we have here')
        cb(null , true)
    }
    
})


module.exports ={multerInstance}