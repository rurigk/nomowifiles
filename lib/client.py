#!/usr/bin/env python
# -*- coding: utf-8 -*-
import dbus
session = dbus.SessionBus()

daemon = session.get_object('nomowi.tools.daemon', '/nomowi/tools/daemon')

icon = dbus.Interface(daemon, dbus_interface='nomowi.tools.daemon.icon')
notify = dbus.Interface(daemon, dbus_interface='nomowi.tools.daemon.notify')
stop = dbus.Interface(daemon, dbus_interface='nomowi.tools.daemon.stop')

print icon.getIcon('firefox',48)
print icon.getIcon('filezilla',48)
print icon.getIcon('midori',48)
print icon.getIcon('wine',48)
print icon.getIcon('gparted',48)
print icon.getIcon('anjuta',48)
print icon.getIcon('ghex',48)
notify.notify('Hola Dbus','Notificacion por dbus','dbusclient','python')
stop.stop()