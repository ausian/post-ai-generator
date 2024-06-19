import React from 'react';
import style from './style.module.css'





const CustomMoreButton = ({ text, color, bg, borderColor }) => {

  const styleObj = {
    color: color,
    background: bg,
    border: `1px solid ${borderColor}`,
    borderRadius: '5px',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0px 4px',
    lineHeight: '1',
    cursor: 'pointer'
  }

  return  (
   <span style={styleObj}>{text}</span>
  ) 
}

export default CustomMoreButton;