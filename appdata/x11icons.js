var fs = require('fs');
var exec = require('child_process').exec;
var Ini = require('ini-parser');
var themename="";
var oldthemename="";
updateThemeName();
module.exports = {
	get:function(n,s,c,callback){
		exec("gsettings get org.gnome.desktop.interface icon-theme",function(error, stdout, stderr){
			if(stdout != ""){
				theme_name=decodeURIComponent(stdout.replace(/["']/g, ""));
				themename=theme_name;
				_IconFinder(theme_name,n,s,c,callback,true);
			}else{
				exec("grep '^gtk-icon-theme-name' $HOME/.gtkrc-2.0 | awk -F'=' '{print $2}'",function(error, stdout, stderr){
					if(stdout != ""){
						theme_name=decodeURIComponent(stdout.replace(/["']/g, ""));
						themename=theme_name;
						_IconFinder(theme_name,n,s,c,callback,true);
					}
				});
			}
		})
	},
	themechanged:function(){
		if(themename != oldthemename){
			oldthemename=themename;
			return true;
		}else{
			return false;
		}
	}
};

function _IconFinder(themename,n,s,c,callback){
	//Obtenemos el directorio del tema
	themename=themename.replace(/[\n]/g, "")
	pathfind="/usr/share/icons/";
	exist=fs.existsSync(pathfind+themename+"/index.theme");
	if(!exist){
		pathfind=app.userdir+"/.icons/";
		exist=fs.existsSync(pathfind+themename+"/index.theme");
	}
	if(exist){
		//Pareseamos el archivo del tema
		theme=Ini.parse(fs.readFileSync(pathfind+themename+"/index.theme",{encoding:"utf8"}))
		Inherits=[];
		//Obtenemos los temas heredados
		if(typeof theme["Icon Theme"].Inherits != "undefined"){
			Inherits=theme["Icon Theme"].Inherits.split(",");
		}
		fixed=[];
		scalables=[];
		//Recorremos las llaves
		for(key in theme){
			//Revisamos si tiene Size definido si no lo tiene no nos es util
			if(typeof theme[key].Size != "undefined"){
				//Revisamos que el contexto sea igual que el que necesitamos
				if(theme[key].Context == c){
					//Añadimos las posibles coincidencias
					theme[key].key=key;
					pathtoicon=pathfind+themename+"/"+key+"/"+n+".png";
					iconexistpng=fs.existsSync(pathtoicon);
					pathtoicon=pathfind+themename+"/"+key+"/"+n+".svg";
					iconexistsvg=fs.existsSync(pathtoicon);
					if(theme[key].Type == "Fixed"){
						if(iconexistpng || iconexistsvg){
							fixed.push(theme[key]);
						}
					}else if(theme[key].Type == "Scalable"){
						if(iconexistsvg || iconexistpng){
							scalables.push(theme[key]);
						}
					}
				}
			}
		}
		//Recorremos las posibles coinsidensias escalables
		scalablePref=null;
		fixedPref=null;
		for (var i = 0; i < scalables.length; i++) {
			size=scalables[i].Size;
			minsize=(typeof scalables[i].MinSize != 'undefined')? scalables[i].MinSize:null;
			maxsize=(typeof scalables[i].MaxSize != 'undefined')? scalables[i].MaxSize:null;
			if(minsize != null && maxsize != null){
				if(s >= minsize && s <= maxsize){
					scalablePref=scalables[i];
					break;
				}/*else{
					if(scalables.length == 1){
						scalablePref=scalables[i];
					}
				}*/
			}else{
				if(scalablePref==null){
					scalablePref=scalables[i];
				}else{
					mediasize=(size > parseInt(scalablePref.Size))? (size-parseInt(scalablePref.Size))/2:(parseInt(scalablePref.Size)-size)/2;
					mediasize=Math.floor(mediasize);
					if(size < parseInt(scalablePref.Size)){
						if(s <= size+mediasize && s>=size){
							scalablePref=scalables[i];
							break;
						}
					}else{
						if(s != size){
							if(s > size-mediasize){
								scalablePref=scalables[i];
							}
						}else{
							scalablePref=scalables[i];
							break;
						}
					}
				}
			}
		};
		if(scalablePref != null){
			pathtoicon=pathfind+themename+"/"+scalablePref.key+"/"+n+".svg";
			iconexistsvg=fs.existsSync(pathtoicon);
			if(iconexistsvg){
				callback(pathtoicon);
				return true;
			}
			pathtoicon=pathfind+themename+"/"+scalablePref.key+"/"+n+".png";
			iconexistpng=fs.existsSync(pathtoicon);
			if(iconexistpng){
				callback(pathtoicon);
				return true;
			}
		}
		//Recorremos las posibles coinsidensias no escalables
		for (var i = 0; i < fixed.length; i++) {
			size=fixed[i].Size;
			minsize=(typeof fixed[i].MinSize != 'undefined')? fixed[i].MinSize:null;
			maxsize=(typeof fixed[i].MaxSize != 'undefined')? fixed[i].MaxSize:null;
			if(minsize != null && maxsize != null){
				if(s >= minsize && s <= maxsize){
					fixedPref=fixed[i];
					break;
				}else{
					if(fixed.length == 1){
						fixedPref=fixed[i];
					}
				}
			}else{
				if(fixedPref==null){
					fixedPref=fixed[i];
				}else{
					mediasize=(size > parseInt(fixedPref.Size))? (size-parseInt(fixedPref.Size))/2:(parseInt(fixedPref.Size)-size)/2;
					mediasize=Math.floor(mediasize);
					//console.log(size+"<"+parseInt(fixedPref.Size))
					if(size < parseInt(fixedPref.Size)){
						if(s <= size+mediasize && s>=size){
							fixedPref=fixed[i];
							break;
						}
					}else{
						if(s != size){
							if(s > size-mediasize){
								fixedPref=fixed[i];
							}
						}else{
							fixedPref=fixed[i];
							break;
						}
					}
				}
			}
		};
		if(fixedPref != null){
			pathtoicon=pathfind+themename+"/"+fixedPref.key+"/"+n+".png";
			iconexistpng=fs.existsSync(pathtoicon);
			if(iconexistpng){
				callback(pathtoicon);
				return true;
			}
			pathtoicon=pathfind+themename+"/"+fixedPref.key+"/"+n+".svg";
			iconexistsvg=fs.existsSync(pathtoicon);
			if(iconexistsvg){
				callback(pathtoicon);
				return true;
			}

		}
		for (var i = 0; i < Inherits.length; i++) {
			if(_IconFinder(Inherits[i],n,s,c,callback)){
				return true;
			}
		};
		return false;
	}
}

setInterval(function(){
	updateThemeName();
},2000);

function updateThemeName(){
	exec("gsettings get org.gnome.desktop.interface icon-theme",function(error, stdout, stderr){
		if(stdout != ""){
			theme_name=decodeURIComponent(stdout.replace(/["']/g, ""));
			themename=theme_name;
		}else{
			exec("grep '^gtk-icon-theme-name' $HOME/.gtkrc-2.0 | awk -F'=' '{print $2}'",function(error, stdout, stderr){
				if(stdout != ""){
					theme_name=decodeURIComponent(stdout.replace(/["']/g, ""));
					themename=theme_name;
				}
			});
		}
	})
}

