import React, { useEffect, useState } from 'react'
import 'codemirror/lib/codemirror.css'
// import 'codemirror/lib/codemirror'
import 'codemirror/theme/material-ocean.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/keymap/sublime'
import CodeMirror from 'codemirror'
import io from 'socket.io-client'
import { Text, Code } from '@chakra-ui/react'
import { useStore } from './store'

const RealTimeEditor = () => {
  const [users, setUsers] = useState([])
  const { username, roomId } = useStore(({ username, roomId }) => ({
    username,
    roomId,
  }))

  useEffect(() => {
    const socket = io('http://10.101.99.227:3001/', {
      transports: ['websocket'],
    })

    let initialValue = '';

    socket.emit('USER_CONNECTED', { roomId, username })

    socket.on('CODE_CHANGED', (code) => {
      initialValue = code;
    })

    const editor = CodeMirror.fromTextArea(document.getElementById('ds'), {
      lineNumbers: true,
      keyMap: 'sublime',
      theme: 'material-ocean',
      mode: 'javascript',
      value: initialValue,
    })

    const widget = document.createElement('span')
    widget.textContent = 'hmmm?'
    widget.style.cssText =
      'background: #F37381; padding: 0px 3px; color: #F3F5F1; cursor: pointer;'

    // const bookMark = editor.setBookmark({ line: 1, pos: 1 }, { widget })
    // widget.onclick = () => bookMark.clear()
    // console.log(editor.getAllMarks())

    socket.on('CODE_CHANGED', (code) => {
      console.log(code)
      const cursor = editor.getCursor()

      editor.setValue(code)
      editor.setCursor(cursor)
    })

    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`)
    })

    socket.on('connect', () => {
      socket.emit('CONNECTED_TO_ROOM', { roomId, username })
    })

    socket.on('disconnect', () => {
      socket.emit('DISSCONNECT_FROM_ROOM', { roomId, username })
    })

    socket.on('ROOM:CONNECTION', (users) => {
      setUsers(users)
      console.log(users)
    })

    editor.on('change', (instance, changes) => {
      const { origin } = changes
      // if (origin === '+input' || origin === '+delete' || origin === 'cut') {
      if (origin !== 'setValue') {
        socket.emit('CODE_CHANGED', instance.getValue())
      }
    })
    editor.on('cursorActivity', (instance) => {
      // console.log(instance.cursorCoords())
    })

    return () => {
      socket.emit('DISSCONNECT_FROM_ROOM', { roomId, username })
    }
  }, [])

  return (
    <>
      <Text fontSize="2xl">Your username is: {username}</Text>
      <Text fontSize="2xl">The room ID is: {roomId}</Text>
      <Text fontSize="2xl">
        How many pople are connected: <b> {users.length}</b>
      </Text>

      <textarea id="ds" />
    </>
  )
}

export default RealTimeEditor
