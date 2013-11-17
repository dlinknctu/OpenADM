package net.floodlightcontroller.omniui;

import net.floodlightcontroller.core.module.IFloodlightService;
import java.util.Set;

public interface IOmniUIService extends IFloodlightService {

		/* 
		 * @brief: getSwitch infomation, include (dpid, flow tables)
		 * 
		 */
	    public Set<SwitchInfo> getSwitches();
		/*
		 * @brief: getLink infomation, include (source/dest dpid, source/dest port)
		 *
		 */
	    public Set<LinkInfo> getLinks();
		/*
		 * @brife: getPorts infomation, include (ports count[packet/type], attached dpid..)
		 *
		 */
	    public Set<PortInfo> getPorts();
}
