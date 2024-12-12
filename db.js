const sqlite3= require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const CreateUsertable=`CREATE TABLE IF NOT EXISTS user(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
username TEXT NOT NULL,
password TEXT NOT NULL,
phonenumber TEXT 
)`;

const CreateBrandTable = `CREATE TABLE IF NOT EXISTS brand(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL, 
    locations TEXT NOT NULL
  )`;

const CreateProductTable = `CREATE TABLE IF NOT EXISTS product(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brandid INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL,
    description TEXT,
    stock INTEGER,
    size TEXT NOT NULL,
    FOREIGN KEY(brandid) REFERENCES brand(id)
)`;

const CreateFeedbackTable = `CREATE TABLE IF NOT EXISTS feedback(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userid INTEGER NOT NULL,
    brandid INTEGER,
    productid INTEGER,
    text TEXT NOT NULL,
    rating INTEGER,
    FOREIGN KEY(userid) REFERENCES user(id),
    FOREIGN KEY(brandid) REFERENCES brand(id),
    FOREIGN KEY(productid) REFERENCES product(id)
  )`;
  
db.serialize(()=>{
    db.run(CreateBrandTable,(err)=>{
        if (err){
            console.error("failed to create brands table",err)

        }
        else {console.log("brands created successfully")

        }
    })
    db.run(CreateProductTable,(err)=>{
        if (err){
            console.error("failed to create product table",err)

        }
        else {console.log("product created successfully")

        }
    })
    db.run(CreateFeedbackTable,(err)=>{
        if (err){
            console.error("failed to create feedback table",err)

        }
        else {console.log("feedback created successfully")

        }
    })
    db.run(CreateUsertable,(err)=>{
        if (err){
            console.error("failed to create user table",err)

        }
        else {console.log("UserTable created successfully")

        }
    })
})
module.exports ={db,CreateUsertable, CreateProductTable, CreateBrandTable, CreateFeedbackTable}