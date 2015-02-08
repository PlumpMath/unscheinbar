/**
 *
 * @licstart  The following is the entire license notice for the
 * JavaScript code in this page.
 *
 * Copyright (C) 2014~2015 by Sascha Willems (www.saschawillems.de)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

function shaderManager() {

  this.shaders = function() {
    this.shader.dungeon = null;
    this.shader.base = null;
    this.shader.grain = null;
  };

  this.getShaderStr = function(path, shaderType) {
    var XmlRequest = new XMLHttpRequest();
    XmlRequest.open("GET", path, false);

    if (XmlRequest.overrideMimeType) {
      XmlRequest.overrideMimeType("text/plain");
    }

    try{
      XmlRequest.send(null);
    } catch(e) {
      console.log('Error reading file "' + path + '"');
    }

    var shader = gl.createShader(shaderType);

    gl.shaderSource(shader, XmlRequest.responseText);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
  };

  this.loadShader = function(vertexShaderFile, fragmentShaderFile) {
    var vertexShader = this.getShaderStr(vertexShaderFile, gl.VERTEX_SHADER);
    var fragmentShader = this.getShaderStr(fragmentShaderFile, gl.FRAGMENT_SHADER);
    var shader = gl.createProgram();
    gl.attachShader(shader, vertexShader);
    gl.attachShader(shader, fragmentShader);
    gl.linkProgram(shader);
    if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
      alert("Error linking shaders!");
      return null;
    }
    return shader;
  };

}
