Floodlight Adapter 
------------------
A floodlight adapter module for OmniUI

##Install##
1. Copy the omniui directory into floodlight/src/main/java/net/floodlightcontroller/
2. Append the `net.floodlightcontroller.omniui.OmniUI` into 
  `src/main/resources/META-INF/services/net.floodlightcontroller.core.module.IFloodlightModule`
3. Modfiy the floodlight config file, default is `src/main/resources/floodlightdefault.properties`
    * Append `net.floodlightcontroller.omniui.OmniUI` to the option `floodlight.modules`
4. Rebuild and restart Floodlight controller