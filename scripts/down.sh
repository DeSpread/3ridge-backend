#!/bin/bash

OLDIFS=$IFS
CWD=$(pwd)
IFS="/"
read -ra fields <<< "$CWD"
length=${#fields[@]}
last_index=$((length - 1))
last_element=${fields[last_index]}
IFS=$OLDIFS

if [[ "$last_element" = 'scripts' ]]; then
  cd ..
fi

docker-compose-v1 -f docker-compose.yml down
