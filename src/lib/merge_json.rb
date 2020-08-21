
 # Every time we add new datas to old datas :

require_relative './merge_recursive.rb'

def merge_json(resultF)

    # Vars
    jsonDir = ENV['JSON_DIR'];
    filename = jsonDir + '/all.json';

    if not File.file?(filename)
        return resultF;
    end

    oldResultF = JSON.parse(File.open(filename).read);
    mergedResultF = merge_recursively(oldResultF, resultF);

    return mergedResultF;
end

def merge_json_h(resultHF)

    # Vars
    jsonDir = ENV['JSON_DIR'];
    filename = jsonDir + '/all_hours.json';

    if not File.file?(filename)
        return resultHF;
    end

    oldResultHF = JSON.parse(File.open(filename).read);
    mergedResultHF = merge_recursively(oldResultHF, resultHF);

    return mergedResultHF;
end