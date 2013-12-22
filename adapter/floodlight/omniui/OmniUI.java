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
import java.util.ArrayList;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.Set;
import org.openflow.util.HexString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OmniUI implements IFloodlightModule,IOFMessageListener  {
	
	protected IFloodlightProviderService floodlightProvider;
	protected IRestApiService restApi;
	protected static Logger logger;

	@Override
	public String getName() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isCallbackOrderingPrereq(OFType type, String name) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isCallbackOrderingPostreq(OFType type, String name) {
		// TODO Auto-generated method stub
		return false;
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
		restApi.addRestletRoutable(new OmniUIWebRoutable());
	}
	
	@Override
	public net.floodlightcontroller.core.IListener.Command receive(IOFSwitch sw, OFMessage msg, FloodlightContext cntx) {
	
		logger.info("FLOW MOD MSG : {}",msg);
		return Command.CONTINUE;
	}
}
