#!/bin/sh

# base dir
BASEDIR="`dirname "$0"`/.."

# Include config file
. $BASEDIR/var/config.sh

# is last day or full (clean all files if full)
export LAST_DAY=true

# Delete old log
echo "" > ./mechanize.log

# Exec ruby
ruby $BASEDIR/src/linky_get_datas.rb


