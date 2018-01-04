var mysql = require('mysql')
var myconf = require('./config.json')

var pool = mysql.createPool({
    connectionLimit: 100, //important
    host: myconf.host,
    user: myconf.user,
    password : myconf.password,
    database: myconf.database,
    debug: false
})

class Handle {
    constructor(req,res){
        this.req = req
        this.res = res

        this.pool = mysql.createPool({
            connectionLimit: 100, //important
            host: myconf.host,
            user: myconf.user,
            password : myconf.password,
            database: myconf.database,
            debug: false
        })

        this.database_discussion = this.database_discussion.bind(this)
        this.database_submit_message = this.database_submit_message.bind(this)
        this.mysql_real_escape_string = this.mysql_real_escape_string.bind(this)
    }

    mysql_real_escape_string(str) {
        return str.replace(/["'\\\%]/g, function (char) {
            switch (char) {
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char  // prepends a backslash to backslash, percent,
                    // and double/single quotes
            }
        }) 
    }

    database_discussion(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({"code": 100, "status" : "error in connection database"})
                return
            }


            let sql= `
            SELECT username AS 'from', body, latex
            FROM DISCUSSION
            ORDER BY createdAt ASC
            `

            connection.query(sql, (err,rows) => {
                console.log(rows)
                connection.release()
                if(!err){
                    this.res.json(rows)
                }
            })

            connection.on('error', (err) => {
                this.res.json({"code": 100, "status": "error in connection database"})
                return
            })
        })
    }

    database_submit_message(username,body,latex){
        var con = mysql.createConnection({
            host: myconf.host,
            user: myconf.user,
            password : myconf.password,
            database: myconf.database
        })

        con.connect((err) => {
            if (err) throw err;
            console.log("Connected!");

            var body_escape = this.mysql_real_escape_string(body)
            var sql = `INSERT INTO DISCUSSION (username,body,latex) VALUES ("${username}","${body_escape}",${latex});`
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        });

    }

}

module.exports = Handle
