#!/bin/bash
fa="$1"

if [[ "$fa" != "dev" && "$fa" != "prod" && "$fa" != "staging" ]]; then
    echo "잘못된 입력입니다. 'dev', 'prod', 'staging' 중 하나를 입력해야 합니다."
    exit 1
fi

echo "환경: $fa"

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
docker-compose-v1 -f docker-compose.yml --env-file .env.$fa up --build -d
