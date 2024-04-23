#!/bin/bash

./log_delete.sh

LOG=bots-$(date +%Y%m%d).log

TS=$(date +%Y%m%d-%H%M%S)

echo 'RESTART' $TS

echo 'RESTART' $TS >> ./logs/restarts.log;

echo >> ./logs/$LOG
echo >> ./logs/$LOG
echo '*+*+*+*+*+*+*+*+*+*+*+*+*+*+*' >> ./logs/$LOG
echo >> ./logs/$LOG
echo 'RESTART' $TS >> ./logs/$LOG
echo >> ./logs/$LOG
echo '*+*+*+*+*+*+*+*+*+*+*+*+*+*+*' >> ./logs/$LOG
echo >> ./logs/$LOG
echo >> ./logs/$LOG

##node ./jalendu/deploy-commands.js >> ./logs/$LOG 2>&1

node -v

node bots.js >> ./logs/$LOG 2>&1

#node db.js >> ./logs/$LOG 2>&1
#node jalendu.js