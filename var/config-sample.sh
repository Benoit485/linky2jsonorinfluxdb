#!/bin/sh

export LINKY_USERNAME="mail@org.tld"
export LINKY_PASSWORD="password"
export LINKY_COOKIE_INTERNAL_AUTH_ID="cookie : internalAuthId"

export TO_INFLUXDB=false
export INFLUXDB_HOST="localhost"
export INFLUXDB_PORT="8086"
export INFLUXDB_DATABASE="database"
export INFLUXDB_USERNAME="user"
export INFLUXDB_PASSWORD="pass"

export TO_JSON=true
export TO_JSON_CHART=true
export JSON_DIR="$BASEDIR/public/api"
