#!/bin/sh

# Include config file
. `dirname "$0"`/config.sh

export LAST_DAY=true

# Delete old log
echo "" > ./mechanize.log

# Exec ruby
ruby2.5 linky_get_datas.rb


