#Required Packages

- jsonc (https://github.com/json-c/json-c)   
- pkg-config 

#Install the uds appliction
- Put the uds directory on your trema-edge/.
    
        trema-edge  
            |-bin
            |-features
            |-ruby
            |-spec
            |-src
            |-uds/src
        
        

#Build the uds appliction
- cd uds
- make

#Run the UDS 
- ./trema run uds/src/uds
