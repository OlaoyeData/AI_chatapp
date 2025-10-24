import styles from "./messageList.module.css"
import react, { useState } from "react";

const MessageList = () => {
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const sendMessage = async () => {
        if (!userMessage.trim()) return;
        setLoading(true);

        try{
            const formData = new formData();
            formData.append("promp", userMessage);

            if (imageFile){
                formData.append("file", imageFile);
            }
            const response = await fetch("http://127.0.0.1:8000/uploadfile/", {
                method: "POST",
                body : FormData,
            });

            if (!response.ok){
                throw new Error("Failed to get response from the server");
            }

            const data = await response.json();

            if (imageFile){
                setChatHistory((prev) => [
                ...prev,
                {sender: "user", message: userMessage, isImage:false},
                {sender: "user", message: imageFile, isImage:true},
                {sender: "bot", message: data.response, isImage:false},
            ]);
            }
            else{
                setChatHistory((prev) => [
                ...prev,
                {sender: "user", message: userMessage, isImage:false},
                {sender: "bot", message: data.response, isImage:false},
            ]);
            }
            

        setUserMessage("");
        setImageFile(null);

        }catch(error){
            console.error("Error:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
        
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };
    return(
        <div className = {styles.container}>
            <h1 className = {styles.header}>Chat with GPT</h1>
            <div className={styles.chatBox}>
                {chatHistory.map((chat, index) => (
                    <div
                        key = {index}
                        className = {`${styles.message} ${chat.sender == "user" ? styles.userMessage : styles.botMessage}`}
                    >
                        {chat.isImage ? (
                            <imag
                                src={URL.createObjectURL(chat.message)}
                                alt="Uploaded"
                                className = {styles.image}
                            />
                        ) : (
                        chat.message
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <input 
                    type= "text"
                    placeholder="Type a message..."
                    value = {userMessage}
                    onChange = {(e) => setUserMessage(e.target.value)}
                    className = {styles.input}
                    disabled = {loading}
                />
                <label htmlFor="image-upload" className={styles.paperclipButton}>
                    📎
                </label>
                <input 
                    id = "image-upload"
                    type = "file"
                    accept = "image/*"
                    className = {styles.inputImage}
                    onChange = {handleImageUpload}
                />
                <button onClick = {sendMessage} className={styles.button} disabled = {loading}>
                    {loading ? "Sending....":"Send"}
                </button>
            </div>
        </div>
    )
};

export default MessageList;