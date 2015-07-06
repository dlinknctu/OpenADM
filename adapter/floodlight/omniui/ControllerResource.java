package net.floodlightcontroller.omniui;

import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;
import java.io.InputStreamReader;
import java.io.LineNumberReader;

public class ControllerResource extends ServerResource {
    @Get()
    public String retrieve(){
        try{
            String cmd = "cat /etc/issue";
            Process process = Runtime.getRuntime().exec(cmd);
            LineNumberReader br = new LineNumberReader(new InputStreamReader(process.getInputStream()));
            String os = br.readLine();

            cmd = "free -h";
            process = Runtime.getRuntime().exec(cmd);
            br = new LineNumberReader(new InputStreamReader(process.getInputStream()));
            String line, total="", used="", free="";
            for(int i=0; i<2; i++){
                line = br.readLine();
                if(i==1){
                    String [] array = line.split("\\s+");
                    total = array[1];
                    used = array[2];
                    free = array[3];
                }
            }
            cmd = "cat /proc/loadavg";
            process = Runtime.getRuntime().exec(cmd);
            br = new LineNumberReader(new InputStreamReader(process.getInputStream()));
            line = br.readLine();
            String cpuload = line.split(" ")[0];

            String data = String.format("{\"controller\":\"floodlight\", \"os\":\"%s\", \"mem_total\":\"%s\", \"mem_used\":\"%s\", \"mem_free\":\"%s\", \"cpu\":\"%s\"}", os, total, used, free, cpuload);
            return data;
        }catch (Exception e){
            e.printStackTrace();
        }
        return "controller info faild";
    }
}
