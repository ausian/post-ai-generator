import React from 'react';
import style from './style.module.css'
import { Badge } from 'antd';




const CustomBadge = ({ name, count, color, dotOn }) => {
  // Контент, который будет отображаться внутри или без Badge
  const content = (
    <span className={style.badgeContainer}>
      <span className={style.badge} style={{ backgroundColor: color }}>
        {name} {count}
      </span>
    </span>
  );

  return dotOn ? (
    <Badge dot color='#1677FF' >{content}</Badge>
  ) : content;
};

export default CustomBadge;