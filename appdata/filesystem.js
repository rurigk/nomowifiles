var fs = require('fs');
module.exports = {
	ls:function(dir,mode){
		mode = (typeof mode != 'undefined')? mode:'';
		switch(mode){
			case 'd':
				filesd=[];
				files = fs.readdirSync(dir);
				for (var i = 0; i < files.length; i++) {
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
				};
				return filesd;
			break;
			default:
				return fs.readdirSync(dir);
			break;
		}
	}
}