# Record in Json Files

def record_json(lastDay, result, resultF, resultH, resultHF)

    # Vars

    jsonDir = ENV['JSON_DIR']


    # Result

    if lastDay
       File.write(jsonDir + '/last_day.json', result.to_json)
    else
       File.write(jsonDir + '/all.json', result.to_json)
    end


    # Result for hours

    if lastDay
       File.write(jsonDir + '/last_day_hours.json', resultH.to_json)
    else
       File.write(jsonDir + '/all_hours.json', resultH.to_json)
    end


    # Formatted result

    if lastDay
       File.write(jsonDir + '/last_day_formatted.json', resultF.to_json)
    else
       File.write(jsonDir + '/all_formatted.json', resultF.to_json)
    end


    # Formatted result for hours

    if lastDay
        File.write(jsonDir + '/last_day_hours_formatted.json', resultHF.to_json)
    else
        File.write(jsonDir + '/all_hours_formatted.json', resultHF.to_json)
    end

end
