const app = require("express")()
const mysql = require("mysql")
const fs = require("fs")
const crypto = require("crypto")
const bodyParcer = require("body-parser")
const { error } = require("console")
const { resolve } = require("path")
const { rejects } = require("assert")

app.listen(8000, () => {
    console.log("Connected to the server ")
})

const db = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12672091',
    password: '1A2uwIuu8X',
    database: 'sql12672091'
})

db.connect(err => {
    if (err) {
        console.log("DB error" + err)
        return
    }
    console.log("Connected to db")
})

//middleware to parse incoming JSON request
app.use(bodyParcer.json());

app.post('/register', (req, res) => {
    const { username, password, usermail } = req.body;

    console.log(username + password + usermail);

    if (username.trim() != "") {
        if (password.trim() != "") {
            if (usermail.trim() != "") {

                try {
                    const insertquery = "insert into user (username , password , usermail) values ( ? , ? , ? )";

                    db.query(insertquery, [username, password, usermail], (error, results) => {


                        if (error) {
                            if (error.code === "ER_DUP_ENTRY") {
                                res.status(409).end(JSON.stringify({ success: false, error: "Username already exist" }))
                                console.log("Error - Duplicate entry :")
                            }
                            else {
                                res.end(JSON.stringify({ success: false, error: "Internal server error: Registration Failed" }))
                                console.log("Error during registration :")
                            }

                        } else {
                            res.status(200).end(JSON.stringify({ success: true, error: "Registration Successful" }))
                            console.log("successful registration ")
                        }
                    })
                }
                catch (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        console.log("DUplicate entry exception by mysql");
                    }
                }


            } else {
                res.end(JSON.stringify({ success: false, error: "Please enter email address" }))
            }


        } else {
            res.end(JSON.stringify({ success: false, error: "Please enter password" }))
        }


    } else {
        res.end(JSON.stringify({ success: false, error: "Please enter user name" }))
    }


})

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username.trim() != "") {
        if (password.trim() != "") {

            const checkquery = "select * from user where username = ? AND password = ?";


            db.query(checkquery, [username, password], (error, results) => {
                if (error) {
                    console.log("login internal mysql error" + error)
                    res.status(500).end(JSON.stringify({ success: false, error: "Internal server problem" }))
                }
                else {
                    if (results.length > 0) {
                        const sessionID = crypto.randomBytes(16).toString('hex');
                        console.log("login successful of :" + username);

                        db.query("update user set usersessionid = ? ", [sessionID], (error, results) => {
                            if (error) {
                                res.end(JSON.stringify({ success: false, error: "Internal server error: login Failed" }))
                                console.log("error while inserting session id :" + username + "session ID :" + sessionID)

                            } else {
                                res.end(JSON.stringify({ success: true, error: "Login Successful", sessionID: sessionID }))
                                console.log("USer " + username + "session id :" + sessionID)

                            }
                        })

                    }else{
                        res.end(JSON.stringify({ success: false, error: "Wrong UserID and Password" }))
                        console.log("Wrong UserID and Password for " + username)
                        
                    }
                }
            })
        } else {
            res.end(JSON.stringify({ success: false, error: "Please enter password" }))
        }


    } else {
        res.end(JSON.stringify({ success: false, error: "Please enter user name" }))
    }

})

// const query = "select * from test";
//     db.query(query , (err ,results)=>{
//         if(err)
//         {
//             console.log("query error" + err)
//             return ;
//         }
//         res.json(results)
//     })