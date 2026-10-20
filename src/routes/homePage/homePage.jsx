import "./homePage.scss"
import SearchBar from "../../components/searchBar/searchBar"


function HomePage() {
    return (
        <div className="homePage">
            <div className="textContainer">
                <div className="wrapper">
                <h1 className="title">Find Real Estate & Get Your Dream Place </h1>      
                
                <p>Discover homes to buy or rent. Search by location and budget, save your favourites, and contact property owners. SunnyEstate is a portfolio demonstration with sample listings.</p>
                    <SearchBar/>
                    <div className="boxes">
                        <div className="box">
                            <h1>Buy</h1>
                            <h2>Find your home</h2>
                        </div>
                        <div className="box">
                            <h1>Rent</h1>
                            <h2>Explore places</h2>
                        </div>
                        <div className="box">
                            <h1>List</h1> 
                            <h2>Share a property</h2>
                        </div>
                    </div>
                    </div>
                    
              
            </div>
            <div className="imageContainer">
                <img src="/bg.png" alt="" />
            </div>
        </div>
    )

}
export default HomePage