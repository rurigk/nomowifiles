var net = require('net');
var daemonList=[];
var client = net.connect({path: '/tmp/nomdbus'},function(){});
client.on('data', function(data) {
	daemonList[0][1](data.toString());
	daemonList.splice(0,1);
	if(daemonList.length > 0){
		client.write(daemonList[0][0]);
	}
});
function daemonQuery(query,datacallback){
	if(typeof query != 'string'){return false;}
	if(typeof datacallback != 'function'){return false;}
	daemonList.push([query,datacallback]);
	if(daemonList.length == 1){
		client.write(query);
	}
}
daemonQuery('icon nomowi 48',function(e){
	console.log(e)
})
daemonQuery("notify 'NomowiFiles' 'Notificacion de prueba' 'nomowifiles' 'nomowi'",function(e){
	client.destroy()
})