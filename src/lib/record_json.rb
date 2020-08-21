# Record in Json Files



def record_json(lastDay, result, resultF, resultH, resultHF, mergedResultF, mergedResultHF)

    # Vars
    jsonDir = ENV['JSON_DIR']

    if lastDay
       File.write(jsonDir + '/last_day_enedis.json', result.to_json) # Result
       File.write(jsonDir + '/last_day_hours_enedis.json', resultH.to_json) # Result for hours
       File.write(jsonDir + '/last_day.json', resultF.to_json) # Formatted result
       File.write(jsonDir + '/last_day_hours.json', resultHF.to_json) # Formatted result for hours
    else
        # all datas
       # For files get from Enedis website, we rewrite old
       File.write(jsonDir + '/all_hours_enedis.json', resultH.to_json)
       File.write(jsonDir + '/all_enedis.json', result.to_json)
    end

    # Every time we add new datas to old datas :
    File.write(jsonDir + '/all.json', mergedResultF.to_json)
    File.write(jsonDir + '/all_hours.json', mergedResultHF.to_json)

end
