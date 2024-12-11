const express = require("express");
const db_access=require('./db.js');
const db=db_access.db;
const port= 1517;
const server=express();
server.use(express.json());

server.post('/user/register', (req , res)=> {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    let phonenumber = req.body.phonenumber;

    if (!name || !email || !password || !username|| !phonenumber){
        return res.status(400).send('registration is required');

    }
    const insertquery = `INSERT INTO user(name, email, password, username, phonenumber)Values('${name}', '${email}', '${password}', '${username}', '${phonenumber}')`;
    db.run(insertquery, (err) =>{
        if(err){
            return res.status(500).send(`invalid registration: ${err.message}`);
        } 
        else {
            return res.status(200).send(`successful registration`);
        }
    })
})


server.post('/user/login', (req , res)=> {
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;

    if ( !email || !password || !username){
        return res.status(400).send('missing fields');
    }
    const loginquery = `SELECT * FROM user WHERE email = '${email}' AND password ='${password}' AND username = '${username}'`;
    db.get(loginquery, (err, row) =>{
        if(err){
            return res.status(500).send(`invalid login: ${err.message}`);
        } 
        else {
            return res.status(200).send(`successful login`);
        }
    });
});


server.get('/users', (req, res) => {
    const getAllUsersQuery = `SELECT * FROM user` ;

    db.all(getAllUsersQuery, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("An error occurred.");
        }

        if (rows.length === 0) {
            return res.status(404).send("No users found.");
        } else {
            return res.status(200).json(rows); 
        }
    });
});









server.listen(port, ()=>{
    console.log(`server is listening at port: ${port}`)
})
