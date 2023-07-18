if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const initializePassport = require("./server-auth");
const { redirect } = require("express/lib/response");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];

app.set("view.engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkUserLoggedOut, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkUserLoggedIn, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkUserLoggedIn,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkUserLoggedIn, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkUserLoggedIn, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});

app.get("/edit-profile", checkUserLoggedIn, (req, res) => {
  res.render("edit-profile.ejs");
});

app.post("/edit-profile", checkUserLoggedIn, async (req, res) => {
  try {
    users.push({
      name: req.body.name,
    });
    res.redirect("/");
  } catch {
    res.redirect("/edit-profile");
  }
  console.log(users);
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function checkUserLoggedOut(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

function checkUserLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  } else {
    next();
  }
}

app.listen(3000);
