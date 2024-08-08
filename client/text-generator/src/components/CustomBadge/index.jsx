import React, { useState, useContext } from 'react';
import style from './style.module.css'
import { Badge } from 'antd';
import {RedoOutlined, LoadingOutlined } from '@ant-design/icons';
import CardContext from '../../context/cardContext';




const CustomBadge = ({ id, name, count, color, dotOn, loading = false, reload = false, setUniqReload, handleUniqReloadVers }) => {
  const { getUniq, getUniqVersion } = useContext(CardContext);
  const handleReload = () => {
    if(!id.isVersion){
      getUniq(id.id)
      setUniqReload(false)
    } else {
      
console.log('✌️id.id --->', id.id);
      getUniqVersion(id.id)
      handleUniqReloadVers(id.id, false)
    }
  
  }
  // Контент, который будет отображаться внутри или без Badge
  const content = (
    <span className={style.badgeContainer}>
      <span className={style.badge} style={{ backgroundColor: reload ? '#E8E8E8' : color, display: 'flex', gap: 5 }}>
        <span>{reload && 'prev'} {name} {count}</span>
        {reload ? <RedoOutlined  onClick={handleReload} style={{cursor: 'pointer', color: '#1677FF'}}/> : loading ? <LoadingOutlined style={{color: '#1677FF'}}/> : ''}
        
      </span>
      
    </span>
  );

  return dotOn ? (
    <Badge dot color='#1677FF' >{content}</Badge>
  ) : content;
};

export default CustomBadge;