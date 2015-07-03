#Nomowi Files
###Corriendo el codigo
1. Descargar
[nw.js](http://nwjs.io/ "nw.js") (antes node-webkit)
y descomprimir en un directorio

2. Descargar el zip de Nomowi Files y extraerlo en el mismo directorio que node-webkit

3. Ejecutar nw

#####Nota: Para que los iconos funcionen dependen de GTK por lo que posiblemente no funcione en KDE
#####Nota 2: Algunos temas de iconos pueden no funcionar :v

#####solucion a libudev.so.0:

Puedes encontrar la solucion al error [aqui](https://github.com/nwjs/nw.js/wiki/The-solution-of-lacking-libudev.so.0 "nw.js wiki")

###Notas de desarrollo

Ahora la mayoria de los temas de iconos funcionan  
Añadido mayor soporte para los bookmarks  
Optimizado de las vistas en miniatura y memoria  
Añadido scroll en la barra de direcciones

###Demonios
Es importante que antes de usar esta version se inicien los demonios python que estan el el directorio lib/ en el siguiente orden

nomowidaemon.py  
nodedbus.py

Asegurese de que solo haya una intancia de cada uno funcionando

####Tambien puedes unirte a la comunidad en fb de Nomowi

[Comunidad de Nomowi en fb](https://www.facebook.com/groups/nomowi/ "Nomowi")