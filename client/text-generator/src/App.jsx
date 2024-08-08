import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import axios from 'axios';
import  './App.css'
import { Layout, Button, Modal, Input, Select, Flex} from 'antd';
const { TextArea } = Input;
import CustomCard from './components/CustomCard';
import Logo from './components/Logo'
import { PlusOutlined, GlobalOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
import TelegramIcon from './components/TelegramIcons';
import Masonry from '@mui/lab/Masonry';
import CardProvider from './context/cardProvider';
import GlobalContext from './context/globalContext';



const { Header, Content } = Layout;


function App() {

  const apiUrl = import.meta.env.VITE_API_URL;
  const {articles, setArticles, fetchData} = useContext(GlobalContext);
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


  const publishData = async (id, sourse, sourceId, isVersion) => {
    // Основной путь к вашему API
    let baseUrl = `${apiUrl}/articles/${!isVersion ? id : `versions/${id}`}`;
    
  
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
      await axios.delete(`${apiUrl}/articles/${id}`);
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
    axios.post(`${apiUrl}/articles`, originalText)
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
  
    <Layout  ref={scrollRef}
      style={{
        height: "100vh",
        overflow: 'hidden',
        overflowY: 'scroll'
      }}
    >

      <Layout className="site-layout">
        <Header className="site-layout-background" style={{
          position: "fixed",
          width: '100%',
          zIndex: 99,
          backgroundColor: '#444444',
          padding: "0 24px",
          display: 'flex',
          alignItems: 'center'
        }}>


        
          <Flex justify={'space-between'} align={'center'} gap={'20px'} style={{width: '100%'}}>
          <Flex  align={'center'} gap={20}>
          <Logo/>
          <Button onClick={showModal} type="primary" shape="circle" icon={ <PlusOutlined />
          } style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} />
           <Select
    showSearch
    placeholder="Выбрать шаблон"
    filterOption={(input, option) =>
      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
    }
    options={[
      {
        value: '1',
        label: 'Новости',
      },
      {
        value: '2',
        label: 'ЮрПеревод',
      },
    ]}
  />
          </Flex>

          <Flex gap={20}>
          {loadingInfo.isLoading && (
          <Button className="buttonStatus" type="text" loading>
            { loadingInfo.type ? (loadingInfo.type.startsWith('@') ?<TelegramIcon width={15} />: <GlobalOutlined /> ) : ''}
            {loadingInfo.text}
          </Button>
        )}
        <Button onClick={changeDisplay} icon={cardDisplay ? <AppstoreOutlined /> : <TableOutlined />}></Button>
          </Flex>

          </Flex>
          
        </Header>
        <div style={{
          paddingTop: '65px'
        }}>
          <Content>
            <Modal title="Добавление нового текста" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} confirmLoading={confirmLoading}>
              <TextArea rows={30} onChange={handleTextChange} />
            </Modal>

            <div style={{
              padding: '24px',
              width: mansoryParams.width
          }}> 
            <Masonry columns={mansoryParams.column} spacing={3} >
            {
              articles.map((card) => (
                <CardProvider key={card.id}>
                <CustomCard
                  dataCard={card}
                  
                  id={card.id}
                  originalText={card.originalText}
                  onDelete={DeleteCard}
                  onUpdateContent={fetchData}
                  setLoadingInfo={setLoadingInfo}
                  setMansoryColumns={setMansoryColumns}
                  moveCardToFirst={moveCardToFirst}
                  setCardID={setCardID}
                  cardDisplay={cardDisplay}
                  setCardDisplay={setCardDisplay}
                  prevDisplay={prevDisplay}
                  publishData={publishData}
                  isLoading={loadingInfo}
                />
                </CardProvider>
              ))
            }
            </Masonry>
            </div>
          </Content>
        </div>

      </Layout>
    </Layout >
   

  )
}

export default App
