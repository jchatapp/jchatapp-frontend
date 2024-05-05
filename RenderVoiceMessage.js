import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { Audio } from 'expo-av';

const RenderVoiceMessage = ({ src }) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);

  const handlePlaySound = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
       { uri: src },
       { shouldPlay: true }
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync(); 
    sound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
  };

  const updatePlaybackStatus = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  return (
    <View>
      <Button title={isPlaying ? "Pause" : "Play"} onPress={handlePlaySound} />
    </View>
  );
};

export default RenderVoiceMessage;
