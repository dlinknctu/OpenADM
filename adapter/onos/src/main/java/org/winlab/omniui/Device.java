package org.winlab.omniui;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  This is class abstraction of device
 */
public class Device {
    private String controller = Omniui.controller_name;
    private String dpid;
    /**
     *
     * @param dpid: dpid of device
     */
    public void setDpid(String dpid) {
        this.dpid = dpid;
    }
}
