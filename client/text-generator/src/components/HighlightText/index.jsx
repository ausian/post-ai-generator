import React, { useState, useContext, useEffect } from "react";
import { Typography, Button } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import style from "./style.module.css";
import { EditOutlined } from "@ant-design/icons";
import GlobalContext from "../../context/globalContext";

const { Text } = Typography;

const HighlightText = ({
  text,
  highlights = [],
  id,
  versionID,
  setUniqReload,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const { editArticleText, fetchData } = useContext(GlobalContext);

  useEffect(() => {
    const highlightedText = applyHighlights(text, highlights);
   
    setCurrentText(highlightedText);
  }, [text, highlights]);

  const handleEditClick = () => {
    // Очистка <mark> тегов перед входом в режим редактирования
    const plainText = removeMarkTags(currentText);
    setCurrentText(plainText);

    setIsEditing(true);
   
  };

  const handleSaveClick = () => {
   
    setIsEditing(false);
    if (id) {
      editArticleText(id, { text: currentText });
      setUniqReload(true);

    }
    if (versionID) {
      setUniqReload(versionID, true);
      const isVersion = true;
      editArticleText(id, { text: currentText }, isVersion, versionID);
    }
  };

  const applyHighlights = (text, highlights) => {
    // Разделяем текст на массив слов, включая пробелы
    const words = text.split(/(\s+)/);

    highlights.forEach(({ highlight, url }) => {
      highlight.forEach(([start, end]) => {
        const startIndex = parseInt(start, 10);
        const endIndex = parseInt(end, 10);

        if (words[startIndex]) {
          words[startIndex] = `<a href="${url}" class="${style.highlight}">${words[startIndex]}`;
        }
        if (words[endIndex]) {
          words[endIndex] = `${words[endIndex]}</a>`;
        }
      });
    });

    const highlightedText = words.join(" ");
 

    return highlightedText;
  };

  const stripTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Функция для удаления <mark> тегов из текста
  const removeMarkTags = (text) => {
    return text.replace(/<\/?mark>/g, "");
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <ReactQuill
            theme="snow"
            value={currentText}
            onChange={(value) => {
           
              setCurrentText(value);
            }}
          />
          <Button onClick={handleSaveClick} style={{ marginTop: "10px" }}>
            Сохранить
          </Button>
        </div>
      ) : (
        <div>
          <Text>
            <span
              className={style.articleTextWrapper}
              dangerouslySetInnerHTML={{ __html: currentText }}
            />
          </Text>
          <EditOutlined
            onClick={handleEditClick}
            style={{ color: "#1677FF" }}
          />
        </div>
      )}
    </div>
  );
};

export default HighlightText;
