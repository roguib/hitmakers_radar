#! /bin/bash

PRIVATE_KEY_PATH=~/.ssh/hitmakers_radar.pem
EC2_INSTANCE=$1
echo 'deploying to' $EC2_INSTANCE

if [ -f $PRIVATE_KEY_PATH ]; then
    echo "Private key file exists."
else 
    echo "Private key does not exist."
    exit
fi

echo 'Starting zip file generation'
zip -r hitmakers_radar.zip . -x "data/*" "node_modules/*" "build/*" ".git/*"

if [ -f ../hitmakers_radar/hitmakers_radar.zip ]; then
    echo "zip file has been created"
else     
    echo "zip file has not been created"
    exit
fi

echo 'Copying zip file into the instance'
scp -i $PRIVATE_KEY_PATH hitmakers_radar.zip $EC2_INSTANCE:~/app/

echo 'Extracting zip'
ssh -i $PRIVATE_KEY_PATH $EC2_INSTANCE unzip -u -o /home/ec2-user/app/hitmakers_radar.zip -d /home/ec2-user/app/

echo 'Removing zip'
ssh -i $PRIVATE_KEY_PATH $EC2_INSTANCE rm -rf /home/ec2-user/app/hitmakers_radar.zip

# 1. scp generated zip file into /app
# 2. unzip hitmakers_radar with -u option (update files, create if necessary)
# 3. remove zip folder
# --- Missing: ---
# 4. docker-compose down
# 5. sleep
# 6. docker-compose up