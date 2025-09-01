import React, { useReducer, useCallback, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  // @ts-ignore
  Picker,
  ImageBackground,
  Image,
  ScrollView,
} from 'react-native'
import { reducer, initialState, TYPES } from './AppReducer'
import { useMsgAfterSubmit } from './hooks'

import HeroSvg from './components/HeroSvg'
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

  let submitInputRef = React.useRef<TextInput>(null)

  const variablesToLookFor: [number, number] = [
    previousNumOfEnemies,
    numOfEnemies,
  ]
  const { msg, isErrorMessage } = useMsgAfterSubmit(
    variablesToLookFor,
    isStoredState
  )

  const handleAnswerChange = useCallback(
    (value: string) => {
      if (/^\d+|[.]$/.test(value.toString()) || value === '') {
        dispatch({ type: TYPES.SET_ANSWER, payload: value })
      }
    },
    [dispatch]
  )

  const handleModePicker = useCallback(
    (mode: string) => {
      dispatch({
        type: TYPES.SET_MODE,
        payload: mode,
      })
    },
    [dispatch]
  )

  const handleModeType = useCallback(
    (mode: string) => {
      dispatch({
        type: TYPES.SET_MODE_TYPES,
        payload: mode,
      })
    },
    [dispatch]
  )

  const handleDifficultyPicker = useCallback(
    (difficulty: string) => {
      dispatch({
        type: TYPES.SET_DIFFICULTY,
        payload: difficulty,
      })
    },
    [dispatch]
  )

  const handleRestart = useCallback(() => {
    dispatch({ type: TYPES.RESTART })
  }, [dispatch])

  const handleSubmit = useCallback(() => {
    dispatch({ type: TYPES.CHECK_ANSWER })
    if (submitInputRef.current) submitInputRef.current.focus()
  }, [dispatch])

  const activeTheme = themes[mode]

  useEffect(() => {
    dispatch({ type: TYPES.NEW_PROBLEM })
    const storedData = localStorage.getItem('state')
    if (storedData) {
      dispatch({ type: TYPES.RESTORE_STATE, payload: JSON.parse(storedData) })
    } else {
      localStorage.setItem(
        'state',
        JSON.stringify({
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
        })
      )
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'state',
      JSON.stringify({
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
      })
    )
  }, [
    answer,
    numOfEnemies,
    won,
    val1,
    val2,
    operator,
    mode,
    difficulty,
    modeType,
    previousNumOfEnemies,
  ])

  const submitMsgText = isErrorMessage
    ? styles.msgTextError
    : styles.msgTextSuccess
  const submitMessageBlock = !!msg && (
    <View style={styles.submitMsgWrapper}>
      <Text style={submitMsgText}>{msg}</Text>
    </View>
  )

  useEffect(() => {
    submitInputRef.current && submitInputRef.current.focus()
  })

  // Split enemies into rows of 4
  const enemyRows: JSX.Element[][] = []
  for (let i = 0; i < numOfEnemies; i += 4) {
    enemyRows.push(
      [...Array(Math.min(4, numOfEnemies - i))].map((_, j) => (
        <Image
          key={i + j}
          source={require('./assets/images/orc.png')}
          style={{ width: 100, height: 200, margin: 5 }}
        />
      ))
    )
  }

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('./assets/images/bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={[styles.title, { color: activeTheme.textColor }]}>
            Battle Math
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={mode}
              onValueChange={handleModePicker}
              nativeID="operation-selector"
            >
              <Picker.Item label="Addition(+)" value="addition" />
              <Picker.Item label="Subtraction(-)" value="subtraction" />
              <Picker.Item label="Multiplication(*)" value="multiplication" />
              <Picker.Item label="Division(/)" value="division" />
            </Picker>

            <Picker
              selectedValue={difficulty}
              style={styles.picker}
              onValueChange={handleDifficultyPicker}
              nativeID="difficulty-selector"
            >
              <Picker.Item label="Easy" value="easy" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Hard" value="hard" />
            </Picker>

            <Picker
              selectedValue={modeType}
              style={styles.picker}
              onValueChange={handleModeType}
              nativeID="modeType-selector"
            >
              <Picker.Item label="Whole Number" value="wholeNumber" />
              <Picker.Item label="Decimals" value="decimal" />
            </Picker>
          </View>

          <View style={styles.battlefield}>
            <View style={styles.heroContainer}>
              <Image
                source={require('./assets/images/hero.png')}
                style={{ width: 100, height: 200 }}
              />
            </View>
            <View style={styles.enemyContainer}>
              {enemyRows.map((row, idx) => (
                <View key={idx} style={styles.enemyRow}>
                  {row}
                </View>
              ))}
            </View>
          </View>

          {won ? (
            <View>
              <Text style={{ color: activeTheme.textColor }}>Victory!</Text>
              <Button
                onPress={handleRestart}
                title="Restart"
                color={activeTheme.buttonColor}
                accessibilityLabel="Click this button to play again."
              />
            </View>
          ) : (
            <View style={styles.mathContainer}>
              {submitMessageBlock}
              <View style={styles.mathRow}>
                <Text
                  nativeID="val1"
                  style={[styles.mathText, { color: activeTheme.textColor }]}
                >
                  {val1}
                </Text>
                <Text
                  nativeID="operator"
                  style={[styles.mathText, { color: activeTheme.textColor }]}
                >
                  {operator}
                </Text>
                <Text
                  nativeID="val2"
                  style={[styles.mathText, { color: activeTheme.textColor }]}
                >
                  {val2}
                </Text>
                <Text style={[styles.mathText, { color: activeTheme.textColor }]}>
                  =
                </Text>
                <TextInput
                  nativeID="answer-input"
                  style={styles.input}
                  onChangeText={handleAnswerChange}
                  onSubmitEditing={handleSubmit}
                  value={answer}
                  ref={submitInputRef}
                />
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: activeTheme.buttonColor }]}
                testID="submit"
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          <BackgroundSound url={bgSound} />
        </ScrollView>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  image: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
    marginVertical: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  picker: {
    height: 40,
    width: 150,
    borderRadius: 8,
    textAlign: 'center',
    marginLeft: 10,
  },
  battlefield: {
    width: '100%',
    paddingHorizontal: 16,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  enemyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  enemyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mathContainer: {
    paddingVertical: 16,
  },
  mathRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  mathText: {
    fontSize: 40,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
  },
  input: {
    height: 60,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 40,
    borderRadius: 8,
  },
  button: {
    height: 60,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 40,
  },
  msgTextError: {
    color: 'red',
    fontSize: 25,
  },
  msgTextSuccess: {
    color: 'green',
    fontSize: 25,
  },
  submitMsgWrapper: {
    paddingBottom: 15,
    fontSize: 40,
  },
})

const themes = {
  addition: {
    backgroundColor: 'darkslateblue',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  subtraction: {
    backgroundColor: 'deepskyblue',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#000',
  },
  multiplication: {
    backgroundColor: 'darkslategrey',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#fff',
  },
  division: {
    backgroundColor: 'turquoise',
    buttonColor: 'rgba(255, 201, 20, 1)',
    textColor: '#000',
  },
}

export default App
