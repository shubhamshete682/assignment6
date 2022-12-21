const express = require("express"); //express
const exphbs = require("express-handlebars"); //handlebar
const multer = require("multer"); //multer
const cookieParser = require("cookie-parser"); //cookie
const mongoose = require("mongoose"); //mongoose
const seceret = "assd123^&*^&*ghghggh";
const oneDay = 1000 * 60 * 60 * 24;
const sessions = require("express-session");
const PORT = 1111; //port
const bcrypt = require("bcrypt"); //bcrypt
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const app = express();
const secret = "secretkey";
//database connection
const nodemailer = require("nodemailer");
var hbs = require("nodemailer-express-handlebars"); //nodemailer
app.use(express.static("uploads"));
let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: "shubhamds682@gmail.com",
        pass: "hssoinyyzmwpwddy",
    },
});
mongoose
    .connect("mongodb://127.0.0.1:27017/pizza")
    .then((res) => console.log("MongoDB Connected"))
    .catch((err) => console.log("Error : " + err));
//end
app.use(
    sessions({
        secret: seceret,
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
transporter.use(
    "compile", hbs({
        viewEngine: "nodemailer-express-handlebars",
        viewPath: "emailTemplate/",
    })
);

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
var path = require("path");
app.use(cookieParser());
const userModel = require("./model/user");
const cartModel = require("./model/cart");
const cart = require("./model/cart");
const { count } = require("console");
//Multer
var session;
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "/uploads"));
    },
    filename: function(req, file, cb) {
        fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + Date.now() + fileExtension);
    },
});


const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("only png and jpg formate support"));
        }
    },
});

// Login page
app.get("/login", (req, res) => {

    return res.render("login");

});

app.get("/", (req, res) => {


    return res.render("home");

});










app.post("/postlogin", (req, res) => {

    let { email, pass } = req.body;

    userModel.findOne({ email: email }, (err, data) => {

        if (err) {

            console.log("errr");
            res.redirect("/")

        } else if (data == null) {

            res.redirect("/")

        } else {

            let h = bcrypt.compareSync(pass, data.password)
            console.log(h, "hello");
            if (bcrypt.compareSync(pass, data.password)) {
                // session = req.session;
                // session.username = email;
                // console.log(req.session);

                jwt.sign({ email }, secret, (err, token) => {

                    return res.redirect(`/welcome/${data._id}`);

                })





            } else {
                return res.redirect("/login");
            }



        }

    })
})



////////////reset pass


app.post('/resetpass', verifytoken, (req, res) => {


    let { email1 } = req.body;

    userModel.findOne({ email: email1 }, (err, data) => {

        if (err) {

            res.redirect("/");
        } else {
            let mailOptions = {
                from: "shubhamds682@gmail.com",
                to: email1,
                subject: "Reset Password",
                template: "email1",
                context: {
                    id: data._id,
                    email2: email1,
                },
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Mail send : " + id);
                }
            });
            res.render("regis", { errmsg: '', succmsg: "reset password link sent to the mail id " })
        }


    })



})


app.get('/reset/:id', (req, res) => {

    let id = req.params.id;

    res.render('password_reset', { id: id });


})

app.post('/password_reset_1/:id', (req, res) => {

    let id1 = req.params.id;

    let { pass1, pass2 } = req.body;
    console.log(pass1, pass2);
    if (pass1 != pass2) {
        res.render('password_reset', { errmsg: "password is not match plaese enter both filed same", succmsg: '' })

    } else {
        const hash = bcrypt.hashSync(pass1, saltRounds);
        userModel
            .updateOne({ _id: id1 }, { $set: { password: hash } })
            .then((data) => {
                console.log("hiii");
                res.render("login", { errmsg: "", succmsg: "your  password is sucessfully reset" });

            })
            .catch((err) => {
                res.render("password_reset", { errmsg: "Plaese enter password not used before", succmsg: "" });
            });
    }


})






//Registration page

app.get("/regis", (req, res) => {
    res.render("regis");
});

const uploadsingle = upload.single("att");

app.post('/postregis', (req, res) => {

    uploadsingle(req, res, (err) => {

        if (err) {
            //////////////
            console.log(err)

        } else {

            let { email, uname, password } = req.body;
            let status = 0;
            const hash = bcrypt.hashSync(password, saltRounds);

            userModel.create({
                email: email,
                username: uname,
                password: hash,
                image: req.file.filename,
                status: status,
            })

            .then((data) => {
                    let mailOptions = {
                        from: "shubhamds682@gmail.com",
                        to: email,
                        subject: "Account Activate",
                        template: "email",
                        context: {
                            id: data._id,
                            uname: uname,
                        },
                    };
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Mail send : " + id);
                        }
                    });

                    res.write("<script>alert('successfully registered')</script>;<script>location.assign('/regis')</script>")

                })
                .catch((err) => {
                    res.render("regis", { error: "User Already Registered" });
                });

        }


    })

})

/// activation email link

app.get('/activate/:id', (req, res) => {
    let id = req.params.id;

    userModel.findOne({ _id: id }, (err, data) => {
        console.log(data);
        if (err) {
            res.send("something went wrong");
        } else {
            userModel
                .updateOne({ _id: id }, { $set: { status: "1" } })
                .then((data1) => {
                    res.render("activate", { username: data.username });
                })
                .catch((err) => {
                    res.send("something went wrong");
                });
        }
    });
});


//Forget pass page
app.get('/forgetpass', (req, res) => {

    res.render("forgetpass")
})

//



//welcome page

app.get('/welcome/:id', verifytoken, (req, res) => {

    let id = req.params.id;
    console.log(id)
    userModel.findOne({ _id: id }, (err, data) => {

        if (err) {
            res.send("something went wrong");
        } else {
            console.log(data.image)
            res.render('welcome', {
                username: data.username,
                path: data.image,
                email: data.email,
                id: data.id


            });

        }
    });
})

function verifytoken(req, res, next) {

    const bearertoken = req.headers.authorization;
    console.log(bearertoken, "hii")

    if (typeof bearertoken !== 'undefined') {}
    next();
}


app.get("/cart/:id1/:id2/:id3/", async(req, res) => {

    let pizza_name = req.params.id1;
    let pizza_price = req.params.id2;
    // let amount = pizza_price *count

    const options = { new: true }
    let amount = pizza_price
    let uuid = req.params.id3;

    let unique_name = `${pizza_name}-${uuid}`

    console.log(pizza_price);
    console.log(pizza_name);

    const cartData = await cartModel.findOne({ unique_name });
    let isError = true;
    if (cartData) {
        const count = cartData.count + 1;
        const updateCartData = await cartModel.updateOne({ unique_name }, { $set: { amount: amount * count, count } });
        if (updateCartData) {
            isError = false;
        }
    } else {
        const cartObj = { uuid, pizza_name, unique_name, pizza_price, count: 1, amount }
        const insertCartData = new cartModel(cartObj).save();
        if (insertCartData) {
            isError = false;
        }
    }
    if (!isError) {
        res.write(`<script>alert("Data added")</script>;<script>location.assign("/welcome/${uuid}")</script>;`);
    } else {
        res.write(`<script>alert("something went wrong")</script>;<script>location.assign("/welcome/${uuid}")</script>;`)
    }
})



app.get("/mycart/:id", (req, res) => {



    let uuid = req.params.id;

    cartModel.find({ 'uuid': uuid }, function(err, docs) {
        // docs is an array
        session = req.session;
        session.uuid = uuid;
        // console.log(req.session.uuid)

        res.render("mycart", {

            data: docs.map(docs => docs.toJSON()),
            data1: req.session.uuid


        })





    });
    // let records =  cartModel.find().where('uuid').in(uuid).exec();




})


app.get("/checkout/:id", (req, res) => {

    let user_id = req.params.id;
    // let msg = "false"
    cartModel.find({ 'uuid': user_id }, function(err, docs) {
        var sum = 0;
        for (let i = 0; i < docs.length; i++) {
            sum += docs[i].amount
        }
        // console.log(docs[1].uuid);
        res.render("checkout", { data: sum, data2: docs[1].uuid })
    })
})





app.get("/delete/:id1/:id2", (req, res) => {

    let id = req.params.id1;
    let id1 = req.params.id2
    cartModel.deleteOne({ _id: id1 }, function(err, docs) {
        if (!err) {
            res.write(`<script>alert("Order deleted successfully")</script>;<script>location.assign("/mycart/${id}")</script>;`)
        } else {
            console.log(err);
        }
    });

})




app.get("/logout", (req, res) => {
    req.session.destroy();

    return res.redirect("/");
});



app.listen(PORT, (err) => {
    if (err) throw err;
    else {
        console.log(`Server work on ${PORT}`);

    }
});