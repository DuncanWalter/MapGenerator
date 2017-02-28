// in order to a) appease twgl, b) work within security standards, and c) keep a slim html file,
// shaders are hard-loaded into the DOM here.

define(function(){

    var vertexId = "paper-vertex"; // vertexId: (ScriptId :: String)
    var fragmentId = "paper-fragment"; // fragmentId: (ScriptId :: String)

    var head = $("head");

    head.append("<script id='"+vertexId+"' type='sglsl'>"
        +"\n "
        +"\n uniform mat4 u_projection;"
        +"\n uniform vec3 u_lightAngle;"
        +"\n uniform vec3 u_viewPosition;"
        +"\n "
        +"\n attribute vec3 a_position;"
        +"\n attribute vec3 a_normal;"
        +"\n attribute vec3 a_color;"
        +"\n "
        +"\n varying vec4 v_position;"
        +"\n varying vec4 v_normal;"
        +"\n varying vec4 v_lightAngle;"
        +"\n varying vec4 v_viewAngle;"
        +"\n varying vec4 v_color;"
        +"\n "
        +"\n void main() {"
        +"\n "
        +"\n     v_position = u_projection * vec4(a_position, 1.0);"
        +"\n     v_normal   = vec4(a_normal, 0);"
        +"\n     v_lightAngle = vec4(u_lightAngle, 0);"
        +"\n     v_viewAngle  = normalize(vec4(u_viewPosition, 0) - vec4(v_position.xyz, 0));"
        +"\n     v_color = vec4(a_color, 1);"
        +"\n "
        +"\n     gl_Position = v_position;"
        +"\n }"
        +"\n </script>");

    head.append("<script id='"+fragmentId+"' type='sglsl'>"
        +"\n precision mediump float;"
        +"\n "
        +"\n varying vec4 v_position;"
        +"\n varying vec4 v_normal;"
        +"\n varying vec4 v_lightAngle;"
        +"\n varying vec4 v_viewAngle;"
        +"\n varying vec4 v_color;"
        +"\n "
        +"\n void main(){"
        +"\n "
        +"\n "
        +"\n "
        +"\n    float diff = 0.35 * dot(v_normal, v_lightAngle);"
        +"\n    if(diff < 0.0){"
        +"\n        diff = 0.0;"
        +"\n    }"
        +"\n "
        +"\n    float spec = 0.15 * dot(v_viewAngle, v_normal);"
        +"\n    if(spec < 0.0){"
        +"\n        spec = 0.0;"
        +"\n    }"
        +"\n "
        +"\n     gl_FragColor = vec4(0.65 + diff + spec, 0.65 + diff + spec, 0.65 + diff + spec, 1.0) * v_color;"
        +"\n }"
        +"\n </script>");

    return {vertex: vertexId, fragment: fragmentId}; // : {vertex: (ScriptId :: String), fragment: (ScriptId :: String)}
});