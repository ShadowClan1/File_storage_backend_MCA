require('dotenv').config()
module.exports = {
PORT :  process.env.PORT || 5000,
STATUS_CODES : {
    GOOD : 200,
    UNAUTH : 401,
    NOTFOUND : 404,
    SEVERERR : 500
}


}