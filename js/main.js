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
 
this.textureManager = new textureManager();
this.shaderManager = new shaderManager();

var vboFullscreenQuad;

var gl = null;
var canvas = null;
var extAnsisotropic = false;
var aspectRatio = 1;

var degTimer = 0.0;
var deg_to_rad = Math.PI / 180.0;

function loadShaderPpl() {
  this.shaderManager.shaders.dungeon = this.shaderManager.loadShader("data/shaders/perpixel.vs", "data/shaders/perpixel.fs");
  var currShader = this.shaderManager.shaders.dungeon;

  gl.useProgram(currShader);

  // Attributes
  currShader.vertexPositionAttribute = gl.getAttribLocation(currShader, "aVertexPosition");
  currShader.texCoordAttribute = gl.getAttribLocation(currShader, "aTextureCoord");
  currShader.normalAttribute = gl.getAttribLocation(currShader, "aNormal");
  gl.enableVertexAttribArray(currShader.vertexPositionAttribute);
  gl.enableVertexAttribArray(currShader.texCoordAttribute);
  gl.enableVertexAttribArray(currShader.normalAttribute);

  // Uniforms
  currShader.pMatrixUniform = gl.getUniformLocation(currShader, "uPMatrix");
  currShader.mvMatrixUniform = gl.getUniformLocation(currShader, "uMVMatrix");
  currShader.lightPosUniform = gl.getUniformLocation(currShader, "lightPos");
  currShader.lightDistUniform = gl.getUniformLocation(currShader, "lightRadius");
}

function loadShaderBase() {
  this.shaderManager.shaders.base = this.shaderManager.loadShader("data/shaders/base.vs", "data/shaders/base.fs");
  var currShader = this.shaderManager.shaders.base;

  gl.useProgram(currShader);

  // Attributes
  currShader.vertexPositionAttribute = gl.getAttribLocation(currShader, "aVertexPosition");
  currShader.texCoordAttribute = gl.getAttribLocation(currShader, "aTextureCoord");
  gl.enableVertexAttribArray(currShader.texCoordAttribute);
  gl.enableVertexAttribArray(currShader.vertexPositionAttribute);

  // Uniforms
  currShader.pMatrixUniform = gl.getUniformLocation(currShader, "uPMatrix");
  currShader.mvMatrixUniform = gl.getUniformLocation(currShader, "uMVMatrix");
  gl.uniform4f(gl.getUniformLocation(currShader, "uColor"), 1.0, 1.0, 1.0, 1.0);
}

function loadShaderGrain() {
  this.shaderManager.shaders.grain = this.shaderManager.loadShader("data/shaders/filmgrain.vs", "data/shaders/filmgrain.fs");
  var currShader = this.shaderManager.shaders.grain;

  gl.useProgram(currShader);

  // Attributes
  currShader.vertexPositionAttribute = gl.getAttribLocation(currShader, "aVertexPosition");
  currShader.texCoordAttribute = gl.getAttribLocation(currShader, "aTextureCoord");
  gl.enableVertexAttribArray(currShader.texCoordAttribute);
  gl.enableVertexAttribArray(currShader.vertexPositionAttribute);

  // Uniforms
  currShader.pMatrixUniform = gl.getUniformLocation(currShader, "uPMatrix");
  currShader.mvMatrixUniform = gl.getUniformLocation(currShader, "uMVMatrix");
}

function initShaders() {
    loadShaderPpl();
    loadShaderBase();
    loadShaderGrain();
}

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms(shader) {
  gl.useProgram(shader);
  gl.uniformMatrix4fv(shader.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shader.mvMatrixUniform, false, mvMatrix);
}

// Generate vertex array for 2D representation of dungeon map
var mapVertexArray = [];
var mapTexCoordArray = [];
var mapVertexBuffer;
var mapTexCoordBuffer;

function generateVertexArrayMap() {
  for (x=0; x<generator.dungeon.width; x++) {
    for (y=0; y<generator.dungeon.height; y++) {
      if (generator.dungeon.cell[x][y].type !== CellTypeEmpty) {
        mapVertexArray.push(x,   0, y);
        mapVertexArray.push(x,   0, y+1);
        mapVertexArray.push(x+1, 0, y);

        mapVertexArray.push(x,   0, y+1);
        mapVertexArray.push(x+1, 0, y+1);
        mapVertexArray.push(x+1, 0, y);

        mapTexCoordArray.push(0, 0);
        mapTexCoordArray.push(0, 1);
        mapTexCoordArray.push(1, 0);

        mapTexCoordArray.push(0, 1);
        mapTexCoordArray.push(1, 1);
        mapTexCoordArray.push(1, 0);
      }
    }
  }

  // Push to GL
  mapVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mapVertexArray), gl.STATIC_DRAW);
  mapVertexBuffer.itemSize = 3;
  mapVertexBuffer.numItems = mapVertexArray.length / mapVertexBuffer.itemSize;

  mapTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, mapTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mapTexCoordArray), gl.STATIC_DRAW);
  mapTexCoordBuffer.itemSize = 2;
  mapTexCoordBuffer.numItems = mapTexCoordArray.length / mapTexCoordArray.itemSize;
}

function generateVertexBuffers() {
  generator.dungeon.generateVertexBufferObjects();
  player.generateVBO();
  vboFullscreenQuad = new vertexBufferObject();
  vboFullscreenQuad.setVertices([0,0,0, 0,1,0, 1,0,0, 0,1,0, 1,1,0, 1,0,0], this.shaderManager.shaders.grain.vertexPositionAttribute);
  vboFullscreenQuad.setTextureCoordinates([0,0,0, 0,1,0, 1,0,0, 0,1,0, 1,1,0, 1,0,0], this.shaderManager.shaders.grain.vertexTextureCoordAttribute);
}

function renderOverlayMap() {
  //mat4.ortho(0, gl.viewportWidth, gl.viewportHeight, 0, 0, 64, pMatrix);
  var aspectRatio = gl.viewportWidth/gl.viewportHeight;
  mat4.ortho(pMatrix, -32*aspectRatio, 32*aspectRatio, -32, 32, 0, 64);
  mat4.rotate(pMatrix, pMatrix, 90 * deg_to_rad, [1, 0, 0]);
  mat4.identity(mvMatrix);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.depthFunc(gl.ALWAYS);
  mat4.rotate(mvMatrix, mvMatrix, player.rotation[1], [0,1,0]);
  mat4.translate(mvMatrix, mvMatrix, [-player.x, 0, -player.y]);
  //setMatrixUniforms(shaderProgram);
  gl.useProgram(this.shaderManager.shaders.base);
  gl.uniformMatrix4fv(this.shaderManager.shaders.base.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(this.shaderManager.shaders.base.mvMatrixUniform, false, mvMatrix);

  //setMatrixUniforms(shaderBase);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.bindTexture(gl.TEXTURE_2D, textureManager.textures.mapTile);
//      gl.disableVertexAttribArray(shaderProgram.normalAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexBuffer);
  gl.vertexAttribPointer(this.shaderManager.shaders.base.vertexPositionAttribute, mapVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, mapTexCoordBuffer);
  gl.vertexAttribPointer(this.shaderManager.shaders.base.texCoordAttribute, mapTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, mapVertexBuffer.numItems);

  gl.useProgram(this.shaderManager.shaders.dungeon);
//      gl.bindTexture(gl.TEXTURE_2D, textureCeil);

  // Highlight active tile
  mat4.identity(mvMatrix);
  mat4.rotate(mvMatrix, mvMatrix, player.rotation[1], [0,1,0]);
  mat4.translate(mvMatrix, mvMatrix, [-(player.x % 1), 0, -(player.y % 1)]);
  setMatrixUniforms(this.shaderManager.shaders.dungeon);
  gl.uniform4f(gl.getUniformLocation(this.shaderManager.shaders.dungeon, "color"), 0.0, 0.0, 1.0, 1.0);
  generator.dungeon.vboFloor.render(gl.TRIANGLES);
  gl.uniform4f(gl.getUniformLocation(this.shaderManager.shaders.dungeon, "color"), 1.0, 1.0, 1.0, 1.0);

  // Player position
  mat4.identity(mvMatrix);
  mat4.rotate(mvMatrix, mvMatrix, player.rotation[1], [0,1,0]);
  mat4.translate(mvMatrix, mvMatrix, [-player.x, 0, -player.y]);
  setMatrixUniforms(this.shaderManager.shaders.dungeon);
  gl.uniformMatrix4fv(this.shaderManager.shaders.dungeon.mvMatrixUniform, false, locMat);
  gl.uniform4f(gl.getUniformLocation(this.shaderManager.shaders.dungeon, "color"), 0.0, 1.0, 0.0, 1.0);
  generator.dungeon.vboFloor.render(gl.TRIANGLES);
  gl.uniform4f(gl.getUniformLocation(this.shaderManager.shaders.dungeon, "color"), 1.0, 1.0, 1.0, 1.0);


  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.BLEND);

//      gl.enableVertexAttribArray(shaderProgram.normalAttribute);

//
  // gl.bindTexture(gl.TEXTURE_2D, textureFloor);
  // for (x=0; x<generator.dungeon.width; x++) {
  //   for (y=0; y<generator.dungeon.height; y++) {
  //     mat4.identity(locMat);
  //     mat4.translate(locMat, locMat, [-player.x+0.5+x, -player.height, -player.y+0.5+y]);
  //     gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, locMat);
  //     generator.dungeon.vboFloor.render(gl.TRIANGLES);
  //   }
  // }

  gl.depthFunc(gl.LEQUAL);

}

function renderMiniMap() {
  // TODO
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(pMatrix);
    mat4.perspective(pMatrix, 45 + (0.02 * Math.cos(player.sway * deg_to_rad)), gl.viewportWidth/gl.viewportHeight, 0.1, 1024);
    // TODO : Swaytimer based on player stresslevel

    player.setCamera(mvMatrix, pMatrix);

    setMatrixUniforms(this.shaderManager.shaders.dungeon);

    gl.uniform3f(this.shaderManager.shaders.dungeon.lightPosUniform, 0, -player.height, 0);
    gl.uniform1f(this.shaderManager.shaders.dungeon.lightDistUniform, player.lightRadius);
    gl.uniform4f(gl.getUniformLocation(this.shaderManager.shaders.dungeon, "color"), 1.0, 1.0, 1.0, 1.0);

    // TODO : Move to dungeon renderer
    // TODO : Visibility
    // TODO : Circular instead of rectangular
    // TODO : Frustum culling for performance
    var drawDistance = 15;
     for (x=Math.round(player.x)-drawDistance; x<=Math.round(player.x)+drawDistance; x++) {
       for (y=Math.round(player.y)-drawDistance; y<=Math.round(player.y)+drawDistance; y++) {
        if ((x>=0) && (y>=0) && (x<generator.dungeon.width) && (y<generator.dungeon.height)) {
          generator.dungeon.cell[x][y].drawGL();
        }
      }
    }

    //enemy.render();
    player.render();
    //setMatrixUniforms(this.shaderManager.shaders.base);
    game.render();

    if (grain) {
      vboFullscreenQuad.setAttribPos(this.shaderManager.shaders.grain.vertexPositionAttribute, 0, this.shaderManager.shaders.grain.vertexTextureCoordAttribute);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthFunc(gl.ALWAYS);
      mat4.ortho(pMatrix, 0, 1, 1, 0, -1, 1);
      mat4.identity(mvMatrix);
      setMatrixUniforms(this.shaderManager.shaders.grain);
      gl.useProgram(this.shaderManager.shaders.grain);
      gl.uniform1f(gl.getUniformLocation(this.shaderManager.shaders.grain, "m_Time"), Math.trunc(degTimer/5)+1);
      vboFullscreenQuad.render(gl.TRIANGLES);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.BLEND);
    }

    // Darkened borders
    // Interesting whitening effect :
    //gl.bindTexture(gl.TEXTURE_2D, textureManager.textures.dropShadow);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.bindTexture(gl.TEXTURE_2D, textureManager.get("blackwhitegradient"));
    vboFullscreenQuad.setAttribPos(this.shaderManager.shaders.base.vertexPositionAttribute, 0, this.shaderManager.shaders.base.texCoordAttribute);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
    gl.depthFunc(gl.ALWAYS);
    mat4.ortho(pMatrix, 0.1, 0.9, 0.9, 0.1, -1, 1);
    mat4.identity(mvMatrix);
    setMatrixUniforms(this.shaderManager.shaders.base);
    gl.useProgram(this.shaderManager.shaders.base);
    vboFullscreenQuad.render(gl.TRIANGLES);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);

    // Map
    setMatrixUniforms(this.shaderManager.shaders.base);
    if (showMap) {
      this.renderOverlayMap();
    }
}

var firstRenderInterval;
var startTime;
var lastTimeStamp;
var lastFpsTimeStamp;
var framesPerSecond = 0;
var frameCount = 0;
var diffuseOnly = 1;
var showMap = false;
var grain = true;

function render() {
  clearInterval(firstRenderInterval);

  time = window.webkitAnimationStartTime ||
         window.mozAnimationStartTime ||
         new Date().getTime();


  if (time - lastFpsTimeStamp >= 1000) {
       framesPerSecond = frameCount;
       frameCount = 0;
       lastFpsTimeStamp = time;
       hudScope.$apply('fps = "' + framesPerSecond + ' fps"');
   }

  degTimer += (time - lastTimeStamp) * 0.01;
  if (degTimer > 360.0) { degTimer -= 360.0; }

  requestAnimationFrame(render);
  //drawScene();
  game.render();

  game.update((time - lastTimeStamp) * 0.01);

  ++frameCount;
  lastTimeStamp = time;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  aspectRatio = canvas.width / canvas.height;
  if (gl !== null) {
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }
}

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        aspectRatio = canvas.width / canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }

    // Anisotropic filtering
    extAnsisotropic = gl.getExtension("EXT_texture_filter_anisotropic");

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // TODO : Some slight red or blue for a nice glowing sky (draw distance...)
}

function webGLStart() {
    canvas = document.getElementById("webGLcanvas");
    resizeCanvas();
    initGL(canvas);

    initShaders();

    textureManager.setup();
    textureManager.loadTextures();
    textureManager.setRenderToTextureCanvas(document.getElementById('rttCanvas'));

    startTime = window.webkitAnimationStartTime ||
                window.mozAnimationStartTime ||
                new Date().getTime();
    lastTimeStamp = startTime;
    lastFpsTimeStamp = startTime;
}
