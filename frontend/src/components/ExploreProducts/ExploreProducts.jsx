import React from 'react'
import './ExploreProducts.css'
import { Products_list } from '../../assets/assets'

const ExploreProducts = ({category,setCategory}) => {
  return (
    <div className='Explore-products' id='Explore-products'>
        <h1>Expore our products</h1>
        <p className="Explore-products-text">
            We offer a carefully curated range of smartphones and accessories to meet every need and budget.
             With a focus on quality, value, and customer satisfaction, 
            our products are chosen to deliver performance you can trust
        </p>
        <div className="Explore-products-list">
            {Products_list.map((item,index)=>{
                return(
                    <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className="Explore-products-list-items">
                         <div className="circle-image">
                         <img className={category===item.menu_name?"active":""} src={item.menu_image} alt={item.menu_name} />
                    </div>
                        <p>{item.menu_name}</p>
                    </div>
                )
            })}
        </div>
        <hr />
      
    </div>
  )
}

export default ExploreProducts;
