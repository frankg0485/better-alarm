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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [url, onChangeURL] = React.useState('');
  const song = React.useRef(new Audio.Sound());
  const [indicator, setIndicator] = React.useState('');
  const [dateTime, setDateTime] =  React.useState(new Date());

  const [expoPushToken, setExpoPushToken] = React.useState('');
  const [notification, setNotification] = React.useState(false);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  React.useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

  async function scheduleNotification() {
    console.log(dateTime.getMinutes());
    console.log(new Date().getMinutes());
    const delay = dateTime.getTime() - new Date().getTime();
    console.log(delay / 1000);
    if (delay > 1000) {
      await schedulePushNotification(delay);
    } else {
      console.log("Invalid date");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chorus</Text>
      <DateTimePicker style={styles.dateTimePicker} onChange={(event, date) => setDateTime(date)} mode="datetime" value={dateTime}/>
      <View style={{flex: 0.1}} />
      <View
      style={{
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to schedule a notification"
        onPress={scheduleNotification}
      />
      </View>
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
      <View style={{flex: 0.05}} />
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
  },

  dateTimePicker: {
    flexBasis: 'auto',
    width: '50%',
  }
});
