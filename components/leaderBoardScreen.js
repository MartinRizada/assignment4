/*  filename    leaderboardScreen.js
 *  Author      Martin Rizada
 *  brief       screen where you can use the score and initials 
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('game.db');

const LeaderboardScreen = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM scores ORDER BY score DESC',
                [],
                (_, { rows: { _array } }) => {
                    setScores(_array);
                },
                (_, error) => {
                    console.error("Failed to retrieve scores from the database", error);
                }
            );
        });
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={scores}
                keyExtractor={(item, index) => 'key-' + index}
                renderItem={({ item }) => {
                    return (
                        <View style={styles.item}>
                            <Text style={styles.initials}>{item.initials}</Text>
                            <Text style={styles.score}>{item.score}</Text>
                        </View>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    initials: {
        fontSize: 24,
    },
    score: {
        fontSize: 24,
    },
});

export default LeaderboardScreen;
