import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, message } from 'antd';
import './App.scss';
import { LOCAL_STORAGE_KEY } from './const';

const { TextArea } = Input;

function App() {
  const [subscription, setSubscription] = useState<string>(localStorage.getItem(LOCAL_STORAGE_KEY) || '');
  const [payload, setPayload] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSubscriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setSubscription(value);
    localStorage.setItem(LOCAL_STORAGE_KEY, value);
  }

  const handlePayloadChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setPayload(value);
  }

  const handleSubmit = async () => {
    let subscriptionObj;
    try {
      subscriptionObj = JSON.parse(subscription);
      if (!subscriptionObj.endpoint || !subscriptionObj.keys || !subscriptionObj.keys.p256dh || !subscriptionObj.keys.auth) {
        throw new Error('Отсутсвует одно из обязательных полей PushSubscription');
      }
    }
    catch (e) {
      console.error(e);
      message.error('Некорректный объект PushSubscription');
    }

    if (subscriptionObj) {
      setIsSending(true);
      try {
        const response = await fetch('/api/trigger-push-msg', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscription: subscriptionObj, payload })
        });
        const jsonData = await response.json();
        if (jsonData && jsonData.statusCode === 201) {
          message.success('Пуш отправлен');
        } else {
          console.error({ response: jsonData });
          throw new Error('Ответ от сервера не 201');
        }
      }
      catch (e) {
        console.error(e);
        message.error('Ошибка во время отправки пуша');
      }
      setIsSending(false);
    }
  }

  return (
    <div className="App">
      <div className='App_container'>

        <span className='App_title'>PushSubscription</span>
        <span className='App_subtitle'>Вставьте свой объект подписки</span>
        <TextArea
          rows={10}
          value={subscription}
          onChange={handleSubscriptionChange}
          className='App_textarea'
          disabled={isSending}
        />

        <span className='App_title'>Push payload</span>
        <TextArea
          rows={6}
          value={payload}
          onChange={handlePayloadChange}
          disabled={!subscription || isSending}
          className='App_textarea'
        />

        <Button
          className='App_button'
          onClick={handleSubmit}
          disabled={!subscription || !payload || isSending}
          type='primary'
        >
          Отправить
        </Button>
      </div>
    </div>
  );
}

export default App;
