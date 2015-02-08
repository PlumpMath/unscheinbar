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
 
function textureManager() {

  this.textureNames = [];
  this.textureIDs = [];
  this.rttCanvas = null;
  this.rttContext = null;
  this.vboQuad = null;

  this.textures = function() {
    this.textures.mapTile = null;
    this.textures.default = null;
    this.textures.defaultEnemy = null;
    this.textures.dropShadow = null;
  };

  this.handleTextureLoaded = function(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };

  this.loadTexture = function(src) {
    var image = new Image();
    var texture = gl.createTexture();
    image.src = src;
    image.onload = function() { textureManager.handleTextureLoaded(image, texture); };
    return texture;
  };

  this.add = function(texturePath, textureName) {
    this.textureNames.push(textureName);
    this.textureIDs.push(this.loadTexture(texturePath));
  };

  this.addEmpty = function(textureName) {
    this.textureNames.push(textureName);
    this.textureIDs.push(gl.createTexture());
  };

  this.get = function(textureName) {
    var index = this.textureNames.indexOf(textureName);
    return (index > -1) ? this.textureIDs[index] : null;
  };

  this.loadTextures = function() {
    this.textures.mapTile = this.loadTexture("data/textures/map_tile01.png");
    this.textures.default = this.loadTexture("data/textures/white32x32.png");
    this.textures.defaultEnemy = this.loadTexture("data/textures/defaultenemy.png");
    this.textures.dropShadow = this.loadTexture("data/textures/dropshadow.png");
    this.add("data/textures/blackwhitegradient.png", "blackwhitegradient");
  };

  this.setRenderToTextureCanvas = function(canvas) {
    this.rttCanvas = canvas;
    this.rttContext = this.rttCanvas.getContext('2d');
  };

  this.setup = function() {
    // Generate vbo for a simple quad
    // TODO : triangle strip
    var d = 1;
    this.vboQuad = new vertexBufferObject();
    this.vboQuad.setVertices([-d/2,-d/2,0, d/2,-d/2,0, -d/2,d/2,0, d/2,d/2,0], -1);
    this.vboQuad.setTextureCoordinates([0,1,0, 1,1,0, 0,0,0, 1,0,0], -1);
  };

  this.generateText = function(text, targetTexture, fontSize) {
    this.rttContext.save();
    this.rttContext.clearRect(0, 0, this.rttCanvas.width, this.rttCanvas.height);
    this.rttContext.fillStyle = 'black';
    this.rttContext.fill();
    this.rttContext.fillStyle = "black";
    this.rttContext.lineWidth = 1;
    this.rttContext.strokeStyle = "#6B0000";
    this.rttContext.shadowColor = "#ABABAB";
    this.rttContext.shadowOffsetX = 0;
    this.rttContext.shadowOffsetY = 0;
    this.rttContext.shadowBlur = 25;
    this.rttContext.font = "bold " + fontSize + " Calibri";
    this.rttContext.textAlign = "center";
    this.rttContext.textBaseline = "middle";
    var leftOffset = this.rttContext.canvas.width / 2;
    var topOffset = this.rttContext.canvas.height / 2;
    this.rttContext.fillText(text, leftOffset, topOffset);
    this.rttContext.restore();
    this.handleTextureLoaded(this.rttCanvas, targetTexture);
  };

  this.renderQuad = function(x, y, z, width, height, shader) {
    gl.useProgram(shader);
    var locMat = mat4.create();
    mat4.identity(locMat);
    mat4.translate(locMat, locMat, [x, y, z]);
    mat4.scale(locMat, locMat, [width, height, 1]);
    gl.disable(gl.CULL_FACE);
    gl.uniformMatrix4fv(shader.mvMatrixUniform, false, locMat);
    this.vboQuad.setAttribPos(shader.vertexPositionAttribute, 0, shader.texCoordAttribute);
    this.vboQuad.render(gl.TRIANGLE_STRIP);
  };

}
