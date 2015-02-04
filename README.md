OmniUI [![Build Status](https://travis-ci.org/dlinknctu/OmniUI.svg?branch=dev)](https://travis-ci.org/dlinknctu/OmniUI)
------
A diagnosis, analytic and management framework for SDN  
http://www.slideshare.net/rascov/20140824-omni-ui

###Introduction###
OmniUI is a diagnosis, analytic and management framework for Software-Defined Networks.  
It provides a graphical user interface to illustrate information on flows, devices and statistic data.  

Features of OmniUI includes:  
- Compatible with various controller
- Forwarding path of specific flow
- Topology view with traffic information
- Statistic data of specific flow
- Statistic data of specific port/link
- Dynamic flow migration
- [Demo Video](http://vimeo.com/mcchan/omniui)

###Prerequisite###
1. Install essential packages  
**Floodlight**  
$ `sudo apt-get install build-essential default-jdk ant python-dev git python-virtualenv`  
**Ryu**  
$ `sudo apt-get install build-essential python-dev git python-virtualenv python-eventlet python-routes python-webob python-paramiko`

2. Update existing packages  
$ `sudo apt-get update`  
$ `sudo pip install --upgrade pip virtualenv`  
$ `sudo pip install flask flask_cors gevent pymongo`

3. Download & Install Mininet  
$ `git clone git://github.com/mininet/mininet`  
$ `mininet/util/install.sh -a`

4. Clone OmniUI from Github  
$ `git clone https://github.com/dlinknctu/OmniUI.git -b dev`

5. Install MongoDB  
    * Please refer to [Install MongoDB](http://docs.mongodb.org/manual/installation/)  

6. Modify OmniUI database credentials  
$ `gedit ~/OmniUI/core/config.json`  
	**Modify the following (UIPusher and DbCollection section):**  
	`"ControllerType":"<CONTROLLER_NAME>"` **If using Ryu, fill ControllerType as "floodlight"**  
	`"dbip":"<YOUR_DATABASE_IP_ADDR>",`  
	`"dbport":"<YOUR_DATABASE_IP_PORT>",`  
	`"db":"<YOUR_DATABASE_NAME>",`  
	`"user":"<YOUR_DATABASE_LOGIN_USERNAME>"`  
	`"password":"<YOUR_DATABASE_LOGIN_PASSWORD>"`

###Installation & Execution###
- Installation & Execution of controller adapter  
    * Please refer to `/adapter/<controller>/README.md`

###Current Progress (dev branch)###
```
feature\controller | Floodlight | POX | Trema | Ryu
---------------------------------------------------
OpenFlow version   | 1.0        | 1.0 | 1.3   | 1.0
Port Statistic     | V          | V   |       | V
Flow Statistic     | V          | V   |       | V
Topology View      | V          | V   |       | V
Path Highlight     | V          | V   |       | V
Flow Modify        | V          |     |       |
General Statistic  | V          | V   |       | V
UDS                |            |     | V     | 
```

