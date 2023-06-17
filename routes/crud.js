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
    }
}


module.exports = API;

