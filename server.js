const express = require("express");
const db_access = require('./db.js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const db = db_access.db;
const port = 3000;
const secret_key = 'DFGddssFHHHd444HJfWgsdhsdfg___!!!@@@@!';

const server = express();
server.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
server.use(express.json());

const generateToken = (id, isAdmin) => {
    return jwt.sign({ id, isAdmin }, secret_key, { expiresIn: '1h' });
};

const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    jwt.verify(token, secret_key, (err, details) => {
        if (err) {
            return res.status(403).send('Invalid or expired token');
        }
        req.userDetails = details;
        next();
    });
};
server.post('/user/register', (req , res)=> {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    let phonenumber = req.body.phonenumber;

    if (!name || !email || !password || !username){
        return res.status(400).send('registration is incomplete');
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

    const insertQuery = `INSERT INTO user(name, email, password, username, phonenumber, isadmin) 
        VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(insertQuery, [name, email, hashedPassword, username, phonenumber, 0], (err) => {
            if (err) {
                console.log(err);
            return res.status(500).send('invalid  registration');
            } else {
                return res.status(200).send('Registration successful');
            }
        });
    });
});

server.post('/user/login', (req , res)=> {
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;

    if (!email || !password || !username) {
        return res.status(400).send('missing fields');
    }

    const loginQuery = `SELECT * FROM user WHERE email = ? AND password = ? AND username = ?`;
    db.get(loginQuery, [email, password, username], (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error during login');
        }
        if (!user) {
            return res.status(401).send('Invalid credentials');
        }
        else {
            return res.status(200).send(`successful login`);
        }
    });
});


server.get('/users', verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin) {
        return res.status(403).send('Admin access required');
    }


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
    const deleting_account= `DELETE FROM user WHERE id =?`
    db.run(deleting_account, [usersid], (err) =>{
        if (err){
            return res.status(500).send("account cannot be deleted")

        }else {
            return res.status(200).send("account deleted successfully")
        }
    })

})
server.post('/user/logout', (req, res) => {
    res.clearCookie('authToken');
    return res.status(200).send('Logged out successfully');
});

server.get('/allbrands', verifyToken, (req, res) => {
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

server.post(`/brands/addbrand`, verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin) {
        return res.status(403).send('Admin access required');
    }

    let name = req.body.name
    let description = req.body.description
    let location = req.body.location
    let rating = req.body.rating
    
    if (!name || !description || !location) {
        return res.status(400).send('Name, description, and location are required');
    }
    
    if (!rating || rating < 0 || rating > 10) {
        return res.status(400).send('Rating must be a number between 0 and 10');
    }
    
    let query = `INSERT INTO brand (name, description, location, rating) 
    VALUES (?, ?, ?, ?)`;
    db.run(query, [name, description, location, rating], (err) => {
        if (err) {
            console.log(err)
            return res.status(500).send(err)
        }
        else {
            return res.status(200).send(`brand added successfully`)
        }
    })

})

server.get(`/brands/search`, verifyToken, (req, res) => {
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
            return res.status(500).send("error searching brand")
        }
        else {
            return res.status(200).json(rows)
        }
    })

})

server.delete('/brand/delete/:id', verifyToken, (req, res)=>{
    if (!req.userDetails.isAdmin) {
        return res.status(403).send('Admin access required');
    }

    let brandid= parseInt(req.params.id,10)
    const deleting_brand= `DELETE FROM brand WHERE id =?`
    db.run(deleting_brand, [brandid], (err) =>{
        if (err){
            return res.status(500).send("brand cannot be deleted")

        }else {
            return res.status(200).send("brand deleted successfully")
        }
    })

})

server.get(`/products/search`, verifyToken, (req, res) => {
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
            return res.status(500).send("error searching product")
        }
        else {
            return res.status(200).json(rows)
        }
    })

})

server.post(`/products/addproduct`, verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin) {
        return res.status(403).send('Admin access required');
    }

    let name = req.body.name
    let description = req.body.description
    let size = req.body.size
    let price = req.body.price
    
    if (!name || !description || !size || !price) {
        return res.status(400).send('All fields are required');
    }
    
    let query = `INSERT INTO product (name, description, size, price) 
    VALUES (?, ?, ?, ?)`;
    db.run(query, [name, description, size, price], (err) => {
        if (err) {
            console.log(err)
            return res.status(500).send("product cannot be added")
        }
        else {
            return res.status(200).send(`product added successfully`)
        }
    })

})

server.delete('/product/delete/:id', verifyToken, (req, res)=>{
    if (!req.userDetails.isAdmin) {
        return res.status(403).send('Admin access required');
    }

    let productid= parseInt(req.params.id,10)
    const deleting_product= `DELETE FROM product WHERE id =?`
    db.run(deleting_product, [productid], (err) =>{
        if (err){
            return res.status(500).send("product cannot be deleted")

        }else {
            return res.status(200).send("product deleted successfully")
        }
    })

})

server.put('/user/:id', verifyToken, (req, res) => {
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
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).send('Error hashing password');
            }
            queryadd.push("password = ?");
            paramm.push(hashedPassword);
        });
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

server.put('/brand/:id', verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin) {
        return res.status(403).send('Admin access required');
    }

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

server.put('/products/:id', verifyToken, (req, res) => {
    if (!req.userDetails.isAdmin) {
        return res.status(403).send('Admin access required');
    }

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

server.post(`/products/buyproduct`, verifyToken, (req, res) => {
    let productId = req.body.productId;

    let checkQuery = `SELECT quantity FROM product WHERE id = ?`;

    db.get(checkQuery, [productId], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching product details');
        }

        if (!row) {
            return res.status(404).send('Product not found');
        }

        if (row.quantity > 0) {
            
            let updateQuery = `UPDATE product SET quantity = quantity - 1 WHERE id = ?`;

            db.run(updateQuery, [productId], (updateErr) => {
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

server.post(`/feedback/website`, verifyToken, (req, res) => {
    let userid = req.body.userid; 
    let comment = req.body.comment; 
    let rating = req.body.rating; 

    
    if (rating < 1 || rating > 10) {
        return res.status(400).send('Rating must be between 1 and 10');
    }

    
    let query = `INSERT INTO website_feedback (user_id, comment, rating) 
    VALUES (?, ?, ?)`;

    db.run(query, [userid, comment, rating], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error submitting website feedback');
        } else {
            return res.status(200).send('Website feedback submitted successfully');
        }
    });
});

server.post(`/feedback/product`, verifyToken, (req, res) => {
    let productid = req.body.productid; 
    let userid = req.body.userid; 
    let comment = req.body.comment; 
    let rating = req.body.rating; 


    if (rating < 1 || rating > 10) {
        return res.status(400).send('Rating must be between 1 and 10');
    }

    let query = `INSERT INTO product_feedback (productid, userid, comment, rating) 
    VALUES (?, ?, ?, ?)`;

    db.run(query, [productid, userid, comment, rating], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error submitting product feedback');
        } else {
            return res.status(200).send('Product feedback submitted successfully');
        }
    });
});

server.post(`/feedback/brand`, verifyToken, (req, res) => {
    let brandid = req.body.brandid; 
    let userid = req.body.userid; 
    let comment = req.body.comment; 
    let rating = req.body.rating; 

    
    if (rating < 1 || rating > 10) {
        return res.status(400).send('Rating must be between 1 and 10');
    }

    let query = `INSERT INTO brand_feedback (brand_id, user_id, comment, rating) 
    VALUES (?, ?, ?, ?)`;

    db.run(query, [brandid, userid, comment, rating], (err) => {
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
