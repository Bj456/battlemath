import React, { useReducer, useCallback, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { reducer, initialState, TYPES } from './AppReducer'
import { useMsgAfterSubmit } from './hooks'

import BackgroundSound from './components/BackgroundSound'
import bgSound from './assets/music/background-music.mp3'

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

  const submitInputRef = React.useRef<TextInput>(null)

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
    (mode: string) => dispatch({ type: TYPES.SET_MODE, payload: mode }),
    [dispatch]
  )
  const handleModeType = useCallback(
    (mode: string) => dispatch({ type: TYPES.SET_MODE_TYPES, payload: mode }),
    [dispatch]
  )
  const handleDifficultyPicker = useCallback(
    (difficulty: string) => dispatch({ type: TYPES.SET_DIFFICULTY, payload: difficulty }),
    [dispatch]
  )
  const handleRestart = useCallback(() => dispatch({ type: TYPES.RESTART }), [dispatch])
  const handleSubmit = useCallback(() => {
    dispatch({ type: TYPES.CHECK_ANSWER })
    submitInputRef.current?.focus()
  }, [dispatch])

  const activeTheme = themes[mode]

  useEffect(() => {
    dispatch({ type: TYPES.NEW_PROBLEM })
    const storedData = localStorage.getItem('state')
    if (storedData) {
      dispatch({ type: TYPES.RESTORE_STATE, payload: JSON.parse(storedData) })
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
  }, [answer, numOfEnemies, won, val1, val2, operator, mode, difficulty, modeType, previousNumOfEnemies])

  const submitMsgText = isErrorMessage ? styles.msgTextError : styles.msgTextSuccess
  const submitMessageBlock = !!msg && (
    <View style={styles.submitMsgWrapper}>
      <Text style={submitMsgText}>{msg}</Text>
    </View>
  )

  useEffect(() => {
    submitInputRef.current?.focus()
  })

  // Enemy rows logic: max 4 per row, 2 rows max
  const renderEnemies = () => {
    const enemies: JSX.Element[] = []
    for (let i = 0; i < numOfEnemies && i < 8; i++) {
      enemies.push(
        <Image
          key={i}
          source={require('./assets/images/orc.png')}
          style={styles.enemyImage}
        />
      )
    }

    const firstRow = enemies.slice(0, 4)
    const secondRow = enemies.slice(4, 8)

    return (
      <View style={styles.enemyContainer}>
        <View style={styles.enemyRow}>{firstRow}</View>
        {secondRow.length > 0 && <View style={styles.enemyRow}>{secondRow}</View>}
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}>
      <ImageBackground
        source={require('./assets/images/bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      >
        <Text style={[styles.title, { color: activeTheme.textColor }]}>Battle Math</Text>

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
          <Image
            source={require('./assets/images/hero.png')}
            style={styles.heroImage}
          />
          {renderEnemies()}
        </View>

        {won ? (
          <View>
            <Text style={{ color: activeTheme.textColor }}>Victory!</Text>
            <Button
              onPress={handleRestart}
              title="Restart"
              color={activeTheme.buttonColor}
            />
          </View>
        ) : (
          <View style={styles.mathContainer}>
            {submitMessageBlock}
            <View style={styles.mathRow}>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>{val1}</Text>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>{operator}</Text>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>{val2}</Text>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}> = </Text>
              <TextInput
                style={styles.input}
                onChangeText={handleAnswerChange}
                onSubmitEditing={handleSubmit}
                value={answer}
                ref={submitInputRef}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: activeTheme.buttonColor }]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}

        <BackgroundSound url={bgSound} />
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  image: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  picker: {
    height: 40,
    width: 150,
    marginLeft: 10,
  },
  battlefield: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  heroImage: {
    width: 100,
    height: 200,
    marginBottom: 10,
  },
  enemyContainer: {
    width: '100%',
    alignItems: 'center',
  },
  enemyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  enemyImage: {
    width: 100,
    height: 200,
    marginHorizontal: 5,
  },
  mathContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  mathRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  mathText: {
    fontSize: 40,
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
    textAlign: 'center',
  },
  button: {
    height: 60,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
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
  },
})

const themes = {
  addition: { backgroundColor: 'darkslateblue', buttonColor: '#FFC914', textColor: '#fff' },
  subtraction: { backgroundColor: 'deepskyblue', buttonColor: '#FFC914', textColor: '#000' },
  multiplication: { backgroundColor: 'darkslategrey', buttonColor: '#FFC914', textColor: '#fff' },
  division: { backgroundColor: 'turquoise', buttonColor: '#FFC914', textColor: '#000' },
}

export default App
