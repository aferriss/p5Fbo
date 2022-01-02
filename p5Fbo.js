
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

		// set projection matrix to size of fbo texture
		// perspective(PI / 3.0, this.width / this.height, 0.1, 500);

		// Not 100% about this but I think it's necessary to get the scale of things looking correct
		// this.renderer.uMVMatrix.scale(gl.drawingBufferWidth / this.width, -gl.drawingBufferHeight / this.height, 1);
	}

	// Call to clear the depth and color buffers
	// Remove this once https://github.com/processing/p5.js/pull/5515 lands
	clear(...args) {
		const gl = this.gl;
		const r = args[0] || 0;
		const g = args[1] || 0;
		const b = args[2] || 0;
		const a = args[3] || 0;

		gl.clearColor(r, g, b, a);
		gl.clearDepth(1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	// Call end once you've done all your render. Super important to do this!
	end() {
		const gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		resetShader();

		// Restore original projection matrix
		// To do this right...I should probably figure out how to extract the FOV from the original pMatrix
		// perspective(PI / 3.0, width / height, 0.1, 500);

		// this.renderer.uMVMatrix = this.originalModelViewMatrix;
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

}