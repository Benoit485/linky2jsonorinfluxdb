


$(document).ready(function()
{
    var urlApiGraph = '/api/charts.json';

    moment.locale('fr');
    charts.setOptions();

    Highcharts.getJSON(urlApiGraph, function (data) {

        var lastDay = data.power_last_day[0][0],
            lastDayStr = moment(lastDay).format('dddd DD MMMM YYYY');
        lastDayStr = lastDayStr.charAt(0).toUpperCase() + lastDayStr.slice(1);
        $('#derniereMaj').text(lastDayStr);

        data.energy_by_day__previous_month = data.energy_by_day__previous_month.map(function(value)
        {
            return [moment(value[0]).add(1, 'month').valueOf(), value[1]];
        });

        charts.create('graph_energy_days', {

            xAxisMinRange: 'D',

            yAxis: [{
                labels: {
                    format: '{value} kWh'
                }
            }],

            series : [{
                id: 'energy_by_day__last_month',
                name: 'Enegie consommée',
                //color: 'red',
                type: 'line',
                //yAxis: 0,
                data: data.energy_by_day__last_month,
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 3
                }
            }, {
                id: 'energy_by_day__previous_month',
                name: 'Mois précedent',
                color: '#9238c9',
                type: 'line',
                //linkedTo: ':previous',
                data: data.energy_by_day__previous_month,
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 3
                }
            }/*, {
                id: 'month_on_last_year',
                name: 'Année précedente',
                color: '#edf320',
                type: 'line',
                //linkedTo: ':previous',
                data: month_on_last_year,
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 3
                }
            }*/]
        });

        var yAxisHeight = 0;
        var index = 0;
        var energy_average_day = [];
        data.power_last_day.forEach(function(value)
        {
            yAxisHeight = Math.max(yAxisHeight, value[1]);

            if(index === 0)
            {
                index = value[1];
                return null;
            }

            energy_average_day.push([value[0], (value[1] + index) / 2 * 0.001]);
            index = 0;
        });

        console.log(yAxisHeight);

        charts.create('conso_w_jour', {

            xAxisMinRange: 'm',

            yAxis: [{
                title: {
                    text: 'Puissance (Watt)'
                },
                labels: {
                    format: '{value} W'
                },
                //lineWidth: 1,
                min: 0,
                max: yAxisHeight
            }, {
                title: {
                    text: 'Energie (kWh)',
                    style: {
                        color: '#FFffFF',
                    }
                },
                labels: {
                    format: '{value} kWh',
                    style: {
                        color: '#FFffFF',
                    }
                },
                min: 0,
                max: yAxisHeight * 0.001,
                opposite: 1
            }],

            plotOptions: {
                column: {
                    opacity: 0.8
                }
            },

            series : [{
                id: 'power_last_day',
                name: 'Puissance consommée',
                color: '#1ac0ff',
                type: 'line',
                //yAxis: 0,
                data: data.power_last_day,
                tooltip: {
                    valueSuffix: ' W',
                    valueDecimals: 0
                }
            }, {
                id: 'energy_average_day',
                name: 'Energie moyenne',
                color: '#9238c9',
                type: 'column',
                yAxis: 1,
                //linkedTo: ':previous',
                data: energy_average_day,
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 3
                }
            }]
        });

        charts.create('graph_last_year', {

            xAxisMinRange: 'D',

            yAxis: [{
                labels: {
                    format: '{value} kWh'
                }
            }],

            series : [{
                id: 'energy_by_day__last_year',
                name: 'Energie consommée',
                //color: '#1ac0ff',
                type: 'line',
                //yAxis: 0,
                data: data.energy_by_day__last_year,
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 3
                }
            }, {
                id: 'energy_by_day__previous_year',
                name: 'Année précedente',
                color: '#9238c9',
                type: 'line',
                //linkedTo: ':previous',
                data: data.energy_by_day__previous_year,
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 3
                }
            }]
        });

        charts.create('graph_conso_w', {

            xAxisMinRange: 'm',

            chart: {
                renderTo: 'graph_conso_w'
                //height: (!window.screenTop && !window.screenY) ? '5000px' : '200px'
            },

            yAxis: [{
                labels: {
                    format: '{value} W'
                }
            }],

            series : [{
                id: 'graph_conso_w',
                name: 'Energie consommée',
                color: '#1ac0ff',
                type: 'line',
                data: data.power,
                tooltip: {
                    valueSuffix: ' W',
                    valueDecimals: 0
                }
            }]
        });

        data.energy_by_month__every_months = data.energy_by_month__every_months.map(function(value)
        {
            var moment1 =  moment(value[0]);

            if(moment1.format('YYYY') !== moment().format('YYYY') ) return null;

            var monthStr = moment1.format('MMMM YYYY');
            monthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
            return [monthStr, value[1]];
        });

        charts.create('energy_by_month__every_months', {

            chart: {
                type: 'pie',
                backgroundColor: '#3B3B3B',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },

            yAxis: [{
                labels: {
                    format: '{value} kWh'
                }
            }],

            tooltip: {
                valueSuffix: ' kWh (<b>{point.percentage:.1f}%</b>)',
                valueDecimals: 3
            },

            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: {
                            color: '#FFf'
                        }
                    }
                }
            },

            series : [{
                id: 'energy_by_month__every_months',
                name: 'Energie consommée',
                color: '#1ac0ff',
                type: 'pie',
                data: data.energy_by_month__every_months
            }]
        });

        charts.create('energy_by_year__every_years', {

            xAxisMinRange: 'Y',

            tooltip: {
                dateTimeLabelFormats: {
                    day: '%Y',
                }
            },

            yAxis: [{
                labels: {
                    format: '{value} kWh'
                }
            }],

            series : [{
                id: 'energy_by_year__every_years',
                name: 'Energie consommée',
                color: '#1ac0ff',
                type: 'column',
                data: data.energy_by_year__every_years,
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 0
                }
            }]
        });

    }); //Highcharts.getJSON

}); //$(document).ready





