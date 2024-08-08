import React, { useState, useEffect, useCallback, useContext } from 'react';
import CardContext from './cardContext';
import axios from 'axios';
import GlobalContext from './globalContext';

const apiUrl = import.meta.env.VITE_API_URL;

const CardProvider = ({ children }) => {
    const { fetchData } = useContext(GlobalContext);
    const [uniqLoading, setUniqLoading] = useState(false);
    const [uniqLoadingVers, setUniqLoadingVers] = useState({});

    const getUniq = async (id) => {

        try {
            setUniqLoading(true)
            const response = await axios.get(`${apiUrl}/articles/uniq/${id}`);
            fetchData()
            setUniqLoading(false)
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
        }
    };

    const getUniqVersion = async (id) => {

        try {
            setUniqLoadingVers(prevState => ({
                ...prevState,
                [id]: true,
            }));
            const response = await axios.get(`${apiUrl}/articles/versions/uniq/${id}`);
            fetchData()
            setUniqLoadingVers(prevState => ({
                ...prevState,
                [id]: false,
            }));
            setUniqLoadingVers(id, false)
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
        }
    };

    return (
        <CardContext.Provider value={{
            getUniq,
            uniqLoading,
            setUniqLoading,
            getUniqVersion,
            uniqLoadingVers
             }}>
            {children}
        </CardContext.Provider>
    );
};

export default CardProvider;