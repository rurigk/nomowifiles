#!/usr/bin/env python
# -*- coding: utf-8 -*-

import gtk
import dbus
import dbus.service
import gobject
from dbus.service import BusName, Object, method
from dbus import SessionBus
from dbus.mainloop.glib import DBusGMainLoop
import sys
global getIconG

dbus_loop = DBusGMainLoop()
session = SessionBus(mainloop=dbus_loop)


def notifyG(summary, body='', app_name='', app_icon='',timeout=5000, actions=[], hints=[], replaces_id=0):
	_bus_name = 'org.freedesktop.Notifications'
	_object_path = '/org/freedesktop/Notifications'
	_interface_name = _bus_name
	session_bus = dbus.SessionBus()
	obj = session_bus.get_object(_bus_name, _object_path)
	interface = dbus.Interface(obj, _interface_name)
	interface.Notify(app_name, replaces_id, app_icon,summary, body, actions, hints, timeout)
def getIconG(name,size):
	icon_theme = gtk.icon_theme_get_default()
	icon_info = icon_theme.lookup_icon(name, size, 0)
	if icon_info == None:
		return getIconG('text-x-generic',size)
	else:
		return icon_info.get_filename()

class NomowiDaemon(Object):
	instancias = 0
	def __init__(self, bus, loop):
		# Nombre Conocido de la aplicación
		name = BusName('nomowi.tools.daemon', bus)
		self.loop = loop
		self.path = '/nomowi/tools/daemon'
		super(NomowiDaemon, self).__init__(name, self.path)
	
	@method(dbus_interface='nomowi.tools.daemon.icon')
	def getIcon(self,name,size):
		return getIconG(name,size)

	@method(dbus_interface='nomowi.tools.daemon.notify')
	def notify(self,title,body,appname,icon):
		notifyG(title,body,appname,icon)
		return True
	
	@method(dbus_interface='nomowi.tools.daemon.stop')
	def stop(self):
		self.loop.quit()

loop = gobject.MainLoop()
gobject.threads_init()

daemon = NomowiDaemon(session, loop)

loop.run()


#print getIconG('firefox',48)
#notify('Error de permisos','No tienes permisos para ver /root/','nomowifiles','file-manager')
