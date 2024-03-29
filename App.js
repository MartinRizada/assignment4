/*  filename    App.js
 *  Author      Martin Rizada
 *  brief       file that will handle the navigation of the screens
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './components/homeScreen'; 
import DifficultyScreen from './components/difficultyScreen'; 
import GameScreen from './components/gameScreen';
import LeaderboardScreen from './components/leaderBoardScreen';  
//import ImageScreen from './components/imageScreen';  

const Stack = createNativeStackNavigator();

const App = () => {
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
