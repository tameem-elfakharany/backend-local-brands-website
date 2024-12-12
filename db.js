const sqlite3= require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');


const CreateUsertable =`CREATE TABLE IF NOT EXISTS user(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    phonenumber TEXT 
    )`;

const CreateBrandstable= `CREATE TABLE IF NOT EXISTS brand(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brandname TEXT NOT NULL,
    description TEXT,
    rating INTEGER NOT NULL,
    location TEXT
    )`;

db.serialize(()=>{
    db.run(CreateUsertable,(err)=>{
        if (err){
            console.error("failed to create user table",err)
    
        }
        else {console.log("UserTable created successfully")
    
        }
    });
    db.run(CreateBrandstable, (err)=>{
        if (err){
            console.error("failed to create brands table")
        }
        else {
            console.log("brands table created successfully")
        }
    });
});

module.exports={db, CreateUsertable, CreateBrandstable}