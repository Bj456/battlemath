import React, { useReducer, useCallback, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Picker,
  ImageBackground,
  Image,
} from 'react-native'
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
      dispatch({ type: TYPES.SET_MODE, payload: mode })
    },
    [dispatch]
  )

  const handleModeType = useCallback(
    (mode: string) => {
      dispatch({ type: TYPES.SET_MODE_TYPES, payload: mode })
    },
    [dispatch]
  )

  const handleDifficultyPicker = useCallback(
    (difficulty: string) => {
      dispatch({ type: TYPES.SET_DIFFICULTY, payload: difficulty })
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

  return (
    <View style={[styles.root, { backgroundColor: activeTheme.backgroundColor }]}>
      <ImageBackground
        source={require('./assets/images/bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      >
        <Text style={[styles.title, { color: activeTheme.textColor }]}>
          Battle Math
        </Text>

        {/* Picker section */}
        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={mode}
            onValueChange={handleModePicker}
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
          >
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>

          <Picker
            selectedValue={modeType}
            style={styles.picker}
            onValueChange={handleModeType}
          >
            <Picker.Item label="Whole Number" value="wholeNumber" />
            <Picker.Item label="Decimals" value="decimal" />
          </Picker>
        </View>

        {/* Battlefield */}
        <View style={styles.battlefield}>
          <View style={styles.heroContainer}>
            <Image
              source={require('./assets/images/hero.png')}
              style={{ width: 100, height: 200 }}
            />
          </View>
          <View style={styles.enemyContainer}>
            {[...Array(Math.min(numOfEnemies, 8))].map((_, i) => (
              <Image
                key={i}
                source={require('./assets/images/orc.png')}
                style={styles.enemyImage}
              />
            ))}
          </View>
        </View>

        {/* Math section */}
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
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>
                {val1}
              </Text>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>
                {operator}
              </Text>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>
                {val2}
              </Text>
              <Text style={[styles.mathText, { color: activeTheme.textColor }]}>
                =
              </Text>
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
  root: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  image: { width: '100%', flex: 1, paddingVertical: 16, alignItems: 'center' },
  title: { fontSize: 32, fontFamily: `"Comic Sans MS", cursive, sans-serif` },
  pickerContainer: { flexDirection: 'row', marginBottom: 10 },
  picker: { height: 40, width: 150, marginHorizontal: 5 },
  battlefield: { flexDirection: 'row', width: '100%', marginVertical: 20 },
  heroContainer: { width: 120, alignItems: 'center' },
  enemyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 420, // 4 enemies per row
    justifyContent: 'center',
  },
  enemyImage: { width: 100, height: 200, margin: 5 },
  mathContainer: { paddingVertical: 16 },
  mathRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 16 },
  mathText: { fontSize: 40, fontFamily: `"Comic Sans MS", cursive, sans-serif` },
  input: {
    height: 60,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 40,
    borderRadius: 8,
    fontFamily: `"Comic Sans MS", cursive, sans-serif`,
  },
  button: { height: 60, width: 200, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 40 },
  msgTextError: { color: 'red', fontSize: 25 },
  msgTextSuccess: { color: 'green', fontSize: 25 },
  submitMsgWrapper: { paddingBottom: 15, fontSize: 40 },
})

const themes = {
  addition: { backgroundColor: 'darkslateblue', heroColor: 'rgba(23, 190, 187, 1)', enemyColor: 'rgba(228, 87, 46, 1)', buttonColor: 'rgba(255, 201, 20, 1)', textColor: '#fff' },
  subtraction: { backgroundColor: 'deepskyblue', heroColor: 'rgba(23, 190, 187, 1)', enemyColor: 'rgba(228, 87, 46, 1)', buttonColor: 'rgba(255, 201, 20, 1)', textColor: '#000' },
  multiplication: { backgroundColor: 'darkslategrey', heroColor: 'rgba(23, 190, 187, 1)', enemyColor: 'rgba(228, 87, 46, 1)', buttonColor: 'rgba(255, 201, 20, 1)', textColor: '#fff' },
  division: { backgroundColor: 'turquoise', heroColor: 'rgba(23, 190, 187, 1)', enemyColor: 'rgba(228, 87, 46, 1)', buttonColor: 'rgba(255, 201, 20, 1)', textColor: '#000' },
}

export default App
