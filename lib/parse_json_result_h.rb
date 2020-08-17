# Format JSON Result H

def parse_json_result_h(resultH)

    labels = resultH["1"]["CONS"]["labels"]
    data = resultH["1"]["CONS"]["data"]
    nbLabels = labels.length

    i = 0
    resultHF = '{'
    while (i < nbLabels)
        if resultHF != '{'
            resultHF += ','
        end
        resultHF += '"'
        resultHF += labels[i].to_s
        resultHF += '":'
        resultHF += data[i].to_s
        resultHF += ''

        i += 1
    end
    resultHF += ',"unit":"kW"}'

    resultHF = JSON.parse(resultHF)

    return resultHF

end
