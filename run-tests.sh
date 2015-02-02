#!/bin/bash
function test_ui {
    cd ui
    npm install
    npm test
    cd ..
}

function test_core {
    cd core
    python setup.py install --user
    python setup.py test
    cd ..
}

test_ui
test_core