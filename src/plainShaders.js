
// in order to a) appease twgl, b) work within security standards, and c) keep a slim html file,
// shaders are hard-loaded into the DOM here.

define(function(){

    var vertexId = "plain-vertex"; // vertexId: (ScriptId :: String)
    var fragmentId = "plain-fragment"; // fragmentId: (ScriptId :: String)

    var head = $("head");

    head.append("<script id='"+vertexId+"' type='sglsl'>"
        +"\n uniform mat4 u_projection;"
        +"\n "
        +"\n attribute vec3 a_position;"
        +"\n attribute vec3 a_color;"
        +"\n "
        +"\n "
        +"\n "
        +"\n varying vec3 v_color;"
        +"\n "
        +"\n void main() {"
        +"\n     v_color = a_color;"
        +"\n     gl_Position = u_projection * vec4(a_position, 1.0);"
        +"\n }"
        +"\n </script>"
    );

    head.append("<script id='"+fragmentId+"' type='sglsl'>"
        +"\n precision mediump float;"
        +"\n "
        +"\n varying vec3 v_color;"
        +"\n "
        +"\n void main(){"
        +"\n     gl_FragColor = vec4(v_color, 1.0);"
        +"\n }"
        +"\n </script>"
    );

    return {vertex: vertexId, fragment: fragmentId}; // : {vertex: (ScriptId :: String), fragment: (ScriptId :: String)}
});