const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path');

const api = require("./routes/crud");

let __DATA__SCHEMA__ = 'techlympic';

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.set('views', './views');

//console.log('directory name-path: ',path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for rendering the map page
app.get('/', (req, res) => {
  res.render('index',{message:''});
});


app.get('/kehadiran/:eventid', (req, res) => {
  const eventid = req.params.eventid;
  api.logdb.total(eventid, (data)=>{
    api.logdb.today(eventid, (semasa)=>{
      res.render('kehadiran',{total:data, tdy:semasa});
    })
  })
});

app.post('/api/count/users', (req, res) =>{
  api.count.users((data)=>{
    res.send(data);
  })
});

app.post('/api/count/daily', (req, res) =>{
  api.count.daily((data)=>{
    res.send(data);
  })
});


app.post('/chat', async (req, res) => {
  console.log('=================================>>>>>>',req.body.message);
  const message = req.body.message;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
      model: 'gpt-3.5-turbo', // Add the model parameter here
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const reply = response.data.choices[0].message.content;
    res.render('index', { message, reply });
  } catch (error) {
    console.error('Error:', error.response.data);
    res.status(500).send('An error occurred.');
  }
});

// Start the server

app.listen(process.env.APPLICATION_PORT, function () {
  console.log('Server started on port ' + process.env.APPLICATION_PORT);
});
