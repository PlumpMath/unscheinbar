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
 
function vertexBufferObject() {
  this.vertices = null;
  this.textureCoords = null;
  this.normals = null;
  this.shaderAttribPosVertices = 0;
  this.shaderAttribPosTextureCoords = 0;
  this.shaderAttribPosNormals = 0;

  this.setVertices = function(vertexArray, attribPos) {
    this.shaderAttribPosVertices = attribPos;
    this.vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
    this.vertices.itemSize = 3;
    this.vertices.numItems = vertexArray.length / 3;
  };

  this.setTextureCoordinates = function(coordinateArray, attribPos) {
    this.shaderAttribPosTextureCoords = attribPos;
    this.textureCoords = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoords);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordinateArray), gl.STATIC_DRAW);
    this.textureCoords.itemSize = 3;
    this.textureCoords.numItems = coordinateArray.length / 3;
  };

  this.setNormals = function(normalArray, attribPos) {
    this.shaderAttribPosNormals = attribPos;
    this.normals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalArray), gl.STATIC_DRAW);
    this.normals.itemSize = 3;
    this.normals.numItems = normalArray.length / 3;
  };

  this.setAttribPos = function(attribPosVertices, attribPosNormals, attribPosTextureCoords) {
      this.shaderAttribPosVertices = attribPosVertices;
      this.shaderAttribPosNormals = attribPosNormals;
      this.shaderAttribPosTextureCoords = attribPosTextureCoords;
  };

  this.render = function(primitiveType) {
    if (this.textureCoords) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoords);
      gl.vertexAttribPointer(this.shaderAttribPosTextureCoords, this.textureCoords.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (this.normals) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
      gl.vertexAttribPointer(this.shaderAttribPosNormals, this.normals.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (this.vertices) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
      gl.vertexAttribPointer(this.shaderAttribPosVertices, this.vertices.itemSize, gl.FLOAT, false, 0, 0);
      gl.drawArrays(primitiveType, 0, this.vertices.numItems);
    }
  };

}
