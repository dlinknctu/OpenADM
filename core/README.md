OmniUI Core 
---------------






## How to write a module ##
####configuration####
- write your configuration in **config.json** with json,
- Example:  assume your module call **hello**.py 

```
config.json
----------
....
"hello":{
    "data1": "Hello,",
    "data2": ",Bye"
}
```
####module load#####
- Append your module name into **module.config**, our module will load all modules in this files.
- Example:  assume your module call **hello**.py 
```
module.config
---
controlleradapter
uipusher
hello
```
####Write your module code####
- Put your code in **modules directory**
- You module should obey the following rules  
- Define a global function **getInstance(core,parm)**.
    * core: the core object, you should register event or event handler via core object.
    * parm: the parameter you setting in **config.json**
- You can use  **core.registerEventHandler(eventName,eventHandler)** to register event.
    * eventName: the event you interesting.
    * eventHandler: the function which been invoked when event occurs.
- You can use  **core.registerEvent(eventName,generator,interval)** to generate event.
    * eventNmae: the event you provider.
    * generator: the function which trigger event. 
    * interval: the generator will run every interval seconds.

####Exapmle####
Assume you write a module **hello.py** and **echo.py**

- Hello.py will say something periodically.
- Echo.py will repeat what hello says.

**config.json**
```
"hello":{
    "word": "Good!!"
}
```

**modules.config**
```
....
hello
echo
```


**hello.py**
``` python
class Hello:
    def __init__(self,core,parm):
        if(parm.has_key['word']):
            word = parm['word']
        else:
            word = "hello"
        core.registerEvent("saySomething", self.saySomething,4)
    def saySomething(self):
        return word.

def getInstance(core,parm):
    return Hello(core,parm)
```


**echo.py**
``` python
class Echo:
    def __init__(self,core,parm):
        core.registerEventHandler("saySomething", self.repeat)
    def repeat(self,event):
        print event

def getInstance(core,parm):
    return Echo(core,parm)
```


