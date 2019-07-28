import java.awt.event.KeyEvent;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.Iterator;
import java.util.List;

import ddf.minim.*;
import ddf.minim.analysis.*;
import ddf.minim.effects.*;
import ddf.minim.signals.*;
import ddf.minim.spi.*;
import ddf.minim.ugens.*;

import spout.Spout;

SoundDataProvider provider;
List<SoundInfo> sounds;
int soundIndex;
boolean repeat;
List<ShaderInfo> shaders;

color backgroundColor;
PImage backgroundImage;
boolean onlyInitialization = true;

FrameRecorder recorder;
Spout spout;

boolean isPlaying;
long startTimeMillis;
int framePerSecond;
float msPerFrame;
int startFrameCount;
int frameDropCount;

final class SoundInfo {
  final String location;

  SoundInfo(String l) {
    location = l;
  }
}

final class ShaderInfo {
  final PShader shader;

  boolean disabled;

  ShaderInfo(PShader s, boolean d) {
    shader = s;
    disabled = d;
  }
}

FrameRecorder createFrameRecorder(JSONObject setting) {
  FrameRecorderType recorderType = null;
  String recordImageType = setting.getString("recordImageType");
  if (recordImageType != null) {
    recordImageType = recordImageType.toLowerCase();
    if (recordImageType.equals("jpeg") || recordImageType.equals("jpg")) {
      recorderType = FrameRecorderType.AsyncRecorder;
    }
    else if (recordImageType.equals("tga")) {
      recorderType = FrameRecorderType.SyncTgaRecorder;
    }
    else if (recordImageType.equals("png")) {
      recorderType = FrameRecorderType.SyncPngRecorder;
    }
  }

  return recorderType != null ? createFrameRecorderInstanceOf(recorderType) : null;
}

List<SoundInfo> loadSounds(JSONArray soundDefinitions) {
  List<SoundInfo> sounds = new ArrayList<SoundInfo>();

  for (int index = 0; index < soundDefinitions.size(); ++index) {
    final JSONObject definition = soundDefinitions.getJSONObject(index);
    sounds.add(new SoundInfo(definition.getString("location")));
  }
  return sounds;
}

void setInitialOptions(final JSONArray options, final PShader shader) {
  for (int index = 0; index < options.size(); ++index) {
    final JSONObject option = options.getJSONObject(index);
    shader.set(option.getString("name"), option.getFloat("value"));
  }
}

List<ShaderInfo> loadShaders(JSONArray shaderDefinitions) {
  List<ShaderInfo> shaders = new ArrayList<ShaderInfo>();

  for (int index = 0; index < shaderDefinitions.size(); ++index) {
    final JSONObject definition = shaderDefinitions.getJSONObject(index);
    final PShader shader = loadShader(definition.getString("location"));
    shader.set("resolution", width, height);

    final JSONObject options = definition.getJSONObject("options");
    if (options != null) {
      final JSONArray initialOptions = options.getJSONArray("initial");
      if (initialOptions != null) {
        setInitialOptions(initialOptions, shader);
      }
    }

    shaders.add(new ShaderInfo(shader, definition.getBoolean("disabled", false)));
  }
  return shaders;
}

void initBackground() { 
  println("initialize background");
  background(backgroundColor);
  if (backgroundImage != null) {
    image(backgroundImage, 0, 0, width, height);
  }
}
