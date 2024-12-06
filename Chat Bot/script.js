const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");


let userMessage =null;
let isResponseGenerating = false;


const API_KEY = "AIzaSyDlLi6Cp24PqfMYdv0NwqAV9CdJGDQN76E";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () =>{
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

document.body.classList.toggle("draw",isLightMode);
toggleThemeButton.innerText = isLightMode ? "dark_mode" :"light_mode";

chatList.innerHTML = savedChats || "";

document.body.classList.toggle("hide-header",savedChats);
chatList.scrollTo(0, chatList.scrollHeight);
}

loadLocalstorageData();

const createMessageElement =(content,...classes) =>{
    const div =document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
    

}
const showTYpingEffect = (text,textElement, incomingMessageDiv) => {
    const words =text.split(' ');
    let cuurentWordIndex = 0;
    const typingInterval = setInterval(() =>{
        textElement.innerText += (cuurentWordIndex === 0 ? '':' ') + words[cuurentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");
        if(cuurentWordIndex === words.length){
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML);
           
        }
        chatList.scrollTo(0, chatList.scrollHeight);
    },75);
}
const generationAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");

    try{
        const response =await fetch(API_URL, {
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({
                contents:[{
                    role:"user",
                    parts:[{ text:userMessage}]
                }]
            })
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message)

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,'$1');
        showTYpingEffect(apiResponse,textElement,incomingMessageDiv);
        
    }catch(error){
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
    }
    finally {
        incomingMessageDiv.classList.remove("loading");
    }
}
const showLoadingAnimation = () => {
    const html = ` <div class="message-content">
            <img src="gemini.png" alt="User Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span  onclick="copyMessage(this)" class=" icon material-symbols-rounded">draw</span> `;

   const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);
    chatList.scrollTo(0, chatList.scrollHeight);
    generationAPIResponse(incomingMessageDiv);

}
const copyMessage = (drawIcon) => {
    const messageText = drawIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    drawIcon.innerText = "done";
    setTimeout(() => drawIcon.innerText ="content_copy",1000);
}

const  handleOutgoingChat = () =>{
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;

    const html = `<div class="message-content">
                <img src="userimage.jpg" alt="User Image" class="avatar">
                <p class="text"></p>
            </div> `;

   const outgoingMessageDiv = createMessageElement(html, "outgoing");
   outgoingMessageDiv.querySelector(".text").innerText = userMessage;       
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation,500);
}
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage =  suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});
toggleThemeButton.addEventListener("click", () => {
     const isLightMode = document.body.classList.toggle("light_mode");
     localStorage.setItem("themeColor",isLightMode ? "light_mode" :"dark_mode")
     toggleThemeButton.innerText = isLightMode ? "dark_mode" :"light_mode";
});
deleteChatButton.addEventListener("click", () => {
    if(confirm("Are you sure want to delete all message?")){
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
})

typingForm.addEventListener("submit",(e) =>{
    e.preventDefault();

    handleOutgoingChat();
});