package org.winlab.omniui;

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Properties;
import java.io.FileReader;

/**
 *  Copyright Winlab, NCTU
 *  @author Ze-Yan LIn
 *  Created on 2016/1/24.
 *  This is class handle send message.
 */
public class SendMsg {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    public SendMsg() {
    }

    /**
     *
     * @param obj : Link, Device, Host, Packet, Port, Flow, Controller
     * @param action: addlink, dellink, addhost, delhost...etc
     * @param type: String of obj class name.
     * @return true or false
     */
    public boolean PostMsg(Object obj, String action, String type) {
        if (Omniui.host == "") { 
            log.info("no IP");
            return false;
        }
        String host = Omniui.host;
        log.info("try post");
        Gson gson = new Gson();
        switch (type) {
            case "Link":
                try {
                    return request(new URL(host + action), gson.toJson((Link)(obj)));
                } catch (Exception e) {
                    log.error("error postMsg : " + e.toString());
                    return false;
                }
            case "Device":
                try {
                    return request(new URL(host + action), gson.toJson((Device)(obj)));
                } catch (Exception e) {
                    log.error("Error PostMsg : " + e.toString());
                    return false;
                }
            case "Host":
                try {
                    return request(new URL(host + action), gson.toJson((Host)(obj)));
                } catch (Exception e) {
                    log.error("Error PostMsg : " + e.toString());
                    return false;
                }
            case "Packet":
                try {
                    return request(new URL(host + action), gson.toJson((Packet)(obj)));
                } catch (Exception e) {
                    log.error("Error PostMsg : " + e.toString());
                    return false;
                }
            case "PortStatistic":
                try {
                    return request(new URL(host + action), gson.toJson((PortStatistic)(obj)));
                } catch (Exception e) {
                    log.error("Error PostMsg : " + e.toString());
                    return false;
                }
            case "Flow":
                try {
                    return request(new URL(host + action), gson.toJson((Flow)(obj)));
                } catch (Exception e) {
                    log.error("Error PostMsg : " + e.toString());
                    return false;
                }
            case "Controller":
                try {
                    return request(new URL(host + action), gson.toJson((Controller)(obj)));
                } catch (Exception e) {
                    log.error("Error PostMsg : " + e.toString());
                    return false;
                }
            default:
                log.error("error type" + type + ", "+ host);
                return false;
        }
    }
    private boolean request(URL url, String data) {
        try {
            log.info(url.toString());
            log.info(data);
            HttpURLConnection http = (HttpURLConnection) url.openConnection();
            http.setRequestMethod("POST");
            http.setRequestProperty("Content-Type", "application/json");
            http.setDoOutput(true);
            http.connect();
            OutputStream outputStream = http.getOutputStream();
            outputStream.write(data.getBytes());
            outputStream.flush();
            outputStream.close();
            InputStream input = http.getInputStream();
            log.info(input.toString());
            http.disconnect();
            return true;
        } catch (Exception e) {
            log.error("error request : " + e.toString());
            return false;
        }
    }
}
