import { useState } from "react"
import "./Chat.scss"


function Chat(){
    const  [chat,setChat] = useState(true)
    return(
        <div className="chat">
            <div className="messages">
                <h1>Messages</h1>
                <div className="message">
                    <img src="https://media.gettyimages.com/id/1289461335/photo/portrait-of-a-handsome-black-man.jpg?s=612x612&w=gi&k=20&c=tLXHz94Tj89nEyeEm4qZuEJdR24qLDO_Xpq-SSQzGuw=" alt="" />
                    <span>Joe John</span>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                         </p>
                </div>
                <div className="message">
                    <img src="https://media.gettyimages.com/id/1289461335/photo/portrait-of-a-handsome-black-man.jpg?s=612x612&w=gi&k=20&c=tLXHz94Tj89nEyeEm4qZuEJdR24qLDO_Xpq-SSQzGuw=" alt="" />
                    <span>Joe John</span>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                         </p>
                </div>
                <div className="message">
                    <img src="https://media.gettyimages.com/id/1289461335/photo/portrait-of-a-handsome-black-man.jpg?s=612x612&w=gi&k=20&c=tLXHz94Tj89nEyeEm4qZuEJdR24qLDO_Xpq-SSQzGuw=" alt="" />
                    <span>Joe John</span>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                         </p>
                </div>
                <div className="message">
                    <img src="https://media.gettyimages.com/id/1289461335/photo/portrait-of-a-handsome-black-man.jpg?s=612x612&w=gi&k=20&c=tLXHz94Tj89nEyeEm4qZuEJdR24qLDO_Xpq-SSQzGuw=" alt="" />
                    <span>Joe John</span>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                         </p>
                </div>
                <div className="message">
                    <img src="https://media.gettyimages.com/id/1289461335/photo/portrait-of-a-handsome-black-man.jpg?s=612x612&w=gi&k=20&c=tLXHz94Tj89nEyeEm4qZuEJdR24qLDO_Xpq-SSQzGuw=" alt="" />
                    <span>Joe John</span>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                         </p>
                </div>
                <div className="message">
                    <img src="https://media.gettyimages.com/id/1289461335/photo/portrait-of-a-handsome-black-man.jpg?s=612x612&w=gi&k=20&c=tLXHz94Tj89nEyeEm4qZuEJdR24qLDO_Xpq-SSQzGuw=" alt="" />
                    <span>Joe John</span>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                         </p>
                </div>
            </div>
           { chat&& 
           <div className="chatBox">
                <div className="top">
                    <div className="user">
                        <img src= "https://media.gettyimages.com/id/1289461335/photo/portrait-of-a-handsome-black-man.jpg?s=612x612&w=gi&k=20&c=tLXHz94Tj89nEyeEm4qZuEJdR24qLDO_Xpq-SSQzGuw=" alt=""/>
                        Joe John
                    </div>
                    <span className="close" onClick={()=>setChat(null)}>X</span>
                </div>
                <div className="center">
                    <div className="chatMessage">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage own">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage ">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage own">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage own">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage own">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage own">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                <div className="chatMessage">
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet, </p>
                        <span>1 hour ago</span>
                </div>
                
                </div>
                <div className="bottom">
                    <textarea></textarea>
                    <button>send</button>
                </div>
            </div>}
        </div>

    )
}

export default Chat