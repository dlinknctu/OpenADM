OmniUI
------
A generalized web UI for various SDN controllers

##Introduction##
OmniUI is a debugging and performance evaluation tool for Software-Defined Network. It provides graphical user interface to illustrate information of flows, devices and statistic data. Features of OmniUI includes:

- Compatible with various controller
- Forwarding path of specific flow
- Topology view with traffic information
- Statistic data of specific flow
- Statistic data of specific port/link
- Dynamic flow migration

##Installation##
- Install controller adapter
    * Please refer to `/adapter/<controller>/README.md`
- Install web UI
    1. Install a web server (e.g. Apache)
    2. Simply copy `/webui` into root directory of website
- Install MongoDB 
	1. Please refer to [Install MongoDB](http://docs.mongodb.org/manual/installation/)
