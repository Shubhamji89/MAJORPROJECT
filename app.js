if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

process.noDeprecation = true; // disable deprecation warnings

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoDBStore = require("connect-mongo");
const flash = require("connect-flash");
const csrf = require("csurf");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const isProduction = process.env.NODE_ENV === "production";
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/test";
if (!process.env.SECRET && isProduction) {
  throw new Error("SECRET environment variable is required in production.");
}
const sessionSecret = process.env.SECRET || "dev-secret-change-me";
const PORT = process.env.PORT || 8081;

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
  } catch (err) {
    console.error("DB Connection Failed:", err);
    process.exit(1);
  }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
if (isProduction) {
  app.set("trust proxy", 1);
}
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter : 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};


app.use(session(sessionOptions));
app.use(flash());
app.use(
  csrf({
    value: (req) => {
      return (
        (req.body && req.body._csrf) ||
        (req.query && req.query._csrf) ||
        req.headers["csrf-token"] ||
        req.headers["xsrf-token"] ||
        req.headers["x-csrf-token"] ||
        req.headers["x-xsrf-token"]
      );
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get("/", (req, res) => {
  res.render("listings/home");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err); // Prevents setting headers twice
  if (err.code === "EBADCSRFTOKEN") {
    req.flash("error", "Invalid or expired form token. Please try again.");
    return res.redirect("back");
  }
  let { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});

main().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
