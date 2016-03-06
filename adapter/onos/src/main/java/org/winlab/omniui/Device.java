package org.winlab.omniui;

/**
 * Created by zylin on 2016/1/29.
 */
public class Device {
    private String controller = Omniui.controller_name;
    private String dpid;
    public void setDpid(String dpid) {
        this.dpid = dpid;
    }
}
