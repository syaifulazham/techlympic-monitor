const auth = require('./auth');
var mysql = require('mysql');

let __DATA__SCHEMA__ = 'techlympic';


let API = {
    count: {
        users: (fn) =>{
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                con.query(`
                SELECT b.negeri, b.ppd, b.peringkat, b.murid AS jumlah_murid, b.namasekolah, koordinat_x AS x, koordinat_y AS y
                FROM user a
                LEFT JOIN sekolah b USING(kodsekolah)
                WHERE b.namasekolah IS NOT NULL AND koordinat_x > 0
              `, function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },
        daily: (fn) =>{
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                con.query(`
                select date(createdate) dt, count(*) total from user group by dt order by dt
              `, function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }
    },

    logdb:{
        total: (eventid, fn) => {
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                con.query(`
                SELECT 'Guru', count(*) Jumlah  
                FROM events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Guru'
                union 
                SELECT 'Pelajar', sum(ifnull(bilpelajar,0))+200 + sum(if(pelawat regexp 'Sekolah',1,0)) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Pengiring|Sekolah'
                union 
                SELECT 'Ibu/ Bapa', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Ibu'
                union 
                SELECT 'Pelajar IPT', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'IPT'
                union 
                SELECT 'Lain-lain', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat not in('Guru','Guru Pengiring','Sekolah Menengah','Sekolah Rendah','Ibu Bapa')
                union
                select 'TOTAL PELAWAT', sum(Jumlah) Jumlah from
                (SELECT 'Guru', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Guru'
                union 
                SELECT 'Pelajar', sum(ifnull(bilpelajar,0))+200 + sum(if(pelawat regexp 'Sekolah',1,0)) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Pengiring|Sekolah'
                union 
                SELECT 'Ibu/ Bapa', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Ibu'
                union 
                SELECT 'Pelajar IPT', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'IPT'
                union 
                SELECT 'Lain-lain', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat not in('Guru','Guru Pengiring','Sekolah Menengah','Sekolah Rendah','Ibu Bapa')) m;
              `, 
              [eventid,eventid,eventid,eventid,eventid,eventid,eventid,eventid,eventid,eventid],
              function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            }catch(err){
                console.log(err);
            }
        },
        today: (eventid, fn) => {
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                con.query(`
                SELECT 'Guru', count(*) Jumlah  
                FROM events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Guru' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Pelajar', sum(ifnull(bilpelajar,0)) + sum(if(pelawat regexp 'Sekolah',1,0)) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Pengiring|Sekolah' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Ibu/ Bapa', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Ibu' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Pelajar IPT', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'IPT' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Lain-lain', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat not in('Guru','Guru Pengiring','Sekolah Menengah','Sekolah Rendah','Ibu Bapa') and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union
                select 'TOTAL PELAWAT', sum(Jumlah) Jumlah from
                (SELECT 'Guru', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Guru' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Pelajar', sum(ifnull(bilpelajar,0)) + sum(if(pelawat regexp 'Sekolah',1,0)) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Pengiring|Sekolah' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Ibu/ Bapa', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'Ibu' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Pelajar IPT', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat regexp 'IPT' and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))
                union 
                SELECT 'Lain-lain', count(*) Jumlah  
                FROM azhamezcute_logdb.events_visitors a 
                WHERE eventid = ? AND 
                    nama <> '' and
                    pelawat not in('Guru','Guru Pengiring','Sekolah Menengah','Sekolah Rendah','Ibu Bapa') and 
                    date(CONVERT_TZ(updatedate, 'America/New_York', 'Asia/Kuala_Lumpur')) = date(CONVERT_TZ(CURRENT_TIMESTAMP(), 'America/New_York', 'Asia/Kuala_Lumpur'))) m;
              `, 
              [eventid,eventid,eventid,eventid,eventid,eventid,eventid,eventid,eventid,eventid],
              function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            }catch(err){
                console.log(err);
            }
        }
    },

    attandance:{
        clockin: (zon, id, role, kodsekolah, fn) => {
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                var constr = '';
                var cond = '';

                if(role==='Guru Pengiring' || role==='Penjaga'){
                    constr = `
                    update aa_${zon}_hadir 
                    set hadir =1,
                        dt_hadir = current_timestamp()
                    where kodsekolah = ?
                  `;

                  cond = kodsekolah;
                }else{
                    constr = `
                    update aa_${zon}_hadir 
                    set hadir = 1,
                        dt_hadir = current_timestamp()
                    where qrcode = ?
                  `;

                  cond = id;
                }
                con.query(constr, cond,function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },
        getmeal: (role, pembekal, zon, id, fn) => {
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            console.log('GETMEAL @@==================>>> ',role, pembekal, zon, id);
            var mealset = (role==='Penyerahan Makanan I'?1:2);
            try {
                con.query(`
                update aa_${zon}_hadir 
                set meal${mealset} =?,
                    dt_meal${mealset} = current_timestamp()
                where qrcode = ?
              `, [pembekal, id],function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },
        getQRcode:(zon, id, fn)=>{
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                con.query(`
                select * from aa_${zon}_hadir where qrcode = ?
              `, id, function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },

        stats:{
            kehadiran(zon, peringkat, fn){
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                try {
                    var sqlstr = '';
                    var cond = '';
                    if(peringkat!==''){
                        sqlstr = `
                        SELECT if(usr_role IN('Ibu Bapa','Guru'),'Peserta',usr_role) kehadiran, 
                            COUNT(*) jangka_hadir, SUM(if(hadir=1,1,0)) telah_hadir, 
                            SUM(if(hadir=0,1,0)) belum_hadir
                        FROM (SELECT a.* from aa_${zon}_hadir a LEFT JOIN program b USING(prog_code) WHERE (prog_desc = 'fizikal' OR usr_role IN('Guru Pengiring','Penjaga','Media','VIP')) and peringkat = ?) a  GROUP BY kehadiran;
                    `
                    }else{
                        sqlstr = `
                        SELECT if(usr_role IN('Ibu Bapa','Guru'),'Peserta',usr_role) kehadiran, 
                            COUNT(*) jangka_hadir, SUM(if(hadir=1,1,0)) telah_hadir, 
                            SUM(if(hadir=0,1,0)) belum_hadir
                        FROM (SELECT a.* from aa_${zon}_hadir a LEFT JOIN program b USING(prog_code) WHERE prog_desc = 'fizikal' OR usr_role IN('Guru Pengiring','Penjaga','Media','VIP')) a  GROUP BY kehadiran;
                    `
                    }
                    con.query(sqlstr, [peringkat], function (err, result) {
                        if (err) {
                            console.log('but with some error: ',err);
                        } else {
                            //console.log('... with some data: ',result);
                            con.end();
                            
                            fn(result);
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            },
        },

        admin:{
            login: (uid, pass, fn)=>{
                //console.log('Login as: ',uid,pass,auth.auth()[__DATA__SCHEMA__]);
                if(pass=='') return 0;
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                try{
                    //"SELECT * from peserta WHERE kp = ? and peserta_password = AES_ENCRYPT(kp,CONCAT(?,?))
                    con.query("SELECT * FROM aa_event_admin where username = ? and password = sha(?)",[uid, pass], 
                    function (err, result) {
                        console.log('result ====> ', result);
                        if(result.length > 0){
                            var user = {
                                name: result[0].username
                            };
    
                            con.end();
                            
                            fn({
                                authorized: true,
                                msg: 'User Authorized!',
                                data: user
                            });
                        }else {
                            con.end();
    
                            fn({
                                authorized: false,
                                msg: 'Incorrect Username of Password',
                                data: []
                            })
                        }
                    });
                } catch(e){
                    console.log(e);
                }
            },
        },

        user:{
            add(data, fn){
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                try {
                    con.query(`
                    insert into aa_event_users(userrole, username, notes, pwd, token, zon)
                    values(?,?,?,?,sha(?),?)
                `, [data.userrole, data.username,data.notes, data.pwd, [data.username,data.pwd].join(), data.zon], function (err, result) {
                        if (err) {
                            console.log('but with some error: ',err);
                        } else {
                            console.log('... with some data: ',result);
                            con.end();
                            
                            fn(result);
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            },
            load(zon, fn){
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                try {
                    con.query(`
                    select * from aa_event_users where zon=? order by userrole
                `, zon, function (err, result) {
                        if (err) {
                            console.log('but with some error: ',err);
                        } else {
                            console.log('... with some data: ',result);
                            con.end();
                            
                            fn(result);
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            },

            login(token, pass, fn){
                //console.log('Login as: ',uid,pass,auth.auth()[__DATA__SCHEMA__]);
                if(token=='' || pass=='') return 0;
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                try{
                    //"SELECT * from peserta WHERE kp = ? and peserta_password = AES_ENCRYPT(kp,CONCAT(?,?))
                    con.query("SELECT * FROM aa_event_users where token = ? and pwd = ? and userrole = 'Kehadiran'",[token, pass], 
                    function (err, result) {
                        console.log('result ====> ', result);
                        if(result.length > 0){
                            var user = {
                                name: result[0].username,
                                notes: result[0].notes,
                                token: result[0].token,
                                zon: result[0].zon,
                                role: result[0].userrole
                            };
    
                            con.end();
                            
                            fn({
                                authorized: true,
                                msg: 'User Authorized!',
                                data: user
                            });
                        }else {
                            con.end();
    
                            fn({
                                authorized: false,
                                msg: 'Incorrect Username of Password',
                                data: []
                            })
                        }
                    });
                } catch(e){
                    console.log(e);
                }
            },

            login_meal(token, pass, fn){
                //console.log('Login as: ',uid,pass,auth.auth()[__DATA__SCHEMA__]);
                if(token=='' || pass=='') return 0;
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                try{
                    //"SELECT * from peserta WHERE kp = ? and peserta_password = AES_ENCRYPT(kp,CONCAT(?,?))
                    con.query("SELECT * FROM aa_event_users where token = ? and pwd = ? and userrole regexp 'Makanan'",[token, pass], 
                    function (err, result) {
                        console.log('result ====> ', result);
                        if(result.length > 0){
                            var user = {
                                name: result[0].username,
                                notes: result[0].notes,
                                token: result[0].token,
                                zon: result[0].zon,
                                role: result[0].userrole
                            };
    
                            con.end();
                            
                            fn({
                                authorized: true,
                                msg: 'User Authorized!',
                                data: user
                            });
                        }else {
                            con.end();
    
                            fn({
                                authorized: false,
                                msg: 'Incorrect Username of Password',
                                data: []
                            })
                        }
                    });
                } catch(e){
                    console.log(e);
                }
            },
        }

    },

    pertandingan:{
        getPertandingan(jenis, peringkat, fn){
            console.log('---------------->-@',jenis,peringkat)
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                con.query(`
                select * from program where prog_desc = ? and target_group = ?
              `, [jenis, peringkat],function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },
        getPeserta(kod, fn){
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            try {
                con.query(`
                select * from aa_utara_hadir where prog_code = ? and usr_role in('Guru','Ibu Bapa')
              `, [kod],function (err, result) {
                    if (err) {
                        console.log('but with some error: ',err);
                    } else {
                        console.log('... with some data: ',result);
                        con.end();
                        
                        fn(result);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },
    }
}


module.exports = API;

