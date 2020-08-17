#!/bin/sh

# Execute this file only one time for first generate

# Include config file
. ./config.sh

export LAST_DAY=false

# Delete old log
echo "" > ./mechanize.log

# Exec ruby
ruby2.5 linky_get_datas.rb
