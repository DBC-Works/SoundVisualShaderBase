void setup() {
  //fullScreen(P2D);
  size(640, 360, P2D);
  //size(960, 540, P2D);
  //size(1280, 720, P2D);

  startTimeMillis = System.currentTimeMillis();
  final JSONObject setting = loadJSONObject("setting.json");
  framePerSecond = setting.getInt("framePerSecond");
  msPerFrame = 1000.0 / framePerSecond;
  println("ms per frame: " + msPerFrame + "ms");
  frameRate(framePerSecond);

  sounds = loadSounds(setting.getJSONArray("sounds"));
  repeat = setting.getBoolean("repeat", false);
  shaders = loadShaders(setting.getJSONArray("shaders"));

  final JSONObject backgroundSetting = setting.getJSONObject("background");
  if (backgroundSetting != null) {
    final String clr = backgroundSetting.getString("color");
    if (clr != null && 0 < clr.length()) {
      backgroundColor = Integer.decode(clr);
    }
    final String image = backgroundSetting.getString("image");
    if (image != null && 0 < image.length()) {
      backgroundImage = loadImage(image);
    }
    initBackground();
  }

  final JSONObject outputSetting = setting.getJSONObject("out");
  final JSONObject connection = outputSetting.getJSONObject("connection");
  if (connection != null) {
    final String senderName = connection.getString("name");
    if (senderName != null && 0 < senderName.length()) { 
      println("initialize spout...");
      spout = new Spout(this);
      if (spout.createSender(senderName, width, height) == false) {
        println("warning: fail to create spout");
        spout = null;
      }
    }
  }
  recorder = createFrameRecorder(outputSetting);
}

void draw() {
  if (provider == null || provider.isPlaying() == false) {
    if (provider != null) {
      ++soundIndex;
      if (soundIndex == sounds.size()) {
        if (repeat == false) {
          if (recorder != null) {
            recorder.finish();
            recorder = null;
          }
          if (0 < frameDropCount) {
            println("Frame drop count: ",  frameDropCount, " / ", frameCount, "(", (frameDropCount * 100.0 / frameCount) ,"%)");
          }
          exit();
          return;
        }
        soundIndex = 0;
      }
    }
    provider = new SoundDataProvider(this, msPerFrame, sounds.get(soundIndex).location);
    provider.play();
  }
  provider.update();
  final float progress = provider.getProgressPercentage();

  if (startFrameCount == 0 && 0.0 < progress) {
    println("Leading frame count: ", frameCount);
    startFrameCount = frameCount;
  }

  if (onlyInitialization == false) {
    initBackground();
  }
  final long frameTimeMillis = System.currentTimeMillis();
  final float time = ((frameTimeMillis - startTimeMillis) / 1000.0);
  for (ShaderInfo shaderInfo: shaders) {
    if (shaderInfo.disabled == false) {
      final PShader shader = shaderInfo.shader;
      shader.set("time", time);
      shader.set("progress", progress);
      shader.set("mouse", mouseX / (float)width, (height - mouseY) / (float)height);
      shader.set("soundLevel",
                  provider.getRightLevelValue(),
                  provider.getLeftLevelValue(),
                  provider.getMixLevelValue());
      shader.set("kick", provider.getKickValue());
      shader.set("hihat", provider.getHihatValue());
      shader.set("snare", provider.getSnareValue());
      filter(shader);
    }
  }

  if (recorder != null) {
    recorder.recordFrame();
  }
  if (spout != null) {
    spout.sendTexture();
  }

  final long timeTaken = System.currentTimeMillis() - frameTimeMillis;
  if ((1.0 / framePerSecond * 1000) < timeTaken) {
    println("Overtime: " + timeTaken + "ms(" + frameCount + ")");
    ++frameDropCount;
  }
}

void keyReleased() {
  if (key != CODED) {
    if (KeyEvent.VK_0 <= keyCode && keyCode <= KeyEvent.VK_9) {
      final int index = KeyEvent.VK_0 < keyCode ? keyCode - KeyEvent.VK_1 : 10;
      if (index < shaders.size()) {
        ShaderInfo info = shaders.get(index);
        info.disabled = !info.disabled;
      }
    } else {
      switch (keyCode) {
        case 5:  // PrtSc
          saveFrame("scene-########.jpg");
          break;
      }
    }
  }
}
