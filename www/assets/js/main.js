var app = {
    init: function() {
        this.asignoEventos();
    },

    asignoEventos: function() {
        document.addEventListener('deviceready', function() {
           this.initBackgroundMode();
        }, false);
    },

    initBackgroundMode: function() {
        cordova.plugins.backgroundMode.setDefaults({
            title: 'Agenda remota',
            text: 'Funcionando en segundo plano...'
        });
        cordova.plugins.backgroundMode.setEnabled(true);
    }
};