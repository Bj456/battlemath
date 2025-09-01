import React, { useReducer, useCallback, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native'
import { reducer, initialState, TYPES } from './AppReducer'
import { useMsgAfterSubmit } from './hooks'
import bgSound from './assets/music/background-music.mp3'
import BackgroundSound from './components/BackgroundSound'

function App() {
  const [
    {
      answer,
      numOfEnemies,
      val1,
      val2,
      won,
      operator,
      mode,
      difficulty,
      modeType,
      previousNumOfEnemies,
      isStoredState,
    },
    dispatch,
  ] = useReducer(reducer, initialState)

  const submitInputRef = useRef<TextInput>(null)

  const variablesToLookFor: [number, number] = [previousNumOfEnemies, numOfEnemies]
  const { msg, isErrorMessage } = useMsgAfterSubmit(variablesToLookFor, isStoredState)

  const handleAnswerChange = useCallback(
    (value: string) => {
      if (/^\d*\.?\d*$/.test(value) || value === '') {
        dispatch({ type: TYPES.SET_ANSWER, payload: value })
      }
    },
    [dispatch]
  )

  const handleRestart = useCallback(() => {
    dispatch({ type: TYPES.RESTART })
  }, [dispatch])

  const handleSubmit = useCallback(() => {
    dispatch({ type: TYPES.CHECK_ANSWER })
    submitInputRef.current?.focus()
  }, [dispatch])

  // Focus input on mount
  useEffect(() => {
    dispatch({ type: TYPES.NEW_PROBLEM })
    submitInputRef.current?.focus()
  }, [])

  const submitMsgText = isErrorMessage ? styles.msgTextError : styles.msgTextSuccess
  const submitMessageBlock = !!msg && (
    <View style={styles.submitMsgWrapper}>
      <Text style={submitMsgText}>{msg}</Text>
    </View>
  )

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('./assets/images/bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      >
        <Text style={styles.title}>Battle Math</Text>

        {/* Battlefield */}
        <View style={styles.battlefield}>
          {/* Hero */}
          <View style={styles.heroContainer}>
            <Image source={require('./assets/images/hero.png')} style={styles.heroImage} />
          </View>

          {/* Enemies */}
          <View style={styles.enemiesContainer}>
            {[...Array(numOfEnemies)].map((_, i) => (
              <Image key={i} source={require('./assets/images/orc.png')} style={styles.enemyImage} />
            ))}
          </View>
        </View>

        {/* Math Input */}
        {won ? (
          <View style={styles.mathContainer}>
            <Text style={styles.victoryText}>Victory!</Text>
            <TouchableOpacity style={styles.button} onPress={handleRestart}>
              <Text style={styles.buttonText}>Restart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mathContainer}>
            {submitMessageBlock}
            <View style={styles.mathRow}>
              <Text style={styles.mathText}>{val1}</Text>
              <Text style={styles.mathText}>{operator}</Text>
              <Text style={styles.mathText}>{val2}</Text>
              <Text style={styles.mathText}>=</Text>
              <TextInput
                style={styles.input}
                value={answer}
                onChangeText={handleAnswerChange}
                onSubmitEditing={handleSubmit}
                ref={submitInputRef}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Background music */}
        <BackgroundSound url={bgSound} />
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  image: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 20,
  },
  battlefield: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  heroImage: {
    width: 100,
    height: 200,
    resizeMode: 'contain',
  },
  enemiesContainer: {
    flex: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  enemyImage: {
    width: 80,
    height: 160,
    margin: 5,
    resizeMode: 'contain',
  },
  mathContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  mathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mathText: {
    fontSize: 40,
    color: '#fff',
    marginHorizontal: 5,
  },
  input: {
    width: 120,
    height: 60,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    color: '#fff',
    fontSize: 40,
    paddingHorizontal: 5,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#841584',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 28,
    color: '#fff',
  },
  submitMsgWrapper: {
    marginBottom: 10,
  },
  msgTextError: {
    color: 'red',
    fontSize: 25,
  },
  msgTextSuccess: {
    color: 'green',
    fontSize: 25,
  },
  victoryText: {
    fontSize: 40,
    color: '#fff',
    marginBottom: 10,
  },
})

export default App
