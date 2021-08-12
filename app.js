const main = document.querySelector('#main')
const span = document.querySelector('.top-header span')
const totalPrice = document.querySelector('.total-price')
const menu = document.querySelector('.menu')
const menuProducts = document.querySelector('.menu-products')
const openBnt = document.querySelector('.fa-shopping-cart')
const backdrop = document.querySelector('.backdrop')
const closeBtn = document.querySelector('.close-menu')
const deleteAll = document.querySelector('.delete')
let cart = []


class Get{
    async getProducts(){
        try{
            const products = await fetch('products.json')
            let data = await products.json()
            data = data.items.map((item) => {
            const {id} = item.sys
            const {title, price} = item.fields
            const image = item.fields.image.fields.file.url
            return{id, title, price, image}
            })
            return data
        }catch(err){
            console.log(err)
        }
    }
}

class Show{
    showProducts(data){
        let result = ''
       data.map((item) => {
            result+=   
                `<div>
                <img src=${item.image} alt=${item.title}>
                <div>
                    <p>${item.title}</p>
                    <p>${item.price}</p>
                </div>
                <button id=${item.id} class="add-product">افزودن به سبد خرید</button>
                </div>`
       })
       main.innerHTML = result
    }
    selectBtns(){
        const btns =[...document.querySelectorAll('.add-product')]
        btns.map((item) => {
            item.addEventListener('click', (e) =>{
               let product = {...Save.getProduct(e.target.id), amount: 1}

               const index = cart.findIndex(item => item.id ===product.id)
               if(index > -1){
                   product = cart[index]
                   product.amount++
               }else{
                cart = [...cart, product]
               }
               Save.saveToStorage('cart', cart)
                this.cartInfo()
                this.showMenu(cart)
                this.openMenu()
            })
        })
    }

    showMenu(cart){
        let result = ''
        cart.map((item) => {
            result+= `  
            <div>
                <img src=${item.image} alt=${item.title}>
                <div>
                    <p>${item.title}</p>
                    <p>${item.price}</p>
                    <button id=${item.id} class="delete-one">حذف</button>
                </div>
                <div class="amount">
                    <i class="fas fa-chevron-up" id=${item.id}></i>
                    <span>${item.amount}</span>
                    <i class="fas fa-chevron-down" id=${item.id}></i>
                </div>
            </div>
            `
        })
        menuProducts.innerHTML = result
        this.deleteProduct()
        this.increase()
        this.decrease()
    }

    cartInfo(){
        let price = 0
        let items = 0
        cart.map((item) => {
            items += item.amount
            price+=item.price*item.amount
        })
        span.textContent = items
        totalPrice.textContent = price
    }

    openMenu(){
        menu.classList.add('open-menu')
        backdrop.classList.add('grey')
    }
    closeMenu(){
        menu.classList.remove('open-menu')
        backdrop.classList.remove('grey')
    }
    deleteProducts(){
        deleteAll.addEventListener('click', this.deleteAllProducts)
    }

    deleteProduct(){
        const deleteOne = [...document.querySelectorAll('.delete-one')]
        deleteOne.map((item) => {
            item.addEventListener('click', (e) => {
                this.deleteOneProduct(e.target.id)
                menuProducts.removeChild(item.parentElement.parentElement)
                this.cartInfo()
            })
        })
    }

    deleteAllProducts(){
        cart.splice(0,cart.length)
        Save.saveToStorage('cart', cart)
        while(menuProducts.children.length != 0){
            menuProducts.removeChild(menuProducts.children[0])
            totalPrice.textContent = 0
            span.textContent = 0
        }
    }
    deleteOneProduct(id){
        cart = cart.filter(item => item.id !== id)
        Save.saveToStorage('cart', cart)
    }

    increase(){
       const btns = [...document.querySelectorAll('.fa-chevron-up')]
       btns.map((item) => {
           item.addEventListener('click', (e) => {
            const index = cart.findIndex(item => item.id ===e.target.id)
            if(index > -1){
                const product = cart[index]
                product.amount++
                Save.saveToStorage('cart', cart)
                this.cartInfo()
                this.showMenu(cart)
            }
           })
       })
    }

    decrease(){
        const btns = [...document.querySelectorAll('.fa-chevron-down')]
       btns.map((item) => {
           item.addEventListener('click', (e) => {
            const index = cart.findIndex(item => item.id ===e.target.id)
            const product = cart[index]
            if(index > -1){
                if(product.amount>1){
                    product.amount--
                    Save.saveToStorage('cart', cart)
                    this.cartInfo()
                    this.showMenu(cart)
                }else{
                    this.deleteOneProduct(e.target.id)
                    menuProducts.removeChild(item.parentElement.parentElement)
                    this.cartInfo()
                }
            }
           })
       })
    }
}

class Save{
    static saveToStorage(title, products){
        localStorage.setItem(title, JSON.stringify(products))
    }
    static getFromStorage(){
        if(localStorage.getItem('cart'))
            cart = JSON.parse(localStorage.getItem('cart'))
    }
    static getProduct(id){
        const products =  JSON.parse(localStorage.getItem('products'))
        return products.find( item => item.id === id)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const get = new Get()
    const show = new Show()

  

    get.getProducts().then((data) => {
        show.showProducts(data)
        Save.saveToStorage('products', data)
        Save.getFromStorage()
    }).then(() => {
        show.selectBtns()
        show.cartInfo()
        show.showMenu(cart)
        openBnt.addEventListener('click', show.openMenu)
        closeBtn.addEventListener('click', show.closeMenu)
        backdrop.addEventListener('click', show.closeMenu)
        show.deleteProducts()
    })
})