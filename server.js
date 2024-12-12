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

    if (!name || !email || !password || !username){
        return res.status(400).send('registration is incomplete');
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
    })
})


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

server.delete('/user/account/delete/:id', (req, res)=>{
    let usersid= parseInt(req.params.id,10)
    const deleting_account= `DELETE FROM user WHERE id =${usersid}`
    db.run(deleting_account, (err) =>{
        if (err){
            return res.status(500).send("account cannot be deleted")

        }else {
            return res.status(200).send("account deleted successfully")
        }
    })

})

server.get('/allbrands', (req, res) => {
    const getAllbrandsQuery = `SELECT * FROM brand` ;

    db.all(getAllbrandsQuery, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("An error occurred.");
        }

        if (rows.length === 0) {
            return res.status(404).send("No brands found.");
        } else {
            return res.status(200).json(rows); 
        }
    });
});

server.post(`/brands/addbrand`, (req, res) => {
    let name = req.body.name
    let description = req.body.description
    let location = req.body.location
    let rating = req.body.rating
    let query = `INSERT INTO brand (name,description,location,rating) 
    VALUES ('${name}', '${description}', '${location}', '${rating}')`;
    db.run(query, (err) => {
        if (err) {
            console.log(err)
            return res.status(500).send(err)
        }
        else {
            return res.status(200).send(`brand added successfully`)
        }
    })

})






server.listen(port, ()=>{
    console.log(`server is listening at port: ${port}`)
})
