const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors');

connectToMongo();
const app = express()
const port = 5000;

app.use(cors()); // CORS (Cross-Origin Resource Sharing) middleware ko use karenge, jisse ke humare frontend aur backend alag-alag domains pe hone ke bawajood communicate kar sakein
app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth') ) // url and file path
app.use('/api/notes', require('./routes/notes') )
  
app.get('/', (req, res) => {
  res.send('Hello Suhail! = Express Api call 3')
})

// app.post('/api/auth', (req, res) => {
//   console.log(req.body);
//   res.json(req.body);
// }); 


app.listen(port, () => {
  console.log(`iNotebook Backend listening on port ${port}`)
})





// {
//   "message": "Welcome to Thunder Client",
//   "about": "Lightweight Rest API Client for VSCode",
//   "createdBy": "Ranga Vadhineni",
//   "launched": 2021,
//   "features": {
//     "git": "Save data to Git Workspace",
//     "themes": "Supports VSCode Themes",
//     "data": "Collections & Environment Variables",
//     "testing": "Scriptless Testing",
//     "local": "Local Storage & Works Offline"
//   },
//   "supports": {
//     "graphql": true,
//     "codeSnippet": true,
//     "requestChaining": true,
//     "scripting": true
//   }
// }