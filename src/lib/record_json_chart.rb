# Record in Json Charts Files

class Json2Chart
  def initialize
    @hash = {}
  end

  def add(key_value)
    key_value.each do |key, value|
      @hash[key] = value
    end
  end

  def mv(key_value)
    key_value.each do |key, value|
      @hash[] = [key, value]
    end
  end

  def entries
     @hash
  end

  def keywords
     @hash.keys
  end

end

    #j2c = Json2Chart.new;
    #j2c.mv(mergedResultHF);


    #p j2c.keywords;













def record_json_chart(mergedResultF, mergedResultHF)

    # Vars
    jsonDir = '../public/api';#ENV['JSON_DIR']

    # power
    powerChart = [];
    mergedResultHF.each do |key, value|
        date = DateTime.iso8601(key).to_time.to_i*1000;
        powerChart.push([date, value*1000]);
    end

    # power last day
    powerLastDay = [];
    total = powerChart.length;
    i = 48;
    until i == 0
        j = total-i;
        date = powerChart[j][0];
        powerLastDay.push([date, powerChart[j][1]]);
        i -= 1;
    end

    # energy every days
    energyEveryDays = [];
    mergedResultF['day_more'].each do |key, value|
        date = DateTime.iso8601(value['date_start']).to_time.to_i*1000;
        energyEveryDays.push([date, value['value']]);
    end

    # energy by day last week
    energyByDayLastWeek = [];
    total = energyEveryDays.length;
    if total > 7
        i = 7;
    else
        i = total;
    end
    until i == 0
        j = total-i;
        date = energyEveryDays[j][0];
        energyByDayLastWeek.push([date, energyEveryDays[j][1]]);
        i -= 1;
    end

    # energy by day previous week
    energyByDayPreviousWeek = [];
    total = energyEveryDays.length;
    if total > 14
        i = 14;
    else
        i = total;
    end
    if i > 7
        until i == 7
            j = total-i;
            date = energyEveryDays[j][0];
            energyByDayPreviousWeek.push([date, energyEveryDays[j][1]]);
            i -= 1;
        end
    end

    # energy by day last month
    energyByDayLastMonth = [];
    total = energyEveryDays.length;
    if total > 31
        i = 31;
    else
        i = total;
    end
    until i == 0
        j = total-i;
        date = energyEveryDays[j][0];
        energyByDayLastMonth.push([date, energyEveryDays[j][1]]);
        i -= 1;
    end

    # energy by day previous month
    energyByDayPreviousMonth = [];
    total = energyEveryDays.length;
    if total > 62
        i = 62;
    else
        i = total;
    end
    if i > 31
        until i == 31
            j = total-i;
            date = energyEveryDays[j][0];
            energyByDayPreviousMonth.push([date, energyEveryDays[j][1]]);
            i -= 1;
        end
    end

    # energy by day last year
    energyByDayLastYear = [];
    total = energyEveryDays.length;
    if total > 365
        i = 365;
    else
        i = total;
    end
    until i == 0
        j = total-i;
        date = energyEveryDays[j][0];
        energyByDayLastYear.push([date, energyEveryDays[j][1]]);
        i -= 1;
    end

    # energy by day previous year
    energyByDayPreviousYear = [];
    total = energyEveryDays.length;
    if total > (365*2)
        i = (365*2);
    else
        i = total;
    end
    if i > 365
        until i == 365
            j = total-i;
            date = energyEveryDays[j][0];
            energyByDayPreviousYear.push([date, energyEveryDays[j][1]]);
            i -= 1;
        end
    end

    # energy by week
    energyByWeekEveryWeeks = [];
    unless mergedResultF['week_more'].nil?
        mergedResultF['week_more'].each do |key, value|
            date = DateTime.iso8601(value['date_start']).to_time.to_i*1000;
            energyByWeekEveryWeeks.push([date, value['value']]);
        end
    end

    # energy by month
    energyByMonthEveryMonths = [];
    unless mergedResultF['month_more'].nil?
        mergedResultF['month_more'].each do |key, value|
            date = DateTime.iso8601(value['date_start']).to_time.to_i*1000;
            energyByMonthEveryMonths.push([date, value['value']]);
        end
    end

    # energy by years
    energyByYearEveryYears = [];
    unless mergedResultF['year_more'].nil?
        mergedResultF['year_more'].each do |key, value|
            date = DateTime.iso8601(value['date_start']).to_time.to_i*1000;
            energyByYearEveryYears.push([date, value['value']]);
        end
    end

    # make charts
    charts = {};
    charts['power'] = powerChart;
    charts['power_last_day'] = powerLastDay;

    charts['energy_by_day__every_days'] = energyEveryDays;
    charts['energy_by_week__every_weeks'] = energyByWeekEveryWeeks;
    charts['energy_by_month__every_months'] = energyByMonthEveryMonths;
    charts['energy_by_year__every_years'] = energyByYearEveryYears;

    charts['energy_by_day__last_week'] = energyByDayLastWeek;
    charts['energy_by_day__previous_week'] = energyByDayPreviousWeek;
    charts['energy_by_day__last_month'] = energyByDayLastMonth;
    charts['energy_by_day__previous_month'] = energyByDayPreviousMonth;
    charts['energy_by_day__last_year'] = energyByDayLastYear;
    charts['energy_by_day__previous_year'] = energyByDayPreviousYear;

    # Write API File
    File.write(jsonDir + '/charts.json', charts.to_json)

end
