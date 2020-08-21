#!/bin/sh

# Execute this file only one time for first generate
# Or if you miss some day, it's will update api files

# base dir
BASEDIR="`dirname "$0"`/.."

# Include config file
. $BASEDIR/var/config.sh

# is last day or full (clean all files if full)
export LAST_DAY=false

# Delete old log
echo "" > ./mechanize.log

# Echo for record exec
echo "getLastDatasLastDay.sh :"
echo "Exec date : `date +'%Y-%m-%d %H:%M:%S'`"

# Exec ruby
ruby $BASEDIR/src/linky_get_datas.rb
