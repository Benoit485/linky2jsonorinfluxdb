# Linky to Json / InfluxDb

This program is write in Javascript and work with NodeJS

He can get your data from Enedis website for save in files (sqlite) and show in website interface or send Json to another interface (Same Node-red, Domoticz or Jeedom).

He also can record data to InfluxDb database.

This version is compatible of new API of Enedis (deployed from june 2020).

Thanks to [Miko53](https://github.com/miko53/ "Miko53") for his ruby script for know how to connect to Enedis.

### Dependencies

* NodeJS
* Yarn

### Instatallation
* `cd /www`
* `git clone https://Benoit485/linky2jsonorinfluxdb.git`
* `cd ./linky2jsonorinfluxdb`
* `cp ./var/config-sample.json ./var/config.json`
* `yarn install`

### Configuration
Edit config file :

`nano /www/linky2jsonorinfluxdb/var/config.json`

Put your credentials for Enedis website : username and password.

You need to put Cookie : internalAuthId for work without Captcha (See after how to do).

You can activate and configure InfluxDb.

### Cron

You can set cron in config file same unix cron

You can see this website : [Crontab.guru](https://crontab.guru/), for know how to write cron time line

### Cookie : internalAuthId
You need to find this cookie for connection can work.

It's easy with Firefox :

Go to Enedis login webpage ([Can go by here directly](https://mon-compte.enedis.fr/auth/XUI/#login/&realm=/enedis&forward=true&spEntityID=SP-ODW-PROD&goto=%2FSSOPOST%2FmetaAlias%2Fenedis%2FproviderIDP%3FReqID%3Da2b4c0i4d7c9eaceja18ia3eg192j7%26index%3Dnull%26acsURL%3Dhttps%253A%252F%252Fapps.lincs.enedis.fr%252Fsaml%252FSSO%26spEntityID%3DSP-ODW-PROD%26binding%3Durn%253Aoasis%253Anames%253Atc%253ASAML%253A2.0%253Abindings%253AHTTP-POST&AMAuthCookie= "Enedis webpage")) and you must do click right and "Inspect" (FR : "Examiner l'élément).

Click on "Storage" ("Stockage" in french) tab and find inside Cookies the value for internalAuthId.

Copy this value to /var/config.json script.

### Help / Request

If you need help or you have request, you can open new Issue

### Author
- **Benoit485 (Benoît MERLE)
**
- ** [Miko53](https://github.com/miko53/ "Miko53") (For Enedis scrapper base library)
**

**You can give for thanks from [Paypal](https://www.paypal.me/benoit485/5 "Paypal")


![](https://static.infosplatch.fr/_/infosplatch/logo400.png)
