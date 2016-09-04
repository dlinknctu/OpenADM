package org.winlab.omniui;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  Abstraction of port statistic
 */
public class PortStatistic {
    private String controller = Omniui.controller_name;
    private String dpid = "" ;
    private String port = "";
    private String rxbyte = "";
    private String rxpacket = "";
    private String txbyte = "";
    private String txpacket = "";
    public void setDpid(String dpid){this.dpid = dpid;}
    public void setPort(String port){this.port = port;}
    public void setRxbyte(String rxbyte){this.rxbyte = rxbyte;}
    public void setRxpacket(String rxpacket){this.rxpacket = rxpacket;}
    public void setTxbyte(String txbyte){this.txbyte = txbyte;}
    public void setTxpacket(String txpacket){this.txpacket = txpacket;}

}
