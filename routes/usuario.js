var express = require('express');
var bcrypt = require('bcryptjs');


var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();



var Usuario = require('../models/usuario');

//Obtener todos los usuarios
app.get('/',(req,res) =>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({},'nombre email image rol')
        .skip(desde)
        .limit(5)
        .exec(
        (err,usuarios)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error cargando usuarios',
                errors: err
            });
        }

        Usuario.count({},(err,conteo)=>{
            res.status(200).json({
                ok: true,
                usuarios,
                total: conteo
            });
        });

    });
});



//Actualizar usuario
app.put('/:id',mdAutenticacion.verificaToken,(req,res) =>{
    var body = req.body;
    var id = req.params.id;

    Usuario.findById(id,(err,usuario)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error al buscar usuario',
                errors: err
            });
        }

        if(!usuario){
            return res.status(400).json({
                ok: false,
                mensaje:'El usuario no existe',
                errors: {message:'No existe un usuario con ese id'}
            });
        }

        usuario.nombre  = body.nombre;
        usuario.email   = body.email;
        usuario.rol     = body.rol;

        usuario.save((err,usuarioGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje:'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });

});


//Crear nuevo usuario
app.post('/',mdAutenticacion.verificaToken,(req,res) =>{

    var body = req.body;

    var usuario = new Usuario({
        nombre  : body.nombre,
        email   : body.email,
        password: bcrypt.hashSync(body.password,10),
        img     : body.img,
        rol     : body.rol
    });

    usuario.save((err,usuarioGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje:'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken : req.usuario
        });
    });
});

//Eliminar un usuario por id
app.delete('/:id',mdAutenticacion.verificaToken,(req,res) =>{
    var id = req.params.id;
    Usuario.findByIdAndRemove(id,(err,usuarioBorrado)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error al borrar usuario',
                errors: err
            });
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                mensaje:'No existe un usuario con ese id',
                error: {message:'No existe usuario con el id'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;