var express = require('express');
var app = express();
const axios = require('axios');
let accessToken = ""
let embedToken = ""

app.get('/', function (req, res) {
  console.log('connected to server')
})

app.get('/test', function (req, res) {
  generateAccessToken(res) //This generates access token then calls generateEmbedToken() on line 30
})

function generateAccessToken(res) {
   console.log("generating access token..")

   var config = {
      method: 'get',
      url: 'https://api.domo.com/oauth/token?grant_type=client_credentials&scope=data workflow audit buzz user account dashboard',
      headers: { 
        'Authorization': 'Basic YTg3NzQwYTctMzU4Yy00NmQzLTkxZWEtNDFjODY4NWQ2ZWYzOjlhY2YzYjJkN2FiODcyOGE2ZTg1Y2MxZTVlMTAwYWUwYTMyOGVlNTJhOTYwMDk4YzA5ZjMwNmU5NjY5MTI3NzI='
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
          "token":"Wn7lv",
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
          <form id="form" action="https://public.domo.com/cards/Wn7lv?referenceId=1" method="post">
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

