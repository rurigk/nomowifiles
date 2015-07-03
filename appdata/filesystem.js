var fs = require('fs');
module.exports = {
	ls:function(dir,mode){
		mode = (typeof mode != 'undefined')? mode:'';
		switch(mode){
			case 'd':
				filesd=[];
				files = fs.readdirSync(dir);
				for (var i = 0; i < files.length; i++) {
					try{
						stats=fs.lstatSync(dir+files[i]);
						sumtype="";
						if(stats.isFile()){
							sumtype="file";
						}else if(stats.isDirectory()){
							sumtype="directory";
						}else if(stats.isSymbolicLink()){
							sumtype="symboliclink";
						}else if(stats.isBlockDevice()){
							sumtype="blockdevice";
						}else if(stats.isCharacterDevice()){
							sumtype="characterdevice";
						}
						filesd.push({file:files[i],type:sumtype});
					}catch(e){
						//e.preventDefault();
						//console.log('Error de acceso: '+dir+files[i])
						if(e.code=='EACCES'){
							console.log('Error de acceso: '+dir+files[i])
						}
					}
				};
				return filesd;
			break;
			default:
				return fs.readdirSync(dir);
			break;
		}
	},
	mkdir:function(dir,flags,callback){},
	mkdirSync:function(dir,flags){}
}