# Copyright (c) 2020 miko53 benoit485
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

#load 'linky_meter.rb'
require_relative '../../linky_meter/lib/linky_meter'
require 'byebug'
require 'json'

# local lib
require_relative './lib/parse_json_result.rb'
require_relative './lib/parse_json_result_h.rb'
require_relative './lib/merge_json.rb'
require_relative './lib/record_json.rb'
require_relative './lib/record_json_chart.rb'
require_relative './lib/record_influxdb.rb'

username = ENV['LINKY_USERNAME']
password = ENV['LINKY_PASSWORD']
authentication_cookie = ENV['LINKY_COOKIE_INTERNAL_AUTH_ID']

toIdb = ENV['TO_INFLUXDB'] == 'true'
toJson = ENV['TO_JSON'] == 'true'
toJsonChart = ENV['TO_JSON_CHART'] == 'true'

lastDay = ENV['LAST_DAY'] == 'true'

linky = LinkyMeter.new(true)
linky.connect(username, password, authentication_cookie)

# Group possible :
# LinkyMeter::BY_YEAR
# LinkyMeter::BY_MONTH
# LinkyMeter::BY_DAY
# LinkyMeter::BY_HOUR

if lastDay
   # Dates
   endDate = DateTime.now
   startDate = startDate2 = endDate.prev_day
else
   # Dates
   endDate = DateTime.now
   startDate = endDate.prev_year(3) # by days, can get 3 last years
   startDate2 = endDate.prev_day(7) # by hours, can get 7 last day
end

# Result for day
result = linky.get(startDate, endDate, LinkyMeter::BY_DAY)

# Result for hours
resultH = linky.get(startDate2, endDate, LinkyMeter::BY_HOUR)

# Format results
resultF = parse_json_result(lastDay, result)
resultHF = parse_json_result_h(resultH)

 # Every time we add new datas to old datas :
mergedResultF = merge_json(resultF);
mergedResultHF = merge_json_h(resultHF);

# Record in Json if activated
if toJson
    record_json(lastDay, result, resultF, resultH, resultHF, mergedResultF, mergedResultHF)
end

# Record in Json Chart (HighChart, datetime) if activated
if toJsonChart
    record_json_chart(mergedResultF, mergedResultHF)
end

# Record in InfluxDb if activated
if toIdb
    record_influxdb(lastDay, result, resultF, resultH, resultHF)
end
