OmniUI Ryu Adapter 
-------------------------
Ryu adapter module for OmniUI

###Installation###
1. Download the Ryu Controller  
$ `git clone git://github.com/osrg/ryu.git`  
$ `cd ryu; sudo python ./setup.py install`

###Execution###
1. Run the Ryu Controller (Using a 2nd Terminal)  
$ `PYTHONPATH=. ~/ryu/bin/ryu-manager --observe-links ~/OmniUI/adapter/ryu/omniui/omniui.py ~/ryu/ryu/app/simple_switch.py`

2. Run a simple Mininet topology (Using a 3rd Terminal)  
$ `sudo mn --topo single,3 --mac --switch ovsk --controller remote`

3. Start-up OmniUI Web UI (Using a 4th Terminal)  
$ `firefox ~/OmniUI/webui/index.html`

