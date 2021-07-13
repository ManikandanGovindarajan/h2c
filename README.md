# h2c

Converts html tags with attribute 'data-h2c'  into Jsx Components and will add required import statements as mentioned in the data-h2c attribute.
This extension will be mostly useful for the company's or individuals who uses existing npm jsx components in their org or community while build their new web app.


![Convert Html to jsx Component](./resources/SampleFeedBackComponent.gif)



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
then invoke command palette, and search & select 'Convert Html to jsx Component' and see the magic.


Example Output
```js

import { Button } from "@myCompany/form-elements";


<Button name="Submit" colour="green" size="small" />

```

## Release Notes

### 1.0.0

Initial release of h2c


