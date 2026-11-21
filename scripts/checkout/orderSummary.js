import {
  cart,
  removeFromCart,
  calculateCartQuantity,
  updateQuantity,
  updateDeliveryOption,
} from '../../data/cart.js'
import { products } from '../../data/products.js'
import { formatCurrency } from '../utils/money.js'
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js'
import { deliveryOptions } from '../../data/deliveryOptions.js'

export function renderOrderSummary() {
  let cartSummaryHTML = ''

  cart.forEach((cartItem) => {
    const productId = cartItem.productId
    let matchingProduct

    products.forEach((product) => {
      if (product.id === productId) {
        matchingProduct = product
      }
    })

    const deliveryOptionId = cartItem.deliveryOptionId

    let deliveryOption = deliveryOptions.find(
      (option) => option.id === deliveryOptionId,
    )
    const today = dayjs()
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days')
    const dateString = deliveryDate.format('dddd, MMMM D')

    cartSummaryHTML += `
  <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
    <div class="delivery-date">Delivery date: ${dateString}</div>

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
        ${deliveryOptionsHTML(matchingProduct, cartItem)}
      </div>
    </div>
  </div>
  `
  })

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = ''

    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs()
      const deliveryDate = today.add(deliveryOption.deliveryDays, 'days')
      const dateString = deliveryDate.format('dddd, MMMM D')

      const priceString =
        deliveryOption.priceCents === 0
          ? 'FREE'
          : `$${formatCurrency(deliveryOption.priceCents)} -`

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId

      html += `
    <div class="delivery-option js-delivery-option" 
      data-product-id="${matchingProduct.id}"
      data-delivery-option-id="${deliveryOption.id}"
      >
      <input type="radio" ${isChecked ? 'checked' : ''} class="delivery-option-input" name="delivery-option-${
        matchingProduct.id
      }">
      <div>
        <div class="delivery-option-date">${dateString}</div>
        <div class="delivery-option-price">${priceString} Shipping</div>
      </div>
    </div>
    `
    })

    return html
  }

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

  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset
      updateDeliveryOption(productId, deliveryOptionId)
      renderOrderSummary()
    })
  })
}
