import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Audio } from 'expo-av';
import { getSongURL } from './backend';
import axios from 'axios';
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
      { shouldPlay: false },
    );

    console.log(url)

    var startTime = 0;
    await axios.post("http://128.61.119.94:5000", {
      "url": url
    })
      .then((response) => {
        console.log('this is the response from the python server on a post request of listname ', JSON.stringify(response));
        startTime = response['data']['start_time']
    })
      .catch((error) => {
        console.log('here is the error on a post request from the python server of listname ', error);
    });
    // try {
    //   const response = await fetch('http://128.61.119.94:5000', {
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       'url': url
    //     })
    //   });
    //   const json = await response.json();
    //   console.log(json.start_time);
    // } catch (error) {
    //   console.error(error);
    // }


    console.log(startTime)
    setIndicator('Playing...');
    console.log('Playing song...');
    await song.current.playFromPositionAsync(startTime * 1000);
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
