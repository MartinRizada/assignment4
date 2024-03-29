/*  filename    App.js
 *  Author      Martin Rizada
 *  brief       file that will handle the navigation of the screens
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './components/homeScreen'; 
import DifficultyScreen from './components/difficultyScreen'; 
import GameScreen from './components/gameScreen';
import LeaderboardScreen from './components/leaderBoardScreen';  
import AppLoading from 'expo-app-loading';
import { Audio } from 'expo-av';
//import ImageScreen from './components/imageScreen';  

const Stack = createNativeStackNavigator();

const App = () => {
    useEffect(() => {
        // Function to load and play the sound
        async function playSound() {
            const soundObject = new Audio.Sound();
            try {
                await soundObject.loadAsync(require('./assets/sfx/preload.mp3'));
                await soundObject.playAsync();
               

                // When app is closed, unload the sound
                return function cleanup() {
                    soundObject.unloadAsync();
                };
            } catch (error) {
                // Handle or log error
                console.error(error);
            }
        }

     
        playSound();
    }, []);
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: 'gray',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        textAlign: 'center',
                        flexGrow: 1,
                    },
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Difficulty" component={DifficultyScreen} />
                <Stack.Screen name="Game" component={GameScreen} />
                <Stack.Screen name="Leaderboards" component={LeaderboardScreen} />
                
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
