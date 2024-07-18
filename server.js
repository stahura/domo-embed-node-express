var express = require('express');
var app = express();
const axios = require('axios');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// AWS configuration
const client = new SecretsManagerClient({ region: 'us-east-2' }); // replace 'your-region' with the correct region

// Function to retrieve the secret
async function getSecret(key) {
    const command = new GetSecretValueCommand({ SecretId: key });
    try {
        const data = await client.send(command);
        return JSON.parse(data.SecretString);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

let accessToken = ""
let embedToken = ""


const secret_name = "domo-embed-secret";
async function init() {
    const secret = await getSecret(secret_name); // replace 'your-secret-name' with the correct secret name
    return secret;
}

app.get('/', function (req, res) {
  console.log('connected to server')
})

app.get('/test', async function (req, res) {
    try {
        console.log("Getting Secret")
        const secret = await init();
        generateAccessToken(res, secret); // Call generateAccessToken with the secret
    } catch (error) {
        res.status(500).send('Error initializing secret');
    }
});


function generateAccessToken(res, secret) {
   console.log("generating access token...")

   var config = {
      method: 'get',
      url: 'https://api.domo.com/oauth/token?grant_type=client_credentials',
      headers: {
        'Authorization': 'Basic '+ secret['domo-secret'] //ENTER YOUR BASE64 client:secret here
      }
    };

    axios(config)
    .then(function (response) {
      //response.data.access_token)
      accessToken = response.data.access_token
      generateEmbedToken(res)  //This generates embedToken and then sends the HTML form back on line 68
    })
    .catch(function (error) {
      console.log(error);
    });
}

function generateEmbedToken(res) {
   console.log("generating embed token...")
   var data = JSON.stringify({
      "sessionLength": 1440,
      "authorizations": [
        {
          "token":"Xo87l",
          "permissions": [
            "READ",
            "FILTER",
            "EXPORT"
          ],
          "filters": []
        }
      ]
    });

    var config = {
      method: 'post',
      url: 'https://api.domo.com/v1/cards/embed/auth',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' +  accessToken
      },
      data : data
    };

    axios(config)
    .then(function (response) {
      embedToken = response.data.authentication
      res.send(`
        <html>
        <body>
          <form id="form" action="https://public.domo.com/cards/Xo87l?referenceId=1" method="post">
            <input type="hidden" name="embedToken" value='${embedToken}'>
          </form>
          <script>
            document.getElementById("form").submit();
          </script>
        </body>
      </html>
      `)
    })
    .catch(function (error) {
      console.log(error);
    }); 
}

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})

