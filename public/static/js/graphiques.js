$(document).ready(function() {

    $('#showConso_button')[0].addEventListener('click', function(e) {
        showPower()
    })

    $('#showMonthlyUseForEveryYears_button')[0].addEventListener('click', function(e) {
        monthlyUseForEveryYears()
    })

    $('#showByYears_button')[0].addEventListener('click', function(e) {
        showByYears()
    })

    var getChart = [
        'chart:power_last_day',
        'chart:day_last_month',
        'chart:day_previous_month',
        'chart:day_last_year',
        'chart:day_previous_year',
        //'chart:power',
        //'chart:year',
        'chart:month_this_year',
        'chart:month_last_year'
    ]
    var urlApiGraph = '/api/' + getChart.join('-')

    moment.locale('fr')
    charts.setOptions()

    Highcharts.getJSON(urlApiGraph, function(data) {
        var lastDay = data['chart:power_last_day'][0][0],
            lastDayStr = moment(lastDay).format('dddd DD MMMM YYYY')
        lastDayStr = lastDayStr.charAt(0).toUpperCase() + lastDayStr.slice(1)
        $('#derniereMaj').text(lastDayStr)

        data['chart:day_previous_month'] = data['chart:day_previous_month'].map(
            function(value) {
                return [
                    moment(value[0])
                        .add(1, 'month')
                        .valueOf(),
                    value[1]
                ]
            }
        )

        var last_month_average =
            Math.round(
                (data['chart:day_last_month'].reduce((a, b) => a + b[1], 0) /
                    data['chart:day_last_month'].length) *
                    1000
            ) / 1000
        var day_last_month_average = data['chart:day_last_month'].map(function(
            value
        ) {
            return [value[0], last_month_average]
        })

        charts.create('graph_energy_days', {
            xAxisMinRange: 'D',

            yAxis: [
                {
                    labels: {
                        format: '{value} kWh'
                    }
                }
            ],

            series: [
                {
                    id: 'energy_by_day__last_month',
                    name: 'Enegie consommée',
                    //color: 'red',
                    type: 'column',
                    //yAxis: 0,
                    data: data['chart:day_last_month'],
                    tooltip: {
                        valueSuffix: ' kWh',
                        valueDecimals: 3
                    }
                },
                {
                    id: 'energy_by_day__previous_month',
                    name: 'Mois précedent',
                    color: '#9238c9',
                    type: 'column',
                    data: data['chart:day_previous_month'],
                    tooltip: {
                        valueSuffix: ' kWh',
                        valueDecimals: 3
                    }
                },
                {
                    id: 'average',
                    name: 'Moyenne',
                    color: '#c90005',
                    type: 'line',
                    linkedTo: ':energy_by_day__previous_month',
                    dashStyle: 'LongDash',
                    data: day_last_month_average,
                    tooltip: {
                        valueSuffix: ' kWh',
                        valueDecimals: 3
                    }
                }
                /*, {
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
            }*/
            ]
        })

        var yAxisHeight = 0
        var index = 0
        var energy_average_day = []
        data['chart:power_last_day'].map(value => {
            value[1] *= 1000
            return value
        })
        data['chart:power_last_day'].forEach(function(value) {
            yAxisHeight = Math.max(yAxisHeight, value[1])

            if (index === 0) {
                index = value[1]
                return null
            }

            energy_average_day.push([
                value[0],
                ((value[1] + index) / 2) * 0.001
            ])
            index = 0
        })

        charts.create('conso_w_jour', {
            xAxisMinRange: 'm',

            yAxis: [
                {
                    title: {
                        text: 'Puissance (Watt)'
                    },
                    labels: {
                        format: '{value} W'
                    },
                    //lineWidth: 1,
                    min: 0,
                    max: yAxisHeight
                },
                {
                    title: {
                        text: 'Energie (kWh)',
                        style: {
                            color: '#FFffFF'
                        }
                    },
                    labels: {
                        format: '{value} kWh',
                        style: {
                            color: '#FFffFF'
                        }
                    },
                    min: 0,
                    max: yAxisHeight * 0.001,
                    opposite: 1
                }
            ],

            plotOptions: {
                column: {
                    opacity: 0.8
                }
            },

            series: [
                {
                    id: 'power_last_day',
                    name: 'Puissance consommée',
                    color: '#1ac0ff',
                    type: 'line',
                    //yAxis: 0,
                    data: data['chart:power_last_day'],
                    tooltip: {
                        valueSuffix: ' W',
                        valueDecimals: 0
                    }
                },
                {
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
                }
            ]
        })

        data['chart:day_previous_year'] = data['chart:day_previous_year'].map(
            function(value) {
                return [
                    moment(value[0])
                        .add(1, 'year')
                        .valueOf(),
                    value[1]
                ]
            }
        )

        var last_year_average =
            Math.round(
                (data['chart:day_last_year'].reduce((a, b) => a + b[1], 0) /
                    data['chart:day_last_year'].length) *
                    1000
            ) / 1000
        var day_last_year_average = data['chart:day_last_year'].map(function(
            value
        ) {
            return [value[0], last_year_average]
        })

        charts.create('graph_last_year', {
            xAxisMinRange: 'D',

            tooltip: {
                dateTimeLabelFormats: {
                    hour: '%A %d %B %Y' // not show hour because it's showed by default (problem with timezone)
                }
            },

            yAxis: [
                {
                    labels: {
                        format: '{value} kWh'
                    }
                }
            ],

            series: [
                {
                    id: 'energy_by_day__last_year',
                    name: 'Energie consommée',
                    //color: '#1ac0ff',
                    type: 'line',
                    //yAxis: 0,
                    data: data['chart:day_last_year'],
                    tooltip: {
                        valueSuffix: ' kWh',
                        valueDecimals: 3
                    }
                },
                {
                    id: 'energy_by_day__previous_year',
                    name: 'Année précedente',
                    color: '#9238c9',
                    type: 'line',
                    //linkedTo: ':previous',
                    data: data['chart:day_previous_year'],
                    tooltip: {
                        valueSuffix: ' kWh',
                        valueDecimals: 3
                    }
                },
                {
                    id: 'average_on_year',
                    name: 'Moyenne',
                    color: '#c90005',
                    type: 'line',
                    linkedTo: ':energy_by_day__last_year',
                    dashStyle: 'LongDash',
                    data: day_last_year_average,
                    tooltip: {
                        valueSuffix: ' kWh',
                        valueDecimals: 3
                    }
                }
            ]
        })

        data['chart:month_this_year'] = data['chart:month_this_year'].map(
            function(value) {
                var moment1 = moment(value[0])

                var monthStr = moment1.format('MMMM YYYY')
                monthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1)
                return [monthStr, value[1]]
            }
        )

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

            yAxis: [
                {
                    labels: {
                        format: '{value} kWh'
                    }
                }
            ],

            tooltip: {
                valueSuffix: ' kWh (<b>{point.percentage:.1f}%</b>)',
                valueDecimals: 0
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

            series: [
                {
                    id: 'energy_by_month__every_months',
                    name: 'Energie consommée',
                    color: '#1ac0ff',
                    type: 'pie',
                    data: data['chart:month_this_year']
                }
            ]
        })

        data['chart:month_last_year'] = data['chart:month_last_year'].map(
            function(value) {
                var moment1 = moment(value[0])

                var monthStr = moment1.format('MMMM YYYY')
                monthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1)
                return [monthStr, value[1]]
            }
        )

        charts.create('energy_by_month_last_year__every_months', {
            chart: {
                type: 'pie',
                backgroundColor: '#3B3B3B',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },

            yAxis: [
                {
                    labels: {
                        format: '{value} kWh'
                    }
                }
            ],

            tooltip: {
                valueSuffix: ' kWh (<b>{point.percentage:.1f}%</b>)',
                valueDecimals: 0
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

            series: [
                {
                    id: 'energy_by_month_last_year__every_months',
                    name: 'Energie consommée',
                    color: '#1ac0ff',
                    type: 'pie',
                    data: data['chart:month_last_year']
                }
            ]
        })
    }) //Highcharts.getJSON
}) //$(document).ready

function showPower() {

    $('#showConso_loading').removeClass('hide');
    $('#showConso').addClass('hide');

    var getChart = [
        'chart:power'
    ]
    var urlApiGraph = '/api/' + getChart.join('-')

    moment.locale('fr')
    charts.setOptions()

    Highcharts.getJSON(urlApiGraph, function(data) {

        // change kW to W
        data['chart:power'].map(value => {
            value[1] *= 1000
            return value
        })

        charts.create('graph_conso_w', {
            xAxisMinRange: 'm',

            chart: {
                renderTo: 'graph_conso_w'
                //height: (!window.screenTop && !window.screenY) ? '5000px' : '200px'
            },

            yAxis: [
                {
                    labels: {
                        format: '{value} W'
                    }
                }
            ],

            series: [
                {
                    id: 'graph_conso_w',
                    name: 'Puissance consommée',
                    color: '#1ac0ff',
                    type: 'line',
                    data: data['chart:power'],
                    tooltip: {
                        valueSuffix: ' W',
                        valueDecimals: 0
                    }
                }
            ]
        })

        $('#showConso_loading').addClass('hide');
        $('#graph_conso_w').removeClass('hide');

    })
}

function monthlyUseForEveryYears() {

    $('#showMonthlyUseForEveryYears').addClass('hide');
    $('#showMonthlyUseForEveryYears_loading').removeClass('hide');

    var getChart = [
        'chart:month'
    ]
    var urlApiGraph = '/api/' + getChart.join('-')

    moment.locale('fr')
    charts.setOptions()

    Highcharts.getJSON(urlApiGraph, function(data) {

        const chartMonths = data['chart:month']

        // order by years - month
        const dataMonths = []
        const series = [] // for chart
        const colors = [ // for chart
            '#1ac0ff',
            '#fffa39',
            '#ff1428',
            '#ff39eb',
            '#334fff',
            '#2eb719',
            '#997007',
            '#ffebc3'
        ]
        let colorIndex = 0

        const firstValue = chartMonths[0]
        const firstYear = moment(firstValue[2]).format('YYYY')
        const firstYearInt = parseInt(firstYear)
        const lastValue = chartMonths[(chartMonths.length-1)]
        const lastYear = moment(lastValue[2]).format('YYYY')
        const lastYearInt = parseInt(lastYear)

        // every year
        for(let year=firstYearInt; year <= lastYearInt; year++) {

            const yearStr = year.toString()

            dataMonths[yearStr] = [];

            // every month
            for(let month = 1; month <= 12; month++) {

                const dataThisMonth = chartMonths.filter(
                    value => parseInt(moment(value[2]).format('YYYY')) === year
                        && parseInt(moment(value[2]).format('M')) === month
                )

                const monthStrCheck = month.toString();
                const monthStr = monthStrCheck.length === 1 ? '0' + monthStrCheck : monthStrCheck

                if(dataThisMonth.length > 0) {
                    dataMonths[yearStr].push(dataThisMonth[0][1])
                } else {
                    dataMonths[yearStr].push(0)
                }

            }

            if(colors[colorIndex] === undefined) {
                colors[colorIndex] =  '#'+(Math.random()*0xFFFFFF<<0).toString(16)
            }

            // make series for chart
            series.push({
                id: 'monthlyUseForEveryYears_' + yearStr,
                name: yearStr,
                color: colors[colorIndex],
                type: 'column',
                data: dataMonths[yearStr],
                tooltip: {
                    valueSuffix: ' kWh',
                    valueDecimals: 0
                }
            })

            colorIndex++
        }

        console.log(series)

        charts.create('monthlyUseForEveryYears', {
            //xAxisMinRange: 'm',

            chart: {
                type: 'column',
                renderTo: 'monthlyUseForEveryYears'
                //height: (!window.screenTop && !window.screenY) ? '5000px' : '200px'
            },

            xAxis: [
                {
                    type: 'category',
                    categories: longMonths,
                    crosshair: true,
                    minTickInterval: false
                }
            ],

            yAxis: [
                {
                    labels: {
                        format: '{value} kWh'
                    }
                }
            ],

            plotOptions: {
                column: {
                    pointPadding: 0.1,
                    borderWidth: 0
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:16px">{point.key}</span><br><br><table>',
                pointFormat: '<tr><td style="font-size:14px;color:{series.color};padding:0"><b>{series.name}:</b></td>' +
                    '<td style="font-size:14px;padding:0;padding-left:10px"><b>{point.y:.0f} kWh</b></td></tr>',
                footerFormat: '</table>',
                useHTML: true
            },

            series: series
        })

        $('#showMonthlyUseForEveryYears_loading').addClass('hide');
        $('#monthlyUseForEveryYears').removeClass('hide');

    })
}

function showByYears() {

    $('#showByYears').addClass('hide');
    $('#showByYears_loading').removeClass('hide');

    var getChart = [
        'chart:year'
    ]
    var urlApiGraph = '/api/' + getChart.join('-')

    moment.locale('fr')
    charts.setOptions()

    Highcharts.getJSON(urlApiGraph, function(data) {

        charts.create('energy_by_year__every_years', {
            xAxisMinRange: 'Y',

            tooltip: {
                dateTimeLabelFormats: {
                    day: '%Y'
                }
            },

            yAxis: [
                {
                    labels: {
                        format: '{value} kWh'
                    }
                }
            ],

            series: [
                {
                    id: 'energy_by_year__every_years',
                    name: 'Energie consommée',
                    color: '#1ac0ff',
                    type: 'column',
                    data: data['chart:year'],
                    tooltip: {
                        valueSuffix: ' kWh',
                        valueDecimals: 0
                    }
                }
            ]
        })

        $('#showByYears_loading').addClass('hide');
        $('#energy_by_year__every_years').removeClass('hide');
    })
}
