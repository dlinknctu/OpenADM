package org.winlab.omniui;

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;


/**
 * Created by zylin on 2016/1/25.
 */
public class SendMsg {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private String host = "http://127.0.0.1/publish/";
    public boolean PostMsg(Object obj, String action, String type) {
        log.error("try post");
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
            case "Port":
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
                log.error("error type");
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
