const express = require('express');
const qrcode = require('qrcode');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
const path = require('path');

const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');

const api = require("./routes/crud");

let __DATA__SCHEMA__ = 'techlympic';

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: false }));

//set cookies
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

//console.log('directory name-path: ',path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for rendering the map page
app.get('/', (req, res) => {
  var session = req.cookies['eventadmin'];
  console.log(session);
  res.render('index',{message:'', session: session});
});


app.post('/api/qr/generate', async (req, res) => {
  const data = req.body.qrstring;  

  if (!data) {
    return res.status(400).json({ error: 'Data is required in the request body.' });
  }

  try {
    const qrCodeImage = await qrcode.toDataURL(data);
    res.json({ qrCodeImage });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'An error occurred while generating the QR code.' });
  }
});

app.get('/juri/:kod/:token', (req, res) => {
  var kod = req.params.kod;
  var token = req.params.token;
  res.render('juri',{message:'', kod:kod});
});

app.get('/hadir/:token', (req, res) => {
  var session = req.cookies['eventkehadiran'];
  if(!session){
    res.render('hadir',{message:'', session: undefined});
  }else if(req.params.token===session.user.data.token){
    console.log('-----A')
    res.render('hadir',{message:'', session: session});
  }else{
    console.log('-----B')
    res.render('hadir',{message:'', session: undefined});
  }
  
});


app.post('/api/hadir/login', (req, res)=>{
  var pass = req.body.pwd;
  var token = req.body.token;
  api.attandance.user.login(token, pass, user=>{
    console.log('LOGIN====>',user);
    if(user.authorized){
      res.cookie('eventkehadiran', {user:user});
      res.send({authorized:true});
    }else{
      res.send(user);
    }
    
  });
});

app.get('/hadir/logout', function (req, res, next) {
  res.clearCookie('eventkehadiran');
  res.redirect('./');
});


app.get('/meal/:token', (req, res) => {
  var session = req.cookies['eventmeal'];
  if(!session){
    res.render('meal',{message:'', session: undefined});
  }else if(req.params.token===session.user.data.token){
    console.log('-----A')
    res.render('meal',{message:'', session: session});
  }else{
    console.log('-----B')
    res.render('meal',{message:'', session: undefined});
  }
  
});


app.post('/api/meal/login', (req, res)=>{
  var pass = req.body.pwd;
  var token = req.body.token;
  api.attandance.user.login_meal(token, pass, user=>{
    console.log('LOGIN====>',user);
    if(user.authorized){
      res.cookie('eventmeal', {user:user});
      res.send({authorized:true});
    }else{
      res.send(user);
    }
    
  });
});

app.post('/api/meal/peserta', (req, res) =>{
  var qr = req.body.qr;
  var session = req.cookies['eventmeal'];
  var zon = session.user.data.zon;
  var role = session.user.data.role;
  var pembekal = session.user.data.name;

  var mealset = (role==='Penyerahan Makanan I'?1:2);

  console.log(qr);
  api.attandance.getQRcode(zon, qr, (dataqr)=>{
    if(dataqr){
      if(dataqr[0]['meal' + mealset] === null){
        api.attandance.getmeal(role, pembekal, zon, qr, result=>{
          res.send(dataqr);
        })
      }else{
        res.send([{msg:'Telah daftar masuk'}])
      }
    }else{
      res.send([{msg:'Tiada dalam rekod'}])
    }
    
  })
});

app.post('/api/meal-cam/peserta', (req, res) => {
  const imageData = req.body.imageData;

  console.log('body capture:==========>>>>',req.body);
  const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

  const buffer = Buffer.from(base64Data, 'base64');
  var session = req.cookies['eventmeal'];
  var zon = session.user.data.zon;
  var role = session.user.data.role;
  var pembekal = session.user.data.name;

  var mealset = (role==='Penyerahan Makanan I'?1:2);

  loadImage(buffer)
      .then((image) => {
          const canvas = createCanvas(image.width, image.height);
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          const imageData = context.getImageData(0, 0, image.width, image.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
              console.log('Scanned content:', code.data);
              var qr = code.data;
              api.attandance.getQRcode(zon, qr, (dataqr)=>{
                if(dataqr){
                  if(dataqr[0]['meal' + mealset] === null){
                    api.attandance.getmeal(role, pembekal, zon, qr, result=>{
                      res.send(dataqr);
                    })
                  }else{
                    res.send([{msg:'Telah daftar masuk'}])
                  }
                }else{
                  res.send([{msg:'Tiada dalam rekod'}])
                }
                
              })
              // Do something with the scanned content
              
          } else {
              //console.error('No QR code found.');
              res.sendStatus(400);
          }
      })
      .catch((error) => {
          //console.error('Error loading image:', error);
          res.sendStatus(500);
      });
});


app.get('/kehadiran/:eventid', (req, res) => {
  const eventid = req.params.eventid;
  api.logdb.total(eventid, (data)=>{
    api.logdb.today(eventid, (semasa)=>{
      res.render('kehadiran',{total:data, tdy:semasa});
    })
  })
});



app.post('/api/admin/login', (req, res)=>{
  var uid = req.body.uid;
  var pass = req.body.pwd;
  api.attandance.admin.login(uid, pass, user=>{
    console.log('LOGIN====>',user);
    if(user.authorized){
      res.cookie('eventadmin', {user:user});
      res.send({authorized:true});
    }else{
      res.send(user);
    }
    
  });
});

app.get('/admin/logout', function (req, res, next) {
  res.clearCookie('eventadmin');
  res.redirect('../');
});

app.post('/api/hadir/peserta', (req, res) =>{
  var qr = req.body.qr;
  var session = req.cookies['eventkehadiran'];
  var zon = session.user.data.zon;
  console.log(qr);
  api.attandance.getQRcode(zon, qr, (dataqr)=>{
    if(dataqr){
      if(dataqr[0].hadir==0){
        console.log('---------|||||----->>>>>', dataqr[0].usr_role,dataqr[0].kodsekolah)
        var role = dataqr[0].usr_role;
        var kodsekolah = dataqr[0].kodsekolah;
        api.attandance.clockin(zon, qr, role, kodsekolah, result=>{
          res.send(dataqr);
        })
      }else{
        res.send([{msg:'Telah daftar masuk'}])
      }
    }else{
      res.send([{msg:'Tiada dalam rekod'}])
    }
    
  })
});

app.post('/api/stats/hadir', (req,res)=>{
  var zon = req.body.zon;
  var peringkat = req.body.peringkat;
  api.attandance.stats.kehadiran(zon, peringkat, result=>{
    res.send(result);
  })
});

app.post('/api/borangqr/adduser', (req,res)=>{
  var data = {
    userrole: req.body.userrole,
    username: req.body.username,
    notes: req.body.notes,
    pwd: req.body.pwd,
    zon: req.body.zon
  };
  if(data.userrole && data.username && data.pwd){
    api.attandance.user.add(data, result=>{
      res.send(result);
    });
  }
});

app.post('/api/borangqr/loadusers', (req,res)=>{
  var zon = req.body.zon;
  api.attandance.user.load(zon, result=>{
    res.send(result);
  })
});

/*----------------------------PERTANDINGAN-----------------------*/

app.post('/api/pertandingan/loadsekolah', (req,res)=>{
  //console.log('/api/pertandingan/loadpeserta');
  var zon = req.body.zon;
  var peringkat = req.body.peringkat;
  api.pertandingan.getSekolah(zon, peringkat, result=>{
    res.send(result);
  })
});

app.post('/api/pertandingan/loadpertandingan', (req,res)=>{
  var jenis = req.body.jenis;
  var peringkat = req.body.peringkat;
  api.pertandingan.getPertandingan(jenis, peringkat, result=>{
    res.send(result);
  })
});

app.post('/api/pertandingan/loadpeserta', (req,res)=>{
  //console.log('/api/pertandingan/loadpeserta');
  var zon = req.body.zon;
  var kod = req.body.kod;
  api.pertandingan.getPeserta(zon, kod, result=>{
    res.send(result);
  })
});

app.post('/api/pertandingan/search', (req,res)=>{
  //console.log('/api/pertandingan/loadpeserta');
  var zon = req.body.zon;
  var peringkat = req.body.peringkat;
  var kod = req.body.kod;
  var sekolah = req.body.sekolah;
  var srch = req.body.srcstr;
  api.pertandingan.searchPeserta(zon, peringkat, kod, sekolah, srch, result=>{
    res.send(result);
  })
});
/*-----------------------END-----PERTANDINGAN-----------------------*/

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


app.get('/api/alldaftar', (req, res) =>{
  api.static.daftar((data)=>{
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
