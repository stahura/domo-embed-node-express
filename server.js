require('dotenv').config(); //pull from .env file
var express = require('express');
var app = express();
const axios = require('axios');


//modocorp tokens
let accessToken = process.env.accessToken || "";
let embedToken = process.env.embedToken || "";
const tokenString = `${accessToken}:${embedToken}`
const base64Token = btoa(tokenString)


//const embedID = "gp9xk"
//const embedID = "16pyZ" //APP GENERATOR
const embedID = "6Wx9O"
const cardUrlAuth = "https://api.domo.com/v1/cards/embed/auth"
const cardEmbed = `https://public.domo.com/cards/${embedID}`
const dashboardUrlAuth = "https://api.domo.com/v1/stories/embed/auth"
const dashboardEmbed = `https://public.domo.com/embed/pages/${embedID}?appData=riley`

app.get('/', function (req, res) {
  console.log('connected to server')
})

app.get('/test', function (req, res) {
  generateAccessToken(res) //This generates access token then calls generateEmbedToken() on line 30
})

function generateAccessToken(res) {
   console.log("generating access token...")

   var config = {
      method: 'get',
      url: 'https://api.domo.com/oauth/token?grant_type=client_credentials&scope=data workflow audit buzz user account dashboard',
      headers: { 
        'Authorization': `Basic ${base64Token}` //ENTER YOUR BASE64 client:secret here
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
          "token":embedID,
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
      url: dashboardUrlAuth,
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
          <form id="form" action="${dashboardEmbed}" method="post">
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

