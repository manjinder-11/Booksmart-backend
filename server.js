const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const profileRoutes = require("./controllers/userController");
const hotelRoutes = require("./routes/hotelRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/user");
const bookingRoutes = require("./routes/booking");
const stripe = require("./routes/stripe");

const morgan = require("morgan");
const app = express();

dotenv.config();
connectDB();

app.use(morgan("dev"));
// app.use(express.json());
app.use(cors({ origin: "https://booksmart-frontend-z6mj.onrender.com" }));
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(bodyParser.json({ limit: "80000kb" }));

app.use("/api/auth", express.json(), authRoutes);
app.use("/api/profile", express.json(), profileRoutes);
app.use("/api/hotels", express.json(), hotelRoutes);
app.use("/api/reviews", express.json(), reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stripe", stripe);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
