var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();


var Medico = require('../models/medico');

//Obtener todos los medicos
app.get('/',(req,res,next) =>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario','nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err,medicos)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error cargando los medicos',
                errors: err
            });
        }

        Medico.count({},(err,conteo)=>{
            res.status(200).json({
                ok: true,
                medicos,
                total: conteo
            });
        });
        
    });
});


//Actualizar medico por id
app.put('/:id',mdAutenticacion.verificaToken,(req,res) =>{
    var body= req.body;
    var id  = req.params.id;

    Medico.findById(id,(err,medico)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error al buscar el medico',
                errors: err
            });
        }

        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje:'El medico no existe',
                errors: {message:'No existe un medico con ese id'}
            });
        }

        medico.nombre   = body.nombre;
        medico.img      = body.img;
        medico.usuario  = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err,medicoGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje:'Error al actualizar el medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                metodo: 'PUT',
                medico: medicoGuardado
            });
        });
    });
});


//Crear nuevo medico
app.post('/',mdAutenticacion.verificaToken,(req,res) =>{

    var body = req.body;

    var medico = new Medico({
        nombre  : body.nombre,
        img     : body.img,
        usuario : req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err,medicoGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje:'Error al crear el medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

//Eliminar un medico por id
app.delete('/:id',mdAutenticacion.verificaToken,(req,res) =>{
    var id = req.params.id;
    Medico.findByIdAndRemove(id,(err,medicoBorrado)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:'Error al borrar el medico',
                errors: err
            });
        }
        if(!medicoBorrado){
            return res.status(400).json({
                ok: false,
                metodo : 'Delete',
                mensaje:'No existe un medico con ese id',
                error: {message:'No existe medico con el id'}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    })
});

module.exports = app;