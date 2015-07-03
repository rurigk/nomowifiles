#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import os, os.path
import socket
import dbus
import re
session = dbus.SessionBus()

daemon = session.get_object('nomowi.tools.daemon', '/nomowi/tools/daemon')

icon = dbus.Interface(daemon, dbus_interface='nomowi.tools.daemon.icon')
notify = dbus.Interface(daemon, dbus_interface='nomowi.tools.daemon.notify')
stop = dbus.Interface(daemon, dbus_interface='nomowi.tools.daemon.stop')

server_address = '/tmp/nomdbus'
try:
	os.unlink(server_address)
except OSError:
	if os.path.exists(server_address):
		raise
sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
sock.bind(server_address)
sock.listen(1)

while True:
	#Wait for a connection
	connection, client_address = sock.accept()
	try:
		while True:
			data = connection.recv(1024)
			if data:
				if re.match( r"notify '(.*)' '(.*)' '(.*)' '(.*)'", data, re.M|re.I):
					sg=re.search(r"notify '(.*)' '(.*)' '(.*)' '(.*)'",data, re.M|re.I)
					notify.notify(sg.group(1),sg.group(2),sg.group(3),sg.group(4))
					connection.send('ok')
				elif re.match( r'icon (.*) (.*)', data, re.M|re.I):
					sg=re.search(r'icon (.*) (.*)',data, re.M|re.I)
					connection.send(icon.getIcon(sg.group(1),int(sg.group(2))))
				else:
					connection.send('null')
			else:
				#Fin de los datos
				break		
	finally:
		# Clean up the connection
		connection.close()