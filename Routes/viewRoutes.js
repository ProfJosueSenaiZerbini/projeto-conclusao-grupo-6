const express = require("express");

const router = express.Router();

const ViewController = require("../Controllers/ViewController");


router.get("/login", ViewController.login);

router.get("/cadastro", ViewController.cadastro);

router.get("/dashboard", ViewController.dashboard);

router.get("/perfil", ViewController.perfil);

router.get("/player", ViewController.player);


// Obras
router.get("/obras/cadastro", ViewController.cadastroObra);

router.get("/obras", ViewController.listaObras);


// Beats
router.get("/beats", ViewController.beats);


// Eventos
router.get("/eventos", ViewController.eventos);


// Colaboração
router.get("/colaboracao", ViewController.colaboracao);


// Central
router.get("/central", ViewController.central);


module.exports = router;