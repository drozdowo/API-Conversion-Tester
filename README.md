# API-Conversion-Tester
Helps test converted API endpoints against the data produced by their original counterparts.

## How to Install
- Clone this repository
- Run the 'npm install' command in the root directory of this repository
- Adjust test.json 
- npm run start

## test.json
test.json is the file that contains all of the tests that will be run. The format is very simple to follow:

### original and converted
`"original": {
    "baseUrl": "https://original-api-url.com/",
    "auth": {
      "payload": {
        "username": "USERNAME",
        "password": "PASSWORD"
      },
      "endpoint": "/login/auth"
    }
  },
  "converted": {
    "baseUrl": "http://localhost:3000"
  },`
  
  Simply replace these with the relevant information. note: the auth object can be removed entirely if there is no authentication required.
  
  ### tests
  Tests is an array of objects that look like the following:
  `{
      "testName": "Get Test 1",
      "endpoint": "/getTest",
      "method": "GET",
      "payload": {}
    },`
    `{
      "testName": "Post Test",
      "endpoint": "/depositMoney",
      "method": "POST",
      "payload": {
        "accountId": 12345,
        "deposit": 123,
        "currency": "USD"
      }
    }`
  Again, adjust these for your use and then run the script. The script will post the same data to both endpoints and then analyze the result.  

