#!/bin/bash

days=$(date +%s --date="-3 days")
echo days = $days

for file in ./logs/bots-*.log; do
    echo file = $file
    fdate=${file:12:8}
    echo $fdate
    fsec=$(date +%s --date=${fdate/.log/})
    echo fsec = $fsec
    if [[ $fsec -lt $days ]]; then
        echo delete $file
        rm $file
    fi
done
