/* Plugins de la app. */
document.addEventListener('deviceready', function() {
    cordova.plugins.backgroundMode.setDefaults({
        title: 'Agenda remota',
        text: 'Funcionando en segundo plano...'
    });
    cordova.plugins.backgroundMode.setEnabled(true);

},false);
