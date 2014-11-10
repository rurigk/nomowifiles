//Funciones nativas e implementadas de manejo de archivos
var fs=require('fs-extra');
var fsnat=require('fs');

var deleteFolderRecursive = function(path,folder) {
	if( fs.existsSync(path) ) {
		fs.readdirSync(path).forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath,true);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		if(typeof folder != "undefined" && folder){fs.rmdirSync(path);}
	}
};

module.exports = {
	mkdir: function (ruta) {//crear un directorio
		// whatever
	},
	mv: function (origen,destino,callback) {//Mover un archivo
		fs.move(origen, destino, callback);
	},
	cp: function (origen,destino) {//Copiar un archivo
		// whatever
	},
	ln: function (origen,destino) {//Crear un enlace simbolico
		// whatever
	},
	rm: function (ruta) {//Remover un archivo
		// whatever
	},
	chmod: function (ruta,permisos) {//Cambiar permisos
		// whatever
	},
	touch: function (ruta) {//Crea un archivo vacio
		// whatever
	},
	rmdir: function (ruta,recursivo) {//Remover un directorio
		// whatever
	},
	trash:function(files,callback){//Mover archivos a la papelera (files => array)
		userdir=(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE)+"/";
		for (var i = 0; i < files.length; i++) {
			filename=files[i].split("/");
			if(filename[filename.length-1] == ""){
				filenamex=filename[filename.length-2]
			}else{
				filenamex=filename[filename.length-1]
			}
			if(fsnat.existsSync(userdir+".local/share/Trash/info/"+filenamex+".trashinfo")){
				filenamexu="";
				for (var ix = 2; ix > 0; ix++) {
					filenamexu=filenamex+"."+ix;
					if(!fs.existsSync(userdir+".local/share/Trash/info/"+filenamexu+".trashinfo")){
						break;
					}
				};
				filenamex=filenamexu;
			}
			filenameu=files[i].replace(/\s/g, '%20');
			filenameu=filenameu.substr(0,filenameu.length-1)
			var msg = ['[Trash Info]','Path=' + filenameu,'DeletionDate=' + new Date().toISOString()].join('\n');
			fs.outputFileSync(userdir+".local/share/Trash/info/"+filenamex+".trashinfo",msg);
			console.log("index:"+i+" total:"+files.length);
			if(i < files.length-1){
				fs.move(files[i], userdir+".local/share/Trash/files/"+filenamex, function(){});
			}else{
				fs.move(files[i], userdir+".local/share/Trash/files/"+filenamex, callback);
			}
		};
	},
	trashclear:function(){//Vaciamos la papelera
		userdir=(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE)+"/";
		deleteFolderRecursive(userdir+".local/share/Trash/files/");
		deleteFolderRecursive(userdir+".local/share/Trash/info/");
	}
};