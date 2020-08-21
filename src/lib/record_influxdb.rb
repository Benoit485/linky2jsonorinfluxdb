# Record in InfluxDb

# https://github.com/influxdata/influxdb-ruby

require 'date'
require 'influxdb'

def record_influxdb(lastDay, result, resultF, resultH, resultHF)

    # Vars
    idbHost = ENV['INFLUXDB_HOST']
    idbPort = ENV['INFLUXDB_PORT']
    idbDb = ENV['INFLUXDB_DATABASE']
    idbUser = ENV['INFLUXDB_USERNAME']
    idbPass = ENV['INFLUXDB_PASSWORD']

    # Connect to InfluxDb
    influxdb = InfluxDB::Client.new host: idbHost,
        port: idbPort,
        database: idbDb,
        username: idbUser,
        password: idbPass
    
    data = []
    
    resultHF.each_pair do |key, value|
        if key != 'unit'
            data.push({
                series: 'power',
                #tags: { unit: 'kW' },
                values: { value: value },
                timestamp: DateTime.iso8601(key).to_time.to_i
            })
        end
    end
    
    resultF['day_more'].each_pair do |key, values|
        if key != 'unit'
            data.push({
                series: 'energy',
                #tags: { unit: 'kWh' },
                values: { value: values['value'] },
                timestamp: DateTime.iso8601(values['date_end']).to_time.to_i
            })
        end
    end
    
    #precision = 's' # not change because Time.to_i is for second
    #retention = 'linky.power.30d'

    influxdb.write_points(data)
    #influxdb.write_points(data, precision, retention)

end

