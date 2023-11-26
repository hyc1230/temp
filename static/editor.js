const editor = {
    newVditor(id, hgt, val) {
        return new Vditor(id, {
            "height": hgt,
            "width": "auto",
            "cache": {
                "enable": false
            },
            "value": val,
            "mode": "ir",
            "preview": {
                "math": {
                    "inlineDigit": true
                }
            }
        });
    },
    newMonaco(id, lang, val) {
        return monaco.editor.create(document.getElementById(id), {
            value: val,
            language: lang,
            automaticLayout: true,
        });
    },
};