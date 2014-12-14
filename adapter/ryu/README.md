OmniUI Ryu Adapter 
-------------------------
A Ryu adapter module for OmniUI

###INSTALLATION###
1. Install some required packages  
$ `sudo apt-get install build-essential python-dev git python-virtualenv python-eventlet python-routes python-webob python-paramiko`

2. Update all existing packages  
$ `sudo apt-get update`  
$ `sudo pip install --upgrade pip virtualenv`  
$ `sudo pip install flask flask_cors pymongo`

3. Download & Install Mininet  
$ `git clone git://github.com/mininet/mininet`  
$ `mininet/util/install.sh -a`

4. Clone OmniUI from Github  
$ `git clone https://github.com/dlinknctu/OmniUI.git -b dev`

5. Download the Ryu Controller  
$ `git clone git://github.com/osrg/ryu.git`  
$ `cd ryu; sudo python ./setup.py install`

6. Edit database credentials in OmniUI core  
$ `gedit ~/OmniUI/core/config.json`  
	**Change to the following details:**  
	`"ControllerType":"floodlight"`  
	`"dbip":"<Enter your DB IP address>",`  
	`"dbport":"<Enter your DB port>",`  
	`"db":"<Enter your DB name>",`  
	`"user":"<Enter your DB's login username>"`  
	`"password":"<Enter your DB's login password>"`  

7. Compile OmniUI core  
$ `python ~/OmniUI/core/core.py`  
**No error means it's running**  

###EXECUTION###
8. Run the Ryu Controller (Using a 2nd Terminal)  
$ `PYTHONPATH=. ~/ryu/bin/ryu-manager --observe-links ~/OmniUI/adapter/ryu/omniui/omniui.py ~/ryu/ryu/app/simple_switch.py`

9. Run a simple Mininet topology (Using a 3rd Terminal)  
$ `sudo mn --topo single,3 --mac --switch ovsk --controller remote`

10. Start-up OmniUI Web UI (Using a 4th Terminal)  
$ `firefox ~/OmniUI/webui/index.html .`
