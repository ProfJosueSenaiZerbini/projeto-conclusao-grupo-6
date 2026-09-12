const express = require("express");
const path = require("path");

const app = express();

const viewRoutes = require("./Routes/viewRoutes");

// Configura o EJS como mecanismo de Views
app.set("view engine", "ejs");

// Define a pasta Views
app.set("views", path.join(__dirname, "Views"));

// Permite arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Permite receber dados de formulários
app.use(express.urlencoded({ extended: true }));

app.use("/", viewRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});