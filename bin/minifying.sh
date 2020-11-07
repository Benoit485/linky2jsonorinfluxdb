
echo "Minifying"

python3 -m rcssmin < "public/static/css/style.css" | perl -p -e 's/\n//' > public/static/css/style.min.css

./node_modules/.bin/babel public/static/js/graphiques.js  --compact true --minified --no-comments -o public/static/js/graphiques.min.js
./node_modules/.bin/babel public/static/js/aide.js  --compact true --minified --no-comments -o public/static/js/aide.min.js
./node_modules/.bin/babel public/static/js/charts.class.js  --compact true --minified --no-comments -o public/static/js/charts.class.min.js
