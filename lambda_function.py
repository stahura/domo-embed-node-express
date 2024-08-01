import json
import boto3
import requests

# AWS configuration
secrets_client = boto3.client('secretsmanager', region_name='us-east-2')


# Function to retrieve the secret
def get_secret(key):
    try:
        response = secrets_client.get_secret_value(SecretId=key)
        secret = json.loads(response['SecretString'])
        return secret
    except Exception as e:
        print(e)
        raise e


access_token = ""
embed_token = ""
secret_name = "domo-embed-secret"


def init():
    secret = get_secret(secret_name)
    return secret


def generate_access_token(secret):
    global access_token
    print("generating access token...")
    url = "https://api.domo.com/oauth/token?grant_type=client_credentials"
    headers = {
        'Authorization': 'Basic ' + secret['domo-secret']
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        access_token = response.json()['access_token']
        generate_embed_token()
    else:
        print(response.json())


def generate_embed_token():
    global embed_token
    print("generating embed token...")
    url = "https://api.domo.com/v1/cards/embed/auth"
    data = json.dumps({
        "sessionLength": 1440,
        "authorizations": [
            {
                "token": "Xo87l",
                "permissions": ["READ", "FILTER", "EXPORT"],
                "filters": []
            }
        ]
    })
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }

    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        embed_token = response.json()['authentication']
        return_response()
    else:
        print(response.json())


def return_response():
    return """
    <html>
    <body>
    <form id="form" action="https://public.domo.com/cards/Xo87l?referenceId=1" method="post">
        <input type="hidden" name="embedToken" value='{}'>
    </form>
    <script>
        document.getElementById("form").submit();
    </script>
    </body>
    </html>
    """.format(embed_token)


def handler(event, context):
    path = event['requestContext']['http']['path']

    if path == '/test':
        try:
            print("Getting Secret")
            secret = init()
            generate_access_token(secret)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/html'
                },
                'body': return_response()
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps('Error initializing secret: {}'.format(str(e)))
            }
    elif path == '/test2':
        return {
            'statusCode': 200,
            'body': json.dumps('connected to server - test2')
        }
    elif path == '/':
        return {
            'statusCode': 200,
            'body': json.dumps('connected to server')
        }
    else:
        return {
            'statusCode': 404,
            'body': json.dumps('400 - Not Found')
        }
