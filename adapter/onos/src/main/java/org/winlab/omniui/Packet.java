package org.winlab.omniui;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  Abstraction of packet
 */
public class Packet {
    private String controller = Omniui.controller_name;
    private String dpid = "";
    private String in_port = "";
    private String mac_src = "";
    private String mac_dst = "";
    private String ether_type = "";
    private String ip_src = "";
    private String ip_dst = "";
    private String protocol = "";
    private String port_src = "";
    private String port_dst = "";
    public void setDpid(String dpid){this.dpid = dpid;}
    public void setIn_port(String in_port){this.in_port = in_port;}
    public void setMac_src(String mac_src){this.mac_src = mac_src;}
    public void setMac_dst(String mac_dst){this.mac_dst = mac_dst;}
    public void setEther_type(String ether_type){this.ether_type = ether_type;}
    public void setIp_src(String ip_src){this.ip_src = ip_src;}
    public void setIp_dst(String ip_dst){this.ip_dst = ip_dst;}
    public void setProtocol(String protocol){this.protocol = protocol;}
    public void setPort_src(String port_src){this.port_src = port_src;}
    public void setPort_dst(String port_dst){this.port_dst = port_dst;}

}
