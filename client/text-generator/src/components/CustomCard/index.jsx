import React, { useState, useContext, useEffect } from 'react';
import { Card, Flex, Button, Drawer, Space, Modal, Row, Col, Select, Typography, Input, InputNumber, Switch, Tabs, ConfigProvider, Dropdown, message, Upload, Image, Tooltip, Form, Slider } from 'antd';
import axios from 'axios';
import { formatDistance, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import CustomBadge from '../CustomBadge';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, ThunderboltOutlined, SettingOutlined, SendOutlined, CloseOutlined, GlobalOutlined, CheckOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import style from './style.module.css';
import HighlightText from '../HighlightText';
import TelegramIcon from '../TelegramIcons';
import CustomMoreButton from '../CustomMoreButton';
import GlobalContext from '../../context/globalContext';
import CardContext from '../../context/cardContext';

const { Dragger } = Upload;
const { Text, Title } = Typography;
const { Meta } = Card;

const CustomCard = ({ id, originalText, onDelete, dataCard, onUpdateContent, setLoadingInfo, setMansoryColumns, moveCardToFirst, setCardID, cardDisplay, setCardDisplay, prevDisplay, publishData, isLoading }) => {



  const apiUrl = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    originalText: "",
    style: "",
    tone: [],
    lang: "",
    degree: "",
    target: "",
    headerLength: 0,
    previewLength: 0,
    textLength: 0,
    perspective: 1,
    paragraph: 1,
    temperature: 0.5,
    quotesInDirectSpeech: true,
    engTranslateExpr: true
  });

  const [isOpenFullText, setOpenFullText] = useState(false);
  const [selectedVersionParams, setSelectedVersionParams] = useState(dataCard.articleParams);
  const [highlightedText, setHighlightedText] = useState(dataCard.text);
  useEffect(() => {
    setHighlightedText(dataCard.text);
  }, [dataCard.text]);




  // Состояние для управления выделенным текстом каждой версии
  const [highlightedTextVersions, setHighlightedTextVersions] = useState({});



  const [hasRewritten, setHasRewritten] = useState({}); // Отслеживает, была ли вызвана функция rewrite для каждой версии


  const [isScipButtonFullText, setIsScipButtonFullText] = useState(false);
  const [tabKey, setDefaultActiveKey] = useState(dataCard.id?.toString() || "");
  const [originalTextState, setOriginalTextState] = useState(originalText);
  const [customInitialContext, setCustomInitialContext] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');


  const [versionsCount, setVersionsCount] = useState(0);
  const [activeDots, setActiveDots] = useState({});
  const [showBorder, setShowBorder] = useState(false);
  const [publishedKey, setPublished] = useState(null);
  const [tabBarStyleProp, setTabBarStyleProp] = useState('');
  const [tabKeyForImg, setTabKeyForImg] = useState(null);
  const [loadingsImg, setLoadingsImg] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([]);
  const [openParams, setOpenParams] = useState(false);
  const [sourceData, setSourceData] = useState([]);
  const [isVersionBoolean, setIsVersion] = useState(false);
  const {
    stylesData,
    setStylesData,
    addStyle,
    removeStyle,
    editArticleText,
    removeVersion,

  } = useContext(GlobalContext);
  const { uniqLoading, uniqLoadingVers } = useContext(CardContext);
  const [activeSources, setActiveSources] = useState(new Set());
  const [customStyles, setCustomStyles] = useState([]);
  const [newStyle, setNewStyle] = useState('');

  const [uniqReload, setUniqReload] = useState(false)
  const [uniqReloadVers, setUniqReloadVers] = useState({});
  const [matchPercentage, setMatchPercentage] = useState({}); // Для хранения процента совпадения

  const [openCustomPromt, setOpenCustomPromt] = useState(false);

  const [uniqSwitch, setUniqSwitch] = useState(true);

  const handleUniqParams = (checked) => {
    setUniqSwitch(checked)
  }


  const handleUniqReloadVers = (versionId, value) => {
    setUniqReloadVers(prevState => ({
      ...prevState,
      [versionId]: value,
    }));
  };

  const handleAddStyle = () => {
    if (newStyle.trim()) {
      addStyle({ name: newStyle });
      setNewStyle('');


    }
  };

  const rewrite = (origText, text, versionId) => {
    if (!origText || !text) {
      console.warn("Один из текстов пустой");
      return text;
    }

    // Очистка текста от HTML-тегов
    const stripHtmlTags = (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };

    // Очистка оригинального текста и текста для поиска
    const cleanOrigText = stripHtmlTags(origText);
    const cleanText = stripHtmlTags(text);

    const origWords = cleanOrigText.split(/\s+/);
    const textWords = cleanText.split(/\s+/);

    const origWordSet = new Set(origWords);

    const highlightedText = textWords
      .map((word) => {
        return origWordSet.has(word) ? `<mark>${word}</mark>` : word;
      })
      .join(" ");

    // Расчёт процента совпадения
    const matchCount = textWords.filter(word => origWordSet.has(word)).length;
    const percentage = 100 - ((matchCount / textWords.length) * 100).toFixed(2);

    // Обновление процента совпадения в состоянии
    setMatchPercentage((prevState) => ({
      ...prevState,
      [versionId]: percentage, // Обновление процента совпадения для текущей версии
    }));

    // Установка состояния вызова
    setHasRewritten((prevState) => ({
      ...prevState,
      [versionId]: true,
    }));

    // Обновляем состояние для основной статьи или версии
    if (versionId === dataCard.id) {
      setHighlightedText(highlightedText);
    } else {
      setHighlightedTextVersions((prevState) => ({
        ...prevState,
        [versionId]: highlightedText,
      }));
    }
  };









  const handleRemoveStyle = (id) => {
    removeStyle(id);
  };

  const handleStyleEditTitle = (text) => {
    editArticleText(id, { title: text })

  };

  const handleStyleEditDescription = (text) => {
    editArticleText(id, { previewText: text })
  };


  const handleStyleEditTitleVersion = (versionID) => (text) => {
    const isVersion = true;

    editArticleText(id, { title: text }, isVersion, versionID)

  };
  const handleStyleEditDescriptionVersion = (versionID) => (text) => {
    const isVersion = true;

    editArticleText(id, { previewText: text }, isVersion, versionID)

  };


  const handleCancel = () => setPreviewOpen(false);





  const handleChange = ({ fileList: newFileList, file }) => {

    if (file.status === 'done') {
      message.success(`${file.name} file uploaded successfully`);
      onUpdateContent()
    } else if (file.status === 'error') {
      message.error(`${file.name} file upload failed.`);
    }
  };







  useEffect(() => {


  }, []);

  useEffect(() => {
    const getSources = async () => {
      try {
        const response = await axios.get(`${apiUrl}/articles/publicate/sources`);
        setSourceData(response.data);
      } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
      }
    };

    getSources();
  }, []);

  const postDataImg = async (articleId, versionId, isGenerate) => {

    try {
      setLoadingsImg(true)
      const response = await axios.post(`${apiUrl}/images/upload`, {
        articleId: articleId,
        articleVersionId: versionId,
        generateImage: isGenerate
      });

      onUpdateContent(id)


      setLoadingsImg(false)
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
      setLoadingsImg(false)
    }
  }

  const propsDrop = {
    name: 'file',
    action: `${apiUrl}/images/upload`,
    multiple: false,
    data: {
      articleId: id,
      articleVersionId: tabKeyForImg,
    },
    onChange: handleChange,
  };

  const uploadButton = fileList.length >= 8 ? null : (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );



  // Находим выбранную версию по ID
  const selectedVersion = dataCard.versions.find(version => version.id == tabKey);


  // Определяем URL изображения для выбранной версии статьи или основного изображения статьи
  let imageUrl = apiUrl; // Базовый URL сервера
  if (selectedVersion && selectedVersion.imageUrl) {
    // Используем изображение из выбранной версии
    imageUrl += selectedVersion.imageUrl;
  } else if (dataCard.imageUrl) {
    // Используем изображение основной статьи, если у выбранной версии нет изображения
    imageUrl += dataCard.imageUrl;
  } else {
    // Запасное изображение, если ни в выбранной версии, ни в основной статье его нет
    imageUrl += '/uploads/sample.svg'; // Замените на ваш запасной URL изображения
  }



  // Сначала создайте маппинг ключей вкладок к их индексам
  const versionKeyToIndexMap = {};

  // Добавьте основную статью
  versionKeyToIndexMap[dataCard.id.toString()] = -1; // Используйте -1 для основной статьи, если у вас нет отдельного индекса для неё

  // Теперь добавьте все версии
  dataCard.versions.forEach((version, index) => {
    versionKeyToIndexMap[version.id.toString()] = index;
  });

  useEffect(() => {
    if (activeDots) { // Проверяем условие, при котором должна появляться граница
      setShowBorder(true); // Включаем отображение границы

      const timer = setTimeout(() => {
        setShowBorder(false); // Выключаем отображение границы через 2 секунды
      }, 1000);

      return () => clearTimeout(timer); // Очищаем таймер при размонтировании компонента
    }
  }, [activeDots]);


  const changeTabs = (key) => {

    setDefaultActiveKey(key); // Обновляем активный ключ таба


    const selectedVersion = key === dataCard.id.toString()
      ? { params: dataCard.articleParams } // Для основного таба используем основные параметры статьи
      : dataCard.versions.find(version => version.id.toString() === key); // Ищем выбранную версию для других табов




    const versionIndex = versionKeyToIndexMap[key];

    if (versionIndex > -1) {

      setIsVersion(true)


    } else {

      setIsVersion(false)

    }

    if (versionIndex === -1) {
      setTabKeyForImg(null)
    } else {
      setTabKeyForImg(key)
    }

    if (selectedVersion && selectedVersion.params) {
      setSelectedVersionParams(selectedVersion.params); // Обновляем выбранные параметры версии

      // Обновляем форму с новыми параметрами. Адаптируйте поля под вашу структуру данных
      setFormData({
        originalText: "", // Предположительно, originalText остается без изменений или обновляется отдельно
        ...selectedVersion.params, // Распаковываем параметры версии в состояние формы
      });
    } else {
      // Здесь можно обработать случай, когда версия не найдена. Например, обнулить форму или установить значения по умолчанию
    }


  }




  function selectVersion(versionIndex) {

    // Обновление состояния с параметрами выбранной версии
    // Проверка, есть ли в выбранной версии специфические параметры, иначе использовать общие
    const versionParams = dataCard.versions[versionIndex]?.params || dataCard.articleParams;


    const handleData = {
      originalText: originalText,
      style: versionParams.style,
      tone: versionParams.tone,
      lang: versionParams.lang,
      degree: versionParams.degree,
      target: versionParams.target,
      headerLength: versionParams.headerLength,
      previewLength: versionParams.previewLength,
      textLength: versionParams.textLength,
      perspective: versionParams.perspective,
      paragraph: versionParams.paragraph,
      temperature: versionParams.temperature,
      quotesInDirectSpeech: versionParams.quotesInDirectSpeech,
      engTranslateExpr: versionParams.engTranslateExpr
    }
    setFormData(handleData)
    setSelectedVersionParams(versionParams);
  }




  const handleOpenFullText = () => {
    setOpenFullText(!isOpenFullText)
  }

  const customTheme = {
    // Определение кастомных токенов
    components: {
      Tabs: {
        verticalItemPadding: '5px 10px',
        cardGutter: 0,
        cardBg: 'rgba(225, 225, 225, 0.02)'
      },
      Card: {
        headerFontSize: 18
      }

    },
    token: {
      fontSize: 18
    },
  };



  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };



  const onCloseCustomPromt = () => {
    setOpenCustomPromt(false);
  };


  const showDrawerParams = (versionIndex) => {

    moveCardToFirst(id)
    setTabKeyForImg(dataCard.versions[versionIndex]?.id)
    setOpenParams(true);
    setMansoryColumns({ column: 1, width: '50vw' })
    setOpenFullText(true)
    setIsScipButtonFullText(true)
    selectVersion(versionIndex)
    setCardID(Number(id))
    setCardDisplay(true)

  };

  const onCloseParams = () => {
    setOpenParams(false);
    setOpenFullText(false)
    setIsScipButtonFullText(false)
    setMansoryColumns({ column: 4, width: '100vw' })
    if (prevDisplay === false) {
      setCardDisplay(prevDisplay)
      setMansoryColumns({ column: 1, width: '100vw' })
    }
  };

  const [loadings, setLoadings] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const showModal = () => {
    setOpenModal(true);
  };
  const hideModal = () => {
    setOpenModal(false);
  };

  const [modal, contextHolder] = Modal.useModal();

  const confirm = (id) => {
    modal.confirm({
      title: !isVersionBoolean ? 'Подтвердите удаление статьи' : 'Подтвердите удаление версии',
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        if (!isVersionBoolean) {
          onDelete(id);
        } else {
          removeVersion(id).then(() => {
            // Обновляем состояние для удаления версии из текущего компонента
            setVersionsCount(prevCount => prevCount - 1);
            setActiveDots(prevDots => {
              const updatedDots = { ...prevDots };
              delete updatedDots[id.toString()];
              return updatedDots;
            });
            // Если текущая версия была активной, переключаемся на основную статью
            if (tabKey === id.toString()) {
              setDefaultActiveKey(dataCard.id.toString());
            }
          });
        }
      },
      okText: 'Удалить',
      cancelText: 'Отмена',
    });
  };


  const uniqColorChange = (percent) => {
    let color = ''; // Объявляем color как let, чтобы можно было изменять его значение
    if (percent < 60) {
      color = '#ff7875';
    } else if (percent >= 60 && percent < 80) {
      color = '#ffc069';
    } else if (percent >= 80) {
      color = '#bae637';
    }
    return color;
  };



  const notUndefind = (e) => {
    if (e == undefined) {
      e = []
    } else {
      return JSON.parse(e);
    }
  }

  const publishArticle = (itemsKey, link, sourceId) => {

    setLoadingInfo({ isLoading: true, text: itemsKey, type: link });
    setPublished(itemsKey)


    // Добавляем sourceId в состояние активных источников
    setActiveSources(prev => new Set(prev).add(sourceId));

    publishData(id, itemsKey, sourceId)

  }



  const menuItems = sourceData.map((source) => ({
    key: source.id,
    label: source.name,
    link: source.url,
  }));




  // Подготовка items для использования в Dropdown
  const items = menuItems.map((item) => ({
    key: item.key,
    label: (
      <Flex onClick={() => publishArticle(item.label, item.link, item.key)} gap={'5px'}>
        {item.link.startsWith('@') ? <TelegramIcon width={15} /> : <GlobalOutlined />}
        <Text strong>{item.label}</Text>
        {(activeSources.has(item.key) || (dataCard.versions.publication ? dataCard.versions.publication : dataCard.publications.some(publication => publication.sourceId === item.key))) && <CheckOutlined style={{ color: '#3f6600' }} />}
      </Flex>
    ),
  }));

  const textCounter = (title, prewtext, text) => {
    // Конкатенация строк с пробелами между ними
    const combinedText = `${title} ${prewtext} ${text}`;


    // Подсчет количества символов
    const charCount = combinedText.length;


    // Подсчет количества слов (разбиваем строку на слова, удаляя лишние пробелы)
    const wordCount = combinedText.trim().split(/\s+/).length;


    // Возвращаем строку с результатами
    return `Знаков: ${charCount}, Слов: ${wordCount}`;
  };

  const itemsCard = [
    {
      label: dataCard.versions[0] ? (
        <CustomBadge count={1} color="#fff" name="Vers">
          {" "}
        </CustomBadge>
      ) : (
        ""
      ),
      key: dataCard.id.toString(),
      children: (
        <Flex vertical="true" style={{ width: "100%" }}>
          <Card
            style={{
              fontSize: "16px",
            }}
            className={style.card}
            cover={<img alt="example" src={imageUrl} />}
            extra={<Text type="secondary">{textCounter(dataCard.title, dataCard.previewText, dataCard.text)}</Text>}
            actions={[
              <div key="original" onClick={() => showDrawer(dataCard.id)}>
                Source
              </div>,
              <DeleteOutlined key="delete" onClick={() => confirm(dataCard.id)} />,
              <SettingOutlined
                key="edit"
                onClick={() => showDrawerParams(dataCard.articleParams)}
              />,

              <Dropdown
                menu={{
                  items,
                }}
                trigger={["click"]}
                placement="bottomLeft"
                arrow={{
                  pointAtCenter: true,
                }}
              >
                <SendOutlined />
              </Dropdown>,
            ]}
          >
            <Meta
              title={
                <Title
                  level={5}
                  style={{ margin: "0" }}
                  editable={{ onChange: handleStyleEditTitle }}
                >
                  {dataCard.title}
                </Title>
              }
              description={
                <Text editable={{ onChange: handleStyleEditDescription }}>
                  {dataCard.previewText}
                </Text>
              }
            />
            <br></br>

            {isScipButtonFullText ? (
              ""
            ) : (
              <div>
                {" "}
                <Flex justify="flex-start">
                  <Button block onClick={handleOpenFullText}>
                    {isOpenFullText ? "Скрыть текст" : "Показать текст"}
                  </Button>{" "}
                </Flex>
                <br></br>{" "}
              </div>
            )}

            {isOpenFullText && (
              <HighlightText
                id={dataCard.id}
                text={highlightedText}
                highlights={notUndefind(dataCard.uniqueness?.matches)}
                setUniqReload={setUniqReload}
              />
            )}
          </Card>
          <Flex justify="flex-end">
            <Flex
              gap="small"
              justify="flex-end"
              align="center"
              style={{ marginTop: "5px" }}
            >
              <CustomBadge
                id={{ id: dataCard.id, isVersion: false }}
                count={dataCard.uniqueness?.percent + "%"}
                loading={uniqLoading}
                reload={uniqReload}
                setUniqReload={setUniqReload}
                color={uniqColorChange(dataCard.uniqueness?.percent)}
                name="uniq"
              ></CustomBadge>
              <div>
                {formatDistance(new Date(dataCard.date), new Date(), {
                  addSuffix: true,
                  locale: ru,
                })}
              </div>
            </Flex>
          </Flex>
        </Flex>
      ),
    },
    ...dataCard.versions.map((version, id) => ({
      label: (
        <CustomBadge
          count={id + 2}
          color="#fff"
          name="Vers"
          dotOn={!!activeDots[version.id.toString()]}
        ></CustomBadge>
      ),
      key: version.id.toString(),
      children: (
        <Flex vertical="true" style={{ width: "100%" }}>
          <Card
            cover={<img alt="example" src={imageUrl} />}
            style={showBorder ? { border: "2px solid #1677FF" } : {}}
            className={style.card}
            extra={<Text type="secondary">{textCounter(version.title, version.previewText, version.text)}</Text>}
            actions={[
              <div key="original" onClick={() => showDrawer(version.id)}>
                Source
              </div>,
              <DeleteOutlined key="delete" onClick={() => confirm(version.id)} />,
              <SettingOutlined
                key="edit"
                onClick={() => showDrawerParams(id)}
              />,
              <Dropdown
                menu={{
                  items,
                }}
                trigger={["click"]}
                placement="bottomLeft"
                arrow={{
                  pointAtCenter: true,
                }}
              >
                <SendOutlined key="send" />
              </Dropdown>,
            ]}
          >
            <Meta
              title={
                <Title
                  level={5}
                  style={{ margin: "0" }}
                  editable={{ onChange: handleStyleEditTitleVersion(version.id) }}
                >
                  {version.title}
                </Title>
              }
              description={
                <Text
                  editable={{
                    onChange: handleStyleEditDescriptionVersion(version.id),
                  }}
                >
                  {version.previewText}
                </Text>
              }
            />
            <br></br>
            {isScipButtonFullText ? (
              ""
            ) : (
              <div>
                {" "}
                <Flex justify="flex-start">
                  <Button block onClick={handleOpenFullText}>
                    {isOpenFullText ? "Скрыть текст" : "Показать текст"}
                  </Button>{" "}
                </Flex>
                <br></br>{" "}
              </div>
            )}
            {isOpenFullText && (
              <HighlightText
                versionID={version.id}
                text={highlightedTextVersions[version.id] || version.text}
                highlights={notUndefind(version.uniqueness?.matches)}
                setUniqReload={(value) => handleUniqReloadVers(version.id, value)}
              />
            )}
          </Card>
          <Flex justify="flex-end">
            <Flex
              gap="small"
              justify="flex-end"
              align="center"
              style={{ marginTop: "5px" }}
            >
              <CustomBadge
                id={{ id: version.id, isVersion: true }}
                handleUniqReloadVers={handleUniqReloadVers}
                count={version.uniqueness?.percent + "%"}
                loading={uniqLoadingVers[version.id] || false}
                reload={uniqReloadVers[version.id] || false}
                color={uniqColorChange(version.uniqueness?.percent)}
                name="uniq"
              ></CustomBadge>
              <div>
                {formatDistance(new Date(dataCard.date), new Date(), {
                  addSuffix: true,
                  locale: ru,
                })}
              </div>
            </Flex>
          </Flex>
        </Flex>
      ),
    })),
  ];


  const handleCustomPromt = () => {
    setOpenCustomPromt(true)
    setCustomInitialContext(selectedVersionParams.articleVersionId
      ? dataCard.versions.find(version => version.id === selectedVersionParams.articleVersionId)?.params.initialContextTemplate
      : dataCard.initialContextTemplate)

    setCustomPrompt(selectedVersionParams.articleVersionId
      ? dataCard.versions.find(version => version.id === selectedVersionParams.articleVersionId)?.params.promptTemplate
      : dataCard.promptTemplate)

  }

  const handleSubmit = async () => {
    try {
      setLoadings(true);
      onCloseParams();
      setOpenCustomPromt(false)

      // Преобразуем поле tone в строку, если оно является массивом
      const formDataToSend = {
        ...formData,
        tone: Array.isArray(formData.tone) ? formData.tone.join(',') : formData.tone,
        initialContextTemplate: customInitialContext, // Новое поле
        promptTemplate: customPrompt, // Новое поле
        uniqSwitch: uniqSwitch
      };

      setLoadingInfo({ isLoading: true, text: 'Идёт генерация версии' });

      const response = await axios.post(`${apiUrl}/articles/${dataCard.id}/versions`, formDataToSend);

      const newTabKey = response.data.id.toString();

      setDefaultActiveKey(newTabKey);
      setLoadingInfo({ isLoading: false, text: 'Идёт генерация' });

      onUpdateContent();

      // Обновите только точку для новой вкладки
      setActiveDots(prev => ({ ...prev, [newTabKey]: true }));

    } catch (error) {
      console.error("Ошибка при отправке данных формы: ", error.response);
      // Обработка ошибки
    } finally {
      setLoadings(false);
    }
  };


  return (



    <ConfigProvider theme={customTheme}>
      <div>


        <Flex
          style={{

            borderRadius: '5px',

          }}>
          {!cardDisplay ? <Flex justify='space-between'>
            <Flex justify='flex-start' gap='middle'
              style={{

              }}>
              <div>
                <Image
                  width={200}
                  src={imageUrl}
                />
                <Flex gap="small" justify="space-between" align='center' style={{ marginTop: '5px' }}>
                  <CustomBadge
                    count={dataCard.uniqueness?.percent + '%'}
                    color={uniqColorChange(dataCard.uniqueness?.percent)}
                    name='uniq'></CustomBadge>
                  <div>{formatDistance(new Date(dataCard.date), new Date(), { addSuffix: true, locale: ru })}</div>
                </Flex>

              </div>
              <div style={{
                width: '15vw'
              }}>
                <Title level={5} style={{ margin: '0' }} editable>
                  {dataCard.title}
                </Title>
                <Text>
                  {dataCard.previewText}
                </Text>

              </div>
              <div style={{
                width: '40vw'
              }}>
                <Tooltip title={dataCard.text} overlayInnerStyle={{ width: '1000px' }} trigger="click">
                  <Text>
                    {dataCard.text.substring(0, 300)} <CustomMoreButton text={'•••'} color={'#1677FF'} borderColor={'#1677FF'} />
                  </Text>
                </Tooltip>

              </div>

            </Flex>
            <Flex vertical={true} justify='space-between' align='center' gap={'small'}>
              <div style={{ cursor: 'pointer' }} key="original" onClick={() => showDrawer(dataCard.id)}>Original</div>
              <DeleteOutlined key="delete" onClick={() => confirm(dataCard.id)} style={{ fontSize: '20px' }} />
              <SettingOutlined key="edit" onClick={() => showDrawerParams(dataCard.articleParams)} style={{ fontSize: '20px' }} />

              <Dropdown

                menu={{
                  items,
                }}
                trigger={['click']}
                placement="bottomLeft"
                arrow={{
                  pointAtCenter: true,
                }}
              >
                <SendOutlined key="send" style={{ fontSize: '20px' }} />
              </Dropdown>
            </Flex>
          </Flex> :
            <Tabs

              activeKey={tabKey}
              onChange={(key) => changeTabs(key)}
              tabPosition={"right"}
              className={style.customTabs}
              style={{
                height: "100%",

              }}
              items={itemsCard}
              tabBarStyle={{
                fill: 'red',
                display: dataCard.versions[0] ? '' : 'none'
              }}
            />

          }

        </Flex>





        <Drawer
          title="Текст источника"
          placement='right'
          closable={true}
          onClose={onClose}
          open={open}
          width={500}
          mask={false}
          zIndex={100000}

        >
          <p>{originalTextState}</p>

        </Drawer>
        <Drawer
          title="Свой промт"
          placement='left'
          closable={true}
          onClose={onCloseCustomPromt}
          open={openCustomPromt}
          width={950}
          mask={false}
          zIndex={100000}

        >
          <Form layout="vertical">
            <Form.Item label="Custom Initial Context">
              <Input.TextArea
                value={customInitialContext}
                onChange={(e) => setCustomInitialContext(e.target.value)}
                rows={8}
              />
            </Form.Item>
            <Form.Item label="Custom Prompt">
              <Input.TextArea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={12}
              />
            </Form.Item>





          </Form>

        </Drawer>

        <Drawer
          title="Параметры статьи"
          placement='right'
          closable={true}
          onClose={onCloseParams}
          open={openParams}
          width={'50vw'}
          mask={false}
          extra={
            <Space>
              <Button onClick={() => {
                const selectedText = selectedVersionParams.articleVersionId
                  ? dataCard.versions.find(version => version.id === selectedVersionParams.articleVersionId)?.text
                  : dataCard.text;

                // Передача идентификатора версии или основной статьи
                const versionId = selectedVersionParams.articleVersionId || dataCard.id;
                rewrite(originalTextState, selectedText, versionId);
              }} type="default">
                {hasRewritten[tabKey] ? (
                  <Text style={{
                    color: matchPercentage[tabKey] >= 90 ? 'green' :
                      matchPercentage[tabKey] >= 75 ? 'orange' :
                        matchPercentage[tabKey] >= 50 ? 'red' :
                          matchPercentage[tabKey] < 50 ? 'red' :
                            'black' // Цвет по умолчанию
                  }}>
                    Rewrite: {matchPercentage[tabKey]}%
                  </Text>
                ) : (
                  "Проверить Rewrite"
                )}
              </Button>


              {versionsCount < 9 && <Button type="primary" onClick={handleSubmit} loading={loadings} icon={<ThunderboltOutlined />}>
                {!loadings ? 'Генерировать версию' : 'Идёт генерация'}
              </Button>}

            </Space>
          }

        >

          <Flex vertical gap={'20px'}>
            <Flex gap={'10px'}>
              <Image
                width={200}
                src={imageUrl}
              />
              <Flex vertical gap={'10px'}>
                <Button type={!loadingsImg ? 'default' : 'primary'} onClick={() => postDataImg(id, Number(tabKeyForImg), true)} loading={loadingsImg} icon={<ThunderboltOutlined />}>
                  {!loadingsImg ? 'Генерировать картинку' : 'Идёт генерация'}
                </Button>
                <Upload {...propsDrop}>
                  <Button icon={<UploadOutlined />}></Button>
                </Upload>
              </Flex>

              <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
              </Modal>

            </Flex>
            <Flex vertical='true' gap='20px'>
              <Row gutter={16}>
                <Col className="gutter-row" span={10}>
                  <Text type="secondary" className={style.labelParams}>Стиль текста</Text>

                  <Select
                    key={selectedVersionParams.id}
                    value={selectedVersionParams.style}
                    onChange={(option) => {
                      setSelectedVersionParams(prevParams => {
                        const updatedParams = { ...prevParams, style: option };
                        setFormData(prevFormData => ({ ...prevFormData, style: option }));
                        return updatedParams;
                      });
                    }}
                    style={{ width: "100%" }}
                    optionLabelProp="label"
                    dropdownRender={menu => (
                      <>
                        {menu}
                        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                          <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                            <Input
                              style={{ flex: 1 }}
                              value={newStyle}
                              onChange={(e) => setNewStyle(e.target.value)}
                            />
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={handleAddStyle}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  >
                    {stylesData.map(style => (
                      <Select.Option key={style.id} value={style.name} label={style.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {style.name}
                          <Button
                            type="text"
                            icon={<CloseOutlined style={{ color: '#BFBFBF' }} />}
                            onMouseDown={() => handleRemoveStyle(style.id)}
                          />
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col className="gutter-row" span={10}>
                  <Text type="secondary" className={style.labelParams}>Тон текста</Text>
                  <Select
                    key={selectedVersionParams.id}
                    mode="multiple"
                    defaultValue={selectedVersionParams.tone.split(',')}
                    onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, tone: defaultValue }))}
                    style={{
                      width: "100%",
                    }}

                    options={[
                      {
                        value: "analytical",
                        label: "Аналитический"
                      },
                      {
                        value: "critical",
                        label: "Критический"
                      },
                      {
                        value: "informative",
                        label: "Информативный"
                      },
                      {
                        value: "neutral",
                        label: "Нейтральный"
                      },
                      {
                        value: "optimistic",
                        label: "Оптимистичный"
                      },
                      {
                        value: "pessimistic",
                        label: "Пессимистичный"
                      },
                      {
                        value: "skeptical",
                        label: "Скептический"
                      },
                      {
                        value: "technical",
                        label: "Технический"
                      },
                      {
                        value: "enthusiastic",
                        label: "Энтузиастический"
                      },
                      {
                        value: "inspirational",
                        label: "Вдохновляющий"
                      },
                      {
                        value: "ironic",
                        label: "Ироничный"
                      },
                      {
                        value: "satirical",
                        label: "Сатирический"
                      }
                    ]}
                  />
                </Col>
                <Col className="gutter-row" span={4}>
                  <Text type="secondary" className={style.labelParams}>Язык текста</Text>
                  <Select
                    key={selectedVersionParams.id}

                    defaultValue={selectedVersionParams.lang}
                    onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, lang: defaultValue }))}
                    style={{
                      width: "100%",
                    }}

                    options={[
                      {
                        value: "ru",
                        label: "RU"
                      },

                      {
                        value: "en",
                        label: "EN"
                      }
                    ]}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col className="gutter-row" span={10}>
                  <Text type="secondary" className={style.labelParams}>Степень</Text>
                  <Select
                    key={selectedVersionParams.id}

                    defaultValue={selectedVersionParams.degree}
                    onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, degree: defaultValue }))}
                    style={{
                      width: "100%",
                    }}

                    options={[
                      {
                        value: "brief",
                        label: "Краткая"
                      },
                      {
                        value: "comprehensive",
                        label: "Исчерпывающая"
                      },
                      {
                        value: "detailed",
                        label: "Детальная"
                      },
                      {
                        value: "general",
                        label: "Общая"
                      },
                      {
                        value: "high-level",
                        label: "Высокоуровневая"
                      },
                      {
                        value: "overview",
                        label: "Обзорная"
                      },
                      {
                        value: "summary",
                        label: "Суммарная"
                      },
                      {
                        value: "technical",
                        label: "Техническая"
                      }
                    ]}
                  />
                </Col>
                {/* <Col className="gutter-row" span={10}>
                  <Text type="secondary" className={style.labelParams}>Целевая аудитория</Text>
                  <Select
                    key={selectedVersionParams.id}

                    defaultValue={selectedVersionParams.target}
                    onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, target: defaultValue }))}
                    style={{
                      width: "100%",
                    }}

                    options={[
                      {
                        value: "academics",
                        label: "Академическая аудитория"
                      },
                      {
                        value: "business-professionals",
                        label: "Бизнес-профессионалы"
                      },
                      {
                        value: "general-public",
                        label: "Широкая публика"
                      },
                      {
                        value: "government-officials",
                        label: "Государственные служащие"
                      },
                      {
                        value: "industry-experts",
                        label: "Эксперты отрасли"
                      },
                      {
                        value: "legal-professionals",
                        label: "Юридические специалисты"
                      },
                      {
                        value: "policy-makers",
                        label: "Политики"
                      },
                      {
                        value: "scientists",
                        label: "Ученые"
                      },
                      {
                        value: "students",
                        label: "Студенты"
                      },
                      {
                        value: "technologists",
                        label: "Технологи"
                      }
                    ]}
                  />
                </Col> */}

              </Row>
              <Row gutter={16}>
                <Col className="gutter-row" span={5}>
                  <Text type="secondary" className={style.labelParams}>Длина заголовка</Text>
                  <InputNumber min={1} max={10} key={selectedVersionParams.id} defaultValue={selectedVersionParams.headerLength} onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, headerLength: defaultValue }))} changeOnWheel />
                  <Text type="secondary" italic={true} className={style.inputNumberUnderLabel}>Слов</Text>
                </Col>
                <Col className="gutter-row" span={5}>
                  <Text type="secondary" className={style.labelParams}>Длина превью</Text>
                  <InputNumber min={10} max={30} key={selectedVersionParams.id} defaultValue={selectedVersionParams.previewLength} onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, previewLength: defaultValue }))} changeOnWheel />
                  <Text type="secondary" italic={true} className={style.inputNumberUnderLabel}>Слов</Text>
                </Col>
                <Col className="gutter-row" span={5}>
                  <Text type="secondary" className={style.labelParams}>Длина текста</Text>
                  <InputNumber min={50} max={1000} key={selectedVersionParams.id} defaultValue={selectedVersionParams.textLength} onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, textLength: defaultValue }))} changeOnWheel />
                  <Text type="secondary" italic={true} className={style.inputNumberUnderLabel}>Слов</Text>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col className="gutter-row" span={5}>
                  <Text type="secondary" className={style.labelParams}>Перспектива</Text>
                  <Select
                    key={selectedVersionParams.id}
                    defaultValue={selectedVersionParams.perspective}
                    onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, perspective: defaultValue }))}
                    style={{
                      width: "100%",
                    }}
                    options={[
                      {
                        value: 1,
                        label: "1-е лицо"
                      },
                      {
                        value: 3,
                        label: "3-е лицо"
                      }
                    ]}
                  />
                </Col>

                <Col className="gutter-row" span={5}>
                  <Text type="secondary" className={style.labelParams}>Абзацев</Text>
                  <InputNumber min={2} max={100} key={selectedVersionParams.id} defaultValue={selectedVersionParams.paragraph} onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, paragraph: defaultValue }))} changeOnWheel />
                  <Text type="secondary" italic={true} className={style.inputNumberUnderLabel}></Text>
                </Col>
                <Col className="gutter-row" span={5}>
                  <Text type="secondary" className={style.labelParams}>Креативность</Text>
                  <InputNumber min={0.1} max={1} key={selectedVersionParams.id} defaultValue={selectedVersionParams.temperature} onChange={(defaultValue) => setFormData(prevFormData => ({ ...prevFormData, temperature: defaultValue }))} step={0.1} changeOnWheel />
                  <Text type="secondary" italic={true} className={style.inputNumberUnderLabel}></Text>
                </Col>
              </Row>
              <Row gutter={16}>

                <Col className="gutter-row" span={9}>
                  <Flex>
                    <Text type="default" className={style.labelParams}>Преобразовать цитаты в прямую речь</Text>
                    <Switch key={selectedVersionParams.id} defaultChecked={selectedVersionParams.quotesInDirectSpeech} onChange={(defaultChecked) => setFormData(prevFormData => ({ ...prevFormData, quotesInDirectSpeech: defaultChecked }))} />
                  </Flex>
                  <Flex>
                    <Text type="default" className={style.labelParams}>Не переводить английские выражения</Text>
                    <Switch key={selectedVersionParams.id} defaultChecked={selectedVersionParams.engTranslateExpr} onChange={(defaultChecked) => setFormData(prevFormData => ({ ...prevFormData, engTranslateExpr: defaultChecked }))} />
                  </Flex>
                 
                  <Flex  justify={'space-between'}>
                  <Text type="default" className={style.labelParams}>Проверить на уникальность</Text>
                  <Switch defaultChecked onChange={handleUniqParams} />
                  </Flex>
                  <Button
                    onClick={handleCustomPromt}
                  >Custom Promt
                  </Button>
                </Col>

              </Row>
            </Flex>
          </Flex>

        </Drawer>

        <Modal
          title="Удаление"
          icon="<ExclamationCircleOutlined />"
          open={openModal}
          onOk={() => onDelete(id)}
          onCancel={hideModal}
          okText="Удалить"
          cancelText="Отмена"
        >
        </Modal>
        {contextHolder}
      </div>
    </ConfigProvider>

  );
};

export default CustomCard;