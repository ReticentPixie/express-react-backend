// ==========================================
//             DEPENDENCIES
// ==========================================
require('dotenv').config();             // get .env variables
const { PORT = 3001, DATABASE_URL } = process.env;    // pull PORT from .env, give default value of 3001
const express = require('express');     // import express
const app = express();                  // create application object
const mongoose = require('mongoose');   // import mongoose
// ----- import middleware -----
const cors = require('cors')            // import cors to allow cross-origin resource sharing
const morgan = require('morgan')        // import morgan to assist in development testing


// ==========================================
//             DATABASE CONNECTION
// ==========================================
mongoose.connect(DATABASE_URL);         // establish connection
const db = mongoose.connection;         // connection events to establish connection status
db.on('connected', () => console.log(`MongoDB is connected to ${db.name} on port ${db.port}`))
db.on('disconnected', () => console.log('Disconnected from MongoDB.'))
db.on('error', (err) => console.log(`MongoDB had an error of: ${err.message}`))


// ==========================================
//              MODEL
// ==========================================
/* 
    This is done here in server.js simply for ease in this project which will is very small in size
    HOWEVER it would typically be built as a .js file in the models folder (using the standard: import, define, convert, export steps)
*/
const Schema = mongoose.Schema;
const PeopleSchema = new Schema({
    name: String,
    image: String,
    title: String,
  }, { timestamps: true }
  );

  const People = mongoose.model('People', PeopleSchema);        // convert the model to a schema


// ==========================================
//             MOUNT MIDDLEWARE
// ==========================================
app.use(cors());                    // to prevent cors errors, open access to all request
app.use(morgan('dev'));             // logging - aids in development/testing
app.use(express.json());            // parse json bodies


// ==========================================
//             ROUTES
//          I.N.D.U.C.E.S
// ==========================================
// ----- TEST Route-----
app.get('/', (req, res) => {
    res.send('hello world');
});

// ----- INDEX Route -----
app.get('/people/', async (req, res) => {
    try {
        // send all people
        res.json(await People.find({}));
    } catch (error) {
        // send error
        res.status(400).json(error);
    }
})

// ----- DELETE Route -----
app.delete("/people/:id", async (req, res) => {
    try {
      // find the person by their ID and delete them from the database
      res.json(await People.findByIdAndDelete(req.params.id));
    } catch (error) {
      //send error
      res.status(400).json(error);
    }
  });
/*  To Test this in Postman:
    - create a duplicate entry using your existing create route or grab an ID from your MongoDB database
    - open a new postman tab - and select "delete"
    - enter the URL with the ID that you've grabbed (e.g., http://localhost:3001/people/6176c83545d867970c4fd528)
    - click send and you should only see one entty send back so you can see that that individual document was deleted
*/

// ----- UPDATE -----
app.put("/people/:id", async (req, res) => {
    try {
      // find the person by their ID and update them in the database using the new req.body info
      res.json(
        await People.findByIdAndUpdate(req.params.id, req.body, { new: true })
      );
    } catch (error) {
      //send error
      res.status(400).json(error);
    }
  });

// ----- CREATE Route -----
app.post('/people', async (req, res) => {
    try {
      // send all people
      res.json(await People.create(req.body));
    } catch (error) {
      // send error
      res.status(400).json(error);
    }
  });

/* To test the Create route in Postman:
    - open a tab, set it to send a POST request
    - type in the url in the bar
    - click the 'body' option because our request is expect a request body
    - change it to 'raw' data
    - change the drop down to 'json' data
    - in the editor type in the data you want to send - remember with this structure express is only accepting json data so it would look like this:
        {
            "name": "cat",
            "image": "image URL",
            "title": "VP of Mouse Traps"
        }
    - make sure things are wrapped in "", json does not accept the '' as string indicators
*/


// ==========================================
//             LISTENER
// ==========================================
app.listen(PORT, () => console.log(`Express is listening on PORT ${PORT}`));