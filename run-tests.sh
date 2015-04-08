#!/bin/bash
function test_ui {
    cd $rootpath/ui
    npm install
    npm test
}

function install_core {
    cd $rootpath/core
    python setup.py install --user
}

function test_core {
    cd $rootpath/core
    python setup.py test
}

function install_floodlight {
    cd $rootpath
    $rootpath/adapter/floodlight/install.sh
}

rootpath=`pwd`
test_ui
install_core
test_core
install_floodlight
