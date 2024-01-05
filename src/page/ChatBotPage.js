import React from 'react'
import ChatBot from 'react-simple-chatbot'
import { ThemeProvider } from 'styled-components'
import { useState, useEffect, useRef } from 'react'
import * as FetchAPI from '../util/fetchApi'
import { CloseOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons'

export default function ChatBotPage() {
  // all available config props
  const [isShow, setIsShow] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [text, setText] = useState('')
  const [listConversation, setListConversation] = useState([]);
  const refFocus = useRef(null);

  // {
  //   role: "assistant",
  //     content: ""
  // }

  const handleSetQuestion = async (tt) => {
    if (!text) return

    setListConversation((prev) => [
      ...prev,
      {
        role: 'user',
        content: tt ? tt : text
      }
    ]);

    setText('');
    setIsTyping(true);

    const res = await FetchAPI.postDataAPI('/payment/question', {
      question: [
        {
          role: 'user',
          content: text
        }
      ]
    })

    if (res) {
      setIsTyping(false);
      setListConversation((prev) => [
        ...prev,
        ...res.map((item) => ({
          role: 'assistant',
          content: item?.message?.content || ''
        }))
      ]);
      refFocus.current.focus();
    }
  }

  useEffect(() => {
    if (refFocus.current) {
      refFocus.current.scrollTop = refFocus.current.scrollHeight;
    }
  }, [listConversation]);

  const handleChangeText = (e) => {
  
      setText(e.target.value)
  }

  const handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      handleSetQuestion(event.target.value);
      if (refFocus.current) {
        refFocus.current.scrollTop = refFocus.current.scrollHeight;
      }
    }
  }

  return (
    <>
      <div className='modal-chat' onClick={() => setIsShow(true)}>
        <MessageOutlined className='icon-message' />
      </div>
      {isShow && (
        <div className='chatbot'>
          <CloseOutlined className='icon-close' onClick={() => setIsShow(false)} />
          <div className='header'>CHAT AI</div>

          <div className='form-text' ref={refFocus} id='style-4'>
            <div class='force-overflow'></div>
            {listConversation &&
              listConversation.length > 0 &&
              listConversation.map((item, index) => (
                <div key={index}>
                  {
                    item.role === "user" && (
                      <div className='user-text'>
                    <div className='logo'>
                      <img
                        src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                        alt=''
                      />
                    </div>
                        <div className='text'>{item.content}</div>
                  </div>
                    )
                  }
                  {
                    item.role === "assistant" && (
                      <div className='gpt-text'>
                    <div className='logo'>
                      <img
                        src='https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
                        alt=''
                      />
                    </div>
                    <div className='text'>{item.content}</div>
                  </div>
                    )
                  }
                  
                </div>
              ))}
                  {
                    isTyping && (
                      <div className='gpt-text'>
                        <div className='logo'>
                          <img
                            src='https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
                            alt=''
                          />
                        </div>
                        <div className='text'>
                        <div class="loader">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        </div>
                    </div>
                    )
                  }
          </div>
          <div className='input-quest'>
            {text && text.length > 0 && (
              <div className='icon-send' onClick={handleSetQuestion}>
                <SendOutlined />
              </div>
            )}
            <input type='text' onKeyPress={handleKeyPress} value={text} onChange={handleChangeText} />
          </div>
        </div>
      )}
    </>
  )
}
