window.__DEBUG = true;

require.config({
    // baseUrl: window.location.host,
    baseUrl: "/",
    paths: {
        "jquery": "assets/libs/jquery/jquery.min",
        "jquery-ui": "assets/libs/jquery-plugins/jquery-ui/jquery-ui",
        "semantic": "assets/libs/semantic/semantic.min",
        "transition": "assets/css/components/transition",
        "dropdown": "assets/css/components/dropdown",
        "modal": "assets/css/components/modal.min",
        "dimmer": "assets/css/components/dimmer.min",
        "popup": "assets/css/components/popup.min",
        "ui-events": "app/public/ui-events",
        "base": "config/base"
    },
    shim: {
        "jquery-ui": {
            deps: ["jquery"]
        },
        "semantic": {
            deps: ["jquery"]
        },
        "transition": {
            deps: ["jquery"]
        },
        "dropdown": {
            deps: ["jquery"]
        },
        "modal": {
            deps: ["jquery"]
        },
        "dimmer": {
            deps: ["jquery"]
        }
    }
});
