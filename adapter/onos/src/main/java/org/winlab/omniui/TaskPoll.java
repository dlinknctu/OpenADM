package org.winlab.omniui;
/** Copyright WinLab, NCTU
 *  @author Ze-Yan Lin
 */

import org.apache.felix.scr.annotations.Activate;
import org.apache.felix.scr.annotations.Deactivate;
import org.apache.felix.scr.annotations.Component;
import org.onlab.rest.BaseResource;
import org.onosproject.net.Device;
import org.onosproject.net.device.DeviceService;
import org.onosproject.net.device.PortStatistics;
import org.onosproject.net.flow.FlowEntry;
import org.onosproject.net.flow.FlowRuleService;
import org.onosproject.net.flow.TrafficSelector;
import org.onosproject.net.flow.criteria.*;
import org.onosproject.net.flow.instructions.Instruction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.ArrayList;

/**  Create By Ze-Yan Lin on 2016/1/30.
 *  This class send info to OpenADM core regular
 */
@Component(immediate = true)
public class TaskPoll extends BaseResource {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private int time_interval = 5000;
    private Timer timer_port = new Timer();
    private Timer timer_flow = new Timer();
    private Timer timer_controller = new Timer();
    @Activate
    protected void activate() {
        timer_port.scheduleAtFixedRate(new TimerTask() {
            public void run() {
                Iterable<org.onosproject.net.Device> devices = get(DeviceService.class).getDevices();
                SendMsg sendMsg = new SendMsg();
                for (Device d : devices) {
                    Iterable<PortStatistics> portStatistics = get(DeviceService.class).getPortStatistics(d.id());
                    for (PortStatistics p : portStatistics) {
                        PortStatistic portStatistic = new PortStatistic();
                        portStatistic.setDpid(d.id().toString());
                        portStatistic.setPort(String.valueOf(p.port()));
                        portStatistic.setRxbyte(String.valueOf(p.bytesReceived()));
                        portStatistic.setRxpacket(String.valueOf(p.packetsReceived()));
                        portStatistic.setTxbyte(String.valueOf(p.bytesSent()));
                        portStatistic.setTxpacket(String.valueOf(p.packetsSent()));
                        sendMsg.PostMsg((Object)(portStatistic), "port", "PortStatistic");
                    }
                }
            }
        }, 0, time_interval);

        timer_flow.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                Iterable<org.onosproject.net.Device> devices = get(DeviceService.class).getDevices();
                SendMsg sendMsg = new SendMsg();
                for (Device d : devices) {
                    Iterable<FlowEntry> flowEntriess = get(FlowRuleService.class).getFlowEntries(d.id());
                    Flow flow = new Flow();
                    flow.setDpid(d.id().toString());
                    for(FlowEntry f:flowEntriess) {
                        TrafficSelector tSelector = f.selector();
                        String ingressPort = tSelector.getCriterion(Criterion.Type.IN_PORT) == null ? "": ((PortCriterion) tSelector.getCriterion(Criterion.Type.IN_PORT)).port().toString() ;
                        String dstMac = tSelector.getCriterion(Criterion.Type.ETH_DST) == null ? "" : ((EthCriterion) tSelector.getCriterion(Criterion.Type.ETH_DST)).mac().toString();
                        String srcMac = tSelector.getCriterion(Criterion.Type.ETH_SRC) == null ? "" : ((EthCriterion) tSelector.getCriterion(Criterion.Type.ETH_SRC)).mac().toString();
                        String dstIP = tSelector.getCriterion(Criterion.Type.IPV4_DST) == null ? "" : ((IPCriterion) tSelector.getCriterion(Criterion.Type.IPV4_DST)).ip().toString();
                        String dstIPMask = "x";
                        String srcIP = tSelector.getCriterion(Criterion.Type.IPV4_SRC) == null ? "" : ((IPCriterion) tSelector.getCriterion(Criterion.Type.IPV4_SRC)).ip().toString();
                        String srcIPMask = "x";
                        String netProtocol = tSelector.getCriterion(Criterion.Type.IP_PROTO) == null ? "" : ((IPCriterion) tSelector.getCriterion(Criterion.Type.IP_PROTO)).type().toString();
                        String dstPort = tSelector.getCriterion(Criterion.Type.TCP_DST) == null ? "" : ((TcpPortCriterion) tSelector.getCriterion(Criterion.Type.TCP_DST)).tcpPort().toString();
                        String srcPort = tSelector.getCriterion(Criterion.Type.TCP_SRC) == null ? "" : ((TcpPortCriterion) tSelector.getCriterion(Criterion.Type.TCP_SRC)).tcpPort().toString();
                        String vlan = tSelector.getCriterion(Criterion.Type.VLAN_VID) == null ? "" : ((VlanIdCriterion) tSelector.getCriterion(Criterion.Type.VLAN_VID)).vlanId().toString();
                        String vlanP = tSelector.getCriterion(Criterion.Type.VLAN_PCP) == null ? "" : String.valueOf(((VlanPcpCriterion) tSelector.getCriterion(Criterion.Type.VLAN_PCP)).priority());
                        String wildcards = "";
                        String tosBits = tSelector.getCriterion(Criterion.Type.IP_ECN) == null ? "" : String.valueOf(((IPEcnCriterion) tSelector.getCriterion(Criterion.Type.IP_ECN)).ipEcn());
                        String counterByte = String.valueOf(f.bytes());
                        String counterPacket  = String.valueOf(f.packets());
                        String idleTimeout = "x";
                        String hardTimeout = "x";
                        String priority = String.valueOf(f.priority());
                        String duration = String.valueOf(f.life());
                        String dlType = "x";
                        List<Instruction> action = f.treatment().allInstructions();
                        List<Action> actions = new ArrayList<Action>();
			for(int i=0;i<action.size();i++){
				Action a = new Action();
				a.type = action.get(i).type().toString();
				a.value = action.get(i).toString().replace(a.type.toString(),"");
			}
                        flow.addFlow(ingressPort, dstMac, srcMac, dstIP, dstIPMask, srcIP, srcIPMask, netProtocol,
                                dstPort, srcPort, vlan, vlanP, wildcards, tosBits, counterByte, counterPacket, idleTimeout,
                                hardTimeout, priority, duration, dlType, actions);
                    }
                    sendMsg.PostMsg((Object)(flow), "flow", "Flow");
                }
            }
        }, 0, time_interval);

        timer_controller.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                Controller controller = new Controller();
                SendMsg sendMsg = new SendMsg();
                sendMsg.PostMsg((Object)(controller), "controller", "Controller");
            }
        }, 0, time_interval);
    }
    @Deactivate
    protected void deactivate() {
        timer_controller.cancel();
        timer_flow.cancel();
        timer_port.cancel();
    }
}
