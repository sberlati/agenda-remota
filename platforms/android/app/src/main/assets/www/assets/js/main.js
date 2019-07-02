var app = {
    init: function() {
        this.asignoEventos();
        this.renderLog();
    },

    asignoEventos: function() {
        var _this = this;
        this.log("App. iniciada");
        document.addEventListener('deviceready', function() {
           _this.initBackgroundMode();
        }, false);
        $('.log-clear').click(function(e) {
            e.preventDefault();
            _this.clearLogs();
        });
    },

    initBackgroundMode: function() {
        this.log("BackgroundMode iniciado");
        cordova.plugins.backgroundMode.setDefaults({
            title: 'Agenda remota',
            text: 'Funcionando en segundo plano...'
        });
        cordova.plugins.backgroundMode.setEnabled(true);
    },

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
        var msg = '['+moment().format('d/m/Y HH:mm:ss').toString()+'] ' + message;
        var logString = localStorage.getItem('appLogs');
        var _log;
        if(logString == null || logString == "") {
            _log = [];
        }else{
            _log = JSON.parse(logString);
        }
        _log.push(msg);
        localStorage.setItem('appLogs', JSON.stringify(_log));
        this.renderLog();
    },

    clearLogs: function() {
        localStorage.setItem('appLogs', "[]");
        this.log("Reportes y seguimiento vaciados.");
        this.renderLog();
    }
};
app.init();