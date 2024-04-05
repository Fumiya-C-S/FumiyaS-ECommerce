import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  //Products Fetch
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('https://dummyjson.com/products') //fetch items
      .then(res => res.json())
      .then(data => {
        console.log(data); //log the json file of products
        setProducts(data.products); //put products in a "products" array
      });
  }, []);

  //Search Bar 
  const [query, setQuery] = useState('');

  const handleInputChange = (event) => {
    fetch('https://dummyjson.com/products/search?q=phone')
    .then(res => res.json())
    .then(console.log);

    event.preventDefault();
    setQuery(event.target.value);
  };

  const filteredProducts = products.filter((product) => { //put all products that have the same name or category as the string in search bar into filtered products
    return product.title.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase());
  });

  //star ratings
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];

    for(let i = 1; i <= fullStars; i++){
      stars.push(1);
    }
    if(rating < 5){
      const partialStar = rating - fullStars;  
      stars.push(partialStar);
      const emptyStars = 5 - stars.length;
      for(let i=1; i<=emptyStars; i++) {
        stars.push(0);
      }
    }
    return stars.map((val, index) => (
      <div key={index} className="starBox" style={{ background: `linear-gradient(90deg, #ff643d ${val * 100}%, #bbbac0 ${val * 100}%)` }}>★</div>
    ));
  };

  //Shopping Cart
  //Toggle Shopping List

  const [showCart, setShowCart] = useState(false);
  const toggleCart = () => {
    const listContainer = document.getElementById("listContainer");

    if(listContainer.style.justifyContent === "flex-start"){
      listContainer.style.justifyContent = "center";
    } else {
      listContainer.style.justifyContent = "flex-start";
    }
    console.log("Cart Toggled")
    setShowCart(!showCart);
  };

  //Add To Cart
  const [cartItems, setCartItems] = useState([]);
  const addToCart = (product) => {
    fetch('https://dummyjson.com/carts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merge: true, 
        products: [
          {
            id: product.id,
            quantity: 1,
          },
        ]
      })
    })
    .then(res => res.json())
    .then(console.log);
                

    const existingProductIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1){
      const updatedCartItems = [...cartItems];
      if (updatedCartItems[existingProductIndex].quantity < updatedCartItems[existingProductIndex].stock){
        updatedCartItems[existingProductIndex].quantity += 1;
        setCartItems(updatedCartItems);
      }
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const deleteFromCart = (itemToDelete) => {
    fetch('https://dummyjson.com/carts/1', {
      method: 'DELETE',
    })
    .then(res => res.json())
    .then(console.log);

    const updatedCartItems = cartItems.filter(item => item !== itemToDelete);
    setCartItems(updatedCartItems);
    calculateTotalCost();
  }

  const calculateTotalCost = () => {
    let total = 0;
    let quantityTotal = 0;
    for (const item of cartItems){
      quantityTotal = item.price * item.quantity;
      total = total + quantityTotal;
    }
    return total;
  }

  const handleChangeQuantity = (product, newQuantity) => {
    const updatedCartItems = cartItems.map(item => {
      if (item.id === product.id) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCartItems);
  }


  return (
    <div className="App">
      <header className="App-header">
        <div className="Header">
          <h1>InnoSHOP</h1>
          <button className="shopListCart" onClick={toggleCart}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="shopListCart" viewBox="0 0 16 16">
              <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0"/>
            </svg>
          </button>
          <div>
            <input className="search"
              type="text"
              placeholder="Search..."
              value={query}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="products">
          <ul id="listContainer">
            {filteredProducts.map((product, index) => (
              <li className={"productItem"} key={product.id}>
                <div>
                  <p className="productInfo">{product.title}</p>
                  <img className="productImage" src={product.thumbnail} alt={product.title}/>
                  <p className="productPrice">${product.price}.00</p>
                </div>
                <div className="starContainer">
                  {renderStars(product.rating)} ({product.rating})
                </div> 
                <button className="addCart" onClick={() => addToCart(product)}>Add to Cart</button>
              </li>
            ))}
          </ul>
        </div>

        {showCart && (
          <div className="cartContainer">
              <h2>Shopping Cart</h2>
              <ul>
                {cartItems.map((product, index) => (
                  <li key={index}>{product.title} - ${product.price}.00 Quantity:
                    <select className='changeQuantity' value={product.quantity} onChange ={(e) => handleChangeQuantity(product, parseInt(e.target.value))}>
                      {[...Array(product.stock)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <button className="trashItemButton" onClick={() => deleteFromCart(product)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="trashItem" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <p>
                Total: ${calculateTotalCost()}.00
              </p>
          </div>
        )}

      </header>
    </div>
  );
}

export default App;
