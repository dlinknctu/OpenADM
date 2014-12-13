OmniUI Floodlight Adapter 
-------------------------
A floodlight adapter module for OmniUI

###INSTALLATION###
1. Install some required packages  
$ `sudo apt-get install build-essential default-jdk ant python-dev eclipse git python-virtualenv python-dev`

2. Update all existing packages  
$ `sudo apt-get update`  
$ `sudo pip install --upgrade pip virtualenv`  
$ `sudo pip install flask flask_cors pymongo`

3. Download & Install Mininet  
$ `git clone git://github.com/mininet/mininet`  
$ `mininet/util/install.sh -a`

4. Clone OmniUI from Github  
$ `git clone https://github.com/dlinknctu/OmniUI.git -b dev`

5. Download the Floodlight Controller  
$ `git clone https://github.com/floodlight/floodlight.git`

6. Add OmniUI into Floodlight  
$ `cd floodlight/src/main/java/net/floodlightcontroller/`  
$ `cp -r ~/OmniUI/adapter/floodlight/omniui/ .`

7. Import OmniUI into Floodlight  
	a) $ `gedit ~/floodlight/src/main/resources/META-INF/services/net.floodlightcontroller.core.module.IFloodlightModule`  
	**Add the following to the end of the file**  
	`net.floodlightcontroller.omniui.OmniUI`  
	b) $ `gedit ~/floodlight/src/main/resources/floodlightdefault.properties`  
	**Add the following to the 2nd line of the file**  
	`net.floodlightcontroller.omniui.OmniUI,\`

8. Compile Floodlight  
$ `cd ~/floodlight`  
$ `ant`  
**No error means successful compilation**  

9. Edit Database data in OmniUI core  
$ `cd ~/OmniUI/core`  
$ `gedit config.json`  
	**Change to the following details:**  
	`"ControllerType":"floodlight"`  
	`"dbip":"<Enter your DB IP address>",`  
	`"dbport":"<Enter your DB port>",`  
	`"db":"<Enter your DB name>",`  
	`"user":"<Enter your DB's login username>"`  
	`"password":"<Enter your DB's login password>"`  

10. Compile OmniUI core  
$ `python core.py`  
**No error means it's running**  

10. Run the Floodlight Controller (Using a 2nd Terminal)  
$ `java -jar floodlight/target/floodlight.jar`

11. Run a simple Mininet topology (Using a 3rd Terminal)  
$ `sudo mn --controller=remote --topo tree,depth=2`

12. Start-up OmniUI Web UI  
$ `firefox ~/OmniUI/webui/index.html &`

###MISCELLANEOUS###
1. Properly exit Mininet  
mininet> exit  
$ `sudo mn -c`
