#!/usr/bin/env bash

set -ex

CMAKE_EXTRA_ARGS=""
IS_NEXT_PREFIX=0

for ARG in "$@"; do
  if [ "$ARG" = --prefix ]; then
    IS_NEXT_PREFIX=1
  elif [ $IS_NEXT_PREFIX -eq 1 ]; then
    IS_NEXT_PREFIX=0
    CMAKE_EXTRA_ARGS="$CMAKE_EXTRA_ARGS -DCMAKE_INSTALL_PREFIX=$ARG"
    CMAKE_EXTRA_ARGS="$CMAKE_EXTRA_ARGS -DCMAKE_INSTALL_RPATH=$ARG/lib"
    CMAKE_EXTRA_ARGS="$CMAKE_EXTRA_ARGS -DCMAKE_PREFIX_PATH=$ARG"
  else
    CMAKE_EXTRA_ARGS="$CMAKE_EXTRA_ARGS $ARG"
  fi
done

curl -L "$INSTALL_URL" -o "$INSTALL_TAG.tar.gz"
tar -xzvf "$INSTALL_TAG.tar.gz"
rm -f "$INSTALL_TAG.tar.gz"
pushd "$INSTALL_TAG"

cmake . ${CMAKE_EXTRA_ARGS}
cmake --build .
cmake --install .

popd
rm -rf "$INSTALL_TAG"
