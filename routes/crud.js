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
    }
}


module.exports = API;

