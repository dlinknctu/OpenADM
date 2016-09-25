# onos-application-for-openadm

## RUN WITH DOCKER
### Start ONOS With Docker
1. `docker run -tidP --name onos1 onosproject/onos`
2. `docker port onos1`
<pre>
8181/tcp -> 0.0.0.0:32840
9876/tcp -> 0.0.0.0:32839
6653/tcp -> 0.0.0.0:32842
8101/tcp -> 0.0.0.0:32841
</pre>
3. Login web ui( http://0.0.0.0:32840/onos/ui/login.html ), click toggle and select application.
4. Turn on "OpenFlow Meta App" and "Reactive Forwarding App".

### Build adapter with Docker
1. `docker run -tid --name maven maven bash`
2. `docker exec -ti maven git clone https://github.com/dlinknctu/OpenADM`
3. `docker exec -ti maven bash -c "cd OpenADM/adapter/onos && mvn clean install"`
4. `docker cp maven:/OpenADM/adapter/onos/target/omniui-1.1-SNAPSHOT.oar .`, you can "cp" to anywhere then install by web.

### Start Mininet
1. `sudo mn --mac --topo=linear,2 --controller remote,ip=0.0.0.0,port=32842`

### Run OpenADM and connect to controller
1. `docker run -itdP --name openadm dlinknctu/openadm /bin/bash`
2. `docker port openadm`
<pre>
 5567 -> 32773 OpenADM core
 6633 -> 32772 OpenFlow
 8000 -> 32771  UI
</pre>
3. `docker exec -it openadm omniui`
4. `docker exec -it openadm bash -c "cd /root/openadm/ui && npm run dev"`
5. visit OpenADM WEB UI (0.0.0.0:32771) to add controller (controller IP: http://0.0.0.0:32840, core IP: http://0.0.0.0:32773)
