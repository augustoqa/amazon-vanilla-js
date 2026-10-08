import {
  cart,
  removeFromCart,
  calculateCartQuantity,
  updateQuantity,
} from '../data/cart.js'
import { products } from '../data/products.js'
import { formatCurrency } from './utils/money.js'

let cartSummaryHTML = ''

cart.forEach((cartItem) => {
  const productId = cartItem.productId
  let matchingProduct

  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product
    }
  })

  cartSummaryHTML += `
  <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
    <div class="delivery-date">Delivery date: Tuesday, June 21</div>

    <div class="cart-item-details-grid">
      <img class="product-image" src="${matchingProduct.image}">

      <div class="cart-item-details">
        <div class="product-name">${matchingProduct.name}</div>
        <div class="product-price">$${formatCurrency(
          matchingProduct.priceCents,
        )}</div>
        <div class="product-quantity">
          <span> Quantity: <span class="quantity-label js-quantity-label">${
            cartItem.quantity
          }</span> </span>
          <span class="update-quantity-link link-primary js-update-quantity-link" data-product-id="${
            matchingProduct.id
          }">
            Update
          </span>
          <input class="quantity-input">
          <span class="quantity-error-message js-quantity-error-message"></span>
          <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id="${
            matchingProduct.id
          }">Save</span>
          <span class="delete-quantity-link link-primary js-delete-link"
            data-product-id="${matchingProduct.id}">
            Delete
          </span>
        </div>
      </div>

      <div class="delivery-options">
        <div class="delivery-options-title">
          Choose a delivery option:
        </div>
        <div class="delivery-option">
          <input type="radio" checked="" class="delivery-option-input" name="delivery-option-${
            matchingProduct.id
          }">
          <div>
            <div class="delivery-option-date">Tuesday, June 21</div>
            <div class="delivery-option-price">FREE Shipping</div>
          </div>
        </div>
        <div class="delivery-option">
          <input type="radio" class="delivery-option-input" name="delivery-option-${
            matchingProduct.id
          }">
          <div>
            <div class="delivery-option-date">Wednesday, June 15</div>
            <div class="delivery-option-price">$4.99 - Shipping</div>
          </div>
        </div>
        <div class="delivery-option">
          <input type="radio" class="delivery-option-input" name="delivery-option-${
            matchingProduct.id
          }">
          <div>
            <div class="delivery-option-date">Monday, June 13</div>
            <div class="delivery-option-price">$9.99 - Shipping</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})

function updateCartQuantityDisplay() {
  document.querySelector('.js-cart-quantity').textContent =
    `${calculateCartQuantity()} items`
}

document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML

document.querySelectorAll('.js-delete-link').forEach((link) => {
  link.addEventListener('click', () => {
    const productId = link.dataset.productId
    removeFromCart(productId)

    const container = document.querySelector(
      `.js-cart-item-container-${productId}`,
    )
    container.remove()
    updateCartQuantityDisplay()
  })
})

addEventListener('load', () => {
  updateCartQuantityDisplay()
})

document.querySelectorAll('.js-update-quantity-link').forEach((link) => {
  link.addEventListener('click', handleUpdateQuantityInput)
})

function handleUpdateQuantityInput(event) {
  document
    .querySelectorAll('.cart-item-container')
    .forEach((cont) => cont.classList.remove('is-editing-quantity'))

  const productId = event.target.dataset.productId
  const container = document.querySelector(
    `.js-cart-item-container-${productId}`,
  )
  const inputEditing = container.querySelector('.quantity-input')
  container.classList.add('is-editing-quantity')

  const labelQuantityValue =
    container.querySelector('.js-quantity-label').textContent

  inputEditing.value = labelQuantityValue
  inputEditing.setAttribute('placeholder', labelQuantityValue)
  inputEditing.select()

  container
    .querySelector('.js-save-quantity-link')
    .addEventListener('click', handleSaveQuantityLink)
}

function handleSaveQuantityLink() {
  const productId = this.dataset.productId
  const container = this.closest(`.js-cart-item-container-${productId}`)
  const quantityInputValue = container
    .querySelector('.quantity-input')
    .value.trim()

  const quantity = Number(quantityInputValue)

  const quantityErrorMessage = container.querySelector(
    '.js-quantity-error-message',
  )
  quantityErrorMessage.textContent = ''
  quantityErrorMessage.classList.contains('is-visible') &&
    quantityErrorMessage.classList.remove('is-visible')

  if (quantityInputValue === '') {
    quantityErrorMessage.classList.add('is-visible')
    quantityErrorMessage.textContent = 'You must enter a quantity'
    return
  }

  if (isNaN(quantity)) {
    quantityErrorMessage.classList.add('is-visible')
    quantityErrorMessage.textContent = 'Quantity must be a number'
    return
  }
  if (quantity < 0 || quantity >= 1000) {
    quantityErrorMessage.classList.add('is-visible')
    quantityErrorMessage.textContent = 'Quantity must be >= 0 and < 1000'
    return
  }

  updateQuantity(productId, quantity)
  updateCartQuantityDisplay()
  container.querySelector('.js-quantity-label').textContent = quantity
  container.classList.remove('is-editing-quantity')
}

document.querySelectorAll('.quantity-input').forEach((input) => {
  input.addEventListener('keydown', handleEnterInput)
})

function handleEnterInput(event) {
  if (event.key === 'Enter') {
    event.target
      .closest('.is-editing-quantity')
      .querySelector('.save-quantity-link')
      .click()
  }
}
