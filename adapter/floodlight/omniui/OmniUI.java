package net.floodlightcontroller.omniui;

import java.util.Collection;
import java.util.Map;
import java.util.HashMap;

import net.floodlightcontroller.core.FloodlightContext;
import net.floodlightcontroller.core.module.FloodlightModuleContext;
import net.floodlightcontroller.core.module.FloodlightModuleException;
import net.floodlightcontroller.core.module.IFloodlightModule;
import net.floodlightcontroller.core.module.IFloodlightService;
import net.floodlightcontroller.restserver.IRestApiService;
import net.floodlightcontroller.core.IOFMessageListener;
import net.floodlightcontroller.core.IOFSwitch;
import net.floodlightcontroller.core.PortChangeType;
import net.floodlightcontroller.core.IFloodlightProviderService;
import net.floodlightcontroller.core.IOFSwitchListener;
import org.projectfloodlight.openflow.protocol.OFFlowRemoved;
import org.projectfloodlight.openflow.protocol.OFFlowRemovedReason;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.Set;

import org.projectfloodlight.openflow.types.DatapathId;
import org.projectfloodlight.openflow.util.HexString;
import org.projectfloodlight.openflow.protocol.OFMessage;
import org.projectfloodlight.openflow.protocol.OFType;
import org.projectfloodlight.openflow.protocol.OFPortDesc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//public class OmniUI implements IFloodlightModule,IOFMessageListener,IOFSwitchListener  {
public class OmniUI implements IFloodlightModule,IOFMessageListener {

	protected IFloodlightProviderService floodlightProvider;
	protected IRestApiService restApi;
	protected static Logger logger;
	public static final String StaticFlowName = "omniui";

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
			floodlightProvider = context.getServiceImpl(IFloodlightProviderService.class);
			restApi = context.getServiceImpl(IRestApiService.class);
			logger = LoggerFactory.getLogger(OmniUI.class);
	}

	@Override
	public void startUp(FloodlightModuleContext context) {
		// TODO Auto-generated method stub
		floodlightProvider.addOFMessageListener(OFType.FLOW_MOD, this);
		floodlightProvider.addOFMessageListener(OFType.FLOW_REMOVED, this);
		floodlightProvider.addOFMessageListener(OFType.BARRIER_REPLY, this);
	//	floodlightProvider.addOFSwitchListener(this);
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
			if (OFFlowRemovedReason.DELETE.equals(msg2.getReason())) {
				logger.info("FLOW REMOVED MSG : {} ; from switch : {}",msg2,sw);
			//	FlowModResource.setMsg();
			}
			return Command.CONTINUE;
		case BARRIER_REPLY:
			logger.info("BARRIER REPLY : {}",msg);
			//FlowModResource.setMsg2();
			return Command.CONTINUE;
        default:
            return Command.CONTINUE;
		}
	}

	/*
    @Override
    public void switchAdded(DatapathId switchId) {
          logger.info("SWITCH ADD : {}",HexString.toHexString(switchId));
 //       FlowModResource.sendEntriesToSwitch(switchId);
    }

    @Override
    public void switchRemoved(DatapathId switchId) {
        // do NOT delete from our internal state; we're tracking the rules,
        // not the switches
    }

    @Override
    public void switchActivated(DatapathId switchId) {
        // no-op
    }

    @Override
    public void switchChanged(DatapathId switchId) {
        // no-op
    }

    @Override
    public void switchPortChanged(DatapathId switchId,
                                  OFPortDesc port,
                                  PortChangeType type) {
        // no-op
    }
*/
}
