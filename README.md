# Linky to Json / InfluxDb

This program can make json files in your repertory than you want for share with another script , website or program (Same Node-red, Domoticz or Jeedom) and  record data to InfluxDb database.

This program work with [Miko53 linky_meter](https://github.com/miko53/linky_meter "Miko53 linky_meter") for connect to Enedis website.

This version is compatible of new API of Enedis (deployed from june 2020).

Thanks to Miko53 for his ruby script.

### Dependencies

* ruby
* ruby-json
* ruby-mechanize
* ruby-byebug
* ruby-influxdb
*  [Miko53 linky_meter](https://github.com/miko53/linky_meter "Miko53 linky_meter") 

### Instatallation
`cd /opt`
`git clone https://github.com/miko53/linky_meter.git`
`git clone https://Benoit485/linky2jsonorinfluxdb.git`
`cd ./linky2jsonorinfluxdb`
`cp config-sampe.sh config.sh`

### Configuration
Edit config file :
`nano /opt/linky2jsonorinfluxdb/config.sh`
Put your credentials for Enedis website : username and password.
You need to put Cookie : internalAuthId for work withour Captcha (See after how to do).
You can activate for record Json and dir.
You can activate and configure InfluxDb

### Cookie : internalAuthId
You need to find this cookie for connection can work.
It's easy with Firefox :
Go to Enedis login webpage ([Can go by here directly](https://mon-compte.enedis.fr/auth/XUI/#login/&realm=/enedis&forward=true&spEntityID=SP-ODW-PROD&goto=%2FSSOPOST%2FmetaAlias%2Fenedis%2FproviderIDP%3FReqID%3Da2b4c0i4d7c9eaceja18ia3eg192j7%26index%3Dnull%26acsURL%3Dhttps%253A%252F%252Fapps.lincs.enedis.fr%252Fsaml%252FSSO%26spEntityID%3DSP-ODW-PROD%26binding%3Durn%253Aoasis%253Anames%253Atc%253ASAML%253A2.0%253Abindings%253AHTTP-POST&AMAuthCookie= "Enedis webpage")) and you must do click right and "Inspect" (FR : "Examiner l'élément).
Click on "Storage" tab and find inside Cookies the value for internalAuthId.
Copy this value to config.sh script.

### Help / Request

If you need help or you have request, you can open new Issue

### Author
**Benoit485 (Benoît MERLE)
**

*You can give for thanks from [Paypal](https://www.paypal.me/benoit485/5 "Paypal") 
*

![](https://static.infosplatch.fr/_/infosplatch/logo400.png)
