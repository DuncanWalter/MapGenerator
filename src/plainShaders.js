
// in order to a) appease twgl, b) work within security standards, and c) keep a slim html file,
// shaders are hard-loaded into the DOM here.

define(function(){

    var vertexId = "plain-vertex"; // vertexId: (ScriptId :: String)
    var fragmentId = "plain-fragment"; // fragmentId: (ScriptId :: String)

    var head = $("head");

    head.append("<script id='"+vertexId+"' type='sglsl'>\
        uniform mat4 u_projection;\
        \
        attribute vec3 a_position;\
        attribute vec3 a_color;\
        \
        \
        \
        varying vec3 v_color;\
        \
        void main() {\
            v_color = a_color;\
            gl_Position = u_projection * vec4(a_position, 1.0);\
        }\
        </script>"
    );

    head.append("<script id='"+fragmentId+"' type='sglsl'>\
        precision mediump float;\
        \
        varying vec3 v_color;\
        \
        void main(){\
            gl_FragColor = vec4(v_color, 1.0);\
        }\
        </script>"
    );

    return {vertex: vertexId, fragment: fragmentId}; // : {vertex: (ScriptId :: String), fragment: (ScriptId :: String)}
});