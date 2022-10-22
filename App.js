import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Audio } from 'expo-av';
import { getSongURL } from './backend';
//import { Sound } from 'expo-av/build/Audio';

//allows for song to be played in the background (doesn't work lol)
/*Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
  playThroughEarpieceAndroid: false
});*/

export default function App() {
  const [url, onChangeURL] = React.useState('');
  const song = React.useRef(new Audio.Sound());
  const [indicator, setIndicator] = React.useState('');


  //TODO: make sure youtube URL is valid
  async function playSong() {
    const status = await song.current.getStatusAsync();
    if (status.isLoaded) {
      setIndicator('Paused');
      console.log('Pausing so next song can play');
      await song.current.pauseAsync();
      song.current = new Audio.Sound();
    }

    setIndicator('Fetching...');
    console.log('Fetching song from youtube...');
    const finalURL = await getSongURL(url);
    await song.current.loadAsync(
      { uri: finalURL },
      { shouldPlay: true },
    );

    setIndicator('Playing...');
    console.log('Playing song...');
    await song.current.playAsync();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chorus</Text>
      <View style={{flex: 0.1}} />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          onChangeText={onChangeURL}
          value={url}
          placeholder="YouTube URL"
          keyboardType="default"
        />
        <Button 
        onPress={playSong}
        title="Play!"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"/>
      </View>
      <View style={{flex: 0.1}} />
      <Text style={styles.indicator}>
        {indicator}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 50,
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputRow: {
    flexDirection: 'row',
  },

  input: {
    padding: 10,
    borderWidth: 1,
  },

  indicator: {
    fontSize: 20,
    letterSpacing: 4,
  }
});
