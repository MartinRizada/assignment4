/*  filename    App.js
 *  Author      Martin Rizada
 * 
 */

import React, { useState, useEffect } from 'react';
import { Alert,Button,Image, View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FlipCard from 'react-native-flip-card';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const numColumns = 3;
const cardMargin = 10;
const windowWidth = Dimensions.get('window').width;
const cardSize = (windowWidth / numColumns) - (cardMargin * 2);

// Shuffle the cards for a new game
function shuffleCards(cards) {
    const shuffledCards = cards.slice().sort(() => 0.5 - Math.random());
    return shuffledCards;
}

const cardPairs = [
    { id: 'card1', content: 'Card A', image:null },
    { id: 'card2', content: 'Card A', image: null },
    { id: 'card3', content: 'Card B', image: null },
    { id: 'card4', content: 'Card B', image: null },
    { id: 'card5', content: 'Card C', image: null },
    { id: 'card6', content: 'Card C', image: null },
];

const App = () => {
    const [cards, setCards] = useState(shuffleCards(cardPairs).map(card => ({
        ...card,
        isFlipped: false,
        isMatched: false,
    })));
    const [firstCard, setFirstCard] = useState(null);
    const [boardLocked, setBoardLocked] = useState(false);
    const [matchSound, setMatchSound] = useState(new Audio.Sound());
    const [mismatchSound, setMismatchSound] = useState(new Audio.Sound());
    const [allMatchedSound, setAllMatchedSound] = useState(new Audio.Sound());


    useEffect(() => {
        loadSounds();
        return () => {
            // Unload sounds when the component unmounts
            matchSound.unloadAsync();
            mismatchSound.unloadAsync();
            allMatchedSound.unloadAsync();
        };
    }, []);

    const loadSounds = async () => {
        try {
            await matchSound.loadAsync(require('./assets/sfx/match.mp3'));
            await mismatchSound.loadAsync(require('./assets/mismatch.mp3'));
            await allMatchedSound.loadAsync(require('./assets/win.mp3'));
            // Set more properties as needed
        } catch (error) {
            console.log(error);
        }
    };

    const playSound = async (sound) => {
        try {
            await sound.replayAsync(); // Or use sound.playAsync() if it is not already loaded
        } catch (error) {
            console.error('Error playing sound', error);
        }
    };

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need media library permissions to make this work!');
            }
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.cancelled && result.assets) {
            const imageUri = result.assets[0].uri;
            assignImageToCardPair(imageUri);
        }
    };

    // Function to assign an image to a random card pair without an image
    const assignImageToCardPair = (uri) => {
        // Filter out card pairs that already have an image.
        const availableCardPairs = cards.reduce((acc, card) => {
            const contentExists = acc.some(c => c.content === card.content);
            const imageNotAssigned = !cards.find(c => c.content === card.content && c.image);

            if (imageNotAssigned && !contentExists) {
                acc.push(card);
            }
            return acc;
        }, []);

        // Log the available card pairs for debugging.
        console.log('Available card pairs:', availableCardPairs);

        if (availableCardPairs.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCardPairs.length);
            const selectedPairContent = availableCardPairs[randomIndex].content;

            const updatedCards = cards.map(card => {
                if (card.content === selectedPairContent) {
                    return { ...card, image: uri };
                }
                return card;
            });

            setCards(updatedCards);
        } else {
            // The alert should be here, outside of the condition where we assign the image.
            console.log('No available card pairs. Showing alert.'); // This should appear in the console if no pairs are available.
            Alert.alert("All card pairs have images", "Every card pair already has an image assigned to it.");
        }
    };



    const onCardPress = async (selectedCard) => {
        // Play haptic feedback for card flip
        Haptics.selectionAsync();

        const newCards = cards.map(card =>
            card.id === selectedCard.id ? { ...card, isFlipped: true } : card
        );
        setCards(newCards);

        if (firstCard === null) {
            setFirstCard(selectedCard);
        } else {
            if (selectedCard.content === firstCard.content && selectedCard.id !== firstCard.id) {
                // Play match sound
                await playSound(matchSound);

                // Cards match
                setCards(newCards.map(card =>
                    (card.content === selectedCard.content) ? { ...card, isMatched: true } : card
                ));
                setFirstCard(null);

                // Check if all cards are matched
                const allMatched = newCards.every((card) => card.content === selectedCard.content ? card.isMatched : true);
                if (allMatched) {
                    // Play all matched sound
                    await playSound(allMatchedSound);
                }
            } else {
                // Play mismatch sound
                await playSound(mismatchSound);

                // Cards do not match
                setBoardLocked(true);
                setTimeout(() => {
                    setCards(newCards.map(card =>
                        !card.isMatched ? { ...card, isFlipped: false } : card
                    ));
                    setBoardLocked(false);
                    setFirstCard(null);
                }, 1000);
            }
        }
    };

        

    return (
        <View style={styles.container}>
            
            {cards.map((card) => (
                <View style={styles.cardContainer} key={card.id}>
                    <FlipCard
                        flipHorizontal={true}
                        flipVertical={false}
                        friction={6}
                        perspective={1000}
                        clickable={false}
                        flip={card.isFlipped || card.isMatched}
                        style={styles.flipCard}
                    >
                        {/* Front Side (Text Side) */}
                        <TouchableOpacity
                            style={[styles.card, styles.faceSide]}
                            onPress={() => onCardPress(card)}
                            activeOpacity={1}
                        >
                            <Text style={styles.cardText}>?</Text>
                        </TouchableOpacity>

                        {/* Back Side (Image Side) */}
                        <View style={[styles.card, styles.backSide]}>
                            {card.image ? (
                                <Image source={{ uri: card.image }} style={styles.image} />
                            ) : (
                                <Text style={styles.cardText}>{card.content}</Text>
                            )}
                        </View>
                    </FlipCard>
                </View>
            ))}
            <Button title="Pick an image for 'Card A'" onPress={pickImage} />
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
        backgroundColor: '#333',
    },
    cardContainer: {
        width: cardSize,
        height: cardSize,
        margin: cardMargin,
    },
    flipCard: {
        width: '100%',
        height: '100%',
    },
    card: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },    faceSide: {
        backgroundColor: '#f00',
    },
    backSide: {
        backgroundColor: '#0f0',
    },
    cardText: {
        fontSize: 20,
        color: '#fff',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Changed to 'contain' for visibility
    },
});

export default App;
