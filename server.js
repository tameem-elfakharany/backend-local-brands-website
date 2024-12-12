const express = require("express");
const db_access=require('./db.js');
const db=db_access.db;
const port= 1515;
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


server.get(`/brands/search`, (req, res) => {
    let name = req.query.name
    let description = req.query.description
    let location = req.query.location
    let rating = req.query.rating
    let query = `SELECT * FROM brand WHERE QUANTITY>0`
    if (name)
        query += ` AND NAME='${name}'`
    if (description)
        query += ` AND DESCRIPTION='${description}'`
    if (location)
        query += ` AND LOCATION='${location}'`
    if (rating)
        query += `AND RATING='${rating}'`

    db.all(query, (err, rows) => {
        if (err) {
            console.log(err)
            return res.status(500).send(err)
        }
        else {
            return res.status(200).send.json(rows)
        }
    })

})

server.delete('/brand/delete/:id', (req, res)=>{
    let brandid= parseInt(req.params.id,10)
    const deleting_brand= `DELETE FROM brand WHERE id =${brandid}`
    db.run(deleting_brand, (err) =>{
        if (err){
            return res.status(500).send("brand cannot be deleted")

        }else {
            return res.status(200).send("brand deleted successfully")
        }
    })

})


server.get(`/products/search`, (req, res) => {
    let name = req.query.name
    let description = req.query.description
    let size = req.query.size
    let price = req.query.price
    let query = `SELECT * FROM product WHERE QUANTITY>0`
    if (name)
        query += ` AND NAME='${name}'`
    if (description)
        query += ` AND DESCRIPTION='${description}'`
    if (size)
        query += ` AND SIZE='${size}'`
    if (price)
        query += `AND PRICE='${price}'`

    db.all(query, (err, rows) => {
        if (err) {
            console.log(err)
            return res.status(500).send(err)
        }
        else {
            return res.status(200).send.json(rows)
        }
    })

})



server.post(`/products/addproduct`, (req, res) => {
    let name = req.body.name
    let description = req.body.description
    let size = req.body.size
    let price = req.body.price
    let query = `INSERT INTO brand (name,description,size,price) 
    VALUES ('${name}', '${description}', '${size}', '${price}')`;
    db.run(query, (err) => {
        if (err) {
            console.log(err)
            return res.status(500).send(err)
        }
        else {
            return res.status(200).send(`product added successfully`)
        }
    })

})


server.delete('/product/delete/:id', (req, res)=>{
    let productid= parseInt(req.params.id,10)
    const deleting_product= `DELETE FROM product WHERE id =${productid}`
    db.run(deleting_product, (err) =>{
        if (err){
            return res.status(500).send("product cannot be deleted")

        }else {
            return res.status(200).send("product deleted successfully")
        }
    })

})


server.put('/user/:id', (req, res) => {
    const { id } = req.params; 
    const { name, email, username, password, phonenumber} = req.body;
    let queryadd = [];
    let paramm = [];

    
    if (name) {
        queryadd.push("name = ?"); 
        paramm.push(name);
    }
    if (email) {
        queryadd.push("email = ?");
        paramm.push(email);
    }
    if (username) {
        queryadd.push("username = ?");
        paramm.push(username);
    }
    if (password) {
        queryadd.push("password = ?");
        paramm.push(password);
    }
    if (phonenumber) {
        queryadd.push("phonenumber = ?");
        paramm.push(phonenumber);
    }

    if (queryadd.length === 0) {
        return res.status(400).send('No fields to update.');
    }
   
    paramm.push(id);

    db.run(
        `UPDATE user SET ${queryadd.join(', ')} WHERE id = ?`,
        paramm,
        (err) => {
            if (err) return res.status(500).send(err.message); 
            res.status(200).send('user account updated successfully');
        }
    );
});





server.put('/brand/:id', (req, res) => {
    const { id } = req.params; 
    const { name, description, location, rating} = req.body;
    let queryadd = [];
    let paramm = [];

    
    if (name) {
        queryadd.push("name = ?"); 
        paramm.push(name);
    }
    if (description) {
        queryadd.push("description = ?");
        paramm.push(description);
    }
    if (location) {
        queryadd.push("location = ?");
        paramm.push(location);
    }
    if (rating) {
        queryadd.push("rating = ?");
        paramm.push(rating);
    }

    if (queryadd.length === 0) {
        return res.status(400).send('No fields to update.');
    }
   
    paramm.push(id);

    db.run(
        `UPDATE brand SET ${queryadd.join(', ')} WHERE id = ?`,
        paramm,
        (err) => {
            if (err) return res.status(500).send(err.message); 
            res.status(200).send('brand updated successfully');
        }
    );
});


server.put('/products/:id', (req, res) => {
    const { id } = req.params; 
    const { name, description, price, size} = req.body;
    let queryadd = [];
    let paramm = [];

    
    if (name) {
        queryadd.push("name = ?"); 
        paramm.push(name);
    }
    if (description) {
        queryadd.push("description = ?");
        paramm.push(description);
    }
    if (price) {
        queryadd.push("price = ?");
        paramm.push(price);
    }
    if (size) {
        queryadd.push("size = ?");
        paramm.push(size);
    }

    if (queryadd.length === 0) {
        return res.status(400).send('No fields to update.');
    }
   
    paramm.push(id);

    db.run(
        `UPDATE product SET ${queryadd.join(', ')} WHERE id = ?`,
        paramm,
        (err) => {
            if (err) return res.status(500).send(err.message); 
            res.status(200).send('product updated successfully');
        }
    );
});



server.post(`/products/buyproduct`, (req, res) => {
    let productId = req.body.productId;

    let checkQuery = `SELECT quantity FROM product WHERE id = '${productId}'`;

    db.get(checkQuery, (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching product details');
        }

        if (!row) {
            return res.status(404).send('Product not found');
        }

        if (row.quantity > 0) {
            
            let updateQuery = `UPDATE product SET quantity = quantity - 1 WHERE id = '${productId}'`;

            db.run(updateQuery, (updateErr) => {
                if (updateErr) {
                    console.log(updateErr);
                    return res.status(500).send('Error updating product quantity');
                }

                return res.status(200).send('Purchase complete');
            });
        } else {
            return res.status(400).send('Product out of stock');
        }
    });
});



server.post(`/feedback/website`, (req, res) => {
    let userid = req.body.userid; 
    let comment = req.body.comment; 
    let rating = req.body.rating; 

    
    if (rating < 1 || rating > 10) {
        return res.status(400).send('Rating must be between 1 and 10');
    }

    
    let query = `INSERT INTO website_feedback (user_id, comment, rating) 
    VALUES ('${userid}', '${comment}', '${rating}')`;

    db.run(query, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error submitting website feedback');
        } else {
            return res.status(200).send('Website feedback submitted successfully');
        }
    });
});





server.post(`/feedback/product`, (req, res) => {
    let productid = req.body.productid; 
    let userid = req.body.userid; 
    let comment = req.body.comment; 
    let rating = req.body.rating; 


    if (rating < 1 || rating > 10) {
        return res.status(400).send('Rating must be between 1 and 10');
    }

    let query = `INSERT INTO product_feedback (product_id, user_id, comment, rating) 
    VALUES ('${productid}', '${userid}', '${comment}', '${rating}')`;

    db.run(query, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error submitting product feedback');
        } else {
            return res.status(200).send('Product feedback submitted successfully');
        }
    });
});










server.post(`/feedback/brand`, (req, res) => {
    let brandid = req.body.brandid; 
    let userid = req.body.userid; 
    let comment = req.body.comment; 
    let rating = req.body.rating; 

    
    if (rating < 1 || rating > 10) {
        return res.status(400).send('Rating must be between 1 and 10');
    }

    let query = `INSERT INTO brand_feedback (brand_id, user_id, comment, rating) 
    VALUES ('${brandid}', '${userid}', '${comment}', '${rating}')`;

    db.run(query, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error submitting brand feedback');
        } else {
            return res.status(200).send('Brand feedback submitted successfully');
        }
    });
});


server.listen(port, ()=>{
    console.log(`server is listening at port: ${port}`)
})
