package net.floodlightcontroller.omniui;

import org.restlet.Context;
import org.restlet.Restlet;
import org.restlet.routing.Router;

import net.floodlightcontroller.restserver.RestletRoutable;

public class OmniUIWebRoutable implements RestletRoutable {
    @Override
    public Restlet getRestlet(Context context) {
        Router router = new Router(context);
        router.attach("/switch/json", SwitchResource.class);
        router.attach("/link/json", LinkResource.class);
//	router.attach("/add/json", FlowModResource.class); //1219
        return router;
    }

    @Override
    public String basePath() {
        return "/wm/omniui";
    }
}
