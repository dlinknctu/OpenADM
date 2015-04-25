package net.floodlightcontroller.omniui;

import java.util.Collection;
import java.util.Map;
import java.util.HashMap;

import org.openflow.protocol.OFMessage;
import org.openflow.protocol.OFType;

import net.floodlightcontroller.core.FloodlightContext;
import net.floodlightcontroller.core.module.FloodlightModuleContext;
import net.floodlightcontroller.core.module.FloodlightModuleException;
import net.floodlightcontroller.core.module.IFloodlightModule;
import net.floodlightcontroller.core.module.IFloodlightService;
import net.floodlightcontroller.restserver.IRestApiService;
import net.floodlightcontroller.core.IOFMessageListener;
import net.floodlightcontroller.core.IOFSwitch;

import net.floodlightcontroller.core.IFloodlightProviderService;
import net.floodlightcontroller.core.IOFSwitchListener;
import net.floodlightcontroller.core.ImmutablePort;
import org.openflow.protocol.OFFlowRemoved;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.Set;
import org.openflow.util.HexString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import net.floodlightcontroller.linkdiscovery.ILinkDiscoveryListener;
import net.floodlightcontroller.linkdiscovery.ILinkDiscoveryService;
import java.util.List;

public class OmniUI implements IFloodlightModule,IOFMessageListener,IOFSwitchListener,ILinkDiscoveryListener  {
	
	protected IFloodlightProviderService floodlightProvider;
	protected ILinkDiscoveryService linkDiscoveryService;
	protected IRestApiService restApi;
	protected static Logger logger;
	public static final String StaticFlowName = "omniui";

	// HTTP POST request
	private void sendPost(String url, String data) throws Exception {
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
		con.setRequestMethod("POST");
		con.setDoOutput(true);
		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
		wr.writeBytes(data);
		wr.flush();
		wr.close();

		int responseCode = con.getResponseCode();
		logger.info("Sending 'POST' request to URL : " + url);
		logger.info("Post parameters : " + data);
		logger.info("Response Code : " + responseCode);

		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();

		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();
		System.out.println(response.toString());
	}

	@Override
	public String getName() {
		// TODO Auto-generated method stub
		return StaticFlowName;
	}

	@Override
	public boolean isCallbackOrderingPrereq(OFType type, String name) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isCallbackOrderingPostreq(OFType type, String name) {
		// TODO Auto-generated method stub
		return(type.equals(OFType.FLOW_REMOVED) && name.equals("staticflowentry"));
		//return false;
	}

	@Override
	public Collection<Class<? extends IFloodlightService>> getModuleServices() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Map<Class<? extends IFloodlightService>, IFloodlightService> getServiceImpls() {
		// TODO Auto-generated method stub
		return null;
	}

	/*
	 *
	 * @brief: Tell the module loader we depend on
	 */
	@Override
	public Collection<Class<? extends IFloodlightService>> getModuleDependencies() {
		// TODO Auto-generated method stub
		Collection<Class<? extends IFloodlightService>> l = new ArrayList<Class<? extends IFloodlightService>>();
		l.add(IFloodlightProviderService.class);
		l.add(IRestApiService.class);
		return l;
	}

	@Override
	public void init(FloodlightModuleContext context)
			throws FloodlightModuleException {
			linkDiscoveryService = context.getServiceImpl(ILinkDiscoveryService.class);
			floodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);
			restApi = context.getServiceImpl(IRestApiService.class);
			logger = LoggerFactory.getLogger(OmniUI.class);
	}

	@Override
	public void startUp(FloodlightModuleContext context) {
		// TODO Auto-generated method stub
		linkDiscoveryService.addListener(this);
		floodlightProvider.addOFMessageListener(OFType.FLOW_MOD, this);
		floodlightProvider.addOFMessageListener(OFType.FLOW_REMOVED, this);
		floodlightProvider.addOFMessageListener(OFType.BARRIER_REPLY, this);
		floodlightProvider.addOFSwitchListener(this);
		restApi.addRestletRoutable(new OmniUIWebRoutable());
	}
	
	@Override
	public net.floodlightcontroller.core.IListener.Command receive(IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {
	
		switch (msg.getType()) {
        case FLOW_MOD:
			logger.info("FLOW MOD MSG : {}",msg);
			return Command.CONTINUE;
		case FLOW_REMOVED:
			OFFlowRemoved msg2 = (OFFlowRemoved) msg;
			if (msg2.getReason() == OFFlowRemoved.OFFlowRemovedReason.OFPRR_DELETE){
				logger.info("FLOW REMOVED MSG : {} ; from switch : {}",msg2,sw);
				FlowModResource.setMsg();
			}
			return Command.CONTINUE;
		case BARRIER_REPLY:
			logger.info("BARRIER REPLY : {}",msg);
			FlowModResource.setMsg2();
			return Command.CONTINUE;
        default:
            return Command.CONTINUE;
		}
	}
	
    @Override
    public void switchAdded(long switchId) {
        logger.info("SWITCH ADD : {}",HexString.toHexString(switchId));
    }

    @Override
    public void switchRemoved(long switchId) {
        logger.info("SWITCH REMOVE : {}",HexString.toHexString(switchId));
        String url = "http://localhost:5567/publish/deldevice";
        String data = String.format("{'dpid':'%s'}", HexString.toHexString(switchId));
        try{
            sendPost(url, data);
         }catch (Exception e){
            logger.info("sendPost failed.");
         }
    }

    @Override
    public void switchActivated(long switchId) {
        logger.info("SWITCH ACTIVATED : dpid {}",HexString.toHexString(switchId));
        FlowModResource.sendEntriesToSwitch(switchId);
        String url = "http://localhost:5567/publish/adddevice";
        String data = String.format("{'dpid':'%s'}", HexString.toHexString(switchId));
        try{
            sendPost(url, data);
         }catch (Exception e){
            logger.info("sendPost failed.");
         }
    }

    @Override
    public void switchChanged(long switchId) {
        logger.info("SWITCH CHANGED : dpid {}",HexString.toHexString(switchId));
    }

    @Override
    public void switchPortChanged(long switchId,
                                  ImmutablePort port,
                                  IOFSwitch.PortChangeType type) {
        String url = "";
        if(type == IOFSwitch.PortChangeType.ADD || type == IOFSwitch.PortChangeType.UP){
            url = "http://localhost:5567/publish/addport";
        }else if(type == IOFSwitch.PortChangeType.DELETE || type == IOFSwitch.PortChangeType.DOWN){
            url = "http://localhost:5567/publish/delport";
        }else{
            logger.info("No process IOFSwitch.PortChangeType.OTHER_UPDATE");
            return;
        }
        String data = String.format("{'dpid':'%s', 'port':'%s'}", HexString.toHexString(switchId), port.getPortNumber());
        try{
            sendPost(url, data);
         }catch (Exception e){
            logger.info("sendPost failed.");
         }

    }

    @Override
    public void linkDiscoveryUpdate(List<LDUpdate> updateList) {
        logger.info("LINK UPDATE 1: {}", updateList);
        for(int i = 0; i < updateList.size(); i++){
            String url = "";
            String data = "";
            switch(updateList.get(i).getOperation()){
                case LINK_UPDATED:
                    url = "http://localhost:5567/publish/addlink";
                    data = String.format("{'src_dpid':'%s', 'dst_dpid':'%s', 'src_port':'%s', 'dst_port':'%s'}", HexString.toHexString(updateList.get(i).getSrc()), HexString.toHexString(updateList.get(i).getDst()), updateList.get(i).getSrcPort(), updateList.get(i).getDstPort());
                    break;
                case LINK_REMOVED:
                    url = "http://localhost:5567/publish/dellink";
                    data = String.format("{'src_dpid':'%s', 'dst_dpid':'%s', 'src_port':'%s', 'dst_port':'%s'}", HexString.toHexString(updateList.get(i).getSrc()), HexString.toHexString(updateList.get(i).getDst()), updateList.get(i).getSrcPort(), updateList.get(i).getDstPort());
                    break;
                case PORT_UP:
                    url = "http://localhost:5567/publish/addport";
                    data = String.format("{'dpid':'%s', 'port':'%s'}", HexString.toHexString(updateList.get(i).getSrc()), updateList.get(i).getSrcPort());
                    break;
                default:
                    break;
            }
            try{
                sendPost(url, data);
            }catch (Exception e){
                logger.info("sendPost failed.");
            }
        }
    }

    @Override
    public void linkDiscoveryUpdate(LDUpdate update) {
        logger.info("LINK UPDATE 2: {}", update);
    }

}
