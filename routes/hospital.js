var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();


var Hospital = require('../models/hospital');

//Obtener todos los hospitales
app.get('/',(req,res,next) =>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario','nombre email')
        .skip(desde)
        .limit(5)
        .exec((err,hospitales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error cargando los hospitales',
                errors: err
            });
        }

        Hospital.count({},(err,conteo)=>{
            res.status(200).json({
                ok: true,
                hospitales,
                total: conteo
            });
        });
        
    });
});


//Actualizar hospital por id
app.put('/:id',mdAutenticacion.verificaToken,(req,res) =>{
    var body= req.body;
    var id  = req.params.id;

    Hospital.findById(id,(err,hospital)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error al buscar hospital',
                errors: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje:'El hospital no existe',
                errors: {message:'No existe un hospital con ese id'}
            });
        }

        hospital.nombre  = body.nombre;
        hospital.img  = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err,hospitalGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje:'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                metodo: 'PUT',
                hospital: hospitalGuardado
            });
        });
    });
});


//Crear nuevo hospital
app.post('/',mdAutenticacion.verificaToken,(req,res) =>{

    var body = req.body;

    var hospital = new Hospital({
        nombre  : body.nombre,
        img     : body.img,
        usuario : req.usuario._id
    });

    hospital.save((err,hospitalGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje:'Error al crear el hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

//Eliminar un hospital por id
app.delete('/:id',mdAutenticacion.verificaToken,(req,res) =>{
    var id = req.params.id;
    Hospital.findByIdAndRemove(id,(err,hospitalBorrado)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error al borrar el hospital',
                errors: err
            });
        }
        if(!hospitalBorrado){
            return res.status(400).json({
                ok: false,
                mensaje:'No existe un hospital con ese id',
                error: {message:'No existe hospital con el id'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});

module.exports = app;