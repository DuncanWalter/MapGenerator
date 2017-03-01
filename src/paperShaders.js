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
        +"\n uniform vec4 u_materialTraits;"
        +"\n "
        +"\n attribute vec3 a_position;"
        +"\n attribute vec3 a_normal;"
        +"\n attribute vec4 a_color;"
        +"\n "
        +"\n varying vec4 v_position;"
        +"\n varying vec3 v_normal;"
        +"\n varying vec3 v_lightAngle;"
        +"\n varying vec3 v_viewPosition;"
        +"\n varying vec3 v_vertPosition;"
        +"\n varying vec4 v_color;"
        +"\n "
        +"\n varying float v_ambient;"
        +"\n varying float v_diffuse;"
        +"\n varying float v_specular;"
        +"\n varying float v_sheen;"
        +"\n "
        +"\n void main() {"
        +"\n "
        +"\n     v_ambient = u_materialTraits[0];"
        +"\n     v_diffuse = u_materialTraits[1];"
        +"\n     v_specular = u_materialTraits[2];"
        +"\n     v_sheen = u_materialTraits[3];"
        +"\n     v_position = u_projection * vec4(a_position, 1.0);"
        +"\n     v_normal   = a_normal;"
        +"\n     v_lightAngle = u_lightAngle;"
        +"\n     v_vertPosition = a_position;"
        +"\n     v_viewPosition = u_viewPosition;"
        +"\n     v_color = a_color;"
        +"\n "
        +"\n     gl_Position = v_position;"
        +"\n }"
        +"\n </script>");

    head.append("<script id='"+fragmentId+"' type='sglsl'>"
        +"\n precision mediump float;"
        +"\n "
        +"\n varying vec4 v_position;"
        +"\n varying vec3 v_normal;"
        +"\n varying vec3 v_lightAngle;"
        +"\n varying vec3 v_viewPosition;"
        +"\n varying vec3 v_vertPosition;"
        +"\n varying vec4 v_color;"
        +"\n varying float v_ambient;"
        +"\n varying float v_diffuse;"
        +"\n varying float v_specular;"
        +"\n varying float v_sheen;"
        +"\n "
        +"\n void main(){"
        +"\n "
        +"\n "
        +"\n "
        +"\n    float diff = v_diffuse * max(dot(v_normal, v_lightAngle), 0.0);"
        +"\n "
        +"\n    vec3 viewAngle = normalize(v_viewPosition - v_vertPosition);"
        +"\n    float spec = v_specular * pow(max(dot(viewAngle, normalize(-v_lightAngle - 2.0*dot(v_normal, -v_lightAngle)*v_normal)), 0.0), v_sheen);"
        +"\n "
        +"\n "
        +"\n    gl_FragColor = vec4(spec, spec, spec, spec) + (vec4(v_ambient + diff, v_ambient + diff, v_ambient + diff, 1.0) * v_color);"
        +"\n }"
        +"\n </script>");

    return {vertex: vertexId, fragment: fragmentId}; // : {vertex: (ScriptId :: String), fragment: (ScriptId :: String)}
});