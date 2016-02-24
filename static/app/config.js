window.__DEBUG = true;

require.config({
    // baseUrl: window.location.host,
    baseUrl: "/",
    paths: {
        "jquery": "assets/libs/jquery/jquery.min",
        "jquery-ui": "assets/libs/jquery-plugins/jquery-ui/jquery-ui",
        "sortable": "assets/libs/jquery-plugins/jquery-tablesort/jquery.tablesort.min",
        "semantic": "assets/libs/semantic/semantic.min",
        "transition": "assets/css/components/transition",
        "dropdown": "assets/css/components/dropdown",
        "modal": "assets/css/components/modal.min",
        "dimmer": "assets/css/components/dimmer.min",
        "popup": "assets/css/components/popup.min",
        "tab": "assets/css/components/tab.min",
        "ui-events": "app/public/ui-events",
        "base": "config/base"
    },
    shim: {
        "jquery-ui": ["jquery"],
        "semantic": ["jquery"],
        "transition": ["jquery"],
        "dropdown": ["jquery"],
        "modal": ["jquery"],
        "dimmer": ["jquery"],
        "sortable": ["jquery"],
        "popup": ["jquery"],
        "tab": ["jquery"]
    }
});
