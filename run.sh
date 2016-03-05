#!/bin/bash

function install_floodlight {
    cd $rootpath/..
    $rootpath/adapter/floodlight/install.sh
}

function test_core {
    cd $rootpath/core
    python setup.py test
}

function install_core {
    cd $rootpath/core
    python setup.py install --user
}

function install_ui {
    cd $rootpath/ui
    npm install
}

function test_ui {
    cd $rootpath/ui
    npm test
}

function install {
    install_floodlight
    install_core
    install_ui
}

function test {
    install
    test_ui
    test_core
}

function setup {
	if [ $# != 2 ]; then
		echo "Usage: $0 exec <IP> <Port>"
		exit -1
	fi

	UI_CONFIG="$OPENADM_ROOT/ui/config/config.json"

	# Config IP address
	rm -rf $UI_CONFIG
	echo "{" > $UI_CONFIG
	echo "    \"OpenADMCoreURL\": \"http://$1:$2/\"" >> $UI_CONFIG
	echo "}" >> $UI_CONFIG
}

function controller {
	$OPENADM_ROOT/../floodlight/floodlight.sh
}

function core {
	/root/.local/bin/omniui
}

function ui {
	cd $OPENADM_ROOT/ui/
	npm run dev &> /tmp/omniui/ui.log &
}

rootpath=`pwd`
OPENADM_ROOT=`dirname $0`
$@
