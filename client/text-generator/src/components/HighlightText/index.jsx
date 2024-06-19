import React from 'react';
import { Typography } from 'antd';
import style from './style.module.css';

const { Text } = Typography;

const HighlightText = ({ text, highlights = [] }) => {
  text = text.replace(/\n\n/g, ' ');
  const words = text.split(' ');
  
  if (!Array.isArray(highlights) || highlights.length === 0) {
    return words.map((word, index) => <span key={index}>{word} </span>);
  }

  let result = [];
  let highlightIndexes = new Map();

  // Отображаем индексы начиная с 0 для JavaScript
  highlights.forEach(({ url, highlight }) => {
    highlight.forEach(([start, end]) => {
      // Исправление: учитываем, что индексы в `highlight` начинаются с 1
      for (let i = start-1; i <= end -1; i++) {
        highlightIndexes.set(i, url);
      }
    });
  });

  words.forEach((word, index) => {
    const url = highlightIndexes.get(index);
    if (url) {
      result.push(
        <Text key={index}>
          <a className={style.markLinkText} href={url} target="_blank" rel="noopener noreferrer">{word} </a>
        </Text>
      );
    } else {
      result.push(<span key={index}>{word} </span>);
    }
  });

  return <>{result}</>;
};

export default HighlightText;
