
class p5Fbo {
	constructor({
		renderer,
		width,
		height,
		interpolationMode = LINEAR,
		wrapMode = CLAMP
	} = {}) {
		this.width = width;
		this.height = height;
		this.gl = renderer.GL;
		const gl = this.gl;
		this.renderer = renderer;

		// Create and bind texture
		let im = new p5.Image(this.width, this.height);
		this.texture = new p5.Texture(this.renderer, im);

		this.texture.setInterpolation(interpolationMode, interpolationMode);
		this.texture.setWrapMode(wrapMode);

		this.originalProjectionMatrix = this.renderer.uPMatrix.copy();
		this.originalModelViewMatrix = this.renderer.uMVMatrix.copy();

		// define size and format of level 0
		const level = 0;

		// Create and bind the framebuffer
		this.frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

		// attach the texture as the first color attachment
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			attachmentPoint,
			gl.TEXTURE_2D,
			this.texture.glTex,
			level
		);

		// create a depth renderbuffer
		const depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

		// make a depth buffer and the same size as the targetTexture
		gl.renderbufferStorage(
			gl.RENDERBUFFER,
			gl.DEPTH_COMPONENT16,
			this.width,
			this.height
		);

		gl.framebufferRenderbuffer(
			gl.FRAMEBUFFER,
			gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER,
			depthBuffer
		);

		// Bind back to null
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);


		this.defaultCamera = this.renderer._curCamera;

		// console.log(this.renderer.pop);
		// this.fboCamera = createCamera()
		// this.fboCamera.perspective(this.defaultCamera.defaultCameraFOV, this.width / this.height, 0.1, 500);
		// console.log(this.defaultCamera);
		// setCamera(this.defaultCamera);
	}

	// Call this function whenever you want to start rendering into your fbo
	begin() {
		const gl = this.gl;
		// This is necessary to prevent p5 from using the wrong shader
		this.renderer._tex = null;

		// render to our targetTexture by binding the framebuffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

		// render cube with our 3x2 texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture.glTex);

		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, this.width, this.height);

		this.renderer._pInst.push();

		// set projection matrix to size of fbo texture
		this.computeCameraSettings();
	}

	// Updates camera to the correct aspect and size
	computeCameraSettings() {
		this.renderer._curCamera.defaultCameraFOV = 60 / 180 * Math.PI;
		this.renderer._curCamera.defaultAspectRatio = this.width / this.height;
		this.renderer._curCamera.defaultEyeX = 0;
		this.renderer._curCamera.defaultEyeY = 0;
		this.renderer._curCamera.defaultEyeZ = this.height / 2.0 / Math.tan(this.renderer._curCamera.defaultCameraFOV / 2.0);
		this.renderer._curCamera.defaultCenterX = 0;
		this.renderer._curCamera.defaultCenterY = 0;
		this.renderer._curCamera.defaultCenterZ = 0;
		this.renderer._curCamera.defaultCameraNear = this.renderer._curCamera.defaultEyeZ * 0.1;
		this.renderer._curCamera.defaultCameraFar = this.renderer._curCamera.defaultEyeZ * 10;

		this.cameraFOV = this.renderer._curCamera.defaultCameraFOV;
		this.aspectRatio = this.renderer._curCamera.defaultAspectRatio;
		this.eyeX = this.renderer._curCamera.defaultEyeX;
		this.eyeY = this.renderer._curCamera.defaultEyeY;
		this.eyeZ = this.renderer._curCamera.defaultEyeZ;
		this.centerX = this.renderer._curCamera.defaultCenterX;
		this.centerY = this.renderer._curCamera.defaultCenterY;
		this.centerZ = this.renderer._curCamera.defaultCenterZ;
		this.upX = 0;
		this.upY = 1;
		this.upZ = 0;
		this.cameraNear = this.renderer._curCamera.defaultCameraNear;
		this.cameraFar = this.renderer._curCamera.defaultCameraFar;

		this.renderer._curCamera.perspective();
		this.renderer._curCamera.camera();

		this.cameraType = 'default';

	}

	// Call end once you've done all your render. Super important to do this!
	end() {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		resetShader();

		// Restore original projection matrix
		this.renderer._curCamera._computeCameraDefaultSettings();
		this.renderer._curCamera._setDefaultCamera();

		this.renderer._pInst.pop();

	}

	getTexture() {
		return this.texture;
	}

	// Copies this framebuffer to another
	copyTo(dst) {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		gl.bindTexture(gl.TEXTURE_2D, dst.texture.glTex);
		gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, dst.width, dst.height, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	// Draw at a given x, y, width, and height.
	// You can call without any parameters to draw the fbo at full screen size
	draw(x, y, w, h) {
		x = x || 0;
		y = y || 0;
		w = w || width;
		h = h || height;

		push();
		translate(x, y);
		scale(1, -1);
		texture(this.texture);
		plane(w, h);
		pop();
	}


}