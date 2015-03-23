function is(w,m){if(m.substr(0,1) == "#"){if(m.substr(1,m.length-1) == w.target.id){return true;}else{return false;}}else if(m.substr(0,1) == "."){fl=w.target.classList.length;for (var i = 0; i < fl; i++){if(w.target.classList[i] == m.substr(1,m.length-1)){return true;break;}else if(i==w.target.classList.length){return false;}};}}
function closest(w,m) {tar=w.target;while (tar.tagName != "HTML") {if(m.substr(0,1) == "#"){if(m.substr(1,m.length-1) == tar.id){return tar;}}else if(m.substr(0,1) == "."){fl=tar.classList.length;for (var i = 0; i < fl; i++){if(tar.classList[i] == m.substr(1,m.length-1)){return tar;break;}};}tar = tar.parentNode;}return null;}
function isclosest(w,m) {tar=w.target;while (tar.tagName != "HTML") {if(m.substr(0,1) == "#"){if(m.substr(1,m.length-1) == tar.id){return true;}}else if(m.substr(0,1) == "."){fl=tar.classList.length;for (var i = 0; i < fl; i++){if(tar.classList[i] == m.substr(1,m.length-1)){return true;break;}};}tar = tar.parentNode;if(tar == null){return false;}}return false;}
function booltoint(w){if(w){return 1;}else{return 0;}}
function getID(w){return document.getElementById(w);}
function getClass(w){return document.getElementsByClassName(w);}
function show(e){e.style.display='block'};function hide(e){e.style.display='none'};ajax=[];

var fs=require('fs');
var path = require('path');
path.split=function(w){
	w=w.split('/');
	w[0]='/';
	if(w[w.length-1] == ""){w.splice(w.length-1,1);}
	return w;
};
var gui = require('nw.gui');
var exec = require('child_process').exec;
var fsw = require('./filesystem.js');

var app={};
app.bookmarks=[];
app.lbookmarks="";
var ui={
	currenttab:1
};
var tabs={
	tabcid:0,
	tabnumb:0,
	history:{}
};

/*History struct
1:{
	index:0,
	history:[]
}
*/

//Obtenemos el directorio del ususario
app.userdir=(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE)+"/";

/*--Configuraciones de la vista--*/
app.showhidden=false;//Mostrar archivos ocultos
app.view=(typeof localStorage["view"] == "undefined") ? "list":localStorage["view"]; //Obtenemos la configuracion de la vista

/*--Ventana--*/
app.main_w=gui.Window.get(0);
app.maximized=false;

app.main_w.on('maximize',function(){
	app.maximized=true;
})
app.main_w.on('unmaximize',function(){
	app.maximized=false;
})

window.addEventListener('load',function(){
	ui.loadElements();
	addTab(app.userdir);
	setInterval(function(){
		loadBookmarks();
	},2000);
	setInterval(function(){
		showBookmarks();
	},200);
	loadBookmarks();
	showBookmarks();
	setView(app.view);
	window.addEventListener('contextmenu', function(e) {
		return false;
	});
	window.addEventListener("click",function(e){
		/*--Controles de la ventana--*/
		if(is(e,'.closewindow')){window.close();}
		if(is(e,'.maxwindow')){if(!app.maximized){app.main_w.maximize();}else{app.maximized=false;app.main_w.unmaximize();}}
		if(is(e,'.minwindow')){app.main_w.minimize();}
		//Click en la barra de direccion
		if(is(e,'.navinput-c') || is(e,'#navinput')){
			ui.navinput_c.setAttribute('editmode','1');
			ui.navinput.focus();
		}else{
			ui.navinput_c.setAttribute('editmode','0');
		}
		if(is(e,'.nav-dir')){
			ev_path=e.target.getAttribute('path');
			goToDir(ui.currenttab,ev_path);
			tabHistoryPush(ui.currenttab,ev_path);
		}
		//Añadir pestaña
		if(is(e,'.addtab')){
			addTab(app.userdir);
		}
		//Cambiar de pestaña
		if(isclosest(e,'.tab')){
			tabid=closest(e,'.tab').getAttribute('tabid');
			showTab(tabid);
		}
		//Cerrar de pestaña
		if(is(e,'.closetab')){
			tabid=closest(e,'.tab').getAttribute('tabid');
			removeTab(tabid);
		}
		//Seleccionar archivo
		if(isclosest(e,'.file-e')){
			if(true){
				tabcont=ui.files.querySelector('[tabid="'+ui.currenttab+'"]');
				files=tabcont.querySelectorAll('.file-e');
				for (var i = 0; i < files.length; i++) {
					files[i].setAttribute('sel','0');
				};
			}
			target=closest(e,'.file-e');
			if(e.detail==2){
				if(target.getAttribute('xtype') == "dir"){
					tab=ui.tabs.querySelector('[tabid="'+ui.currenttab+'"]');
					dir=tab.getAttribute('dir')+target.getAttribute('file')+"/";
					goToDir(ui.currenttab,dir);
					tabHistoryPush(ui.currenttab,dir);
				}else if(target.getAttribute('xtype') == "file"){
					tab=ui.tabs.querySelector('[tabid="'+ui.currenttab+'"]');
					dir=tab.getAttribute('dir')+target.getAttribute('file');
					exec("xdg-open '"+dir+"'")
				}
			}
			target.setAttribute('sel','1');
		}
		//Cambiar la vista
		if(is(e,'.view-btn')){
			view=e.target.getAttribute('view');
			setView(view);
		}
		/*--Bookmarks--*/
		//Ir al bookmark
		if(isclosest(e,'.gk-dropdown-item')){
			tdir=closest(e,'.gk-dropdown-item').getAttribute('tdir');
			goToDir(ui.currenttab,tdir);
			tabHistoryPush(ui.currenttab,tdir);
		}
		if(is(e,".gk-dropdown")){
			sixl=!Boolean(parseInt(e.target.getAttribute("opened")));
			e.target.setAttribute("opened",booltoint(sixl))
			e.target.nextElementSibling.setAttribute("opened",booltoint(sixl))
		}
		/*--Navegacion--*/
		if(is(e,'#nextdir')){
			tabHistoryNext(ui.currenttab);
		};
		if(is(e,'#prevdir')){
			tabHistoryPrev(ui.currenttab);
		};
	});
	window.addEventListener('keydown', function(e){
		if(e.keyIdentifier === 'F5'){window.location.reload();}
		if(e.keyCode == 13){
			if(e.srcElement.id == "navinput"){
				val=e.srcElement.value;
				val=(val.substr(val.length-1,1) != "/") ? val+"/":val;
				if(ui.tabs.childElementCount > 0){
					goToDir(ui.currenttab,path.normalize(val));
				}else{
					addTab(path.normalize(val));
					goToDir(ui.currenttab,path.normalize(val));
				}
				ui.navinput_c.setAttribute('editmode','0');
				tabHistoryPush(ui.currenttab,val);
			}
		}
	});
});

/*--UI namespace--*/
ui.loadElements=function(){
	ui.navinput=getID('navinput');
	ui.navinput_b=getID('navinput-b');
	ui.navinput_c=getID('navinput-c');
	ui.tabs=getID('tabs');
	ui.files=getID('files');
	ui.prevdir=getID('prevdir');
	ui.nextdir=getID('nextdir');
}

//Cambia la direccion en la barra de direccion
ui.setPath=function(path_n){
	ui.navinput.value=path_n;
	ui.navinput_b.innerHTML="";
	path_s=path.split(path_n);
	if(path_n == ""){ui.navinput_b.innerHTML="";}else{
		for (var i = 0; i < path_s.length; i++) {
			ui.navinput_b.innerHTML+="<div class='nav-dir l bz' path='"+arr2strN(path_s,i+1)+"'>"+path_s[i]+"</div>";
		};
	}
	if(path_n != "/"){
		nametab=path.basename(path_n);
	}else{
		nametab="Sistema de archivos";
	}
	ui.tabs.querySelector('[tabid="'+ui.currenttab+'"]').querySelector('.tabtext').innerHTML=nametab;
}
function goToDir(tabid,dir){
	ui.setPath(dir);
	if(fs.existsSync(dir)){
		tab=ui.tabs.querySelector('[tabid="'+tabid+'"]');
		tab.setAttribute('dir',dir);
		showFilesInView(tabid,fsort(fsw.ls(dir,'d'),{showhidden:app.showhidden}));
	}
}

function showFilesInView(tabid,files){
	//tabtar.innerHTML+="<div class='file-e nosel' xtype='dir'><div class='f-icon'></div><div class='f-name'>"+ohfolders[i][0]+"</div></div>";
	tabcont=ui.files.querySelector('[tabid="'+tabid+'"]');
	tabcont.innerHTML="";
	for(folder in files.directory){
		tabcont.innerHTML+="<div class='file-e nosel' xtype='dir' sel='0' file='"+files.directory[folder].file+"'><div class='f-icon'>d</div><div class='f-name'>"+files.directory[folder].file+"</div></div>";
	}
	for(file in files.files){
		tabcont.innerHTML+="<div class='file-e nosel' xtype='file' ext='"+path.extname(files.files[file].file)+"' file='"+files.files[file].file+"'><div class='f-icon'>f</div><div class='f-name'>"+files.files[file].file+"</div></div>";
	}
	autoHeight(tabcont);
}

//
function fsort(fi,o){
	o=(typeof o != 'undefined')? o:{};
	o.showhidden=(typeof o.showhidden != 'undefined')? o.showhidden:false;
	folders=[];
	files=[];
	//Separamos los archivos y los directorios
	for (var i = 0; i < fi.length; i++) {
		if(fi[i].file.substr(0,1) == '.'){
			if(o.showhidden){
				if(fi[i].type == 'directory'){
					folders.push(fi[i]);
				}else{
					files.push(fi[i]);
				}
			}
		}else{
			if(fi[i].type == 'directory'){
				folders.push(fi[i]);
			}else{
				files.push(fi[i]);
			}
		}
	};
	return {directory:folders,files:files};
}


//Obtiene x cantidad de elementos de un array y los pasa a string
function arr2strN(arr,n){
	str="";
	for (var i = 0; i < ((n <= arr.length)? n:arr.length); i++) {
		str+=arr[i]+"/";
	};
	return path.normalize(str);
}

/*--Tab manager--*/
function tabHistoryCreate(tabid,dir){
	tabs.history[tabid]={};
	tabs.history[tabid].history=[];
	tabs.history[tabid].history.push(dir);
	tabs.history[tabid].index=0;
	tabHistoryUpdt(tabid);
}
function tabHistoryRemove(tabid){
	delete tabs.history[tabid];
}
function tabHistoryNext(tabid){
	index=tabs.history[tabid].index;
	length=tabs.history[tabid].history.length;
	if(index < length-1){
		tabs.history[tabid].index+=1;
		index+=1;
		goToDir(tabid,tabs.history[tabid].history[index]);
	}
	tabHistoryUpdt(tabid);
};
function tabHistoryPrev(tabid){
	index=tabs.history[tabid].index;
	length=tabs.history[tabid].history.length;
	if(index > 0){
		tabs.history[tabid].index-=1;
		index-=1;
		goToDir(tabid,tabs.history[tabid].history[index]);
	}
	tabHistoryUpdt(tabid);
};
function tabHistoryPush(tabid,dir){
	index=tabs.history[tabid].index;
	length=tabs.history[tabid].history.length;
	tabs.history[tabid].history.splice(index+1,((length-1)-index));
	tabs.history[tabid].history.push(dir);
	tabs.history[tabid].index=tabs.history[tabid].history.length-1;
	tabHistoryUpdt(tabid)
};
function tabHistoryUpdt(tabid){
	if(tabid > 0){
		index=tabs.history[tabid].index;
		length=tabs.history[tabid].history.length;
		if(length > 1){
			if(index > 0){
				ui.prevdir.setAttribute('unabled','0');
			}else{
				ui.prevdir.setAttribute('unabled','1');
			}
			if(index < length-1){
				ui.nextdir.setAttribute('unabled','0');
			}else{
				ui.nextdir.setAttribute('unabled','1');
			}
		}else{
			ui.prevdir.setAttribute('unabled','1');
			ui.nextdir.setAttribute('unabled','1');
		}
	}else{
		ui.prevdir.setAttribute('unabled','1');
		ui.nextdir.setAttribute('unabled','1');
	}
};
function addTab(dir){
	tabs.tabnumb+=1;
	tabs.tabcid+=1;
	tabelem="<div class='tab' sel='1' tabid='"+tabs.tabcid+"' dir='"+dir+"'><div class='l tabtext'>"+path.basename(dir)+"</div><div class='closetab bz'>&#xf00d;</div></div>"
	ui.tabs.innerHTML+=tabelem;
	ui.files.innerHTML+="<div class='tabcont' tabid='"+tabs.tabcid+"'></div>";
	ui.currenttab=tabs.tabcid;
	goToDir(tabs.tabcid,app.userdir);
	showTab(tabs.tabcid);
	tabHistoryCreate(tabs.tabcid,dir);
}
function removeTab(tabid){
	tabHistoryRemove(tabid);
	tabs.tabnumb-=1;
	tabel=ui.tabs.querySelector('[tabid="'+tabid+'"]');
	if(ui.tabs.childElementCount > 1){
		if(tabel.previousElementSibling != null){
			tabidx=tabel.previousElementSibling.getAttribute('tabid');
			showTab(tabidx);
			tabHistoryUpdt(tabidx);
		}else if(tabel.nextElementSibling != null){
			tabidx=tabel.nextElementSibling.getAttribute('tabid');
			showTab(tabidx);
			tabHistoryUpdt(tabidx);
		}
	}else{
		ui.setPath('');
		tabHistoryUpdt(0);
	}
	tabel.remove();
	ui.files.querySelector('[tabid="'+tabid+'"]').remove();
}
function showTab(tabid){
	ui.currenttab=tabid;
	hideTabs();
	tab=ui.tabs.querySelector('[tabid="'+tabid+'"]');
	ui.setPath(tab.getAttribute('dir'));
	tab.setAttribute('sel','1');
	ui.files.querySelector('[tabid="'+tabid+'"]').setAttribute('sel','1');
}
function hideTabs(){
	for (var i = 0; i < ui.tabs.children.length; i++) {
		ui.tabs.children[i].setAttribute('sel','0');
	};
	for (var i = 0; i < ui.files.children.length; i++) {
		ui.files.children[i].setAttribute('sel','0');
	};
}
function autoHeight(w){
	maxh=0;
	files=w.getElementsByClassName('file-e');
	for (var i = 0; i < files.length; i++) {
		files[i].style.height="auto";
	};
	for (var i = 0; i < files.length; i++) {
		cheight=parseInt(getComputedStyle(files[i], null).height);
		maxh=(cheight > maxh)? cheight:maxh;
	};
	maxh = (maxh > 134) ? 134:maxh;
	for (var i = 0; i < files.length; i++) {
		files[i].style.height=maxh;
	};
}
//Cambiar de vista
function setView(view){
	viewbnts=getClass('view-btn');
	for (var i = 0; i < viewbnts.length; i++) {
		if(viewbnts[i].getAttribute('view') == view){
			viewbnts[i].setAttribute('sel','1');
		}else{
			viewbnts[i].setAttribute('sel','0');
		}
	};
	ui.files.setAttribute('view',view);
	localStorage["view"]=view;
	app.view=view;
	tabcont=ui.files.querySelector('[tabid="'+ui.currenttab+'"]');
	autoHeight(tabcont);
}
//Bookmarks
function loadBookmarks(){
	exist=fs.existsSync(app.userdir+"/.gtk-bookmarks");
	if(exist){
		app.bookmarks=fs.readFileSync(app.userdir+"/.gtk-bookmarks", {encoding: "utf8"});
		app.bookmarks=app.bookmarks.split("\n");
		app.bookmarks.reverse();
		app.bookmarks.push("file://"+app.userdir+" Carpeta personal");
		app.bookmarks.reverse();
		if(app.bookmarks[app.bookmarks.length-1] == ""){app.bookmarks.pop();}
		for (var i = 0; i < app.bookmarks.length; i++) {
			app.bookmarks[i]=app.bookmarks[i].substr(7,app.bookmarks[i].length-7);
		};
	}else{
		fs.createWriteStream(app.userdir+"/.gtk-bookmarks", { flags: 'w',encoding: null,mode: 0666 ,autoClose: true})
	}
}
function showBookmarks(){
	fgx="";
	if(ui.tabs.childElementCount > 0){
		curdir=ui.tabs.querySelector('[tabid="'+ui.currenttab+'"]').getAttribute('dir');
	}else{
		curdir="";
	}
	for (var i = 0; i < app.bookmarks.length; i++) {
		cbookmark=app.bookmarks[i].split(" ")
		if(cbookmark.length > 1){
			texta=app.bookmarks[i].substr(app.bookmarks[i].indexOf(" "),app.bookmarks[i].length);
			namedir=decodeURIComponent(texta);
			cbookmark[0]=(cbookmark[0].substr(cbookmark[0].length-1,1) != "/") ? cbookmark[0]+"/":cbookmark[0];
		}else{
			cbookmark[0]=(cbookmark[0].substr(cbookmark[0].length-1,1) != "/") ? cbookmark[0]+"/":cbookmark[0];
			namedir=cbookmark[0].split("/");
			namedir=decodeURIComponent(namedir[namedir.length-2]);
		}
		state=(curdir == decodeURIComponent(cbookmark[0]) )? 1:0;
		fgx+='<div class="gk-dropdown-item bz nosel" sel="'+state+'" tdir="'+decodeURIComponent(cbookmark[0])+'"><div class="l gk-sidebar-icon"></div>'+namedir+'</div>';
	};
	if(getID("bookmarks").innerHTML != fgx){
		getID("bookmarks").innerHTML=fgx;
	}
	app.lbookmarks=app.bookmarks;
}
//Vuelca el contenido de una variable a texto
function dtx(dt,verbose){
	verbose=(!verbose)? false:true;
	fgt="";
	if(typeof dt == 'object'){
		if(typeof dt.push != "undefined"){
			//Es un array
			for (var i = 0; i < dt.length; i++) {
				if(!verbose){
					fgt+=((typeof dt[i] == 'object')? dtx(dt[i],verbose):dt[i])+"<br>";
				}else{
					fgt+="Index: "+i+" ->"+((typeof dt[i] == 'object')? dtx(dt[i],verbose):dt[i])+"<br>";
				}
			};
		}else{
			//Es un objeto
			for(key in dt){
				if(!verbose){
					fgt+=((typeof dt[key] == 'object')? dtx(dt[key],verbose):dt[key])+"<br>";
				}else{
					fgt+="Key:"+key+" Value:"+((typeof dt[key] == 'object')? dtx(dt[key],verbose):dt[key])+"<br>";
				}
			}
		}
	}else{
		fgt=dt;
	}
	return fgt;
}