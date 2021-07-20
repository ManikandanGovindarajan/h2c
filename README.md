# h2c

Converts html tags with attribute 'data-h2c'  into Jsx Components and will add required import statements as mentioned in the data-h2c attribute.
This extension will be mostly useful for the company's or individuals who uses existing npm jsx components in their org or community while build their new web app.


![Convert Html to jsx Component](./resources/SampleFeedBackComponent.gif)

## Release Notes

### 1.1.0
Support for converting html into jsx Component based on css-class mapping is added

Create a Javascript file that returns an object inside immediately invoke function expression (IIFE) like below. In the returning js object,  set the css-class as prop name and component details as value.  

Invoke command palette  search  "Preferences: Open Settings (UI)" Go to -> Choose Extensions -> h2c (Html to jsx Component) and Provide css-class-map Js file full path

Them open js or jsx file which has html tags pasted in render method,
then invoke command palette, and search & select 'Convert Html to jsx Component' and see the magic

supported component defining structures are string and object

1) string format
    {ComponentName}::@packageName::prop1=value1
    DefaultComponentName::@packageName2::prop1=value1

2) object format
    {
        isNamedImport: true, // set true if component is named imported
        name: "Button", // component name
        source: "@myCompany/form-elements",  // component module source
        attributes: { // attribute
            name: "Test"
        }
    }
```js
(()=>{

    return {

        inputText : "{InputText}::@myCompany/form-elements::value=test",
        
        button: (cssClasses) => {
            // please do the logic here and return the required component details.
            // you can return string format from the function.
            return {
                isNamedImport: true,
                name: "Button",
                source: "@myCompany/form-elements",
                attributes: {
                    name: "Test"
                }
            }
        },

        form : "Form::@myCompany/form::name=feedback",


    };

})();
```

### 1.0.0

Initial release of h2c



## Structure of data-h2c attribute

```
data-h2c=ComponentName::@myOrg/myPackage::prop1=value1,prop2=value2

data-h2c={AnotherComponentName}::@myOrg/myPackage1::prop1=value1,prop2=value2
```

NOTE:
1) the component name, package source, and attributes are delimited with double colon '::'
2) enclose the component with curly braces for named import

Add 'data-h2c' attribute to the child html tags that need to be persevered when replacing the parent html tag with JSX component, by default the html tag will be preserved if its containing a child with data-h2c


Example Input
```html
<button data-h2c="{Button}::@myCompany/form-elements::name=Submit,colour=green,size=small"
>
    Submit
</button>

```

Converting html into jxs Components H2C:

After installing the H2C extension, open js or jsx file which has html tags pasted in render method,
then invoke command palette, and search & select 'Convert Html to jsx Component based on H2c Prop' and see the magic.


Example Output
```js

import { Button } from "@myCompany/form-elements";


<Button name="Submit" colour="green" size="small" />

```

