#!/bin/bash

# Set the AWS environment variables
#

AWS_REGION="us-west-2"
export AWS_REGION 

USER_POOL="us-west-2_bUtASxUz6"
export USER_POOL

USER_FILE="Integration-LOAD.csv"
export USER_FILE

# Use the AWS Cognito CLI to add the user
userFile=$USER_FILE

# Set the CSV comma delimeter
IFS=","

# Loop through the user file to add the users

while read f1 f2 f3 f4 f5 f6 f7 f8 f9
do
aws cognito-idp admin-create-user --region $AWS_REGION --user-pool-id $USER_POOL --username $f1 --user-attributes Name=custom:RACFID,Value=$f2 Name=custom:RACFId,Value=$f2 Name=given_name,Value=$f3 Name=family_name,Value=$f4 Name=email,Value=$f1 Name=phone_number,Value=$f5 Name=custom:County,Value=$f6 Name=custom:Office,Value=$f7 Name=preferred_username,Value=$f6 Name=custom:Role,Value="$f9" Name=zoneinfo,Value="$f9" Name=custom:Permission,Value="$f8" Name=email_verified,Value=True --desired-delivery-mediums "EMAIL"
echo "$f1 is being added to $USER_POOL with the Role: $f9 and the Permission: $f8"
done < $USER_FILE

