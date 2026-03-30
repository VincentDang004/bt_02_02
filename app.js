const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/testDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ===== MODEL =====
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  slug: String
});

const Product = mongoose.model("Product", productSchema);

// ===== API =====

// GET /products (filter)
app.get("/products", async (req, res) => {
  try {
    let { title, minPrice, maxPrice, slug } = req.query;

    let filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (slug) {
      filter.slug = slug;
    }

    const data = await Product.find(filter);
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /products/:id
app.get("/products/:id", async (req, res) => {
  try {
    const data = await Product.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tạo data
app.post("/products", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.json(saved);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// start server
app.listen(3000, () => {
  console.log("http://localhost:3000");
});