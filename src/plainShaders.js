
// in order to a) appease twgl, b) work within security standards, and c) keep a slim html file,
// shaders are hard-loaded into the DOM here.

define(function(){

    var vertexId = "plain-vertex"; // vertexId: (ScriptId :: String)
    var fragmentId = "plain-fragment"; // fragmentId: (ScriptId :: String)

    var head = $("head");

    head.append("<script id='"+vertexId+"' type='sglsl'>"
        +"attribute vec4 position;"
        +"attribute float color;"
        +""
        +"uniform mat4 projection;"
        +"uniform vec4 color1;"
        +"uniform vec4 color2;"
        +""
        +"varying vec4 pass_color;"
        +""
        +"void main() {"
        +"    if(color == 1.0) {"
        +"        pass_color = color1;"
        +"    } else {"
        +"        pass_color = color2;"
        +"    }"
        +"    gl_Position = projection * position;"
        +"}"
        +"</script>");

    head.append("<script id='"+fragmentId+"' type='sglsl'>"
        +"precision mediump float;"
        +""
        +"varying vec4 pass_color;"
        +""
        +"void main(){"
        +"    gl_FragColor = pass_color;"
        +"}"
        +"</script>");

    return {vertex: vertexId, fragment: fragmentId}; // : {vertex: (ScriptId :: String), fragment: (ScriptId :: String)}
});