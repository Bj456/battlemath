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

  const submitInputRef = React.useRef<TextInput>(null)
  const variablesToLookFor: [number, number] = [previousNumOfEnemies, numOfEnemies]
  const { msg, isErrorMessage } = useMsgAfterSubmit(variablesToLookFor, isStoredState)

  const handleAnswerChange = useCallback(
    (value: string) => {
      if (/^\d*\.?\d*$/.test(value)) {
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
      JSON.stringify({ answer, numOfEnemies, val1, val2, won, operator, mode, difficulty, modeType, previousNumOfEnemies })
    )
  }, [answer, numOfEnemies, val1, val2, won, operator, mode, difficulty, modeType, previousNumOfEnemies])

  useEffect(() => {
    submitInputRef.current?.focus()
  })

  const submitMsgText = isErrorMessage ? styles.msgTextError : styles.msgTextSuccess
  const submitMessageBlock = msg && (
    <View style={styles.submitMsgWrapper}>
      <Text style={submitMsgText}>{msg}</Text>
    </View>
  )

  const displayedEnemies = numOfEnemies > 8 ? 8 : numOfEnemies

  return (
    <View style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}>
      <ImageBackground
        source={require('./assets/images/bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      >
        <Text style={[styles.title, { color: activeTheme.textColor }]}>Battle Math</Text>

        <View style={styles.pickerContainer}>
          <Picker selectedValue={mode} style={styles.picker} onValueChange={handleModePicker}>
            <Picker.Item label="Addition(+)" value="addition" />
            <Picker.Item label="Subtraction(-)" value="subtraction" />
            <Picker.Item label="Multiplication(*)" value="multiplication" />
            <Picker.Item label="Division(/)" value="division" />
          </Picker>

          <Picker selectedValue={difficulty} style={styles.picker} onValueChange={handleDifficultyPicker}>
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>

          <Picker selectedValue={modeType} style={styles.picker} onValueChange={handleModeType}>
            <Picker.Item label="Whole Number" value="wholeNumber" />
            <Picker.Item label="Decimals" value="decimal" />
          </Picker>
        </View>

        <View style={styles.battlefield}>
  {/* Hero on left */}
  <View style={styles.heroContainer}>
    <Image
      source={require('./assets/images/hero.png')}
      style={styles.heroImage}
      resizeMode="contain"
    />
  </View>

  {/* Enemies on right in 2 rows x 4 per row */}
  <View style={styles.enemiesContainer}>
    {[...Array(Math.min(numOfEnemies, 8))].map((_, i) => (
      <View key={i} style={styles.enemyWrapper}>
        <Image
          source={require('./assets/images/orc.png')}
          style={styles.enemyImage}
          resizeMode="contain"
        />
      </View>
    ))}
  </View>
</View>

        {won ? (
          <View>
            <Text style={{ color: activeTheme.textColor }}>Victory!</Text>
            <Button onPress={handleRestart} title="Restart" color={activeTheme.buttonColor} />
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

            <TouchableOpacity style={[styles.button, { backgroundColor: activeTheme.buttonColor }]} onPress={handleSubmit}>
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
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 16 },
  title: { fontSize: 32, fontFamily: `"Comic Sans MS", cursive, sans-serif`, marginBottom: 16 },
  pickerContainer: { flexDirection: 'row', marginBottom: 16 },
  picker: { height: 40, width: 150, marginHorizontal: 5 },
  battlefield: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingHorizontal: 16, marginVertical: 16 },
  heroColumn: { flex: 1, alignItems: 'center' },
  heroImage: { width: 100, height: 200 },
  enemiesColumn: { flex: 2, alignItems: 'flex-end' },
  enemiesWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 360 },
  enemyImage: { width: 80, height: 120, margin: 4 },
  mathContainer: { paddingVertical: 16, alignItems: 'center' },
  mathRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 16 },
  mathText: { fontSize: 40, fontFamily: `"Comic Sans MS", cursive, sans-serif`, color: '#fff' },
  input: { height: 60, width: 200, borderColor: 'gray', borderWidth: 1, marginLeft: 8, color: '#fff', fontSize: 40, borderRadius: 8 },
  button: { height: 60, width: 200, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 40 },
  msgTextError: { color: 'red', fontSize: 25 },
  msgTextSuccess: { color: 'green', fontSize: 25 },
  submitMsgWrapper: { paddingBottom: 15, fontSize: 25 },
})

const themes = {
  addition: { backgroundColor: 'darkslateblue', buttonColor: 'yellow', textColor: '#fff' },
  subtraction: { backgroundColor: 'deepskyblue', buttonColor: 'yellow', textColor: '#000' },
  multiplication: { backgroundColor: 'darkslategrey', buttonColor: 'yellow', textColor: '#fff' },
  division: { backgroundColor: 'turquoise', buttonColor: 'yellow', textColor: '#000' },
}

export default App
