import boto3
import sys
import csv
import datetime


# This script updates users with a username/email address which contains uppercase chars to all lowercase chars


if len(sys.argv) != 3:
  print "USAGE: python lowercase.py region userpoolid"
  exit()
environment = 'stg'

region = sys.argv[1]
userpoolid = sys.argv[2]
cognito = boto3.client('cognito-idp', region_name=region)

with open('users-{}-{}.csv'.format(environment, datetime.datetime.today().strftime('%Y-%m-%d')), 'wb') as csvfile:
    filewriter = csv.writer(csvfile, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    filewriter.writerow(['Name', 'Role', 'Permission', 'County', 'RACFID', 'Email'])
    response = cognito.list_users(
        UserPoolId=userpoolid,
        Limit=60
    )

    count = 1
    while len(response['Users']) > 0:
      count = count + 1

      for user in response['Users']:
        firstname = ''
        lastname = ''
        role = ''
        permissions = ''
        county = ''
        racfid = ''
        email = ''
      
        for attribute in user['Attributes']:
          if attribute['Name'] == 'given_name': 
            firstname = attribute['Value']
          elif attribute['Name'] == 'family_name': 
            lastname = attribute['Value']
          elif  attribute['Name'] == 'custom:Role':
            role = attribute['Value']
          elif attribute['Name'] == 'custom:Permission': 
            permissions = attribute['Value']
          elif attribute['Name'] == 'custom:County': 
            county = attribute['Value']
          elif  attribute['Name'] == 'custom:RACFID':
            racfid = attribute['Value']
          elif attribute['Name'] == 'email': 
            email = attribute['Value']

        print('"{} {}", "{} ", "{} ", "{} ", "{} ", "{} "'.format(firstname, lastname, role, permissions, county, racfid, email))
        
        filewriter.writerow(['{} {}'.format(firstname, lastname), role, permissions, county, racfid, email])




      if 'PaginationToken' in response:
        response = cognito.list_users(
            UserPoolId=userpoolid,
            Limit=60,
            PaginationToken=response['PaginationToken']
        )
      else:
        break


