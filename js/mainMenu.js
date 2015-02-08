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

function mainMenu() {
  this.enemies = [];
  this.cell = new Array([]);
  this.shader = shaderManager.shaders.dungeon;
  this.sway = 0;

  this.vbos = function() {
    this.vbos.floor = null;
    this.vbos.ceil = null;
    this.vbos.wall = null;
  };

  this.generateBufferObjects = function() {
    var vaPosition = [];
    var vaTexCoord = [];
    var vaNormal = [];
    var h = 1.85;
    var d = 20;

    vaPosition.push(-d,0,d, d,0,d, -d,0,-d, d,0,-d);
    vaNormal.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
    vaTexCoord.push(0,1,0, 1,1,0, 0,0,0, 1,0,0);

    this.vbos.floor = new vertexBufferObject();
    this.vbos.floor.setVertices(vaPosition, this.shader.vertexPositionAttribute);
    this.vbos.floor.setNormals(vaNormal, this.shader.normalAttribute);
    this.vbos.floor.setTextureCoordinates(vaTexCoord, this.shader.texCoordAttribute);

    vaNormal.splice(0, vaNormal.length);
    vaPosition.splice(0, vaPosition.length);
    vaTexCoord.splice(0, vaTexCoord.length);

    vaPosition.push(-d,h,d, -d,h,-d, d,h,d, d,h,-d);
    vaNormal.push(0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0);
    vaTexCoord.push(0,1,0, 0,0,0, 1,1,0, 1,0,0);

    this.vbos.ceil = new vertexBufferObject();
    this.vbos.ceil.setVertices(vaPosition, this.shader.vertexPositionAttribute);
    this.vbos.ceil.setNormals(vaNormal, this.shader.normalAttribute);
    this.vbos.ceil.setTextureCoordinates(vaTexCoord, this.shader.texCoordAttribute);

    vaNormal.splice(0, vaNormal.length);
    vaPosition.splice(0, vaPosition.length);
    vaTexCoord.splice(0, vaTexCoord.length);

    vaPosition.push(-d,0,-d/4, d,0,-d/4, -d,h,-d/4, d,h,-d/4);
    vaNormal.push(0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1);
    vaTexCoord.push(0,d,0, 0,0,0, d,h,0, d,0,0);

    this.vbos.wall = new vertexBufferObject();
    this.vbos.wall.setVertices(vaPosition, this.shader.vertexPositionAttribute);
    this.vbos.wall.setNormals(vaNormal, this.shader.normalAttribute);
    this.vbos.wall.setTextureCoordinates(vaTexCoord, this.shader.texCoordAttribute);
  };

  this.generateTextElements = function() {
    textureManager.addEmpty("gameLogo");
    textureManager.addEmpty("gameLogoBy");
    textureManager.generateText("unscheinbar", textureManager.get("gameLogo"), "96pt");
    textureManager.generateText("A game by Sascha Willems", textureManager.get("gameLogoBy"), "48pt");
  };

  this.update = function(timeFactor) {
    this.sway += timeFactor * 5;
    if (this.sway > 360) { this.sway -= 360; }
    // Enemies
    this.enemies.forEach(function (element, index) {
      element.update(timeFactor);
    });
  };

  this.setup = function() {
    this.generateBufferObjects();
    this.generateTextElements();
    for (i=-2; i<3; i++) {
      this.enemies.push(new enemy(i*1.25 + Math.random() * 0.15, -4.5 + Math.abs(i) * 0.25, textureManager.textures.defaultEnemy));
    }
    for (i=-2; i<3; i++) {
      if (i!==0) {
        this.enemies.push(new enemy(i*(Math.abs(i) != 1 ? 0.6 : 0.4) + Math.random() * 0.15, -3.5 + Math.abs(i) * 0.5, textureManager.textures.defaultEnemy));
      }
    }
    this.enemies.forEach(function (element, index) {
      element.position[1] += Math.random() * 0.15;
    });
  };

  this.render = function() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(pMatrix);
    mat4.perspective(pMatrix, 60 * deg_to_rad + (0.075 * Math.cos(this.sway * deg_to_rad)), gl.viewportWidth/gl.viewportHeight, 0.1, 1024);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, -1.15, 0]);

    gl.useProgram(this.shader);
    gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);

    gl.uniform3f(this.shader.lightPosUniform, 0.75 * Math.sin(this.sway * deg_to_rad), -0.2, 0.75 * Math.cos(this.sway * deg_to_rad));
    gl.uniform1f(this.shader.lightDistUniform, 4.5);
    gl.uniform4f(gl.getUniformLocation(this.shader, "color"), 1.0, 1.0, 1.0, 1.0);
    gl.bindTexture(gl.TEXTURE_2D, textureManager.textures.default);
    this.vbos.floor.render(gl.TRIANGLE_STRIP);
    this.vbos.ceil.render(gl.TRIANGLE_STRIP);
    this.vbos.wall.render(gl.TRIANGLE_STRIP);

    // Enemies
    this.enemies.forEach(function (element, index) {
      element.render();
    });

    if (grain) {
      vboFullscreenQuad.setAttribPos(shaderManager.shaders.grain.vertexPositionAttribute, 0, shaderManager.shaders.grain.vertexTextureCoordAttribute);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthFunc(gl.ALWAYS);
      mat4.ortho(pMatrix, 0, 1, 1, 0, -1, 1);
      mat4.identity(mvMatrix);
      setMatrixUniforms(shaderManager.shaders.grain);
      gl.useProgram(shaderManager.shaders.grain);
      gl.uniform1f(gl.getUniformLocation(shaderManager.shaders.grain, "m_Time"), Math.trunc(degTimer/5)+1);
      vboFullscreenQuad.render(gl.TRIANGLES);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.BLEND);
    }

    // Darkened borders
    // Interesting whitening effect :
    //gl.bindTexture(gl.TEXTURE_2D, textureManager.textures.dropShadow);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.bindTexture(gl.TEXTURE_2D, textureManager.get("blackwhitegradient"));
    vboFullscreenQuad.setAttribPos(shaderManager.shaders.base.vertexPositionAttribute, 0, shaderManager.shaders.base.texCoordAttribute);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
    gl.depthFunc(gl.ALWAYS);
    mat4.ortho(pMatrix, 0.1, 0.9, 0.9, 0.1, -1, 1);
    mat4.identity(mvMatrix);
    setMatrixUniforms(shaderManager.shaders.base);
    gl.useProgram(shaderManager.shaders.base);
    vboFullscreenQuad.render(gl.TRIANGLES);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);

    // TODO : Text test

    mat4.ortho(pMatrix, -0.5, 0.5, -0.5, 0.5, -1, 1);
    mat4.identity(mvMatrix);
    setMatrixUniforms(shaderManager.shaders.base);

    gl.uniform4f(gl.getUniformLocation(shaderManager.shaders.base, "uColor"), 1.0, 1.0, 1.0, 0.25);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthFunc(gl.ALWAYS);
    gl.bindTexture(gl.TEXTURE_2D, textureManager.get("gameLogo"));
    textureManager.renderQuad(0, 0, 0, 0.75, 0.75*aspectRatio, shaderManager.shaders.base);
    gl.bindTexture(gl.TEXTURE_2D, textureManager.get("gameLogoBy"));
    textureManager.renderQuad(0.1, -0.075, 0, 0.5, 0.5*aspectRatio, shaderManager.shaders.base);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);
    gl.uniform4f(gl.getUniformLocation(shaderManager.shaders.base, "uColor"), 1.0, 1.0, 1.0, 1.0);
  };

  this.setup();

}
