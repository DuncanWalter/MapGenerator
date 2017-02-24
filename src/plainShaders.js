
// in order to a) appease twgl, b) work within security standards, and c) keep a slim html file,
// shaders are hard-loaded into the DOM here.

define(function(){

    var vertexId = "plain-vertex"; // vertexId: (ScriptId :: String)
    var fragmentId = "plain-fragment"; // fragmentId: (ScriptId :: String)

    console.dir($);

    var head = $("head");

    head.append("<script id='"+vertexId+"' type='sglsl'>"
        +"\n attribute vec3 positions;"
        +"\n attribute vec3 colors;"
        +"\n attribute vec2 offsets;"
        +"\n "
        +"\n "
        +"\n uniform mat4 projection;"
        +"\n "
        +"\n varying vec3 pass_color;"
        +"\n "
        +"\n void main() {"
        +"\n     pass_color = colors;"
        +"\n     gl_Position = projection * vec4(positions + vec3(offsets, 0.0), 1.0);"
        +"\n }"
        +"\n </script>");

    head.append("<script id='"+fragmentId+"' type='sglsl'>"
        +"\n precision mediump float;"
        +"\n "
        +"\n varying vec3 pass_color;"
        +"\n "
        +"\n void main(){"
        +"\n     gl_FragColor = vec4(pass_color, 1.0);"
        +"\n }"
        +"\n </script>");

    return {vertex: vertexId, fragment: fragmentId}; // : {vertex: (ScriptId :: String), fragment: (ScriptId :: String)}
});