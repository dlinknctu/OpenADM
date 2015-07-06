package net.floodlightcontroller.omniui;

import java.util.Collection;
import java.util.Map;
import java.util.HashMap;
import java.util.Timer;
import java.util.TimerTask;

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
import org.openflow.protocol.OFPacketIn;
import org.openflow.protocol.OFMatch;
import java.util.ArrayList;
import java.util.Arrays;
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
import net.floodlightcontroller.devicemanager.IDevice;
import net.floodlightcontroller.devicemanager.IDeviceListener;
import net.floodlightcontroller.devicemanager.IDeviceService;
import net.floodlightcontroller.devicemanager.SwitchPort;

import org.json.JSONObject;
import org.json.JSONArray;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

public class OmniUI extends ServerResource implements IFloodlightModule,IOFMessageListener,IOFSwitchListener,ILinkDiscoveryListener {

	protected IFloodlightProviderService floodlightProvider;
	protected ILinkDiscoveryService linkDiscoveryService;
	protected IDeviceService deviceService;
	protected DeviceListenerImpl deviceManager;
	protected IRestApiService restApi;
	protected static Logger logger;
	public static final String StaticFlowName = "omniui";
	protected Timer timer, timer2;
	protected static String controller_name;

	@Post()
	public String retrieve(String name){
		controller_name = name;
		return "OK";
	}

	// HTTP POST request
	private void sendPost(String url, String data) throws Exception {
		if(controller_name == null) return;

		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
		con.setRequestProperty("Content-Type", "application/json");
		con.setRequestMethod("POST");
		con.setDoOutput(true);
		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
		wr.writeBytes(data);
		wr.flush();
		wr.close();

		int responseCode = con.getResponseCode();
		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();

		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();
		//System.out.println(response.toString());
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
		l.add(IDeviceService.class);
		l.add(IRestApiService.class);
		return l;
	}

	@Override
	public void init(FloodlightModuleContext context) throws FloodlightModuleException {
		linkDiscoveryService = context.getServiceImpl(ILinkDiscoveryService.class);
		deviceService = context.getServiceImpl(IDeviceService.class);
		deviceManager = new DeviceListenerImpl();
		floodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);
		restApi = context.getServiceImpl(IRestApiService.class);
		logger = LoggerFactory.getLogger(OmniUI.class);
		timer = new Timer();
		timer.schedule(new PollTask(), 5000, 3000);
		timer2 = new Timer();
		timer2.schedule(new PollTask2(), 5000, 10000);
	}

	@Override
	public void startUp(FloodlightModuleContext context) {
		// TODO Auto-generated method stub
		linkDiscoveryService.addListener(this);
		deviceService.addListener(this.deviceManager);
		floodlightProvider.addOFMessageListener(OFType.FLOW_MOD, this);
		floodlightProvider.addOFMessageListener(OFType.FLOW_REMOVED, this);
		floodlightProvider.addOFMessageListener(OFType.BARRIER_REPLY, this);
		floodlightProvider.addOFMessageListener(OFType.PACKET_IN, this);
		floodlightProvider.addOFSwitchListener(this);
		restApi.addRestletRoutable(new OmniUIWebRoutable());
	}
	
	@Override
	public net.floodlightcontroller.core.IListener.Command receive(IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {
		switch (msg.getType()) {
		case FLOW_MOD:
			//logger.info("FLOW MOD MSG : {}",msg);
			return Command.CONTINUE;
		case FLOW_REMOVED:
			OFFlowRemoved msg2 = (OFFlowRemoved) msg;
			if (msg2.getReason() == OFFlowRemoved.OFFlowRemovedReason.OFPRR_DELETE){
				logger.info("FLOW REMOVED MSG : {} ; from switch : {}",msg2,sw);
				FlowModResource.setMsg();
			}
			return Command.CONTINUE;
		case BARRIER_REPLY:
			//logger.info("BARRIER REPLY : {}",msg);
			FlowModResource.setMsg2();
			return Command.CONTINUE;
		case PACKET_IN:
			OFPacketIn pi = (OFPacketIn) msg;
			OFMatch match = new OFMatch();
			match.loadFromPacket(pi.getPacketData(), pi.getInPort());
			String url = "http://localhost:5567/publish/packet";
			String data = String.format("{\"controller\":\"%s\", \"dpid\":\"%s\", \"in_port\":\"%s\", \"mac_src\":\"%s\", \"mac_dst\":\"%s\", \"ether_type\":\"0x%x\", \"ip_src\":\"%s\", \"ip_dst\":\"%s\", \"protocol\":\"0x%x\", \"port_src\":\"%s\", \"port_dst\":\"%s\"}", controller_name, HexString.toHexString(sw.getId()), match.getInputPort(), HexString.toHexString(match.getDataLayerSource()), HexString.toHexString(match.getDataLayerDestination()), match.getDataLayerType(), intToIp(match.getNetworkSource()), intToIp(match.getNetworkDestination()), match.getNetworkProtocol(), match.getTransportSource(), match.getTransportDestination());
			try{
				sendPost(url, data);
			}catch (Exception e){
				logger.info("sendPost failed.");
			}
			return Command.CONTINUE;
		default:
			return Command.CONTINUE;
		}
	}

	@Override
	public void switchAdded(long switchId) {
		//logger.info("SWITCH ADD : {}",HexString.toHexString(switchId));
	}

	@Override
	public void switchRemoved(long switchId) {
		//logger.info("SWITCH REMOVE : {}",HexString.toHexString(switchId));
		String url = "http://localhost:5567/publish/deldevice";
		String data = String.format("{\"controller\":\"%s\", \"dpid\":\"%s\"}", controller_name, HexString.toHexString(switchId));
		try{
			sendPost(url, data);
		}catch (Exception e){
			logger.info("sendPost failed.");
		}
	}

	@Override
	public void switchActivated(long switchId) {
		//logger.info("SWITCH ACTIVATED : dpid {}",HexString.toHexString(switchId));
		FlowModResource.sendEntriesToSwitch(switchId);
		String url = "http://localhost:5567/publish/adddevice";
		String data = String.format("{\"controller\":\"%s\", \"dpid\":\"%s\"}", controller_name, HexString.toHexString(switchId));
		try{
			sendPost(url, data);
		}catch (Exception e){
			logger.info("sendPost failed.");
		}
	}

	@Override
	public void switchChanged(long switchId) {
		// no-op
		logger.info("SWITCH CHANGED : dpid {}",HexString.toHexString(switchId));
	}

	@Override
	public void switchPortChanged(long switchId, ImmutablePort port, IOFSwitch.PortChangeType type) {
		String url = "";
		if(type == IOFSwitch.PortChangeType.ADD || type == IOFSwitch.PortChangeType.UP){
			url = "http://localhost:5567/publish/addport";
		}else if(type == IOFSwitch.PortChangeType.DELETE || type == IOFSwitch.PortChangeType.DOWN){
			url = "http://localhost:5567/publish/delport";
		}else{
			logger.info("No process IOFSwitch.PortChangeType.OTHER_UPDATE");
			return;
		}
		String data = String.format("{\"controller\":\"%s\", \"dpid\":\"%s\", \"port\":\"%s\"}", controller_name, HexString.toHexString(switchId), port.getPortNumber());
		try{
			sendPost(url, data);
		}catch (Exception e){
			logger.info("sendPost failed.");
		}
	}

	@Override
	public void linkDiscoveryUpdate(List<LDUpdate> updateList) {
		//logger.info("LINK UPDATE 1: {}", updateList);
		for(int i = 0; i < updateList.size(); i++){
			String url = "";
			String data = "";
			switch(updateList.get(i).getOperation()){
				case LINK_UPDATED:
					url = "http://localhost:5567/publish/addlink";
					data = String.format("{\"controller\":\"%s\", \"src_dpid\":\"%s\", \"dst_dpid\":\"%s\", \"src_port\":\"%s\", \"dst_port\":\"%s\"}", controller_name, HexString.toHexString(updateList.get(i).getSrc()), HexString.toHexString(updateList.get(i).getDst()), updateList.get(i).getSrcPort(), updateList.get(i).getDstPort());
					break;
				case LINK_REMOVED:
					url = "http://localhost:5567/publish/dellink";
					data = String.format("{\"controller\":\"%s\", \"src_dpid\":\"%s\", \"dst_dpid\":\"%s\", \"src_port\":\"%s\", \"dst_port\":\"%s\"}", controller_name, HexString.toHexString(updateList.get(i).getSrc()), HexString.toHexString(updateList.get(i).getDst()), updateList.get(i).getSrcPort(), updateList.get(i).getDstPort());
					break;
				case PORT_UP:
					url = "http://localhost:5567/publish/addport";
					data = String.format("{\"controller\":\"%s\", \"dpid\":\"%s\", \"port\":\"%s\"}", controller_name, HexString.toHexString(updateList.get(i).getSrc()), updateList.get(i).getSrcPort());
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

	class DeviceListenerImpl implements IDeviceListener{

		@Override
		public void deviceAdded(IDevice device) {
			//logger.info("DEVICE ADD: {}", device);
			SwitchPort[] sw = device.getAttachmentPoints();
			String url = "http://localhost:5567/publish/addhost";
			String data2 = "";
			for(int i=0; i<sw.length; i++){
				String info = String.format("{\"dpid\":\"%s\", \"port\":\"%d\"}", HexString.toHexString(sw[i].getSwitchDPID()), sw[i].getPort());
				data2 += info;
				if(i != sw.length-1) data2 += ",";
			}
			String data = String.format("{\"controller\":\"%s\", \"mac\":\"%s\", \"aps\":[%s]}", controller_name, HexString.toHexString(device.getMACAddress()).substring(6), data2);
			try{
				sendPost(url, data);
			}catch (Exception e){
				logger.info("sendPost failed.");
			}
		}

		@Override
		public void deviceRemoved(IDevice device) {
			//logger.info("DEVICE REMOVED: {}", device);
			String url = "http://localhost:5567/publish/delhost";
			String data = String.format("{\"controller\":\"%s\", \"mac\":\"%s\"}", controller_name, HexString.toHexString(device.getMACAddress()).substring(6));
			try{
				sendPost(url, data);
			}catch (Exception e){
				logger.info("sendPost failed.");
			}
		}

		@Override
		public void deviceMoved(IDevice device) {
			//logger.info("DEVICE MOVED: {}", device);
			String url, data;
			SwitchPort[] sw = device.getAttachmentPoints();
			if( sw.length == 0){
				url = "http://localhost:5567/publish/delhost";
				data = String.format("{\"controller\":\"%s\", \"mac\":\"%s\"}", controller_name, HexString.toHexString(device.getMACAddress()).substring(6));
			}else{
				url = "http://localhost:5567/publish/addhost";
				String data2 = "";
				for(int i=0; i<sw.length; i++){
					String info = String.format("{\"dpid\":\"%s\", \"port\":\"%d\"}", HexString.toHexString(sw[i].getSwitchDPID()), sw[i].getPort());
					data2 += info;
					if(i != sw.length-1) data2 += ",";
				}
				data = String.format("{\"controller\":\"%s\", \"mac\":\"%s\", \"aps\":[%s]}", controller_name, HexString.toHexString(device.getMACAddress()).substring(6), data2);
			}
			try{
				sendPost(url, data);
			}catch (Exception e){
				logger.info("sendPost failed.");
			}
		}

		@Override
		public void deviceIPV4AddrChanged(IDevice device) {
			//logger.info("DEVICE ADDR CHANGED: {}", device);
			String url = "http://localhost:5567/publish/addhost";
			String data2 = "";
			SwitchPort[] sw = device.getAttachmentPoints();
			for(int i=0; i<sw.length; i++){
				String info = String.format("{\"dpid\":\"%s\", \"port\":\"%d\"}", HexString.toHexString(sw[i].getSwitchDPID()), sw[i].getPort());
				data2 += info;
				if(i != sw.length-1) data2 += ",";
			}
			Integer[] ips = device.getIPv4Addresses();
			String ips2 = "";
			for(int i=0; i<ips.length; i++){
				ips2 += ("\""+intToIp(ips[i])+"\"");
				if(i != ips.length-1) ips2 += ",";
			}
			String data = String.format("{\"controller\":\"%s\", \"mac\":\"%s\", \"ips\":[%s], \"aps\":[%s]}",	controller_name, HexString.toHexString(device.getMACAddress()).substring(6), ips2, data2);
			try{
				sendPost(url, data);
			}catch (Exception e){
				logger.info("sendPost failed.");
			}
		}

		@Override
		public void deviceVlanChanged(IDevice device) {
			logger.info("DEVICE VLAN CHANGED: {}", device);
		}
		@Override
		public String getName() {
			return "omniui_device_listener";
		}
		@Override
		public boolean isCallbackOrderingPrereq(String type, String name) {
			return false;
		}
		@Override
		public boolean isCallbackOrderingPostreq(String type, String name) {
			return false;
		}
	}

	private String intToIp(int i) {
		return ((i >> 24 ) & 0xFF) + "." + ((i >> 16 ) & 0xFF) + "." + ((i >>  8 ) & 0xFF) + "." + ( i & 0xFF);
	}

	class PollTask2 extends TimerTask {
		@Override
		public void run(){
			try{
				String url = "http://localhost:8080/wm/omniui/controller/info";
				URL obj = new URL(url);
				HttpURLConnection con = (HttpURLConnection) obj.openConnection();
				con.setRequestMethod("GET");
				BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
				String data = String.format("{\"controller\":\"%s\", %s}",controller_name, in.readLine());
				in.close();
				String url2 = "http://localhost:5567/publish/controller";
				sendPost(url2, data);
			}catch(Exception e){
				e.printStackTrace();
			}
		}
	}

	class PollTask extends TimerTask {
		@Override
		public void run(){
			try{
				String url = "http://localhost:8080/wm/omniui/switch/json";
				URL obj = new URL(url);
				HttpURLConnection con = (HttpURLConnection) obj.openConnection();
				con.setRequestMethod("GET");
				BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
				String inputLine;
				StringBuffer response = new StringBuffer();
				while ((inputLine = in.readLine()) != null) {
					response.append(inputLine);
				}
				in.close();

				String s = response.toString();
				JSONArray myJsonArray = new JSONArray(s);
				for(int i=0 ; i < myJsonArray.length() ;i++){
					JSONObject myjObject = myJsonArray.getJSONObject(i);
					String dpid = myjObject.getString("dpid");

					JSONArray flowJsonArray = myjObject.getJSONArray("flows");
					sendflowmsg(dpid, flowJsonArray);

					JSONArray portJsonArray = myjObject.getJSONArray("ports");
					for(int j=0 ; j < portJsonArray.length() ;j++){
						JSONObject portjObject = portJsonArray.getJSONObject(j);
						portjObject.putOnce("controller", controller_name);
						portjObject.putOnce("dpid", dpid);
					}
					sendportmsg(portJsonArray);
				}
			}catch(Exception e){
				e.printStackTrace();
			}
		}
		protected void sendflowmsg(String dpid, JSONArray flows){
			String url = "http://localhost:5567/publish/flow";
			String data = String.format("{\"controller\":\"%s\", \"dpid\":\"%s\", \"flows\":%s}",controller_name , dpid, flows.toString());
			try{
				sendPost(url, data);
			}catch (Exception e){
				logger.info("sendPost failed.");
			}
		}
		protected void sendportmsg(JSONArray ports){
			String url = "http://localhost:5567/publish/port";
			for(int j=0 ; j < ports.length() ;j++){
				try{
					String data = String.format("%s", ports.getJSONObject(j).toString());
					sendPost(url, data);
				}catch (Exception e){
					logger.info("sendPost failed.");
				}
			}
		}
	}
}
