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
import net.floodlightcontroller.core.types.SwitchMessagePair;

import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;

import net.floodlightcontroller.core.IFloodlightProviderService;
import net.floodlightcontroller.core.IOFSwitch;
import net.floodlightcontroller.core.annotations.LogMessageDoc;

import org.openflow.protocol.OFFeaturesReply;
import org.openflow.protocol.OFMatch;
import org.openflow.protocol.OFPort;
import org.openflow.protocol.OFStatisticsRequest;
import org.openflow.protocol.statistics.OFAggregateStatisticsRequest;
import org.openflow.protocol.statistics.OFFlowStatisticsRequest;
import org.openflow.protocol.statistics.OFPortStatisticsRequest;
import org.openflow.protocol.statistics.OFPortStatisticsReply;
import org.openflow.protocol.statistics.OFQueueStatisticsRequest;
import org.openflow.protocol.statistics.OFStatistics;
import org.openflow.protocol.statistics.OFStatisticsType;
import org.openflow.util.HexString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class SwitchResource extends ServerResource {
    protected static Logger log =
		        LoggerFactory.getLogger(SwitchResource.class);

	@Get("json")
    public List<SwitchInfo> retrieve() {

        IFloodlightProviderService floodlightProvider =
                (IFloodlightProviderService)getContext().getAttributes().
                    get(IFloodlightProviderService.class.getCanonicalName());
		Set<Long> switchDpids = floodlightProvider.getAllSwitchDpids();
		List<QueryThread> activeThreads = new ArrayList<QueryThread>(switchDpids.size());
		List<QueryThread> pandingRemoveThreads = new ArrayList<QueryThread>(switchDpids.size());
		Map<Long, SwitchInfo > resultMap = new HashMap< Long , SwitchInfo>();
		

		OFStatisticsType [] queryTypes = {OFStatisticsType.PORT, OFStatisticsType.FLOW};

		//For each switch, use a thread to query statistics
		List<SwitchInfo> resultList = new ArrayList<SwitchInfo>();
		for(Long dpid: switchDpids){
			log.error("dpid = {}",dpid);
			
			// Create SwitchInfo object, use a Map to store.
			IOFSwitch sw = floodlightProvider.getSwitch(dpid);
			SwitchInfo swi = new SwitchInfo(dpid);
			resultMap.put(dpid,swi);
			

			// Create concurrent thread to query switch inforamtion
			//
			for(OFStatisticsType type : queryTypes){
				QueryThread thread = new QueryThread(dpid,sw,type);
				activeThreads.add(thread);
				thread.start();
			}
		}

		for(int sleepCycles=0; sleepCycles < 10; sleepCycles++){
			for(QueryThread currentThread: activeThreads){
				if(currentThread.getState()==Thread.State.TERMINATED){
					if(resultMap.containsKey(currentThread.getSwitchDpid())){
						resultMap.get(currentThread.getSwitchDpid()).setOFStatisticsType(currentThread.getOFStatisticsType(),currentThread.getStatisticsReply());
					}
					pandingRemoveThreads.add(currentThread);
				}
			}	
			for(QueryThread removeThread: pandingRemoveThreads){
				activeThreads.remove(removeThread);
			}
			pandingRemoveThreads.clear();
			if(activeThreads.isEmpty()){
				break;
			}
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                log.error("Interrupted while waiting for statistics", e);
            }

		}
		for(Long dpid: resultMap.keySet()){
			resultList.add(resultMap.get(dpid));
		}
		log.error("size = {}",resultList.size());
        return resultList;
    }

	
	protected class QueryThread extends Thread{
		
		private Long dpid;
		private IOFSwitch sw; 
		private OFStatisticsType type;
		private List<OFStatistics> value;

		public QueryThread(Long dpid, IOFSwitch sw,OFStatisticsType type){
			this.dpid = dpid;
			this.sw = sw;
			this.type = type;
		}

		public Long getSwitchDpid(){
			return this.dpid;
		}
		public List<OFStatistics> getStatisticsReply(){
			return this.value;
		}
		public OFStatisticsType getOFStatisticsType(){
			return type;
		}
		@Override
		public void run(){
			if(this.sw!=null){
				Future<List<OFStatistics>> future;
				OFStatisticsRequest req = new OFStatisticsRequest();
				req.setStatisticType(type);
				int requestLength = req.getLengthU();
				if (type == OFStatisticsType.PORT){
					//Query Port information foe each port,
					//so use the OFPP_NONE as the port_number
					log.error("Port request {}", sw.toString());
					OFPortStatisticsRequest specificReq = new OFPortStatisticsRequest();
					specificReq.setPortNumber(OFPort.OFPP_NONE.getValue());
					req.setStatistics(Collections.singletonList((OFStatistics)specificReq));
					requestLength += specificReq.getLength();
				}
				else if (type == OFStatisticsType.FLOW){
	                
					OFFlowStatisticsRequest specificReq = new OFFlowStatisticsRequest();
	                OFMatch match = new OFMatch();
                	//Query all flow for eacth table
					//use wildcards as 0xffffffff to match all flow
					//use tableId as 0xff to find all table.
					//set output port as OFPP_NONE, means no restriction for matching rules.
					match.setWildcards(0xffffffff);
            	    specificReq.setMatch(match);
        	        specificReq.setOutPort(OFPort.OFPP_NONE.getValue());
    	            specificReq.setTableId((byte) 0xff);
	                req.setStatistics(Collections.singletonList((OFStatistics)specificReq));
	                requestLength += specificReq.getLength();
				}
				req.setLengthU(requestLength);
				try{
					future = sw.queryStatistics(req);
					value = future.get(10,TimeUnit.SECONDS);
				}
				catch (Exception e){
					log.error("err = {}",e.toString());

				}
			}
		}
	}
}
