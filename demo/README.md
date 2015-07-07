

# text-fit

**Requirements**:
  - Angular
  - Lodash - ToDo: remove lodash dependency
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
                            wordWrap: true // default,
                            accuracy: 0 // default,
                            projectedPercentageOfBox: .87 // default } "/>
```
* accuracy = the directive needs to resize the font and then test that size to see if it is too big or too small. This will dump out of the guessing phase if its last two guesses were within a certain threshold specified. For instace, if you specify .5 then the system will stop guess as soon as its last two guesses are within 1/2 pixel of each other.

* projectedPercentageOfBox = the directive needs a starting point for the size of the text. It assumes a good starting point is the (height of container) * projectedPercentageOfBox. Use this with the above setting to get faster guesses and speed up the performance of this directive. 



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
<div id="parentContainer" text-fit-group=" {max: 30, min: 20, wordWrap: true} ">
    ... 
</div>
```
