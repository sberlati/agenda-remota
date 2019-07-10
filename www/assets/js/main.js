var app = {
    init: function() {
        this.asignoEventos();
        logger.renderLog();
    },

    asignoEventos: function() {
        var _this = this;
        logger.log("App. iniciada");
        document.addEventListener('deviceready', function() {
            console.log(device.cordova);
           _this.initBackgroundMode();
           // Inicio el websocket server
           ws.init();
        }, false);
        $('.log-clear').click(function(e) {
            e.preventDefault();
            logger.clearLogs();
        });
        $('.ipupdate-btn').click(function(e) {
            e.preventDefault();
            _this.retrieve();
        });
    },

    initBackgroundMode: function() {
        logger.log("BackgroundMode iniciado");
        cordova.plugins.backgroundMode.setDefaults({
            title: 'Agenda remota',
            text: 'Funcionando en segundo plano...'
        });
        cordova.plugins.backgroundMode.setEnabled(true);
    },

    retrieve: function() {
        var url = $('input[name="ip"]').val();
        $('.ipupdate-btn').attr('disabled','disabled');
        logger.log("Obteniendo contactos...");
        $.ajax({
            url: url,
            type: "GET"
        }).done(async function(res) {
            logger.log(res.length + " contactos obtenidos.");
            for(var i=0;i<res.length;i++) {
                var cObject = res[i];
                var posString = "["+(i+1)+"/"+res.length+"]";
                // Valido que no esté vacío
                if(cObject.nombre == "" || cObject.telefono == "") {
                    logger.log(posString+"[E:0] SKIPPED: Faltan campos para continuar. (nombre='"+cObject.nombre+"';telefono='"+cObject.telefono+"')");
                    continue;
                }
                // Guardo el teléfono removiendo los +54, guiones, puntos, etc
                var telefono = cObject.telefono.replace(" ","").replace("+549","").replace("+54","").replace("-","").replace(".","");
                // Validaciones previas
                if(validations.todosIgual(telefono) === true) {
                    logger.log(posString+"[E:1] ERROR: " + cObject.nombre + " teléfono inválido ("+telefono+")");
                    continue;
                }else if(validations.esNumero(telefono) === false) {
                    // El campo teléfono no tiene números.
                    logger.log(posString+"[E:2] ERROR: " + cObject.nombre + " teléfono inválido ("+telefono+")");
                    continue;
                }else if(telefono.substring(0,1) == "0") {
                    // El teléfono empezó con "011" en vez de "11".
                    logger.log(posString+"[E:3] INFO: Re-escribiendo "+telefono+" a "+telefono.substring(1,telefono.length));
                    telefono = telefono.substring(1,telefono.length);
                }
                // Re-escribo poniendo el +54 9
                telefono = "+549"+telefono;
                // Busco entradas anteriores con ese teléfono
                var searchOptions = new ContactFindOptions();
                searchOptions.filter = telefono;
                searchOptions.hasPhoneNumber = true;
                var _continue = true;
                await navigator.contacts.find([navigator.contacts.fieldType.phoneNumbers], async function(r) {
                    if(r.length <= 0) {
                        _continue = true;
                    }else{
                        _continue = false;
                    }
                }, async function(err) {
                    _continue = true;
                },searchOptions);

                if(!_continue) {
                    logger.log(posString+"[E:4] ERROR: número ya agendado.")
                    continue;
                }

                // Genero el contacto con nombre, apellido y teléfono
                var contacto = navigator.contacts.create();
                contacto.displayName    = cObject.nombre;
                contacto.nickname       = cObject.nombre;
                contacto.phoneNumbers   = [new ContactField('mobile', telefono, true)];
                // Guardo el contacto
                contacto.save(function(result) {
                    logger.log(posString+"Agendado: " + cObject.nombre + " " + telefono);
                });
            }
            // Vuelvo a activar el botón
            $('.ipupdate-btn').removeAttr('disabled');
        });
    },
};

/*******************************
 * Validaciones de inputs.
 *******************************/
var validations = {
    todosIgual: function(input) {
        return /^(.)\1+$/.test(input);
    },
    esNumero: function(input) {
        return /^\d+$/.test(input);
    }
};

/*******************************
 * Consulta de agenda
 *******************************/
var agenda = {

};

/*******************************
 * Log de eventos de la app.
 *******************************/
var logger = {
    retrieveLog: function() {
        return JSON.parse(localStorage.getItem('appLogs'));
    },

    renderLog: function() {
        $('.log-entries').empty();
        var log = this.retrieveLog();
        for(var i=0;i<log.length;i++) {
            $('.log-entries').prepend('<p class="entry">'+log[i]+'</p>');
        }
    },

    log: function(message) {
        // Formateo el mensaje y lo agrego al localStorage
        var msg         = '['+moment().format('d/m/Y HH:mm:ss').toString()+'] ' + message;
        var logString   = localStorage.getItem('appLogs');
        var _log        = ((logString == null || logString == "") ? [] : JSON.parse(logString));
        _log.push(msg);
        localStorage.setItem('appLogs', JSON.stringify(_log));
        // Recargo el logger en la UI.
        this.renderLog();
        // Loggeo en la consola también.
        console.log(msg);
    },

    clearLogs: function() {
        localStorage.setItem('appLogs', "[]");
        this.log("Reportes y seguimiento vaciados.");
        this.renderLog();
    }
};

/*******************************
 * Webserver
 *******************************/
var ws = {
    port: 4000,

    init: function() {
        if(typeof webserver !== 'undefined') {
            webserver.start(function(){
                this.asignoEventos();
            },
            function(err){
                // error
                console.log(err);
            },this.port);
        }
    },

    asignoEventos: function() {
        /* Recibo un request */
        webserver.onRequest(function(request) {
            this.route(request);
        });
    },

    route: async function(request) {
        switch(request.path) {
            case "/contactos/get/all":
                var contactos = await agenda.getAll();
            break;
        }
    },

    sendResponse: function(body) {

    }
};

app.init();