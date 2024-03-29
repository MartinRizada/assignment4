/*  filename    homeScreen.js
 *  Author      Martin Rizada
 *  brief       screen where user will see when the start of the app
 */
import React from 'react';
import { View, Button, Pressable, StyleSheet, Text } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Difficulty')}>
                <Text style={styles.buttonText}>Play</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Leaderboards')}>
                <Text style={styles.buttonText}>Leaderboards</Text>
            </Pressable>
            {/* Add buttons for Leaderboard and Adding Images */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
       // backgroundColor: '#F5FCFF',
        marginTop:200,
    },
    button: {
        backgroundColor: 'gray',
        borderRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop:30,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default HomeScreen;
