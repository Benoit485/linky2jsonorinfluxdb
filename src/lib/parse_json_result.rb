# Format Json Result 

def parse_json_result(lastDay, result)

    # result Values
    resultV = result["1"]["CONS"]["aggregats"] 

    # Every values
    day = resultV['JOUR']
    week = resultV['SEMAINE']
    month = resultV['MOIS']
    year = resultV['ANNEE']

    # Init
    resultF = '{'
    resultF2 = ''
    lastValue = -1

    # Vor every type
    if lastDay
        types = ["JOUR"]
    else
        types = ["JOUR","SEMAINE","MOIS","ANNEE"]
    end

    for type in types

        datasType = resultV[type]
        labels = datasType['labels']
        periods = datasType['periodes']
        datas = datasType['datas']

        if resultF != '{'
            resultF += ','
        end
        if resultF2 != ''
            resultF2 += ','
        end
       
        typeF = 'day'
        if type == 'SEMAINE'
             typeF = 'week'
        elsif type == 'SEMAINE'
             typeF = 'week'
        elsif type == 'MOIS'
             typeF = 'month'
        elsif type == 'ANNEE'
             typeF = 'year'
        end

        resultF += '"'
        resultF += typeF
        resultF += '":{'

        resultF2 += '"'
        resultF2 += typeF
        resultF2 += '_more":{'

        nbLabels = labels.length
        i = 0
        type_no_empty = false

        while (i < nbLabels)
            
            if datas[i].to_s != 'NaN'
            
                if type_no_empty
                    resultF += ','
                    resultF2 += ','
                end

                resultF += '"'
                resultF += labels[i].to_s
                resultF += '":'
                resultF += datas[i].to_s

		lastValue = datas[i].to_s

                resultF2 += '"'
                resultF2 += labels[i].to_s
                resultF2 += '":{"value":'
                resultF2 += datas[i].to_s
                resultF2 += ',"lowercase_label":"'
                resultF2 += labels[i].to_s.downcase
                resultF2 += '","date_start":"'
                resultF2 += periods[i]["dateDebut"].to_s
                resultF2 += '","date_end":"'
                resultF2 += periods[i]["dateFin"].to_s
                resultF2 += '"}'

                type_no_empty = true
            end

            i += 1

        end

        resultF += '}'
        resultF2 += '}'

    end

    resultF += ','
    resultF += resultF2

    resultF += ''
    resultF += '}'

    resultF = JSON.parse(resultF)
    
    return resultF
    
end

