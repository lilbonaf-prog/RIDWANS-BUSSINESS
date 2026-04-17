// Phone icons & UI assets
import basket_icon from './basket_icon.png'
import logo from './logo.png'
import header_img from './header_img.png'
import search_icon from './search_icon.png'

// Brand / category images
import menu_1 from './menu_1.png' // Apple
import menu_2 from './menu_2.png' // Samsung
import menu_3 from './menu_3.png' // Xiaomi
import menu_4 from './menu_4.png' // OnePlus
import menu_5 from './menu_5.png' // Oppo
import menu_6 from './menu_6.png' // Vivo
import menu_7 from './menu_7.png' // Realme
import menu_8 from './menu_8.png' // Accessories

// Phone product images
import phone_1 from './phone_1.png'
import phone_2 from './phone_2.png'
import phone_3 from './phone_3.png'
import phone_4 from './phone_4.png'
import phone_5 from './phone_5.png'
import phone_6 from './phone_6.png'
import phone_7 from './phone_7.png'
import phone_8 from './phone_8.png'
import phone_9 from './phone_9.png'

// Other icons
import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'
import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import facebook_icon from './facebook_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'
import rating_stars from './rating_stars.png'
import profile_icon from './profile_icon.png'
import bag_icon from './bag_icon.png'
import logout_icon from './logout_icon.png'
import parcel_icon from './parcel_icon.png'

export const assets = {
    logo,
    basket_icon,
    header_img,
    search_icon,
    rating_stars,
    add_icon_green,
    add_icon_white,
    remove_icon_red,
    app_store,
    play_store,
    linkedin_icon,
    facebook_icon,
    twitter_icon,
    cross_icon,
    selector_icon,
    profile_icon,
    logout_icon,
    bag_icon,
    parcel_icon
}

// Phone Categories
export const Products_list = [
    { menu_name: "Apple", menu_image: menu_1 },
    { menu_name: "Samsung", menu_image: menu_2 },
    { menu_name: "Tecno", menu_image: menu_3 },
    { menu_name: "Itel", menu_image: menu_4 },
    { menu_name: "Infinix", menu_image: menu_5 },
    { menu_name: "Redmi", menu_image: menu_6 },
    { menu_name: "BT Speaker", menu_image: menu_7 },
    { menu_name: "Accessories", menu_image: menu_8 }
]

// Phone Products
export const phone_list = [
  {
    _id: "1",
    name: "iPhone 17 Air",
    image: phone_1,
    price: 0,
    description: "6.1-inch display, A16 Bionic chip, Pro camera system",
    category: "Apple"
  },
  {
    _id: "2",
    name: "iPhone 13",
    image: phone_2,
    price: 0,
    description: "A15 Bionic chip, dual-camera system",
    category: "Apple"
  },
  {
    _id: "3",
    name: "Samsung Galaxy S23 Ultra",
    image: phone_3,
    price: 0,
    description: "Dynamic AMOLED display, Snapdragon processor",
    category: "Samsung"
  },
  {
    _id: "4",
    name: "Samsung Galaxy A54",
    image: phone_4,
    price: 4300,
    description: "Affordable smartphone with premium design",
    category: "Samsung"
  },
  {
    _id: "5",
    name: "Xiaomi Redmi Note 12",
    image: phone_5,
    price: 2300,
    description: "High performance at a budget-friendly price",
    category: "Redmi"
  },
  {
    _id: "6",
    name: "Infinix Hot 60i",
    image: phone_6,
    price: 2500,
    description: "Flagship performance with fast charging",
    category: "Infinix"
  },
  {
    _id: "7",
    name: "Tecno Spark 10",
    image: phone_7,
    price: 1800,
    description: "Affordable Tecno smartphone",
    category: "Tecno"
  },
  {
    _id: "8",
    name: "Itel A60",
    image: phone_8,
    price: 1200,
    description: "Budget Itel smartphone with reliable performance",
    category: "Itel"
  },
  {
    _id: "9",
    name: "BT Speaker Portable",
    image: phone_9,
    price: 300,
    description: "High-quality Bluetooth speaker for music on the go",
    category: "BT Speaker"
  },
  {
    _id: "10",
    name: "Wireless Earbuds",
    image: phone_8,
    price: 150,
    description: "Noise cancellation and long battery life",
    category: "Accessories"
  },
  {
    _id: "11",
    name: "Power Bank",
    image: phone_9,
    price: 500,
    description: "Portable power solution for your devices",
    category: "Accessories"
  }
]