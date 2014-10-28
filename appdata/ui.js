function is(w,m){if(m.substr(0,1) == "#"){if(m.substr(1,m.length-1) == w.target.id){return true;}else{return false;}}else if(m.substr(0,1) == "."){fl=w.target.classList.length;for (var i = 0; i < fl; i++){if(w.target.classList[i] == m.substr(1,m.length-1)){return true;break;}else if(i==w.target.classList.length){return false;}};}}
function closest(w,m) {tar=w.target;while (tar.tagName != "HTML") {if(m.substr(0,1) == "#"){if(m.substr(1,m.length-1) == tar.id){return tar;}}else if(m.substr(0,1) == "."){fl=tar.classList.length;for (var i = 0; i < fl; i++){if(tar.classList[i] == m.substr(1,m.length-1)){return tar;break;}};}tar = tar.parentNode;}return null;}
function isclosest(w,m) {tar=w.target;while (tar.tagName != "HTML") {if(m.substr(0,1) == "#"){if(m.substr(1,m.length-1) == tar.id){return true;}}else if(m.substr(0,1) == "."){fl=tar.classList.length;for (var i = 0; i < fl; i++){if(tar.classList[i] == m.substr(1,m.length-1)){return true;break;}};}tar = tar.parentNode;}return false;}
function booltoint(w){if(w){return 1;}else{return 0;}}
function getID(w){return document.getElementById(w);}
function getClass(w){return document.getElementsByClassName(w);}
function show(e){e.style.display='block'};function hide(e){e.style.display='none'};ajax=[];
ajax.get=function(url){req = new XMLHttpRequest;req.open("GET",url,false);req.send();return req.responseText;}
ajax.post=function(url,post){req = new XMLHttpRequest;req.open("POST",url,false);req.setRequestHeader("Content-type","application/x-www-form-urlencoded");req.send(post);return req.responseText;}
//moment().format("DD/MM/YYYY");
function str2hex(str){response="";for (var i = 0; i < str.length; i++) {hex=str.charCodeAt(i).toString(16);response+=("000"+hex).slice(-4);};return response;}
function hex2str(str){response="";hexes=str.match(/.{1,4}/g) || [];for (var i = 0; i < hexes.length; i++) {response+=String.fromCharCode(parseInt(hexes[i],16));};return response;}
function isPair(n){res=0;for (var i = n; i >= 1; i-=2) {res=i;};return res;}//Para numeros menores a 100000000

function getIndex(n){for (var i = 0; i < app.tabs.length; i++) {if(app.tabs[i][0] == n){return i;break;}};return -1;}
function execute(command, callback){
	if(typeof callback != "undefined"){
		exec(command, function(error, stdout, stderr){ callback(stdout); });
	}else{
		exec(command, function(error, stdout, stderr){});
	}
};


//Node import
var fs=require('fs');
var path = require('path');
var gui = require('nw.gui');
var Ini = require('ini-parser');
var exec = require('child_process').exec;
var mime = require('mime');
var Thumbnail = require('thumbnail');
var sizeOfImage = require('image-size');
var clipboard = require('./clipboard.js');
var filemanager = require('./filemanager.js');

//get clipboard
//var text = clipboard.get('text');
//set clipboard
//clipboard.set('I love node-webkit :)', 'text');

var app=[];
app.userdir=(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE)+"/";
app.tabscount=0;
app.tabid=1;
app.tabs=[];
app.hiddenfiles=false;
app.bookmarks=[];
app.lbookmarks="";

app.view=(typeof localStorage["view"] == "undefined") ? "list":localStorage["view"];

//console.log(gui.App.argv);

keyh=[]
keyh.shift=false;
keyh.ctrl=false;
keyh.altk=false;

menu=[];
menu.file=new gui.Menu();
menu.file.append(new gui.MenuItem({ label: 'Abrir' }));
menu.file.append(new gui.MenuItem({ type: 'separator' }));
menu.file.append(new gui.MenuItem({ label: 'Copiar' }));
menu.file.append(new gui.MenuItem({ label: 'Cortar' }));
menu.file.append(new gui.MenuItem({ label: 'Pegar' }));
menu.file.append(new gui.MenuItem({ type: 'separator' }));
menu.file.append(new gui.MenuItem({ label: 'Renombrar' }));
menu.file.append(new gui.MenuItem({ type: 'separator' }));
menu.file.append(new gui.MenuItem({ label: 'Mover a la papelera' }));
menu.file.append(new gui.MenuItem({ type: 'separator' }));
menu.file.append(new gui.MenuItem({ label: 'Propiedades' }));

menu.file.items[0].click=function(){
	dirpath=app.tabs[getIndex(app.tabid)][1];
	w=getTabDom();
	files=w.getElementsByClassName('file-e');
	folderstoopen=[];
	for (var i = 0; i < files.length; i++) {
		if(files[i].getAttribute('sel') == "1"){
			name=files[i].getElementsByClassName('f-name')[0].innerHTML;
			if(files[i].getAttribute('xtype') == "file"){
				execute("xdg-open '"+dirpath+name+"'")
			}else if(files[i].getAttribute('xtype') == "dir"){
				folderstoopen.push(dirpath+name+"/");
			}
		}
	}
	for (var i = 0; i < folderstoopen.length; i++) {
		console.log("llamada de addTab");
		addTab(folderstoopen[i])
	};
}
menu.file.items[2].click=function(){
	dirpath=app.tabs[getIndex(app.tabid)][1]
	console.log("llamada del menu");
	w=getTabDom();
	files=w.getElementsByClassName('file-e');
	toclip=[];
	for (var i = 0; i < files.length; i++) {
		if(files[i].getAttribute('sel') == "1"){
			name=files[i].getElementsByClassName('f-name')[0].innerHTML;
			if(files[i].getAttribute('xtype') == "file"){
				toclip.push(dirpath+name)
			}else if(files[i].getAttribute('xtype') == "dir"){
				toclip.push(dirpath+name+"/");
			}
		}
	}
	toclip=toclip.join("\n");
	clipboard.set(toclip);
}
menu.file.items[8].click=function(){
	dirpath=app.tabs[getIndex(app.tabid)][1];
	w=getTabDom();
	files=w.getElementsByClassName('file-e');
	pathstotrash=[];
	for (var i = 0; i < files.length; i++) {
		if(files[i].getAttribute('sel') == "1"){
			name=files[i].getElementsByClassName('f-name')[0].innerHTML;
			if(files[i].getAttribute('xtype') == "file"){
				pathstotrash.push(dirpath+name)
			}else if(files[i].getAttribute('xtype') == "dir"){
				pathstotrash.push(dirpath+name+"/");
			}
		}
	}
	filemanager.trash(pathstotrash,function(err){
		loadDir();
	});
}


window.addEventListener("load",function(){
	loadBookmarks();
	setInterval(function(){loadBookmarks();},2000);
	setInterval(function(){showBookmarks();},200);

	getClass('view-btn')[0].setAttribute('sel','0');
	getClass('view-btn')[1].setAttribute('sel','0');
	if(app.view == "list"){
		getClass('view-btn')[0].setAttribute('sel','1');
	}else if(app.view == "mosaic"){
		getClass('view-btn')[1].setAttribute('sel','1');
	}
	getID('files').setAttribute('view',app.view);
	addTab(app.userdir);
	console.log("llamada de inicio");
	autoHeight(getTabDom());
	gen_thumbnails();
	//·Mouse
	window.addEventListener('contextmenu', function(e) {
		if(isclosest(e,'.file-e')){
			file_e=closest(e,'.file-e')
			if(file_e.getAttribute('sel') != "1"){
				file_e.click();
			}
			menu.file.popup(e.x, e.y);
		}
		return false;
	});
	window.addEventListener("click",function(e){
		if(is(e,'.closewindow')){
			window.close();
		}
		if(is(e,'.f-icon') || is(e,'.f-name')){
			tabs=getClass('tabcont');
			tabsxc=null;
			for (var i = 0; i < tabs.length; i++){
				if(tabs[i].getAttribute('tabid') == app.tabs[getIndex(app.tabid)][0]){
					tabsxc=tabs[i];
				}
			};
			target=(e.target.className == "file-e nosel") ? e.target:e.target.parentNode;
			if(!keyh.ctrl){
				ent=tabsxc.getElementsByClassName('file-e');
				for (var i = 0; i < ent.length; i++) {
					ent[i].setAttribute('sel','0');
				};
			}
			app.tabs[getIndex(app.tabid)][2]=target;
			target.setAttribute('sel','1');
			if(e.detail==2){
				if(target.getAttribute('xtype') == "dir"){
					app.tabs[getIndex(app.tabid)][2]=null;
					cDir(getIndex(app.tabid),app.tabs[getIndex(app.tabid)][1]+target.getElementsByClassName('f-name')[0].innerHTML+"/")
				}else if(target.getAttribute('xtype') == "file"){
					execute("xdg-open '"+app.tabs[getIndex(app.tabid)][1]+target.getElementsByClassName('f-name')[0].innerHTML+"'")
				}
			}
		}
		if(is(e,'.addtab')){
			addTab(app.userdir);
		}
		if(is(e,'.f-tab')){
			tabs=getClass('f-tab');
			for (var i = 0; i < tabs.length; i++) {tabs[i].setAttribute('sel','0');};
			e.target.setAttribute('sel','1');
			tabs=getClass('tabcont');
			for (var i = 0; i < tabs.length; i++) {
				if(tabs[i].getAttribute('tabid')!=e.target.getAttribute('tabid')){
					hide(tabs[i]);
				}else{
					show(tabs[i]);
					if(getID('files').getAttribute('view') == "mosaic"){autoHeight(tabs[i]);}
				}
			};
			app.tabid=parseInt(e.target.getAttribute('tabid'))
				getID("navinput").value=app.tabs[getIndex(app.tabid)][1];
		}
		if(is(e,'#prevdir') && app.tabs.length != 0){
			app.tabs[getIndex(app.tabid)][2]=null;
			dir=app.tabs[getIndex(app.tabid)][1];
			dir=dir.split("/");
			dir.pop();dir.pop();
			dir=dir.join("/");
			app.tabs[getIndex(app.tabid)][1]=dir+"/";
			loadDir();
		}
		if(is(e,'.closetab')){
			tabid=e.target.parentNode.getAttribute('tabid');
			issel=parseInt(e.target.parentNode.getAttribute('sel'));
			pvt=null;
			pvg=null;
			for (var i = 0; i < app.tabs.length; i++) {
				if(app.tabs[i][0] == parseInt(tabid)){
					pvt=e.target.parentNode.previousElementSibling;
					pvt=(pvt != null) ? pvt : e.target.parentNode.nextElementSibling;
					e.target.parentNode.remove();
					tabs=getClass('tabcont');
					for (var ik = 0; ik < tabs.length; ik++) {
						if(tabs[ik].getAttribute('tabid') == tabid){
							pvg=tabs[ik].previousElementSibling;
							pvg=(pvg != null) ? pvg : tabs[ik].nextElementSibling;
							tabs[ik].remove();
						}
					};
					app.tabs.splice(i,1)
					if(issel == 1){
						if(pvt != null && pvg != null){
							pvt.setAttribute('sel','1');
							show(pvg);
							if(typeof app.tabs[i-1] == "undefined"){
								app.tabid=app.tabs[i][0];
							}else{
								app.tabid=app.tabs[i-1][0];
							}
							getID("navinput").value=app.tabs[getIndex(app.tabid)][1];
						}else{
							app.tabid=1;
							getID('navinput').value="";
						}
					}
					break;
				}
			};
		}
		if(is(e,".gk-dropdown")){
			sixl=!Boolean(parseInt(e.target.getAttribute("opened")));
			e.target.setAttribute("opened",booltoint(sixl))
			e.target.nextElementSibling.setAttribute("opened",booltoint(sixl))
		}
		if(is(e,".gk-dropdown-item")){
			elements=document.getElementsByClassName("gk-dropdown-item");
			for (var i = 0; i < elements.length; i++) {
				elements[i].setAttribute("sel","0");
			};
			e.target.setAttribute("sel","1");
			if(app.tabs.length > 0){
				app.tabs[getIndex(app.tabid)][1]=e.target.getAttribute('tdir');
				loadDir();
			}else{
				addTab(e.target.getAttribute('tdir'));
			}
		}
		if(is(e,'.view-btn')){
			if(e.target.getAttribute('view') != getID('files').getAttribute('view')){
				getClass('view-btn')[0].setAttribute('sel','0');
				getClass('view-btn')[1].setAttribute('sel','0');
				e.target.setAttribute('sel','1');
				localStorage["view"]=e.target.getAttribute('view');
				getID('files').setAttribute('view',e.target.getAttribute('view'));
				getMimeIcons();
				gen_thumbnails();
				autoHeight(getTabDom());
			}
		}
	});
	//Selector
	window.addEventListener("mousedown",function(e){
		if(is(e,'.tabcont') && e.button != 2){
			tabcont=getTabDom();
			scrollTop=getID("files").scrollTop;
			tabcont.innerHTML+="<div class='bz selector' xstart='"+e.clientX+"' ystart='"+(e.clientY+scrollTop)+"'></div>";
			getClass('selector')[0].style.left=e.layerX;
			getClass('selector')[0].style.top=e.layerY;
		}
	});
	window.addEventListener("mousemove",function(e){
		scrollTop=getID("files").scrollTop;
		selector=getClass('selector');
		if(selector.length > 0){
			xstart=parseInt(selector[0].getAttribute('xstart'));
			ystart=parseInt(selector[0].getAttribute('ystart'))
			if(e.clientX < xstart){
				selector[0].style.left=e.clientX;
				selector[0].style.width=xstart-(e.clientX);
			}else{
				selector[0].style.left=xstart;
				selector[0].style.width=(e.clientX)-xstart;
			}
			if((e.clientY)+scrollTop < ystart){
				selector[0].style.top=(e.clientY);
				selector[0].style.height=ystart-((e.clientY)+scrollTop);
			}else{
				selector[0].style.top=ystart-scrollTop;
				selector[0].style.height=((e.clientY)+scrollTop)-ystart;
			}
		}
	});
	window.addEventListener("mouseup",function(e){
		selector=getClass('selector');
		if(selector.length > 0){
			selector[0].remove();
		}
	});
	//·Keyboard
	window.addEventListener('keydown', function(e){
		if(e.keyIdentifier === 'F5'){window.location.reload();}
		if(e.keyCode == 16){keyh.shift=true;}
		if(e.keyCode == 17){keyh.ctrl=true;}
		if(e.keyCode == 18){keyh.altk=true;}
		if(e.keyCode == 72){if(keyh.ctrl){
			app.hiddenfiles=(app.hiddenfiles) ? false:true;
			for (var i = 0; i < app.tabs.length; i++) {
				loadDir(i);
			};
		}}
		if(e.keyCode == 38){
			event.preventDefault();
			if(app.tabs[getIndex(app.tabid)][2] != null){

				el=app.tabs[getIndex(app.tabid)][2].previousElementSibling;
				if(el!=null){
					if(!keyh.ctrl){
						ent=getClass('file-e');
						for (var i = 0; i < ent.length; i++) {ent[i].setAttribute('sel','0');};
						app.tabs[getIndex(app.tabid)][2].setAttribute('sel','0');
					}
					if(el.offsetTop < getID('files').scrollTop){
						if(getID('files').getAttribute('view') == "mosaic"){
							getID('files').scrollTop=el.offsetTop-6;
						}else{
							getID('files').scrollTop=el.offsetTop;
						}
					}
					el.setAttribute('sel','1');
					app.tabs[getIndex(app.tabid)][2]=el;
				}
			}
			else{
				tabs=getClass('tabcont');
				tabsxc=null;
				for (var i = 0; i < tabs.length; i++){if(tabs[i].getAttribute('tabid') == app.tabs[getIndex(app.tabid)][0]){tabsxc=tabs[i];}};
				elms=tabsxc.getElementsByClassName('file-e');
				elms[elms.length-1].setAttribute('sel','1');
				app.tabs[getIndex(app.tabid)][2]=elms[elms.length-1];
				el=app.tabs[getIndex(app.tabid)][2];
				if(el != null){
					getID('files').scrollTop=el.offsetTop-(parseInt(getComputedStyle(getID('files'),null).height)-parseInt(getComputedStyle(el,null).height)-20);
				}
			}
		}//arriba
		if(e.keyCode == 40){
			event.preventDefault();
			if(app.tabs[getIndex(app.tabid)][2] != null){
				el=app.tabs[getIndex(app.tabid)][2].nextElementSibling;
				if(el!=null){
					if(!keyh.ctrl){
						ent=getClass('file-e');
						for (var i = 0; i < ent.length; i++) {ent[i].setAttribute('sel','0');};
						app.tabs[getIndex(app.tabid)][2].setAttribute('sel','0');
					}
					if(el.offsetTop+parseInt(getComputedStyle(el,null).height) > getID('files').scrollTop+parseInt(getComputedStyle(getID('files'),null).height)){
						if(getID('files').getAttribute('view') == "mosaic"){
							getID('files').scrollTop=el.offsetTop-(parseInt(getComputedStyle(getID('files'),null).height)-parseInt(getComputedStyle(el,null).height)-12);
						}else{
							getID('files').scrollTop=el.offsetTop-(parseInt(getComputedStyle(getID('files'),null).height)-parseInt(getComputedStyle(el,null).height)-8);
						}
					}
					el.setAttribute('sel','1');
					app.tabs[getIndex(app.tabid)][2]=el;
				}
			}else{
				tabs=getClass('tabcont');
				tabsxc=null;
				for (var i = 0; i < tabs.length; i++){if(tabs[i].getAttribute('tabid') == app.tabs[getIndex(app.tabid)][0]){tabsxc=tabs[i];}};
				elms=tabsxc.getElementsByClassName('file-e');
				elms[0].setAttribute('sel','1');
				app.tabs[getIndex(app.tabid)][2]=elms[0];
			}
		}//abajo
		if(e.keyCode == 13){
			if(e.srcElement.id == "navinput"){
				val=e.srcElement.value;
				val=(val.substr(val.length-1,1) != "/") ? val+"/":val;
				if(app.tabs.length != 0){cDir(getIndex(app.tabid),val);}
			}else{
				tabs=getClass('tabcont');
				tabsxc=null;
				for (var i = 0; i < tabs.length; i++){if(tabs[i].getAttribute('tabid') == app.tabs[getIndex(app.tabid)][0]){tabsxc=tabs[i];}};
				ent=tabsxc.getElementsByClassName('file-e');
				for (var i = 0; i < ent.length; i++) {
					if(ent[i].getAttribute('sel') == "1"){
						if(ent[i].getAttribute('xtype') == "dir"){
							app.tabs[getIndex(app.tabid)][2]=null;
							cDir(getIndex(app.tabid),app.tabs[getIndex(app.tabid)][1]+ent[i].getElementsByClassName('f-name')[0].innerHTML+"/")
						}else if(ent[i].getAttribute('xtype') == "file"){
							execute("xdg-open '"+app.tabs[getIndex(app.tabid)][1]+ent[i].getElementsByClassName('f-name')[0].innerHTML+"'")
						}
					}
				};
			}
		}
		if(e.keyCode == 8 && e.target.id != "navinput"){
			dir=app.tabs[getIndex(app.tabid)][1];
			if(dir != "/"){
				app.tabs[getIndex(app.tabid)][2]=null;
				dir=dir.split("/");
				dir.pop();dir.pop();
				dir=dir.join("/");
				app.tabs[getIndex(app.tabid)][1]=dir+"/";
				loadDir();
			}
		}
		if(e.keyCode == 46 && e.target.id != "navinput"){
			dirpath=app.tabs[getIndex(app.tabid)][1];
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			pathstotrash=[];
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('sel') == "1"){
					name=files[i].getElementsByClassName('f-name')[0].innerHTML;
					if(files[i].getAttribute('xtype') == "file"){
						pathstotrash.push(dirpath+name)
					}else if(files[i].getAttribute('xtype') == "dir"){
						pathstotrash.push(dirpath+name+"/");
					}
				}
			}
			filemanager.trash(pathstotrash,function(err){
				loadDir();
			});
		}
	});
	window.addEventListener('keyup', function(e){
		if(e.keyCode == 16){keyh.shift=false;}
		if(e.keyCode == 17){keyh.ctrl=false;}
		if(e.keyCode == 18){keyh.altk=false;}
	});
});


function loadDir(n,tabdom){
	console.log("llamada loadDir");
	tabtar= tabdom || getTabDom();
	gindex = (typeof n == "undefined")? getIndex(app.tabid):n;
	files=fs.readdirSync(app.tabs[gindex][1]);
		files.sort();
		tabtar.innerHTML="";
		//Arrays que contienen las carpetas y los archivos separados
		ofolders=[];
		ohfolders=[];
		ofiles=[];
		ohfiles=[];
		for (var i = 0; i < files.length; i++) {
			stat=fs.lstatSync(app.tabs[gindex][1]+files[i]);
			if (stat.isFile()){
				if(files[i].indexOf(".") >= 0){
					ftype=files[i].split(".");
					if(ftype[0] == ""){
						if(ftype.length > 2){ftype=ftype[ftype.length-1];}else{ftype="";}
					}else{
						ftype=ftype[ftype.length-1];
					}
				}else{ftype="";}
				if(files[i].substr(0,1) == "."){ohfiles.push([files[i],ftype]);}else{ofiles.push([files[i],ftype]);}
			}else if(stat.isDirectory()){
				if(files[i].substr(0,1) == "."){ohfolders.push([files[i],""]);}else{ofolders.push([files[i],""]);}
			}
		};
		ofolders.sort();
		ohfolders.sort();
		ofiles.sort();
		ohfiles.sort();
		//Add Hidden Folders and files
		if(app.hiddenfiles){
			for (var i = 0; i < ohfolders.length; i++) {
				tabtar.innerHTML+="<div class='file-e nosel' xtype='dir'><div class='f-icon'></div><div class='f-name'>"+ohfolders[i][0]+"</div></div>";
			};
			for (var i = 0; i < ohfiles.length; i++) {
				tabtar.innerHTML+="<div class='file-e nosel' xtype='file' ext='"+ohfiles[i][1]+"'><div class='f-icon'></div><div class='f-name'>"+ohfiles[i][0]+"</div></div>";
			};
		}
		//Add Folders
			for (var i = 0; i < ofolders.length; i++) {
				tabtar.innerHTML+="<div class='file-e nosel' xtype='dir'><div class='f-icon'></div><div class='f-name'>"+ofolders[i][0]+"</div></div>";
			};
		//Add Files
			for (var i = 0; i < ofiles.length; i++) {
				tabtar.innerHTML+="<div class='file-e nosel' xtype='file' ext='"+ofiles[i][1]+"'><div class='f-icon'></div><div class='f-name'>"+ofiles[i][0]+"</div></div>";
			};
		nametab=app.tabs[gindex][1].split('/');
		nametab=nametab[nametab.length-2];
		if(nametab == ""){nametab="Sistema de archivos";}
		tabs=getClass('f-tab');
		for (var i = 0; i < tabs.length; i++) {
			if(tabs[i].getAttribute('tabid') == app.tabs[gindex][0]){
				tabs[i].innerHTML="<div class='closetab bz'>&#xf00d;</div>"+nametab;
			}
		};
		tabs=getClass('tabcont');
		for (var i = 0; i < tabs.length; i++) {
			if(tabs[i].getAttribute('tabid') == app.tabs[gindex][0] && getID('files').getAttribute('view') == "mosaic"){autoHeight(tabs[i]);}
		};
		getID("navinput").value=app.tabs[getIndex(app.tabid)][1];
		getID('files').scrollTop=0;
		getMimeIcons();
		gen_thumbnails(gindex,tabtar);
}

function addTab(d){
	app.tabscount+=1;
	app.tabs.push([app.tabscount,d,null]);
	app.tabid=app.tabscount;
	tabs=getClass('tabcont');
	for (var i = 0; i < tabs.length; i++) {hide(tabs[i]);};
	tabs=getClass('f-tab');
	for (var i = 0; i < tabs.length; i++) {tabs[i].setAttribute('sel','0');};
	nametab=app.tabs[getIndex(app.tabid)][1].split('/');
	nametab=nametab[nametab.length-2];
	getID('tabs').innerHTML+="<div class='f-tab bz' sel='1' tabid='"+app.tabscount+"'><div class='closetab bz'>&#xf00d;</div>"+nametab+"</div>"
	getID('files').innerHTML+="<div class='tabcont' tabid='"+app.tabscount+"'></div>";
	tabstopsh=getTabDom(app.tabscount);
	if(fs.existsSync(d)){
		loadDir(getIndex(app.tabscount),tabstopsh);
	}else{
		tabs=getClass('tabcont');
		for (var i = 0; i < tabs.length; i++) {
			if(tabs[i].getAttribute('tabid') == app.tabs[getIndex(app.tabid)][0]){tabs[i].innerHTML="";;}
		};
		alert("No existe el directorio")
	}
	getID("navinput").value=app.tabs[getIndex(app.tabid)][1];
	getID('tabs').scrollLeft=100000;
}
function cDir(n,dir){
	app.tabs[n][1]=dir;
	app.tabs[n][2]=null;
	if(fs.existsSync(dir)){
		loadDir(n);
	}else{
		tabs=getClass('tabcont');
		for (var i = 0; i < tabs.length; i++) {
			if(tabs[i].getAttribute('tabid') == app.tabs[getIndex(app.tabid)][0]){tabs[i].innerHTML="";;}
		};
		alert("No existe el directorio")
	}
	getID("navinput").value=app.tabs[getIndex(app.tabid)][1];
}
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
	if(app.tabs.length > 0 && getIndex(app.tabid) >= 0){
		if(app.lbookmarks!=app.bookmarks){
			fgx="";
			curdir=app.tabs[getIndex(app.tabid)][1];
			for (var i = 0; i < app.bookmarks.length; i++) {
				cbookmark=app.bookmarks[i].split(" ")

				if(cbookmark.length > 1){
					namedir=decodeURIComponent(cbookmark[1]);
					cbookmark[0]=(cbookmark[0].substr(cbookmark[0].length-1,1) != "/") ? cbookmark[0]+"/":cbookmark[0];
				}else{
					cbookmark[0]=(cbookmark[0].substr(cbookmark[0].length-1,1) != "/") ? cbookmark[0]+"/":cbookmark[0];
					namedir=cbookmark[0].split("/");
					namedir=decodeURIComponent(namedir[namedir.length-2]);
				}

				state=(curdir == cbookmark[0])? 1:0;
				fgx+='<div class="gk-dropdown-item bz nosel" sel="'+state+'" tdir="'+decodeURIComponent(cbookmark[0])+'"><div class="l gk-sidebar-icon" style="background-image:url(\''+app.icon_dirs_small+'\');"></div>'+namedir+'</div>';
			};
			if(getID("bookmarks").innerHTML != fgx){
				getID("bookmarks").innerHTML=fgx;
			}
			app.lbookmarks=app.bookmarks;
		}
	}else{
		items=getClass('gk-dropdown-item');
		for (var i = 0; i < items.length; i++) {
			items[i].setAttribute('sel','0');
		};
	}
}
//Adjust Icons height

function autoHeight(w){
	maxh=0;
	files=w.getElementsByClassName('file-e');
	for (var i = 0; i < files.length; i++) {
		cheight=parseInt(getComputedStyle(files[i], null).height);
		maxh=(cheight > maxh)? cheight:maxh;
	};
	maxh = (maxh > 134) ? 134:maxh;
	for (var i = 0; i < files.length; i++) {
		files[i].style.height=maxh;
	};
}

//System Icons
//gsettings get org.gnome.desktop.interface icon-theme

function Icon(n,s,c,callback){
	execute("gsettings get org.gnome.desktop.interface icon-theme",function(stdout){
		if(stdout != ""){theme_name=decodeURIComponent(stdout.replace(/["']/g, ""));IconFinder(theme_name,n,s,c,callback,true);}else{
			execute("grep '^gtk-icon-theme-name' $HOME/.gtkrc-2.0 | awk -F'=' '{print $2}'",function(stdout){
				if(stdout != ""){theme_name=decodeURIComponent(stdout.replace(/["']/g, ""));IconFinder(theme_name,n,s,c,callback,true);}
			})
		}
	})
}
function IconFinder(themename,n,s,c,callback,first){
	themename=themename.replace(/[\n]/g, "")
	pathfind="/usr/share/icons/";
	exist=fs.existsSync(pathfind+themename+"/index.theme");
	if(!exist){
		pathfind=app.userdir+"/.icons/";
		exist=fs.existsSync(pathfind+themename+"/index.theme");
	}
	if(exist){
		theme=Ini.parse(fs.readFileSync(pathfind+themename+"/index.theme",{encoding:"utf8"}))
		Inherits=[];
		if(typeof theme["Icon Theme"].Inherits != "undefined"){
			Inherits=theme["Icon Theme"].Inherits.split(",");
		}
		for(key in theme){
			if(typeof theme[key].Size != "undefined"){
				if(theme[key].Context == c){
					if(theme[key].Type == "Fixed" || theme[key].Type == "Scalable"){
						if(theme[key].Size == s){
							iconexist=fs.existsSync(pathfind+themename+"/"+key+"/"+n+".png");
							iconexistsvg=fs.existsSync(pathfind+themename+"/"+key+"/"+n+".svg")
							if(iconexist){
								callback(pathfind+themename+"/"+key+"/"+n+".png");
								return true;
							}else if(iconexistsvg){
								callback(pathfind+themename+"/"+key+"/"+n+".svg");
								return true;
							}else{
								ic=true;
								for (var i = 0; i < Inherits.length; i++) {
									if(IconFinder(Inherits[i],n,s,c,callback)){
										return true;
									}
								};
								if(typeof first != "undefined"){
									callback(app.icon_file);
								}
								return false;
							}
						}
					}
				}
			}
		}
	}
}

//Tipos comunes

function getTypeByExt(w){
	if(w == null){ag="";}else{ag=w;}
	switch(ag.toLowerCase()){
		case "png":
		case "jpeg":
		case "jpg":
		case "gif":
			return "image";
		break;
		case "gif":
			return "gif";
		break;
		case "bmp":
			return "bitmap";
		break;
		case "ico":
			return "w-icon";
		break;
		case "mp3":
		case "m4a":
		case "ogg":
		case "wma":
		case "mid":
		case "midi":
			return "audio";
		break;
		case "txt":
			return "text";
		break;
		case "sh":
		case "php":
		case "js":
		case "py":
			return "shellscript";
		break;
		case "zip":
		case "jar":
		case "rar":
		case "bz":
		case "xz":
		case "7z":
		case "lzma":
		case "bz2":
		case "cbz":
		case "ar":
			return "package";
		break;
		case "html":
		case "htm":
		case "xhtml":
		case "xhtm":
			return "html";
		break;
		default:
			return "file"
		break;
	}
}

//thumbnails
function gen_thumbnails(n,domx){
	gindex= n || getIndex(app.tabid)
	if(getID('files').getAttribute('view') == "mosaic"){
		dir=app.tabs[getIndex(app.tabid)][1]
		var execPath = path.dirname( process.execPath );
		thumbdir=execPath+'/thumbnails';
		if(!fs.existsSync(thumbdir+"/")){fs.mkdirSync(thumbdir+"/", 0766);}
		//recreate folder tree
		genFolders(thumbdir,dir);
		console.log("llamada del gen_thumbnails");
		w=domx || getTabDom();
		files=w.getElementsByClassName('file-e');
		for (var i = 0; i < files.length; i++) {
			if(getTypeByExt(files[i].getAttribute('xtype')) == "file"){
				filename=files[i].getElementsByClassName('f-name')[0].innerHTML;
				ext=files[i].getAttribute('ext')
				if(getTypeByExt(ext) == "image"){
					imgsize=sizeOfImage(dir+filename);
					if(imgsize.height > 80){
						setTimeout(function(){
							var thumbnail = new Thumbnail(this.dir, this.thumbdir+this.dir);
							thumbnail.ensureThumbnail(this.filename, null, 100, function (err, filename) {
								if(typeof filename != "undefined"){
									elemtoi=this.felem.getElementsByClassName('f-icon')[0]
									elemtoi.style.backgroundImage="url('"+thumbdir+"/"+this.basedir+filename+"')";
								}
							}.bind({felem:this.felem,basedir:this.basedir}));
						}.bind({felem:files[i],basedir:dir,dir:dir,thumbdir:thumbdir,filename:filename}),30*i)
					}else if(imgsize.width > 120){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+dir+filename+"')";
						elemtoi.style.backgroundSize="contain"
					}else{
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+dir+filename+"')";
						elemtoi.style.backgroundSize="auto"
					}
				}else if(getTypeByExt(ext) == "gif" || getTypeByExt(ext) == "bitmap" || getTypeByExt(ext) == "w-icon"){
					elemtoi=files[i].getElementsByClassName('f-icon')[0]
					elemtoi.style.backgroundImage="url('"+dir+filename+"')";
				}
			}
		};
	}else{
		console.log("llamada de gen_thumbnails");
		w=getTabDom();
		files=w.getElementsByClassName('file-e');
		for (var i = 0; i < files.length; i++) {
			files[i].style.height="auto";
			//elemtoi=files[i].getElementsByClassName('f-icon')[0];
			//elemtoi.style.backgroundImage="";
		}
	}
}
var deleteFolderRecursive = function(path,folder) {
	if( fs.existsSync(path) ) {
		fs.readdirSync(path).forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath,folder);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		if(typeof folder != "undefined" && folder){fs.rmdirSync(path);}
	}
};
function genFolders(base,dir){
	fld=dir.split("/");
	basedir=base+"/";
	for (var i = 1; i < fld.length-1; i++){
		basedir+=fld[i]+"/";
		if(!fs.existsSync(basedir)){fs.mkdirSync(basedir, 0766);}
	};
}

function getMimeIcons(){
	console.log("llamada del getMimeIcons");
	if(getID('files').getAttribute('view') == "mosaic"){
		iconsize=64;
	}else if(getID('files').getAttribute('view') == "list"){
		iconsize=16;
	}
	Icon("text-x-preview",iconsize,"MimeTypes",function(e){
		app.icon_file=e;
		set_icons("file");
		Icon("folder",iconsize,"Places",function(e){
			app.icon_dirs=e;
			set_icons("folder");
		});
		Icon("audio-x-generic",iconsize,"MimeTypes",function(e){
			app.icon_audio=e;
			set_icons("audio");
		});
		Icon("image-x-generic",iconsize,"MimeTypes",function(e){
			app.icon_image=e;
			set_icons("image");
		});
		Icon("text-plain",iconsize,"MimeTypes",function(e){
			app.icon_text=e;
			set_icons("text");
		});
		Icon("shellscript",iconsize,"MimeTypes",function(e){
			app.icon_shellscript=e;
			set_icons("shellscript");
		});
		Icon("package-x-generic",iconsize,"MimeTypes",function(e){
			app.icon_package=e;
			set_icons("package");
		});
		Icon("text-html",iconsize,"MimeTypes",function(e){
			app.icon_html=e;
			set_icons("html");
		});
		Icon("folder",16,"Places",function(e){
			app.icon_dirs_small=e;
		});
	});
}

function set_icons(type){
	switch(type){
		case "folder":
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "dir"){
					elemtoi=files[i].getElementsByClassName('f-icon')[0]
					elemtoi.style.backgroundImage="url('"+app.icon_dirs+"')";
					elemtoi.style.backgroundSize="auto";
				}
			}
		break;
		case "audio":
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "file"){
					ext=files[i].getAttribute('ext');
					if(getTypeByExt(ext) == "audio"){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+app.icon_audio+"')";
						elemtoi.style.backgroundSize="auto";
					}
				}
			}
		break;
		case "text":
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "file"){
					ext=files[i].getAttribute('ext');
					if(getTypeByExt(ext) == "text"){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+app.icon_text+"')";
						elemtoi.style.backgroundSize="auto";
					}
				}
			}
		break;
		case "shellscript":
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "file"){
					ext=files[i].getAttribute('ext');
					if(getTypeByExt(ext) == "shellscript"){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+app.icon_shellscript+"')";
						elemtoi.style.backgroundSize="auto";
					}
				}
			}
		break;
		case "package":
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "file"){
					ext=files[i].getAttribute('ext');
					if(getTypeByExt(ext) == "package"){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+app.icon_package+"')";
						elemtoi.style.backgroundSize="auto";
					}
				}
			}
		break;
		case "file":
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "file"){
					ext=files[i].getAttribute('ext');
					if(getTypeByExt(ext) == "file"){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+app.icon_file+"')";
						elemtoi.style.backgroundSize="auto";
					}
				}
			}
		break;
		case "html":
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "file"){
					ext=files[i].getAttribute('ext');
					if(getTypeByExt(ext) == "html"){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+app.icon_html+"')";
						elemtoi.style.backgroundSize="auto";
					}
				}
			}
		break;
		case "image":
		if(getID('files').getAttribute('view') == "list"){
			w=getTabDom();
			files=w.getElementsByClassName('file-e');
			for (var i = 0; i < files.length; i++) {
				if(files[i].getAttribute('xtype') == "file"){
					ext=files[i].getAttribute('ext');
					if(getTypeByExt(ext) == "image"){
						elemtoi=files[i].getElementsByClassName('f-icon')[0]
						elemtoi.style.backgroundImage="url('"+app.icon_image+"')";
						elemtoi.style.backgroundSize="auto";
					}
				}
			}
		}
		break;
	}
}

function getTabDom(n){
	tabtofind = parseInt(n) || app.tabid;
	tabs=getClass('tabcont');
	for (var i = 0; i < tabs.length; i++) {
		if(parseInt(tabs[i].getAttribute('tabid')) == tabtofind){
			return tabs[i];
		}
	};
}


//Icons spaces
app.icon_dirs="";
app.icon_dirs_small="";
app.icon_file="";
app.icon_audio="";
app.icon_text="";
app.icon_shellscript="";
app.icon_package="";
app.icon_html="";
function test(){
	clipboard.get(function(clip){
		alert(clip)
	})
}