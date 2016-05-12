package org.winlab.omniui;

import java.util.ArrayList;
import java.util.List;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *   Abstraction of link
 */
public class Link {
    private String controller = Omniui.controller_name;
    private List<link> link = new ArrayList<link>();
    private class link {
        String dpid;
        String port;
        public link(String dpid, String port){
            this.dpid = dpid;
            this.port = port;
        }
    }
    public void newLink(String dpid, String port) {
        this.link.add(new link(dpid, port));
    }
}
