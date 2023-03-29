const express = require('express')
const bodyParser = require('body-parser');
const passport = require('passport')
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JWT = require('jsonwebtoken')
const app = new express();

//calulator function
const add = (n1, n2) => {
    return n1 + n2
}

const sub = (n1, n2) => {
    return n1 - n2
}

const mult = (n1, n2) => {
    return n1 * n2
}
const div = (n1, n2) => {
    return n1 / n2
}

app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

//===========Create a JWT strategy==============
const JwtOptions={
    secretOrKey : 'myScretKey',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};
passport.use(new jwtStrategy(JwtOptions,(jwtPlayload,done)=>{
    // console.log(jwtPlayload);
    // console.log(JwtOptions.jwtFromRequest)
    //Check if JWT token is past its valid time (24h)
    console.log(Date.now())
    //can't get exp though jwtPlayLoad.exp
    const {exp} = jwtPlayload;
    console.log(exp)
    if (Date.now() > exp * 1000) { 
        console.log('JWT token is expired');
        return done(null, false, { message: 'Token expired' });
      }
    
    if (jwtPlayload.username !== 'admin') {
        //unvalid username
        console.log('JWT token is invalid');
        return done(null, false,);

    }
    //valid token
    console.log('JWT token is valid');
    return done(null, jwtPlayload.username);

}));

//=======login part_user will receive their owen token====
app.post('/login', (req,res)=>{
    const userinfo = req.body;
    console.log(userinfo)
    //fail to log in
    if(userinfo.username!=='admin'&&userinfo.password!=='123'){
      return res.send({
          status:400,
          message:'fail to log in. Please check your username or password!'
        })
    }
    console.log('success to log in')
      //success to log in
      //Encrypt the user name and set the validity period to 24 hours
      const tokenStr = JWT.sign({username:userinfo.username}, JwtOptions.secretOrKey,{expiresIn:'2h'});
      console.log('success to generate token')
      res.send({
        status:200,
        message:'success to log in',
        token:tokenStr,
      })
   
  })

  
//=============calculator part===================
  app.get("/add",(req, res) => {
    console.log('进了')
    try {
        const n1 = parseFloat(req.query.n1);
        const n2 = parseFloat(req.query.n2);
        if (isNaN(n1)) {
            throw new Error("n1 incorrectly defined");
        }
        if (isNaN(n2)) {
            throw new Error("n2 incorrectly defined");
        }
        const result = add(n1, n2);
        res.status(200).json({ statuscode: 200, data: result })
    } catch (error) {
        console.error(error)
        res.status(500).json({ statuscode: 500, msg: error.toString() })
    }
});

app.get("/sub", passport.authenticate('jwt',{session:false}),(req, res) => {
    try {
        const n1 = parseFloat(req.query.n1);
        const n2 = parseFloat(req.query.n2);
        if (isNaN(n1)) {
            throw new Error("n1 incorrectly defined");
        }
        if (isNaN(n2)) {
            throw new Error("n2 incorrectly defined");
        }

        const result = sub(n1, n2);
        res.status(200).json({ statuscode: 200, data: result })
    } catch (error) {
        console.error(error)
        res.status(500).json({ statuscode: 500, msg: error.toString() })
    }
});

app.get("/mult", passport.authenticate('jwt',{session:false}), (req, res) => {
    try {
        const n1 = parseFloat(req.query.n1);
        const n2 = parseFloat(req.query.n2);
        if (isNaN(n1)) {
            throw new Error("n1 incorrectly defined");
        }
        if (isNaN(n2)) {
            throw new Error("n2 incorrectly defined");
        }

        const result = sub(n1, n2);
        res.status(200).json({ statuscode: 200, data: result })
    } catch (error) {
        console.error(error)
        res.status(500).json({ statuscode: 500, msg: error.toString() })
    }
});

app.get("/div", passport.authenticate('jwt',{session:false}),  (req, res) => {
    try {
        const n1 = parseFloat(req.query.n1);
        const n2 = parseFloat(req.query.n2);
        if (isNaN(n1)) {
            throw new Error("n1 incorrectly defined");
        }
        if (isNaN(n2)||n2==0) {
            throw new Error("n2 incorrectly defined");
        }

        const result = div(n1, n2);
        res.status(200).json({ statuscode: 200, data: result })
    } catch (error) {
        console.error(error)
        res.status(500).json({ statuscode: 500, msg: error.toString() })
    }
});

app.use((err,req,res,next)=>{
    //token resolution failure
    if(err.name === 'UnauthorizedError'){
        return res.send({status:401, message:'unvalid token'})
    }
    res.send({status:500, message:'unknowen error'})
})
app.listen(3000, () => {
    console.log('Server id listening on port 3000');

})
  