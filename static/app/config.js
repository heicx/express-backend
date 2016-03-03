window.__DEBUG = true;

require.config({
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
        "base": "config/base",
        "crypto": "assets/libs/crypto/crypto-js",
        "md5": "assets/libs/crypto/md5",
        "core": "assets/libs/crypto/core"
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
