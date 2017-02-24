/**
 * Created by Duncan on 2/24/2017.
 */
define(function(){
    var input = {};
    var that = this; // yup...

    this.keysDown  = []; // keeps an array of keys and their states
    for(var i = 0; i < 221; i++){this.keysDown[i] = false;}

    this.deltaMice = []; // any mouse buttons that have changed state this frame
    this.miceDown  = []; // also keeps an array of mouse buttons
    for(var j = 0; j < 3;   j++){this.keysDown[j] = false;}

    this.deltaWheels = [];

    this.cursor = {x: null, y: null, dx: 0, dy: 0};

    // The Event Listeners, which update the inputListener's information between firings
    document.addEventListener("mousemove", function(e){that.setMouseState(e)}, false);
    this.setMouseState = function(event){
        this.mouseScreens = getMousePosition(canvas, event);
    };

    // mouse button listeners
    document.addEventListener("mousedown", function(e){that.setMice(e, true )});
    document.addEventListener("mouseup",   function(e){that.setMice(e, false)});
    this.setMice = function(event, isDown){
        this.miceDown[event.button] = isDown;
        this.deltaMice.push({button: event.button, isDown: isDown});
    };

    canvas.addEventListener("mousewheel", function(e){that.setRoll(e)});
    this.setRoll = function(event){
        this.deltaWheels.push(event.wheelDelta);
    };
    document.onmousewheel = function(){return false};

    // key listeners
    canvas.addEventListener("keydown",   function(e){that.setKeys(e, true )}, false);
    canvas.addEventListener("keyup",     function(e){that.setKeys(e, false)}, false);
    this.setKeys = function(event, isDown){
        this.keysDown[event.keyCode] = isDown;
        this.deltaKeys.push({keyCode: event.keyCode, isDown: isDown});
    };

    canvas.oncontextmenu = function(){return false;}; // this prevents context menus from appearing on the canvas

    // x times a second, the listener will prompt the user to acknowledge commands and update figures
    var calcDelay = 1000 / user.settings.FramesPerSecond;
    setInterval(function(){that.cycleCalcFrame(Date.now(), calcDelay)}, calcDelay);
    this.cycleCalcFrame = function(currentTime, delay){
        user.calcFrame(currentTime, delay, this);
        this.deltaMice   = [];
        this.deltaKeys   = [];
        this.deltaWheels = [];
    };





    return input;
});