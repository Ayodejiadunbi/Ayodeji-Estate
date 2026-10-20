import { Link } from "react-router-dom";
import "./card.scss";

function Card({ item }) {
    return (
        <div className="card">
            <Link to={`/${item.id}`} className="imageContainer"> 
                <img loading="lazy" src={item.img} alt={item.name || "Image"} />
            </Link>
            <div className="textContainer">
                <h2 className="title">
                    <Link to={`/${item.id}`}>{item.title}</Link>
                </h2>
                <p className="address">
                    <img src="/pin.png" alt="" />
                    <span>{item.address}</span>
                </p>
                <p className="price">£{item.price.toLocaleString()}{item.type === "rent" ? " / month" : ""}</p>
                <div className="bottom">
                    <div className="features">
                        <div className="feature">
                            <img src="/bed.png" alt="" />
                            <span>{item.bedroom} bedroom</span>
                        </div>
                        <div className="feature">
                            <img src="/bath.png" alt="" />
                            <span>{item.bathroom} bathroom</span>
                        </div>
                    </div>
                    <Link to={`/${item.id}`}>View details →</Link>

                </div>
            </div>
        </div>
    );
}

export default Card;
