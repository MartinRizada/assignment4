// ImageSelectionScreen.js

import React, { useState } from 'react';
import { Button, View, Image,Pressable, ScrollView, StyleSheet, Text} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('game.db');

db.transaction(tx => {
    tx.executeSql(
        'CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT NOT NULL);'
    );
});

// Function to insert image URIs into the database
const insertImages = (images) => {
    db.transaction(
        tx => {
            images.forEach(uri => {
                tx.executeSql('INSERT INTO images (uri) VALUES (?);', [uri]);
            });
        },
        error => {
            console.error('Error saving images to database', error);
        },
        () => {
            console.log('Images saved successfully');
        }
    );
};
const ImageScreen = ({ navigation, route }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const { difficulty } = route.params;

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
               // allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                allowsMultipleSelection: true,
            });

            if (!result.cancelled && result.assets) {
                // If selecting multiple images, assets will be an array of images
                const newImageUris = result.assets.map(asset => asset.uri);
                setSelectedImages([...selectedImages, ...newImageUris]);
                insertImages(newImageUris); // Store new image URIs in the database
            }
        } catch (error) {
            console.error("An error occurred while picking the image:", error);
        }
    };



    const startGame = () => {
        navigation.navigate('Game', { difficulty, customImages: selectedImages });
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Choose Images</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={startGame} disabled={selectedImages.length === 0}>
                <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
            <View style={styles.scrollViewContainer}>
          
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        alignItems: 'center',
      
        marginTop: 100,
    },
    ScrollViewContainer: {
        border: '1',
        borderColor: 'black',
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

export default ImageScreen;
