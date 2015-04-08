#!/bin/bash

echo -e "\033[32mClone Floodlight 0.91 from GitHub repository\033[0m"
git clone https://github.com/floodlight/floodlight.git -b v0.91 floodlight

echo -e '\033[32mCopy OmniUI module into Floodlight directory\033[0m'
cp -r adapter/floodlight/omniui floodlight/src/main/java/net/floodlightcontroller/

echo -e '\033[32mModify META-INF\033[0m'
echo "net.floodlightcontroller.omniui.OmniUI" >> \
    floodlight/src/main/resources/META-INF/services/net.floodlightcontroller.core.module.IFloodlightModule

echo -e '\033[32mModify floodlightdefault.properties\033[0m'
file='floodlight/src/main/resources/floodlightdefault.properties'
sed '2i\
   net.floodlightcontroller.omniui.OmniUI,\\
   ' $file > $file.tmp
mv $file.tmp $file

# Compile Floodlight
echo -e '\033[32mCompile Floodlight\033[0m'
cd floodlight
ant
