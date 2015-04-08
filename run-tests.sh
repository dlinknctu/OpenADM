#!/bin/bash
<<<<<<< HEAD
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
=======
cd ui
npm install
npm test
>>>>>>> cc14ed5e79713b94a9db5ca79711229fc6fc5f47
