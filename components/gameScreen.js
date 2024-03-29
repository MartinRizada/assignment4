import React, { useState, useEffect } from 'react';
import { Alert, Button, Image, View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Dimensions, Pressable} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FlipCard from 'react-native-flip-card';
import * as SQLite from 'expo-sqlite';
import * as Haptics from 'expo-haptics';


const db = SQLite.openDatabase('game.db');

// Set up the table
db.transaction(tx => {
    tx.executeSql(
        'CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT, initials TEXT NOT NULL, score INT NOT NULL);'
    );
});
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
    { id: 'card1', content: 'Card A', image: null },
    { id: 'card2', content: 'Card A', image: null },
    { id: 'card3', content: 'Card B', image: null },
    { id: 'card4', content: 'Card B', image: null },
    { id: 'card5', content: 'Card C', image: null },
    { id: 'card6', content: 'Card C', image: null },
];

const GameScreen = ({route}) => {
    const [cards, setCards] = useState(shuffleCards(cardPairs).map(card => ({
        ...card,
        isFlipped: false,
        isMatched: false,
    })));
    const [firstCard, setFirstCard] = useState(null);
    const [boardLocked, setBoardLocked] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // For a 1-minute countdown
    const [isGameActive, setIsGameActive] = useState(false);
    const [timerId, setTimerId] = useState(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [userInitials, setUserInitials] = useState('');
    const { difficulty } = route.params;

    const [numColumns, setNumColumns] = useState(3);
    const [cardWidth, setCardWidth] = useState((windowWidth / 3) - (cardMargin * 2));


    const initializeGame = (difficultyLevel) => {
        let numPairs;
        let columns;
        switch (difficultyLevel) {
            case 'Easy':
                numPairs = 3; // 3 pairs, 6 cards in total
                columns = 3;
                break;
            case 'Medium':
                numPairs = 6; // 5 pairs, 10 cards in total
                columns = 3;
                break;
            case 'Hard':
                numPairs = 7; // 8 pairs, 16 cards in total
                columns = 4;
                break;
            default:
                numPairs = 3;
                columns = 3;
        }
        setNumColumns(columns);

        // Calculate the card size based on the number of columns
        const cardWidth = (windowWidth - (columns + 1) * cardMargin) / columns;
        setCardWidth(cardWidth);

        const newCards = [];
        for (let i = 0; i < numPairs; i++) {
            // Each pair consists of two identical cards
            const cardContent = 'Card ' + (i + 1);
            newCards.push({ id: `a${i}`, content: cardContent, isFlipped: false, isMatched: false });
            newCards.push({ id: `b${i}`, content: cardContent, isFlipped: false, isMatched: false });
        }

        setCards(shuffleCards(newCards)); // Shuffle the cards and update state
    };


    useEffect(() => {
        initializeGame(difficulty);
    }, [difficulty]);



    // Clean up the timer when it's no longer needed
    useEffect(() => {
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [timerId]);


    useEffect(() => {
        // If the component unmounts or game ends, clear the timer
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [timerId]);

    const resetGame = () => {
        setTimeLeft(60);
        setScore(0);
        setFirstCard(null);
        setBoardLocked(false);
        setCards(shuffleCards(cardPairs));
        setShowScoreModal(false); // Hide the score modal
        setUserInitials(''); // Clear the user initials
    };


    const startNewGame = () => {
        // Reset game states
        setCards(shuffleCards(cardPairs).map(card => ({
            ...card,
            isFlipped: false,
            isMatched: false,
            image: null // Reset the images if you're also shuffling them each game
        })));
        setFirstCard(null);
        setBoardLocked(false);
        setScore(0); // Assuming you have a score state
        setTimeLeft(60); // Reset the timer
        startTimer(); // Start the new game timer
    };




    const saveUserScore = (initials) => {


        db.transaction(
            tx => {
                tx.executeSql('INSERT INTO scores (initials, score) VALUES (?, ?)', [initials.toUpperCase(), score]);
            },
            error => {
                console.error('Error saving score to database', error);
                Alert.alert('Error', 'Could not save the score.');
            },
            () => {
                console.log('Score saved successfully');
                Alert.alert('Success', 'Score saved!');
                resetGame();
            }
        );
        setShowScoreModal(false); // Hide the score modal
        setUserInitials(''); // Clear the user initials
    };

    // Update onSubmitInitials function
    const onSubmitInitials = () => {
        if (userInitials.trim().length > 0) {
            saveUserScore(userInitials);
            setShowScoreModal(false); // Hide the modal only after saving score
        } else {
            // If initials are not entered, keep the modal open
            Alert.alert('Error', 'Please enter your initials.');
        }
    };

    const onCancelInitials = () => {
        setModalVisible(false);
        resetGame(); // Reset the game if the user cancels
    };


    // Call this function when you want to start a new game, such as in a 'New Game' button onPress


    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need media library permissions to make this work!');
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
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
        } catch (error) {
            console.error("Error picking an image: ", error);
            Alert.alert('Error', 'An error occurred while picking the image.');
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




    const onCardPress = (selectedCard) => {
        if (boardLocked || selectedCard.isFlipped) {
            return; // Prevent any action if the board is locked or the card is already flipped
        }

        // Start the timer on the first card flip
        if (!isGameActive) {
            startTimer();
            setIsGameActive(true);
        }

        const newCards = cards.map(card =>
            card.id === selectedCard.id ? { ...card, isFlipped: true } : card
        );
        setCards(newCards);

        if (!firstCard) {
            setFirstCard(selectedCard);
        } else {
            if (selectedCard.content === firstCard.content && selectedCard.id !== firstCard.id) {
                // Cards match, increase score
                const updatedCards = newCards.map(card =>
                    card.content === selectedCard.content ? { ...card, isMatched: true } : card
                );
                
                setScore(prevScore => prevScore + 10);
                setCards(updatedCards);
                setFirstCard(null);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                )
                // Check if all cards are matched
                if (updatedCards.every(card => card.isMatched)) {
                    handleGameEnd(); // End the game if all cards are matched
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                }
            } else {
                // Cards don't match, decrease score
                setScore(prevScore => prevScore - 2);
                setBoardLocked(true);
                setTimeout(() => {
                    const revertedCards = newCards.map(card =>
                        !card.isMatched ? { ...card, isFlipped: false } : card
                    );
                    Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Error
                    )
                    setCards(revertedCards);
                    setBoardLocked(false);
                    setFirstCard(null);
                }, 1000);
            }
        }
    };


    const startTimer = () => {
        const id = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime === 1) {
                    clearInterval(id);
                    setIsGameActive(false);
                    handleGameEnd();  // End the game when time runs out
                }
                return prevTime - 1;
            });
        }, 1000);
        setTimerId(id);
    };

    const handleGameEnd = () => {
        clearInterval(timerId);
        setTimerId(null);
        setIsGameActive(false);
        setShowScoreModal(true); // Open the score modal
    };


    // Rest of your component

    return (
        <View style={styles.container}>
         
            <Text style={styles.timerText}>Time Left: {timeLeft}s</Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
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
            <Pressable onPress={pickImage}>
                <Text style={styles.imageText}>Choose Images</Text>
            </Pressable>
            {/* Score Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showScoreModal} // This state variable controls the visibility
                onRequestClose={() => setShowScoreModal(false)}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.modalText}
                            placeholder="Enter your initials"
                            onChangeText={(text) => setUserInitials(text)}
                            defaultValue={userInitials}
                        />
                        <Button
                            title="Save Score"
                            onPress={onSubmitInitials}
                        />
                        <Button
                            title="Cancel"
                            color="#FF6347"
                            onPress={() => {
                                setShowScoreModal(!showScoreModal);
                                resetGame(); // Reset the game if user cancels
                            }}
                        />
                    </View>
                </View>
            </Modal>
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
        paddingTop: 20,
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
    }, faceSide: {
        backgroundColor: '#f00',
    },
    backSide: {
        backgroundColor: 'gray',
    },
    cardText: {
        fontSize: 20,
        color: '#fff',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    timerText: {
        fontSize: 24,
        color: 'white',
        padding: 16,
        textAlign: 'center',
    },
    mainText: {
        marginTop: 5,
        fontSize: 24,
        color: 'white',
        padding: 16,
        textAlign: 'center',
    },
    scoreText: {
        fontSize: 24,
        color: 'white',
        padding: 16,
        textAlign: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        width: '50%',
        height: '20%',
        margin: 20,
        backgroundColor: '#lightgray',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    imageText: {
        marginTop: 10,
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default GameScreen;