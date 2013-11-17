Floodlight Adapter 
---------------

A floodlight adapter module for OmniUI



##Install##
- Copy the omniui directory into floodlight/src/main/java/net/floodlight/

- Append the `net.floodlightcontroller.omniui.OmniUI` into   
  `src/main/resources/META-INF/services/net.floodlightcontroller.core.module.IFloodlightModule`
- Modfiy the floodlight config file, default is `src/main/resources/floodlightdefault.properties`
    * append `net.floodlightcontroller.omniui.OmniUI` to the options `floodlight.modules`


##Usage##
- Use RESTAPI 
    * /wm/omniui/swtich/json
    * /wm/omniui/link/json
    * /wm/omniui/port/json
    
