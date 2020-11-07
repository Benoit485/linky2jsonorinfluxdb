/*
 * InfoSplatch
 * chart.class.js
 */

// https://api.highcharts.com/highcharts/

var charts = {
    // https://api.highcharts.com/highcharts/global

    chartsGenerated: {},

    setOptions: function(options = {}) {
        Highcharts.setOptions({
            lang: {
                months: [
                    'Janvier',
                    'Février',
                    'Mars',
                    'Avril',
                    'Mai',
                    'Juin',
                    'Juillet',
                    'Août',
                    'Septembre',
                    'Octobre',
                    'Novembre',
                    'Décembre'
                ],
                shortMonths: [
                    'Jan',
                    'Fév',
                    'Mar',
                    'Avr',
                    'Mai',
                    'Jun',
                    'Jul',
                    'Aou',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ],
                weekdays: [
                    'Dimanche',
                    'Lundi',
                    'Mardi',
                    'Mercredi',
                    'Jeudi',
                    'Vendredi',
                    'Samedi'
                ],
                shortWeekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
            },
            options
        })
    },

    create: function(id, data) {
        var xAxisMinRange = 'D'
        if (typeof data.xAxisMinRange != 'undefined') {
            xAxisMinRange = data.xAxisMinRange
        }

        this.chartsGenerated[id] = Highcharts.chart(
            id,
            $.extend(
                true,
                {
                    // title
                    title: {
                        text: ''
                    },

                    // subtitle
                    subtitle: {
                        text:
                            document.ontouchstart === undefined
                                ? //'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                                  ''
                                : ''
                    },

                    // time
                    time: {
                        timezone: 'Europe/Paris'
                    },

                    // chart
                    chart: {
                        type: 'line', //bar line spline
                        zoomType: 'x', // x y xy
                        resetZoomButton: {
                            position: {
                                x: -40,
                                y: 0
                            }
                        },
                        backgroundColor: '#3B3B3B'
                    },

                    // credit
                    credits: {
                        enabled: false
                    },

                    // tooltip
                    tooltip: {
                        crosshairs: true,
                        shared: true,
                        dateTimeLabelFormats: {
                            day: '%A %d %B %Y',
                            //month: '%B %Y',
                            //year: '%Y',
                            week: '',
                            hour: '%A %d %B %Y %H',
                            minute: '%A %d %B %Y %H:%M',
                            second: '%A %d %B %Y %H:%M:%S',
                            millisecond: '%A %d %B %Y %H:%M:%S.%L'
                        }
                    },

                    // legend
                    legend: {
                        enabled: true,
                        backgroundColor:
                            (Highcharts.theme &&
                                Highcharts.theme.legendBackgroundColor) ||
                            '#FFFFFF'
                    },

                    // plotOptions
                    plotOptions: {
                        spline: {
                            lineWidth: 3,
                            states: {
                                hover: {
                                    lineWidth: 3
                                }
                            },
                            marker: {
                                enabled: false,
                                states: {
                                    hover: {
                                        enabled: true,
                                        symbol: 'circle',
                                        radius: 5,
                                        lineWidth: 1
                                    }
                                }
                            }
                        },
                        line: {
                            lineWidth: 3,
                            states: {
                                hover: {
                                    lineWidth: 3
                                }
                            },
                            marker: {
                                enabled: false,
                                states: {
                                    hover: {
                                        enabled: true,
                                        symbol: 'circle',
                                        radius: 5,
                                        lineWidth: 1
                                    }
                                }
                            }
                        },
                        areasplinerange: {
                            marker: {
                                enabled: false
                            }
                        }
                    },

                    // axis x
                    xAxis: [
                        {
                            //categories: data.local_label, // if is not datetime
                            type: 'datetime', //"linear" | "logarithmic" | "datetime" | "category" | "treegrid"
                            labels: {
                                style: {
                                    color: '#FFffFF'
                                }
                            },
                            dateTimeLabelFormats: {
                                day: '%e. %b',
                                week: '%e. %b',
                                month: '%B %Y'
                            },
                            minTickInterval: this.getMinTrickInterval(
                                xAxisMinRange
                            )
                        }
                    ],

                    // axis y
                    yAxis: [
                        {
                            title: {
                                text: '',
                                style: {
                                    color: '#FFffFF'
                                }
                            },
                            labels: {
                                format: '{value}',
                                style: {
                                    color: '#FFffFF'
                                }
                            }
                        }
                    ],

                    // series
                    series: []
                },
                data
            )
        )
    },

    getMinTrickInterval: function(xAxisMinRange) {
        var ms = 1,
            s = 1000 * ms,
            m = 60 * s,
            h = 60 * m,
            day = 24 * h,
            month = 30 * day,
            year = 365 * day

        //var year = 1000 * 60 * 60 * 24 * 30;

        switch (xAxisMinRange) {
            case 'ms':
                return ms
            case 's':
                return s
            case 'm':
                return m
            case 'h':
                return h
            default:
            case 'D':
                return day
            case 'M':
                return month
            case 'Y':
                return year
        }
    },

    redraw: function(id) {
        this.chartsGenerated[id].redraw()
    }
}
