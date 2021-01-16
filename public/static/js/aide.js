$(document).ready(function() {
    var $linkApi = $('.link-api')

    $linkApi.each(function() {
        var $this = $(this)

        $this.html(
            $this
                .html()
                .replace(
                    '{{ssl}}',
                    document.location.protocol === 'https' ? 's' : ''
                )
                .replace('{{host}}', document.location.host)
                .replace(
                    '{{dateStart}}',
                    moment()
                        .subtract(15, 'days')
                        .format('YYYY-MM-DD')
                )
                .replace(
                    '{{dateEnd}}',
                    moment()
                        .subtract(5, 'days')
                        .format('YYYY-MM-DD')
                )
                .replace(
                    '{{dateStart2}}',
                    moment()
                        .subtract(15, 'days')
                        .format('YYYY-MM-DD')
                )
                .replace(
                    '{{dateEnd2}}',
                    moment()
                        .subtract(5, 'days')
                        .format('YYYY-MM-DD')
                )
                .replace(
                    '{{dateStart3}}',
                    moment()
                        .subtract(15, 'days')
                        .format('YYYY-MM-DD')
                )
                .replace(
                    '{{dateEnd3}}',
                    moment()
                        .subtract(5, 'days')
                        .format('YYYY-MM-DD')
                )
                .replace(
                    '{{dateStart4}}',
                    moment()
                        .subtract(15, 'days')
                        .format('YYYY-MM-DD')
                )
                .replace(
                    '{{dateEnd4}}',
                    moment()
                        .subtract(5, 'days')
                        .format('YYYY-MM-DD')
                )
        )

        $this.attr('href', $this.text())
    })
}) //$(document).ready
