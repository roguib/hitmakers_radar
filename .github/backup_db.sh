#! /bin/bash

PRIVATE_KEY_PATH=~/.ssh/hitmakers_radar.pem
EC2_INSTANCE=ec2-user@ec2-3-122-119-88.eu-central-1.compute.amazonaws.com
NOW=$(date +"%d_%m_%Y_%H_%M")
FILE_NAME=hitmakers_radarDB$NOW.zip

echo 'Stoping docker compose'
ssh -i $PRIVATE_KEY_PATH $EC2_INSTANCE docker-compose -f /home/ec2-user/app/docker-compose.yml down

echo 'Creating mongodb backup folder'
ssh -i $PRIVATE_KEY_PATH $EC2_INSTANCE sudo zip $FILE_NAME -r /home/ec2-user/app/data

scp -r -i $PRIVATE_KEY_PATH $EC2_INSTANCE:/home/ec2-user/$FILE_NAME /mnt/c/users/roger/Documents/Proyectos/backups/hitmakers_radar

ssh -i $PRIVATE_KEY_PATH $EC2_INSTANCE sudo rm -rf $FILE_NAME

echo 'Starting docker compose'
ssh -i $PRIVATE_KEY_PATH $EC2_INSTANCE docker-compose -f /home/ec2-user/app/docker-compose.yml up -d