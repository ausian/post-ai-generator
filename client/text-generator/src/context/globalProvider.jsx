import React, { useState, useEffect, useCallback } from 'react';
import GlobalContext from './globalContext';
import axios from 'axios';

const GlobalProvider = ({ children }) => {
    const [stylesData, setStylesData] = useState([]);
    const [articles, setArticles] = useState([]);

    

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchData = useCallback(async (id) => {
        try {
            const response = await axios.get(`${apiUrl}/articles/`);
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
    }, [apiUrl]);

    const getStyles = async () => {
        try {
            const response = await axios.get(`${apiUrl}/styles`);
            setStylesData(response.data);
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
        }
    };

    useEffect(() => {
        getStyles();
    }, [apiUrl]);

    const addStyle = async (newStyle) => {
        try {
            await axios.post(`${apiUrl}/styles`, newStyle);
            getStyles();
        } catch (error) {
            console.error('Ошибка при добавлении нового стиля:', error);
        }
    };

    const removeStyle = async (id) => {
        try {
            await axios.delete(`${apiUrl}/styles/${id}`);
            getStyles();
        } catch (error) {
            console.error('Ошибка при удалении стиля:', error);
        }
    };

    const removeVersion = async (id) => {
        try {
            await axios.delete(`${apiUrl}/articles/versions/${id}`);
            setArticles(prevArticles => prevArticles.map(article => {
                return {
                    ...article,
                    versions: article.versions.filter(version => version.id !== id)
                };
            }));
        } catch (error) {
            console.error('Ошибка при удалении версии статьи:', error);
        }
    };

    const editArticleText = async (id, object = {}, isVersion, versionID) => {
        if (isVersion) {
            try {
                await axios.put(`${apiUrl}/articles/versions/${versionID}`, object, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                fetchData();
            } catch (error) {
                console.error('Ошибка при редактировании заголовка:', error);
            }
        } else {
            try {
                await axios.put(`${apiUrl}/articles/${id}`, object, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                fetchData();
            } catch (error) {
                console.error('Ошибка при редактировании заголовка:', error);
            }
        }
    };

    return (
        <GlobalContext.Provider value={{
            stylesData,
            setStylesData,
            addStyle,
            removeStyle,
            editArticleText,
            articles,
            setArticles,
            fetchData,
            removeVersion,
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
