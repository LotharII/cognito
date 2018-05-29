#!/bin/bash

# Set the AWS environment variables
#

AWS_REGION="us-west-2"
export AWS_REGION 

USER_POOL="us-west-2_bUtASxUz6"
export USER_POOL

USER_FILE="Integration-CHANGES-LOAD.csv"
export USER_FILE

# Use the AWS Cognito CLI to add the user
userFile=$USER_FILE

# Set the CSV comma delimeter
IFS=","

# Loop through the user file to add the users

while read f1 f2 f3 f4 f5 f6 f7 f8 f9
do
aws cognito-idp admin-update-user-attributes --region $AWS_REGION --user-pool-id $USER_POOL --username $f1 --user-attributes Name=custom:Role,Value="$f9" Name=zoneinfo,Value="$f8" Name=custom:Permission,Value="$f8" 
echo "$f1: is being changed, adding Role: $f9 adding permission: $f8"
done < $USER_FILE

