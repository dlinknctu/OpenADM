OmniUI Ryu Adapter 
-------------------------
Ryu adapter module for OmniUI

###Installation###
1. Download the Ryu Controller  
$ `git clone git://github.com/osrg/ryu.git`  
$ `cd ryu; sudo python ./setup.py install`

###Execution###
1. Compile OmniUI core  
$ `cd ~; python ~/OmniUI/core/core.py`  
**Successful compilation starts the OmniUI core**  

2. Run the Ryu Controller (Using a 2nd Terminal)  
$ `PYTHONPATH=. ~/ryu/bin/ryu-manager --observe-links ~/OmniUI/adapter/ryu/omniui/omniui.py ~/ryu/ryu/app/simple_switch.py`

3. Run a simple Mininet topology (Using a 3rd Terminal)  
$ `sudo mn --topo single,3 --mac --switch ovsk --controller remote`

4. Start-up OmniUI Web UI (Using a 4th Terminal)  
$ `firefox ~/OmniUI/webui/index.html`

###How to execution Ryu 1.3###
1. Emulate 1 switch with 3 hosts<br/> 
$ `sudo mn --topo single,3 --mac --controller remote --switch ovsk,protocols=OpenFlow13`

2. Make a switch supports OF 1.3<br/>
$ `sudo ovs-vsctl set bridge s1 protocols=OpenFlow13`

3. Initiating the Ryu controller, Ryu app, OmniUI adapter and Simple Switch 1.3 application<br/> 
$ `ryu-manager --observe-links ~/OmniUI/adapter/ryu/omniui/omniui.py ~/ryu/ryu/app/simple_switch_13.py`

4. An example of adding flow<br/> 
$ `curl -X POST -d '{"command": "ADD","switch": "00:00:00:00:00:00:00:01","idleTimeout": "3600","hardTimeout": "3600","priority": "1","ingressPort": "1","srcMac": "00:00:00:00:00:01","dstMac": "00:00:00:00:00:02","dlType": "2048","vlan": "0","vlanP": "0","netProtocol": "17","ip_proto": "17","srcIP": "0.0.0.0/0","dstIP": "0.0.0.0/0","srcPort": "0","dstPort": "0","actions": "OUTPUT=2","dstIPMask": "0","srcIPMask": "0","active": "true","tosBits": "0"}' http://localhost:8080/wm/omniui/add/json` 

5. Check flow in mininet<br/> 
$ `dpctl dump-flows -O OpenFlow13`
