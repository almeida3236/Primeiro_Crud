require("dotenv").config();
const express = require("express");

const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const pool = require("./db/conn");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();

const PORT = 3000;
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use(express.static(path.join(__dirname, "public")));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//Middleware para tratamento de erros
app.use(
  session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("admin/home/home");
});

app.post("/products/insertproduct", (req, res) => {
  const data = req.body;
  var error_msg = false;
  /*Validando campo produto */
  if (
    !data.product ||
    typeof data.product == undefined ||
    data.product == null
  ) {
    error_msg = "Favor preencher o campo produto";
  } else if (
    !data.amount ||
    typeof data.amount == undefined ||
    data.amount == null
  ) {
    error_msg = "Favor preencher o campo quantidade";
  } else if (
    !data.price ||
    typeof data.price == undefined ||
    data.price == null
  ) {
    error_msg = "Favor preencher o campo preço";
  }
  if (error_msg) {
    res.render("admin/home/home", { error_msg, data });
  } else {
    const query = `INSERT INTO products (product,amount,price) VALUES (?,?,?)`;
    values = [data.product, data.amount, data.price];
    pool.query(query, values, (err) => {
      if (err) {
        req.flash("error_msg", "Produto não cadastrado com sucesso");
      }

      req.flash("success_msg", "Produto cadastrado com sucesso");

      res.redirect("/products");
    });
  }
});

app.get("/products", (req, res) => {
  const data = req.body;
  if (data === 0) {
    req.flash("success_msg", "Lista de produtos vazio");
  } else {
    const query = `SELECT * FROM  products`;

    pool.query(query, (err, data) => {
      if (err) {
        console.log(err);
      }
      const products = data;

      res.render("admin/products/products", { products });
    });
  }
});

app.get("/products/:id", (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM products WHERE id = ${id} `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
    }

    const product = data[0];

    console.log(data[0]);

    res.render("admin/product/product", { product });
  });
});

app.get("/products/edit/:id", (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM products WHERE id = ${id}`;
  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
    }

    const product = data[0];
    console.log(data[0]);
    res.render("admin/editproduct/editproduct", { product });
  });
});

app.post("/products/updateproduct", (req, res) => {
  const data = req.body;
  const query = `UPDATE products SET product = '${data.product}',amount = ${data.amount},price = ${data.price} WHERE id = ${data.id}`;
  pool.query(query, (err) => {
    if (err) {
      console.log(err);
    }
    req.flash("success_msg", "Produto Atualizado com sucesso");
    res.redirect(`/products/`);
  });
});

app.post("/products/remove/:id", (req, res) => {
  const id = req.params.id;

  const query = `DELETE FROM products WHERE id = ${id}`;
  pool.query(query, (err) => {
    if (err) {
      console.log(err);
    }
    req.flash("success_msg", "Produto excluido  com sucesso");
    res.redirect("/products");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
