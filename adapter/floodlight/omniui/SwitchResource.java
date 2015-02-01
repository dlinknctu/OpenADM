package net.floodlightcontroller.omniui;

import java.util.ArrayList;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.lang.Thread.State;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.Future;

import java.util.Collections;

import net.floodlightcontroller.core.internal.IOFSwitchService;

import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;

import net.floodlightcontroller.core.IOFSwitch;
import net.floodlightcontroller.core.annotations.LogMessageDoc;

import org.projectfloodlight.openflow.types.DatapathId;
import org.projectfloodlight.openflow.types.OFPort;
import org.projectfloodlight.openflow.types.TableId;
import org.projectfloodlight.openflow.util.HexString;
import org.projectfloodlight.openflow.protocol.match.Match;
import org.projectfloodlight.openflow.protocol.OFFeaturesReply;
import org.projectfloodlight.openflow.protocol.OFStatsReply;
import org.projectfloodlight.openflow.protocol.OFStatsType;
import org.projectfloodlight.openflow.protocol.OFStatsRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.util.concurrent.ListenableFuture;

public class SwitchResource extends ServerResource {
    protected static Logger log =
                LoggerFactory.getLogger(SwitchResource.class);

    @Get("json")
    public List<SwitchInfo> retrieve() {

        IOFSwitchService switchService = (IOFSwitchService) getContext().getAttributes().
                        get(IOFSwitchService.class.getCanonicalName());

        Set<DatapathId> switchDpids = switchService.getAllSwitchDpids();

        List<QueryThread> activeThreads = new ArrayList<QueryThread>(switchDpids.size());
        List<QueryThread> pandingRemoveThreads = new ArrayList<QueryThread>(switchDpids.size());
        Map<DatapathId, SwitchInfo > resultMap = new HashMap<DatapathId, SwitchInfo>();
        List<SwitchInfo> resultList = new ArrayList<SwitchInfo>();

        OFStatsType []queryTypes = {OFStatsType.FLOW, OFStatsType.PORT};

        for (DatapathId dpid: switchDpids) {
            SwitchInfo swi = new SwitchInfo(dpid);

            resultMap.put(dpid, swi);

            for (OFStatsType type : queryTypes) {
                QueryThread thread = new QueryThread(dpid, type);
                activeThreads.add(thread);
                thread.start();
            }
        }

        for (int sleepCycles = 0; sleepCycles < 10; ++sleepCycles) {
            for (QueryThread currentThread: activeThreads) {
                if (currentThread.getState()==Thread.State.TERMINATED) {
                    if (resultMap.containsKey(currentThread.getSwitchDpid())) {
                        resultMap.get(currentThread.getSwitchDpid()).setOFStatType(currentThread.getOFStatisticsType(), currentThread.getStatisticsReply());
                    }

                    pandingRemoveThreads.add(currentThread);
                }
            }

            for (QueryThread removeThread: pandingRemoveThreads) {
                activeThreads.remove(removeThread);
            }
            pandingRemoveThreads.clear();

            if (activeThreads.isEmpty()) {
                break;
            }

            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                log.error("Interrupted while waiting for statistics", e);
            }

        }


        for (SwitchInfo swi : resultMap.values()) {
            resultList.add(swi);
        }

        return resultList;
    }

    protected class QueryThread extends Thread{

        private DatapathId dpid;
        private OFStatsType type;
        private List<OFStatsReply> values = null;

        public QueryThread(DatapathId dpid, OFStatsType type) {
            this.dpid = dpid;
            this.type = type;
        }

        public DatapathId getSwitchDpid() {
            return this.dpid;
        }

        public List<OFStatsReply> getStatisticsReply() {
            return this.values;
        }

        public OFStatsType getOFStatisticsType() {
            return type;
        }

        @Override
        public void run() {

            IOFSwitchService switchService = (IOFSwitchService) getContext().getAttributes().get(IOFSwitchService.class.getCanonicalName());
            IOFSwitch sw = switchService.getSwitch(dpid);
            ListenableFuture<?> future;
            Match match;

            if (null != sw) {
                OFStatsRequest<?> req = null;
                switch (type) {
                    case FLOW:
                        match = sw.getOFFactory().buildMatch().build();
                        req = sw.getOFFactory().buildFlowStatsRequest().setMatch(match).setOutPort(OFPort.ANY).setTableId(TableId.ALL).build();
                        break;
                    case PORT:
                        req = sw.getOFFactory().buildPortStatsRequest().setPortNo(OFPort.ANY).build();
                        break;
                    case AGGREGATE:
                        break;
                    default:
                        log.error("Stats Request Type {} not implemented yet", type.name());
                }

                try {
                    if (null != req) {
                        future = sw.writeStatsRequest(req);
                        values = (List<OFStatsReply>) future.get(10, TimeUnit.SECONDS);
                    }
                } catch (Exception e) {
                        log.error("Failure retrieving statistics from switch " + sw, e);
                }
            }
        }
    }
}
