/*  filename    leaderboardScreen.js
 *  Author      Martin Rizada
 *  brief       screen where user will choose the level of difficulty
 */
import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';

const DifficultyScreen = ({ navigation }) => {

    return (
        <View style={styles.container}>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Game', { difficulty: 'Easy' })} >
                <Text style={styles.buttonText}>Easy</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Game', { difficulty: 'Medium' })}>
                <Text style={styles.buttonText}>Medium</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Game', { difficulty: 'Hard' })} >
                <Text style={styles.buttonText}>Hard</Text>
            </Pressable>
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
        marginTop: 200,
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
        marginTop: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default DifficultyScreen;
