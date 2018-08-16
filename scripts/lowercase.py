import boto3
import sys

# This script updates users with a username/email address which contains uppercase chars to all lowercase chars


if len(sys.argv) != 3:
  print "USAGE: python lowercase.py region userpoolid"
  exit()

region = sys.argv[1]
userpoolid = sys.argv[2]
cognito = boto3.client('cognito-idp', region_name=region)

response = cognito.list_users(
    UserPoolId=userpoolid,
    AttributesToGet=[
        'email',
        'sub'
    ],
    Limit=60
)

count = 1
while len(response['Users']) > 0:
  count = count + 1

  for user in response['Users']:
    username = user['Username'] 
    for attribute in user['Attributes']:
      if attribute['Name'] == 'email': 
        email = attribute['Value']
        if any(c.isupper() for c in email):
          print('{}, {} contains uppercase'.format(username, email))
          response = cognito.admin_update_user_attributes(
              UserPoolId=userpoolid,
              Username=username,
              UserAttributes=[
                  {
                      'Name': 'email',
                      'Value': email.lower()
                  },
              ]
          )
        else:
          print('{}, {} contains no uppercase'.format(username, email))
  
  if 'PaginationToken' in response:
    response = cognito.list_users(
        UserPoolId='us-west-2_bUtASxUz6',
        AttributesToGet=[
            'email',
            'sub'
        ],
        Limit=60,
        PaginationToken=response['PaginationToken']
    )
  else:
    break

