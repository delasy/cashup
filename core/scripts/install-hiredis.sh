#!/usr/bin/env bash

set -ex

INSTALL_TAG=hiredis-master
INSTALL_URL=https://github.com/redis/hiredis/archive/master.tar.gz

source "$(cd "$(dirname "$0")" && pwd)/install.sh"
