var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

let rolesValidos = {
    values:['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
    nombre  :{type:String, required:[true,'El nombre es necesario']},
    email   : {type:String, required:[true,'El correo es necesario'], unique:true},
    password:{type:String, required:[true,'La contraseña es necesaria']},
    img     :{type:String, required:false},
    rol     :{type:String, required:true, default:'USER_ROLE',enum:rolesValidos},
    googel  : {type: Boolean, default: false}
});

usuarioSchema.plugin(uniqueValidator, {message:'{PATH} debe de ser único'});

module.exports = mongoose.model('Usuario',usuarioSchema,'usuarios');