import express from "express";
import bodyParser from "body-parser";
import {db} from "./db.js"; // FIXED
import { USER_PROFILE } from "./config.js";

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


// HOME PAGE
app.get("/", async (req, res) => {
    try {
        const [weightRows] = await db.query(
            "SELECT * FROM daily_weight ORDER BY date DESC LIMIT 1"
        );

        const [logs] = await db.query(
            "SELECT * FROM exercises ORDER BY date DESC"
        );

        let weight = weightRows.length ? weightRows[0].weight : null;
        let bmi = null;

        if (weight) {
            let m = USER_PROFILE.height / 100;
            bmi = (weight / (m * m)).toFixed(1);
        }

        res.render("index", {
            profile: USER_PROFILE,
            currentWeight: weight,
            bmi,
            logs
        });

    } catch (err) {
        console.error("Home Error:", err);
        res.send("Error loading Homepage");
    }
});


// PROFILE PAGE
app.get("/profile", async (req, res) => {
    try {
        const [weightRows] = await db.query(
            "SELECT * FROM daily_weight ORDER BY date DESC LIMIT 1"
        );

        let weight = weightRows.length ? weightRows[0].weight : null;
        let bmi = null;

        if (weight) {
            let m = USER_PROFILE.height / 100;
            bmi = (weight / (m * m)).toFixed(1);
        }

        res.render("profile", {
            profile: USER_PROFILE,
            currentWeight: weight,
            bmi
        });
    } catch (err) {
        console.error("Profile Error:", err);
        res.render("profile", {
            profile: USER_PROFILE,
            currentWeight: null,
            bmi: null
        });
    }
});


// DAILY WEIGHT PAGE
app.get("/weight", (req, res) => {
    res.render("weight");
});

app.post("/weight", async (req, res) => {
    const { date, weight } = req.body;

    await db.query(
        "INSERT INTO daily_weight (date, weight) VALUES (?, ?)",
        [date, weight]
    );

    res.redirect("/");
});


// CHOOSE MUSCLE PAGE
app.get("/workout/:category", async (req, res) => {
    const category = req.params.category;

    const [muscles] = await db.query(
        "SELECT * FROM muscles WHERE category = ?",
        [category]
    );

    res.render("choose-muscle", { category, muscles });
});


// CHOOSE EXERCISE PAGE
app.get("/workout/:category/:muscleId", async (req, res) => {
    const { category, muscleId } = req.params;

    const [exercises] = await db.query(
        "SELECT * FROM exercise_library WHERE muscle_id = ?",
        [muscleId]
    );

    res.render("choose-exercise", {
        category,
        muscleId,
        exercises
    });
});


// LOG EXERCISE
app.post("/log-exercise", async (req, res) => {
    const { date, category, muscle, exercise, sets, reps, weight } = req.body;

    await db.query(
        "INSERT INTO exercises (date, category, muscle, exercise, sets, reps, weight) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [date, category, muscle, exercise, sets, reps, weight]
    );

    res.redirect("/");
});


// ADD CUSTOM EXERCISE
app.post("/add-custom-exercise", async (req, res) => {
    const { muscleId, exerciseName } = req.body;

    await db.query(
        "INSERT INTO exercise_library (muscle_id, exercise_name) VALUES (?, ?)",
        [muscleId, exerciseName]
    );

    res.redirect("back");
});


app.listen(3000, () =>
    console.log("Server running at http://localhost:3000")
);
