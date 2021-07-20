(() => {
    
    return {

        "form": "{Form}::@myCompany/form-elements::for=userName",

        "alert": "{Alert}::@myCompany/form-elements::for=userName",

        "avatar": "{Avatar}::@myCompany/form-elements::for=userName",

        "badge": "{Badge}::@myCompany/form-elements::for=userName",

        "btn": (cssClasses) => {
            return {
                isNamedImport: true,
                name: "Button",
                source: "@myCompany/form-elements",
                attributes: {
                    name: "Test"
                }
            }
        },

        "dialog": "{Dialog}::@myCompany/form-elements::for=userName",

        "tab": "{Tab}::@myCompany/form-elements::for=userName",

        "tooltip": "{Tooltip}::@myCompany/form-elements::for=userName",

        "text": (cssClasses) => {
            return {
                name: "InputTextBox",
                source: "@myCompany/form-elements2",
                attributes: {}
            };
        },

        "input-label": "{Label}::@myCompany/form-elements2::for=userName",

    };

})();

