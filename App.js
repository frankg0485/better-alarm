import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, Button, View } from 'react-native';
import { Audio } from 'expo-av';
import { getSongURL } from './backend/youtube';
import DateTimePicker from '@react-native-community/datetimepicker';
import { schedulePushNotification, registerForPushNotificationsAsync } from './backend/notifications';
import * as Notifications from 'expo-notifications';

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
      { shouldPlay: true },
    );

    setIndicator('Playing...');
    console.log('Playing song...');
    await song.current.playAsync();
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
