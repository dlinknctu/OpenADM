# onos-application-for-openadm

1. update core IP  
  file path : src/main/java/org/winlab/omniui/SendMsg.java  
  `private String host = "http://{YOUR IP}/publish/";  `  
2. compile application  
  `mvn clean install`  
3. install application  
  `onos-app 127.0.0.1 install! target/omniui-1.0-SNAPSHOT.oar`
