OpenADM [![Build Status](https://travis-ci.org/dlinknctu/OmniUI.svg?branch=dev)](https://travis-ci.org/dlinknctu/OmniUI)
------
An opensource Aanalytic, Diagnosis and Management framework for SDN.
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

###Quickstart using Docker image###
1. Pull Docker image from Docker Hub <br/>
  `docker pull dlinknctu/openadm`

2. Run Docker container <br/>
  `docker run -itdP --name openadm dlinknctu/openadm /bin/bash`

3. Check port forwarding <br/>
  ```
  docker port openadm
  # 5567 -> 32773 OpenADM core
  # 6633 -> 32772 OpenFlow
  # 8000 -> 32771  UI
  ```
4. Setup IP address <br/>
  `docker exec openadm /root/omniui/run.sh setup 10.211.55.3 32773` <br/>
  Note: The IP should be the one of Docker host instead of containter. The port should be the one mapped to port 5567

5. Start controller, core and UI <br/>
  ```
  docker exec -it openadm /root/floodlight/floodlight.sh
  docker exec -it openadm omniui
  docker exec -it openadm bash -c "cd /root/omniui/ui && npm run dev"
  ```

6. Connect Mininet to controller <br/>
  `sudo mn --mac --topo=tree,2 --controller=remote,ip=10.211.55.3,port=32772` <br/>
  Note: The IP should be the one of Docker host instead of containter. The port should be the one mapped to port 6633

7. Access web UI <br/>
  `http://10.211.55.3:32771` <br/>
  Note: The IP should be the one of Docker host instead of containter. The port should be the one mapped to port 8000

###Prerequisite###
1. Install essential packages  
**Floodlight**  
$ `sudo apt-get install build-essential default-jdk ant python-dev git python-virtualenv`  
**Ryu**  
$ `sudo apt-get install build-essential python-dev git python-virtualenv python-eventlet python-routes python-webob python-paramiko`

2. Update existing packages  
$ `sudo apt-get update`  
$ `sudo pip install --upgrade pip virtualenv`  

3. Download & Install Mininet  
$ `git clone git://github.com/mininet/mininet`  
$ `mininet/util/install.sh -a`

4. Clone OmniUI from Github  
$ `git clone https://github.com/dlinknctu/OmniUI.git -b dev`

5. Install MongoDB  
    * Please refer to [Install MongoDB](http://docs.mongodb.org/manual/installation/)  

###Installation & Execution of OmniUI Core###
1. Modify OmniUI database credentials  
$ `gedit ~/OmniUI/core/etc/config.json`  
    **Modify the following (UIPusher and DbCollection section):**  
    `"ControllerType":"<CONTROLLER_NAME>"` **If using Ryu, fill ControllerType as "floodlight"**  
    `"dbip":"<YOUR_DATABASE_IP_ADDR>",`  
    `"dbport":"<YOUR_DATABASE_IP_PORT>",`  
    `"db":"<YOUR_DATABASE_NAME>",`  
    `"user":"<YOUR_DATABASE_LOGIN_USERNAME>"`  
    `"password":"<YOUR_DATABASE_LOGIN_PASSWORD>"`

2. Install OmniUI core and dependencies
$ `cd ~/OmnuUI/core/`
$ `sudo python setup.py install`

3. Run OmniUI core
$ `/usr/local/bin/omniui`

###Installation & Execution of Controllers###
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

