package org.winlab.omniui;

import java.util.ArrayList;
import java.util.List;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *   Abstraction of host
 */
public class Host {
    private String controller = Omniui.controller_name;
    private String mac = "";
    private String vlan = "";
    private String type = "wired";
    private String ip = "";
    private Location location;
    private class Location {
        String dpid;
        String port;
        public Location(String dpid, String port) {
            this.dpid = dpid;
            this.port = port;
        }
    }
    public void setMac(String mac) {this.mac = mac;}
    public void setVlan(String vlan) {this.vlan = vlan;}
    public void setType(String type) {this.type = type;}
    public void setIp(String ip) {this.ip = ip;}
    public void addLocation(String dpid, String port) {
        location = new Location(dpid, port);
    }
}
