/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { withAuthenticator } from '@aws-amplify/ui-react'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {
  const [fileState, setFileState] = useState({fileUrl:'', file:'', fileName:''})
  const [fileOnS3, setfileOnS3State] = useState('')
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [data, setData] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  function setFileInput( value) {
    setfileOnS3State(value)
  }


  function handleChange(e){
    const file = e.target.files[0];
    setFileState({
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
      file
    })
  }

    function saveFile(){
      Storage.put(fileState.fileName, fileState.file,{contentType: 'application/json'})
              .then(() =>{ 
                console.log("Successfully uploaded file")
                setFileState({fileUrl:'', fileName:'', file:''})
              })
              .catch((err)=> {
                console.log("error uploading file" + err)
              })
    }

    function getFile(){
      Storage.get(fileOnS3, {download:true})
              .then((data) =>{ 
                setData(JSON.stringify(data,0,2))
                console.log(JSON.stringify(data,2))
              })
              .catch((err)=> {
                console.log("error uploading file" + err)
              })
    }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Amplify Upload JSON Files</h2>
      {/* <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name} 
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>Create Todo</button>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>
          </div>
        ))
      } */}
     <div>
     <input
        type="file"
        onChange={handleChange}
        style={styles.input}
      />
      <button onClick={saveFile}>Save File</button>
     </div>
     <div style = {styles.textArea} >
      
     <input
       type="text"
       placeholder = "Enter file name"
       onChange={event => setFileInput(event.target.value)}
       />
     <button onClick={getFile}>get File</button>
     <br />
     <textarea
      marginTop= "20px"
      width="300px"
      height="700px"
      value={data}
     >
     
     </textarea>
     </div>
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  textArea: { margin: '20px auto'},
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App)