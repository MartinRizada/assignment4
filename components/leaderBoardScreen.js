/*  filename    leaderboardScreen.js
 *  Author      Martin Rizada
 *  brief       screen where you can use the score and initials 
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('scores.db');

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

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Text style={styles.headerText}>Initials</Text>
                <Text style={styles.headerText}>Score</Text>
            </View>
        );
    };
    return (
        <View style={styles.container}>
            {renderHeader()}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        width: '100%',
        backgroundColor: '#f3f3f3',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 20,
        width: '50%',
        textAlign: 'center', 
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%', 
    },
    initials: {
        fontSize: 24,
        width: '50%', 
        textAlign: 'center',
    },
    score: {
        fontSize: 24,
        width: '50%',
        textAlign: 'center', 
    },
});

export default LeaderboardScreen;
