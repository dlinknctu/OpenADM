package org.winlab.omniui;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  Abstraction of port
 */
public class Port {
    private String controller = Omniui.controller_name;
    private String dpid;
    private String port;
    public void setDpid(String dpid) {
        this.dpid = dpid;
    }
    public void setPort(String port) {
        this.port = port;
    }
}
