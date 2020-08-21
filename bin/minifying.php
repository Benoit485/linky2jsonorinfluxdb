#!/usr/bin/php
<?php

# sudo apt install python3-pip && pip3 install rjsmin && pip3 install rcssmin

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$dirJs = realpath(__DIR__.'/../public/static/js');
$dirCss = realpath(__DIR__.'/../public/static/css');

$filesJs = scandir($dirJs);
$filesCss = scandir($dirCss);

$date = date('Y-m-d H:i:s');

foreach($filesJs as $fileJs)
{
    if($fileJs == '.' || $fileJs == '..') continue;

    if(strrpos($fileJs, '.min.js') ) continue;

    $fileJsMin = str_replace('.js', '.min.js', $fileJs);

    $code = "/*\n * [InfoSplatch] linky-logs.domosplatch.fr";
    //$code .= "\n * File : $fileJs";
    //$code .= "\n * File Min : $fileJsMin";
    $code .= "\n * Generate date : $date";
    $code .= "\n */";
    $code .= "\n";
    $code .= exec("python3 -m rjsmin < $dirJs/$fileJs | perl -p -e 's/\n//'");
    //echo $code;
    echo "\n$fileJs => $fileJsMin";

    if( ! file_put_contents("$dirJs/$fileJsMin", $code) )
    {
        echo "\nError for $fileJsMin";
    }

    //break;
}

foreach($filesCss as $fileCss)
{
    $ext = 'css';

    if($fileCss == '.' || $fileCss == '..') continue;

    if(strrpos($fileCss, ".min.$ext") ) continue;

    $fileCssMin = str_replace(".$ext", ".min.$ext", $fileCss);

    $code = "/*\n * [InfoSplatch] gestion-granules.domosplatch.fr";
    //$code .= "\n * File : $fileJs";
    //$code .= "\n * File Min : $fileJsMin";
    $code .= "\n * Generate date : $date";
    $code .= "\n */";
    $code .= "\n";
    $code .= exec("python3 -m rcssmin < $dirCss/$fileCss | perl -p -e 's/\n//'");
    //echo $code;
    echo "\n$fileCss => $fileCssMin";

    if( ! file_put_contents("$dirCss/$fileCssMin", $code) )
    {
        echo "\nError for $fileCssMin";
    }

    //break;
}

echo "\n";
