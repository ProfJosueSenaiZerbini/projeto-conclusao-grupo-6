class ViewController {

    static login(req, res) {
        res.render("login");
    }

    static cadastro(req, res) {
        res.render("cadastro");
    }

    static dashboard(req, res) {
        res.render("dashboard");
    }

    static perfil(req, res) {
        res.render("perfil");
    }

    static player(req, res) {
        res.render("player");
    }

    static cadastroObra(req, res) {
        res.render("obras/cadastro");
    }

    static listaObras(req, res) {
        res.render("obras/lista");
    }

    static beats(req, res) {
        res.render("beats/index");
    }

    static eventos(req, res) {
        res.render("eventos/index");
    }

    static colaboracao(req, res) {
        res.render("colaboracao/index");
    }

    static conhecimento(req, res) {
        res.render("conhecimento/index");
    }

}

module.exports = ViewController;