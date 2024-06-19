import React, { useState, useEffect, useCallback, useRef  } from 'react';
import axios from 'axios';
import  './App.css'
import { Layout, Button, Modal, Input, Badge, Flex} from 'antd';
const { TextArea } = Input;
import CustomCard from './components/CustomCard';
import Logo from './components/Logo'
import { PlusOutlined, GlobalOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
import TelegramIcon from './components/TelegramIcons';
import Masonry from '@mui/lab/Masonry';




const { Header, Content } = Layout;

function App() {
  
  const [articles, setArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [mansoryParams, setMansoryColumns] = useState({column: 4, width: '100vw'});
  const [cardID, setCardID] = useState(null)
  
  const [loadingInfo, setLoadingInfo] = useState({ isLoading: false, text: '', type: '' });
  const [cardDisplay, setCardDisplay] = useState(true)

  const prevDisplayRef = useRef();

  const displayParams = { isCard: true };


  useEffect(() => {
    prevDisplayRef.current = cardDisplay;
  });

  const prevDisplay = prevDisplayRef.current;

  const changeStatus = (ok,text) => {
    setLoadingInfo({isLoading: ok})
    setLoadingText(text)
  }

  const fetchData = useCallback(async (id) => {
    try {
      const response = await axios.get('http://45.91.168.197:3001/articles/');
      // Обратите внимание, что мы сначала делаем копию данных, чтобы не мутировать исходный массив при reverse
      let newData = [...response.data].reverse();
  
      if (id) {
        const cardIndex = newData.findIndex(card => card.id === id);
        if (cardIndex !== -1) {
          const [cardToMove] = newData.splice(cardIndex, 1);
          newData = [cardToMove, ...newData];
        }
      }
  
      setArticles(newData);
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  }, []);

  const publishData = async (id, sourse, sourceId, isVersion) => {
    // Основной путь к вашему API
    let baseUrl = `http://45.91.168.197:3001/articles/${!isVersion ? id : `versions/${id}`}`;
console.log('✌️baseUrl --->', baseUrl);
  
    // Добавляем query-параметры к URL
    let queryParams = new URLSearchParams({
      publishSource: sourse,
      sourceId: sourceId

    }).toString();
  
    let url = `${baseUrl}?${queryParams}`;
  
    try {
      const response = await axios.get(url);
      setLoadingInfo({isLoading: false})
     
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  };


  const DeleteCard = useCallback(async (id) => {
    try {
      await axios.delete(`http://45.91.168.197:3001/articles/${id}`);
      // Обновляем состояние, чтобы исключить удаленную статью
      setArticles(currentArticles => currentArticles.filter(article => article.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении статьи:", error);
    }
  }, []);


  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [articles]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setConfirmLoading(true);
    const originalText = {
      originalText: textValue
    }
    setIsModalOpen(false);
    setLoadingInfo({isLoading: true, text: 'Идет генерация статьи', type: null})
    axios.post('http://45.91.168.197:3001/articles', originalText)
      .then(response => {
        console.log("Статья успешно добавлена:", response.data);
        // Здесь вы можете обработать ответ сервера, например, закрыть модальное окно
        fetchData();
        setLoadingInfo({isLoading: false, text: 'Идет генерация статьи', type: null})
        setConfirmLoading(false);
      })
      .catch(error => {
        console.error("Ошибка при добавлении статьи:", error);
        // Обработка ошибки, например, показ сообщения об ошибке
      });
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };



  const changeDisplay = () => {

    if(cardDisplay){

      setCardDisplay(false)
      setMansoryColumns({column: 1, width: '100vw'})
      localStorage.setItem('displayParams', JSON.stringify(displayParams));

    } else {

      setCardDisplay(true)
      setMansoryColumns({column: 4, width: '100vw'})
      

    }
    
  }



  const moveCardToFirst = (cardId) => {




    
    
    setArticles(currentArticles => {
      // Находим индекс элемента, который нужно переместить
      const cardIndex = currentArticles.findIndex(card => card.id === cardId);
      if (cardIndex === -1) return currentArticles; // Элемент не найден
  
      // Получаем элемент и удаляем его из текущего местоположения
      const [card] = currentArticles.splice(cardIndex, 1);
  
      // Возвращаем новый массив с элементом на первом месте
      
      
      return [card, ...currentArticles];
      
    });
  };
  
 

  return (
    
  <></>
  )
}

export default App
