# onos-application-for-openadm

## Start Onos With Docker
1. `docker run -tidP --name onos1 onosproject/onos:1.4`
2. `docker port onos1`
<pre>
8181/tcp -> 0.0.0.0:32840
9876/tcp -> 0.0.0.0:32839
6653/tcp -> 0.0.0.0:32842
8101/tcp -> 0.0.0.0:32841
</pre>
3. Login web ui( http://0.0.0.0:32840/onos/ui/login.html ), click toggle and select application.
4. Turn on openflow and fwd.

## Build Onos Application with Docker
1. `docker run -tid --name maven maven bash`
2. `docker exec -ti maven git clone https://github.com/dlinknctu/OpenADM`
3. `docker exec -ti maven bash -c "cd OpenADM/adapter/onos && mvn clean install"`
4. `docker cp maven:/OpenADM/adapter/onos/target/omniui-1.0-SNAPSHOT.oar .`, you can "cp" to anywhere then install and run by web.

## Start Mininet 
1. ` mn --mac --topo=linear,2 --controller remote,ip=0.0.0.0,port=32842`

## Set OpenADM ip in adapter
1. ` curl -d '{"core":"http://{openadm ip}/publish/","controller_name":"what's your name"}' http://0.0.0.0:32840/wm/omniui/core`    
Return "OK" means success
