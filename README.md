OmniUI
------
A diagnosis, analytic and management framework for SDN
http://www.slideshare.net/rascov/20140824-omni-ui

##Introduction##
OmniUI is a diagnosis, analytic and management framework for Software-Defined Network. It provides graphical user interface to illustrate information of flows, devices and statistic data. Features of OmniUI includes:

- Compatible with various controller
- Forwarding path of specific flow
- Topology view with traffic information
- Statistic data of specific flow
- Statistic data of specific port/link
- Dynamic flow migration
- [Demo Video](http://vimeo.com/mcchan/omniui)

##Installation##
- Install controller adapter
    * Please refer to `/adapter/<controller>/README.md`
- Install web UI
    1. Install a web server (e.g. Apache)
    2. Simply copy `/webui` into root directory of website
- Install MongoDB 
    * Please refer to [Install MongoDB](http://docs.mongodb.org/manual/installation/)
- Modify the config file
    * `core/config.json`: Update `dbip`, `user` and `password` in both UIPusher and DbCollection section
    
    if you are access webui from outside localhost (optional)
    * `core/core.py`: Update `Access-Control-Allow-Origin`
    * `webui/js/omniui.js`: Update IP in `function loadJSONP()` and `function sendFlow()`

##Current Progress (on dev branch)##
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
