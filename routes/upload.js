var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

//default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id',(req,res) =>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de coleccion
    var tiposValidos = ['hospitales','medicos','usuarios'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok:false,
            mensaje: 'Tipo de colección no es valida',
            errors: {message:'Tipo de colección no es valida'}
        });
    }

    if(!req.files){
        return res.status(400).json({
            ok:false,
            mensaje: 'No selecciono nada',
            errors: {message:'Debe seleccionar una imagen'}
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Sólo estas extenciones son permitidas
    var extencionesValidas = ['png','jpg','gif','jpeg'];

    if(extencionesValidas.indexOf(extensionArchivo) < 0){
        return res.status(400).json({
            ok:false,
            mensaje: 'Extensión no valida',
            errors: {message:'Las extenciones validas son ' + extencionesValidas.join(', ')}
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archivo del temporal
    var path = `./upload/${tipo}/${nombreArchivo}`;

    archivo.mv(path,err=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }
        subirPorTipo(tipo,id,nombreArchivo,res);
        /* res.status(200).json({
            ok: true,
            mensaje:'Archivo cargado',
            extension: extensionArchivo
        }); */
    })


    
});


function subirPorTipo(tipo,id,nombreArchivo,res){
    if(tipo === 'usuarios'){
        Usuario.findById(id,(err,usuario)=>{
            var pathViejo = './upload/usuarios/'+usuario.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                    console.log(pathViejo + ' was deleted');
                  });
            }

            usuario.img = nombreArchivo;
            usuario.save((err,usuarioActualizado) =>{
                return res.status(200).json({
                    ok: true,
                    mensaje:'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if(tipo === 'medicos'){
        Medico.findById(id,(err,medico)=>{
            var pathViejo = './upload/medicos/'+medico.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                    console.log(pathViejo + ' was deleted');
                  });
            }

            medico.img = nombreArchivo;
            medico.save((err,medicoActualizado) =>{
                if(err){
                    return res.status(500).json({
                        ok:false,
                        mensaje: 'Error al actulizar la imagen'
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje:'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });
    }

    if(tipo === 'hospitales'){
        Hospital.findById(id,(err,hospital)=>{
            var pathViejo = './upload/hospitales/'+hospital.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo, (err) => {
                    if (err) throw err;
                    console.log(pathViejo + ' was deleted');
                  });
            }

            hospital.img = nombreArchivo;
            hospital.save((err,hospitalActualizado) =>{
                if(err){
                    return res.status(500).json({
                        ok:false,
                        mensaje: 'Error al actulizar la imagen del hospital'
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje:'Imagen del hospital actualizada',
                    hospital: hospitalActualizado
                });
            });

        });
    }
}

module.exports = app;