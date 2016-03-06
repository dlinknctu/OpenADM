package org.winlab.omniui;

/**
 * Created by zylin on 2016/1/30.
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
