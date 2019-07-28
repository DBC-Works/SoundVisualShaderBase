final class SoundDataProvider {
  final AudioPlayer player;
  /*
  final FFT rightFft;
  final FFT leftFft;
   */

  private final float perFrame;
  private final BeatDetect mixBeatDetector;
  private final BeatDetect rightBeatDetector;
  private final BeatDetect leftBeatDetector;

  private final Minim minim;

  private float rightLevelValue;
  private float leftLevelValue;
  private float mixLevelValue;

  private boolean kickHitted;
  private TransitionValue kickValue;
  private boolean hihatHitted;
  private TransitionValue hihatValue;
  private boolean snareHitted;
  private TransitionValue snareValue;

  SoundDataProvider(PApplet applet, float msPerFrame, String filePath) {
    perFrame = msPerFrame;
    minim = new Minim(applet);
    player = minim.loadFile(filePath, 1024);

    /*
    rightFft = new FFT(player.bufferSize(), player.sampleRate());
    leftFft = new FFT(player.bufferSize(), player.sampleRate());
    rightFft.window(FFT.HAMMING);
    leftFft.window(FFT.HAMMING);
     */

    mixBeatDetector = new BeatDetect();
    mixBeatDetector.detectMode(BeatDetect.FREQ_ENERGY);
    rightBeatDetector = new BeatDetect();
    rightBeatDetector.detectMode(BeatDetect.FREQ_ENERGY);
    leftBeatDetector = new BeatDetect();
    leftBeatDetector.detectMode(BeatDetect.FREQ_ENERGY);
  }
  boolean isPlaying() {
    return player.isPlaying();
  }
  float getProgressPercentage() {
    return player.position() / (float)player.length();
  }
  float getRightLevelValue() {
    return rightLevelValue;
  }
  float getLeftLevelValue() {
    return leftLevelValue;
  }
  float getMixLevelValue() {
    return mixLevelValue;
  }
  float getKickValue() {
    return kickValue != null ? kickValue.next() : 0;
  }
  float getHihatValue() {
    return hihatValue != null ? hihatValue.next() : 0;
  }
  float getSnareValue() {
    return snareValue != null ? snareValue.next() : 0;
  }
  void play() {
    player.play();
  }
  void pause() {
    player.pause();
  }
  void stop() {
    player.close();
    minim.stop();
  }
  void update() {
    rightLevelValue = getLevel(rightLevelValue, player.right.level());
    leftLevelValue = getLevel(leftLevelValue, player.left.level());
    mixLevelValue = getLevel(mixLevelValue, player.mix.level());

    mixBeatDetector.detect(player.mix);
    rightBeatDetector.detect(player.right);
    leftBeatDetector.detect(player.left);

    final boolean kick = rightBeatDetector.isKick() || mixBeatDetector.isKick() || leftBeatDetector.isKick();
    if (kickHitted != kick) {
      if (kick) {
        if (kickValue != null) {
          kickValue.reset();
        }
        else {
          kickValue = createValue();
        }
      }
      kickHitted = kick;
    }
    final boolean hihat = rightBeatDetector.isHat() || mixBeatDetector.isHat() || leftBeatDetector.isHat();
    if (hihatHitted != hihat) {
      if (hihat) {
        if (hihatValue != null) {
          hihatValue.reset();
        }
        else {
          hihatValue = createValue();
        }
      }
      hihatHitted = hihat;
    }
    final boolean snare = rightBeatDetector.isSnare() || mixBeatDetector.isSnare() || leftBeatDetector.isSnare();
    if (snareHitted != snare) {
      if (snare) {
        if (snareValue != null) {
          snareValue.reset();
        }
        else {
          snareValue = createValue();
        }
      }
      snareHitted = snare;
    }

    /*
    rightFft.forward(player.right);
    leftFft.forward(player.left);
     */
  }

  private TransitionValue createValue() {
    return new TransitionValue(1, 0, (int)(frameRate / 2));
  }
  private float getLevel(float prevLevel, float newLevel) {
    if (prevLevel == 0.0 || prevLevel == newLevel) {
      return newLevel;
    }
    
    final float ratio = perFrame;
    final float level = prevLevel < newLevel
      ? Math.min(prevLevel * (1 + ratio), newLevel)
      : Math.max(newLevel, prevLevel * (1 - ratio));
    return 1.0e-3f < level ? level : 0;
  }
}
