

# text-fit

**Requirements**:
  - Angular
  - Lodash
  - NO jQuery!!!!

### Usage

```
<div id="parentContainer">
    <div text-fit=" 'Text2Fit' " />
</div>
```

This will size Text2Fit to be as large as the parent container. 

### Options
Options can be specified in the `text-fit-options` attribute

```
    <div 
        text-fit=" 'Text2Fit' " 
        text-fit-options=" { max: 100 // default, 
                            min: 6 // default, 
                            debug: false // default, 
                            wordWrap: true // default } "/>
```


# text-fit-group

Used to make uniform the text-size of multiple text-fit objects in a single group.


```
<div id="parentContainer" text-fit-group>
    <div text-fit=" 'Text2Fit' " />
    <div text-fit=" 'Long Text 2 Fit' " />
    <div text-fit=" 'Short' " />
    <div text-fit=" 'Stuff' " />
</div>
```

All the above phrases will be matched in text size.

### Options

You can specify all the options on the children by specifing them in the `text-fit-group` attribute.

```
<div id="parentContainer" text-fit-group=" '{max: 30, min: 20, wordWrap: true}' ">
    ... 
</div>
```
