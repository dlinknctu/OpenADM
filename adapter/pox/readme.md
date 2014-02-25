POX Adapter 

A pox adapter module for OmniUI

Install


1.Put the flow_stats.py and upload_webcore.py in pox/ext
2.upload_webcore.py basically modified by webcore.py and appended some functions to handle RESTful api
3.run with ./pox.py messenger topology forwarding.l2_learning openflow.topology openflow.discovery flow_stats upload_webcore flow_modify
