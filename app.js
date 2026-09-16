const path = require("path");
const express = require("express");
const app = express();

const viewRoutes = require("./Routes/viewRoutes");

// Permite arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Libera a pasta public para ser acessada pelo navegador
app.use(express.static('public'));

// Configura o EJS como mecanismo de Views
app.set("view engine", "ejs");

// Define a pasta Views
app.set("views", path.join(__dirname, "Views"));


// Permite receber dados de formulários
app.use(express.urlencoded({ extended: true }));

// Adicione isso no seu app.js antes das rotas
app.use((req, res, next) => {
    res.locals.user = req.session?.user || req.user || null;
    next();
});

app.use("/", viewRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});