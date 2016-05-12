package org.winlab.omniui;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
/** Copyright WinLab, NCTU
 *  @author Ze-Yan Lin
 *   Created on 2016/1/24.
 *   This class is controller host info
 */

public class Controller {
    private String controller = Omniui.controller_name;
    private String type = "ONOS";
    private String mem_total = "";
    private String mem_used = "";
    private String mem_free = "";
    private String os = "";
    private String cpu = "";
    public Controller() {
        os = getOS();
        getFreeMem();
        cpu = getLoad();
    }
    /* Get the operation system info */
    private String getOS(){
        try {
            Process p = Runtime.getRuntime().exec("cat /etc/issue");
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            return stdInput.readLine().replaceAll("\\\\\\w+", "");
        }
        catch (Exception e) {
            return "OS info failed";
        }
    }
    /* Get the memory info */
    private void getFreeMem() {
        try {
            Process p = Runtime.getRuntime().exec("free -h");
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            stdInput.readLine();
            String freeLine = stdInput.readLine();
            String freeArray[] = freeLine.split("\\s+");
            String freeMem[] = new String[3];
            mem_total = freeArray[1];
            mem_used = freeArray[2];
            mem_free = freeArray[3];
        }
        catch (Exception e){
            String error[] = new String[3];
            Arrays.fill(error,"free mem info fail");
        }
    }
    /* Get the cpu loading info */
    private String getLoad(){
        try {
            Process p = Runtime.getRuntime().exec("cat /proc/loadavg");
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            return stdInput.readLine().split(" ")[0];
        }
        catch (Exception e) {
            return "loadavg info failed";
        }
    }
}
