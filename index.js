const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());
const { registration } = require("./src/registration");

app.post("/signup", registration.signUp);
app.post("/login",registration.signIn);
app.get('/home',registration.verifyToken,(req,res)=>{
  return res.status(200).json({Message:"This is a protected route"});
});
app.listen(port, () => {
  console.log(`app listening on port${port}`);
});
