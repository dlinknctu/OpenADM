OpenADM [![Build Status](https://travis-ci.org/dlinknctu/OpenADM.svg?branch=dev)](https://travis-ci.org/dlinknctu/OpenADM) [![](https://images.microbadger.com/badges/version/dlinknctu/openadm.svg)](http://microbadger.com/images/dlinknctu/openadm "Get your own version badge on microbadger.com")
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
  `docker exec openadm /root/openadm/run.sh setup 10.211.55.3 32773` <br/>
  Note: The IP should be the one of Docker host instead of containter. The port should be the one mapped to port 5567

5. Start controller, core and UI <br/>
  ```
  docker exec -it openadm /root/floodlight/floodlight.sh
  docker exec -it openadm omniui
  docker exec -it openadm bash -c "cd /root/openadm/ui && npm run dev"
  ```

6. Connect Mininet to controller <br/>
  `sudo mn --mac --topo=tree,2 --controller=remote,ip=10.211.55.3,port=32772` <br/>
  Note: The IP should be the one of Docker host instead of containter. The port should be the one mapped to port 6633

7. Access web UI <br/>
  `http://10.211.55.3:32771` <br/>
  Note: The IP should be the one of Docker host instead of containter. The port should be the one mapped to port 8000

### Manual Install without Docker

Developers who do not familiar with Docker can install OpenADM natively without Docker. OpenADM has been tested on Ubuntu operating system. Before proceeding further, please be sure you have Ubuntu 14.04 LTS installed and Internet connectivity.

1. Get root privilege:

  ```
  $ sudo su -
  ```

2. Install dependencies:

  ```
  $ echo oracle-java7-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
      apt-get update && \
      apt-get install -y software-properties-common && \
      add-apt-repository -y ppa:webupd8team/java && \
      apt-get update && \
      apt-get install -y git-core wget unzip python-minimal python-pip python-dev oracle-java7-installer ant && \
      rm -rf /var/lib/apt/lists/* && \
      rm -rf /var/cache/oracle-jdk7-installer && \
      wget -qO- https://deb.nodesource.com/setup_5.x | bash - && \
      apt-get install -y nodejs
  ```

3. Drop root privilege, then clone the OpenADM repository under the home directory:

  ```
  $ exit
  $ git clone https://github.com/dlinknctu/openadm.git ~/openadm
  ```

4. Install OpenADM bundle (including Floodlight, OpenADM Core, OpenADM WebUI):

  ```
  $ cd openadm
  $ ./run.sh install
  ```

5. Modify `OpenADMCoreUrl` in `~/openadm/ui/config/config.json` to be the machine's IP address which runs OpenADM Core.

6. Open three terminals and execute the command respectively (you can use `screen` or `tmux`):

  * Floodlight: `~/floodlight/floodlight.sh`
  * OpenADM Core: `~/.local/bin/omniui`
  * OpenADM WebUI: `cd ~/openadm/ui && npm run dev`
  * Mininet (optional): `sudo mn --topo=tree,2 --controller=remote`

  It is recommended that always start the services in this order: **Floodlight -> OpenADM Core -> Mininet (optional)**

  If you're using OpenFlow switches instead of Mininet, please be sure that the OpenFlow switches are properly configured with correct controller, i.e. Floodlight controller's IP and port.

7. Open a browser then connect to the machine's IP address and port 8000 (e.g. 127.0.0.1:8000) which runs OpenADM WebUI.

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
